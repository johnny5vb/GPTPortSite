/**
 * Post-processing.
 *
 * A hand-rolled chain rather than EffectComposer, because the effects here are
 * cheap enough to fold into two passes and the ordering matters:
 *
 *   scene → HDR target
 *   bright pass → 3 blurred mips (ping-pong separable gaussian)
 *   composite: radial motion blur → bloom → god rays → chromatic aberration →
 *              ACES tonemap → colour grade → vignette → grain → CRT
 *
 * Tone mapping deliberately happens *after* bloom so highlights bloom in HDR
 * and roll off afterwards, which is what makes the sun and the sparkle read as
 * light rather than as white pixels.
 */

import * as THREE from "three";
import { clamp01, damp } from "../core/math";

export type FilterId =
  | "none"
  | "vhs"
  | "kodachrome"
  | "bleach"
  | "noir"
  | "infra"
  | "sunset"
  | "ps1";

export const FILTERS: { id: FilterId; name: string }[] = [
  { id: "none", name: "Clean" },
  { id: "kodachrome", name: "Kodachrome" },
  { id: "sunset", name: "Magic Hour" },
  { id: "vhs", name: "VHS 1999" },
  { id: "bleach", name: "Bleach Bypass" },
  { id: "noir", name: "Noir" },
  { id: "infra", name: "Infrared" },
  { id: "ps1", name: "PS1" },
];

const FILTER_INDEX: Record<FilterId, number> = {
  none: 0,
  vhs: 1,
  kodachrome: 2,
  bleach: 3,
  noir: 4,
  infra: 5,
  sunset: 6,
  ps1: 7,
};

const QUAD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const BRIGHT_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform float uThreshold;
  uniform float uKnee;
  void main() {
    vec3 c = texture2D(tDiffuse, vUv).rgb;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float soft = clamp(l - uThreshold + uKnee, 0.0, 2.0 * uKnee);
    soft = soft * soft / (4.0 * uKnee + 1e-5);
    float contrib = max(soft, l - uThreshold) / max(l, 1e-5);
    gl_FragColor = vec4(c * contrib, 1.0);
  }
`;

const BLUR_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform vec2 uDir;
  void main() {
    vec3 sum = vec3(0.0);
    sum += texture2D(tDiffuse, vUv - uDir * 4.0).rgb * 0.0162;
    sum += texture2D(tDiffuse, vUv - uDir * 3.0).rgb * 0.0540;
    sum += texture2D(tDiffuse, vUv - uDir * 2.0).rgb * 0.1216;
    sum += texture2D(tDiffuse, vUv - uDir * 1.0).rgb * 0.1946;
    sum += texture2D(tDiffuse, vUv).rgb                * 0.2270;
    sum += texture2D(tDiffuse, vUv + uDir * 1.0).rgb * 0.1946;
    sum += texture2D(tDiffuse, vUv + uDir * 2.0).rgb * 0.1216;
    sum += texture2D(tDiffuse, vUv + uDir * 3.0).rgb * 0.0540;
    sum += texture2D(tDiffuse, vUv + uDir * 4.0).rgb * 0.0162;
    gl_FragColor = vec4(sum, 1.0);
  }
`;

const COMPOSITE_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D tScene;
  uniform sampler2D tBloom0;
  uniform sampler2D tBloom1;
  uniform sampler2D tBloom2;

  uniform vec2  uResolution;
  uniform float uTime;
  uniform float uBloom;
  uniform float uExposure;
  uniform float uVignette;
  uniform float uGrain;
  uniform float uChroma;
  uniform float uMotion;       // radial motion blur strength
  uniform vec2  uMotionCenter;
  uniform vec2  uSunPos;
  uniform float uRays;
  uniform float uFlash;
  uniform vec3  uFlashColor;
  uniform float uDesat;
  uniform float uFilter;
  uniform float uCrt;
  uniform float uRetro;
  uniform float uSpeedLines;
  uniform float uFade;

  float hash12(vec2 p){
    p = fract(p * vec2(443.897, 441.423));
    p += dot(p, p.yx + 19.19);
    return fract(p.x * p.y);
  }

  vec3 aces(vec3 x){
    const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
  }

  vec3 grade(vec3 c, float f){
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    if (f < 0.5) return c;                                        // none
    if (f < 1.5) {                                                // vhs
      c.r = mix(c.r, c.r * 1.12 + 0.02, 1.0);
      c.b = mix(c.b, c.b * 1.08 + 0.03, 1.0);
      c = mix(vec3(l), c, 0.78);
      return c * vec3(1.02, 0.98, 1.06);
    }
    if (f < 2.5) {                                                // kodachrome
      c = pow(max(c, 0.0), vec3(0.92, 0.98, 1.06));
      c = mix(vec3(l), c, 1.28);
      return c * vec3(1.05, 1.0, 0.94);
    }
    if (f < 3.5) {                                                // bleach
      vec3 d = mix(vec3(l), c, 0.35);
      return mix(d, vec3(1.0) - (vec3(1.0) - d) * (vec3(1.0) - d), 0.55);
    }
    if (f < 4.5) return vec3(mix(l, l * 1.15 - 0.04, 1.0));        // noir
    if (f < 5.5) {                                                // infrared
      return vec3(c.g * 1.3 + c.b * 0.2, c.b * 0.6 + l * 0.2, c.r * 1.1);
    }
    if (f < 6.5) {                                                // magic hour
      c *= vec3(1.14, 1.0, 0.88);
      c += vec3(0.05, 0.02, 0.0) * (1.0 - l);
      return mix(vec3(l), c, 1.14);
    }
    // ps1: crushed, posterised
    c = floor(c * 20.0) / 20.0;
    return mix(vec3(l), c, 1.1) * vec3(1.02, 1.0, 1.05);
  }

  void main() {
    vec2 uv = vUv;
    vec2 texel = 1.0 / uResolution;

    if (uRetro > 0.5) {
      vec2 grid = uResolution / 3.2;
      uv = (floor(uv * grid) + 0.5) / grid;
    }

    if (uCrt > 0.5) {
      // Gentle barrel distortion.
      vec2 c = uv * 2.0 - 1.0;
      float r2 = dot(c, c);
      c *= 1.0 + r2 * 0.055 * uCrt;
      uv = c * 0.5 + 0.5;
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }
    }

    vec2 toCenter = uMotionCenter - uv;

    // ── radial motion blur ────────────────────────────────────────────────
    vec3 scene = vec3(0.0);
    if (uMotion > 0.001) {
      float total = 0.0;
      for (int i = 0; i < 8; i++) {
        float t = float(i) / 7.0;
        float w = 1.0 - t * 0.65;
        vec2 s = uv + toCenter * t * uMotion;
        scene += texture2D(tScene, s).rgb * w;
        total += w;
      }
      scene /= total;
    } else {
      scene = texture2D(tScene, uv).rgb;
    }

    // ── chromatic aberration ──────────────────────────────────────────────
    if (uChroma > 0.0005) {
      vec2 off = toCenter * uChroma;
      scene.r = texture2D(tScene, uv + off).r;
      scene.b = texture2D(tScene, uv - off).b;
    }

    // ── bloom ─────────────────────────────────────────────────────────────
    vec3 bloom =
        texture2D(tBloom0, uv).rgb * 0.5
      + texture2D(tBloom1, uv).rgb * 0.32
      + texture2D(tBloom2, uv).rgb * 0.24;
    vec3 col = scene + bloom * uBloom;

    // ── god rays from the sun ─────────────────────────────────────────────
    if (uRays > 0.001) {
      vec2 dir = (uSunPos - uv) / 24.0;
      vec2 p = uv;
      vec3 acc = vec3(0.0);
      float decay = 1.0;
      for (int i = 0; i < 24; i++) {
        p += dir;
        acc += texture2D(tBloom1, p).rgb * decay;
        decay *= 0.945;
      }
      col += acc * (uRays / 24.0);
    }

    // ── speed lines ───────────────────────────────────────────────────────
    if (uSpeedLines > 0.001) {
      vec2 d = uv - uMotionCenter;
      float ang = atan(d.y, d.x);
      float rad = length(d);
      float lines = hash12(vec2(floor(ang * 42.0), floor(uTime * 24.0)));
      float streak = smoothstep(0.86, 1.0, lines) * smoothstep(0.16, 0.62, rad);
      col += vec3(1.0) * streak * uSpeedLines * 0.55;
    }

    // ── exposure + tonemap + grade ────────────────────────────────────────
    col *= uExposure;
    col = aces(col);
    col = grade(col, uFilter);

    if (uDesat > 0.001) {
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(col, vec3(l) * vec3(0.92, 0.97, 1.12), uDesat);
    }

    // ── flash ─────────────────────────────────────────────────────────────
    col = mix(col, uFlashColor, clamp(uFlash, 0.0, 1.0));

    // ── vignette ──────────────────────────────────────────────────────────
    vec2 vg = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    float v = 1.0 - dot(vg, vg) * uVignette;
    col *= clamp(v, 0.0, 1.0);

    // ── CRT scanlines ─────────────────────────────────────────────────────
    if (uCrt > 0.5) {
      float scan = 0.92 + 0.08 * sin(uv.y * uResolution.y * 1.9 + uTime * 12.0);
      col *= scan;
      col *= 1.0 + 0.06 * sin(uv.x * uResolution.x * 3.14159);
    }

    // ── grain ─────────────────────────────────────────────────────────────
    if (uGrain > 0.0005) {
      float g = hash12(uv * uResolution + fract(uTime) * 991.0) - 0.5;
      col += g * uGrain;
    }

    col *= uFade;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

interface Mip {
  a: THREE.WebGLRenderTarget;
  b: THREE.WebGLRenderTarget;
}

export class PostFX {
  private renderer: THREE.WebGLRenderer;
  private sceneRT!: THREE.WebGLRenderTarget;
  private mips: Mip[] = [];
  private quad: THREE.Mesh;
  private quadScene = new THREE.Scene();
  private quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  private brightMat: THREE.ShaderMaterial;
  private blurMat: THREE.ShaderMaterial;
  private compMat: THREE.ShaderMaterial;

  private width = 1;
  private height = 1;
  private resScale = 1;
  private msaa = 4;
  private useHdr = true;

  /** Half-float targets. Falls back to 8-bit where they aren't renderable. */
  set hdr(on: boolean) {
    if (on === this.useHdr) return;
    this.useHdr = on;
    this.width = 0;
  }

  // Animated state.
  private flash = 0;
  private flashColor = new THREE.Color("#ffffff");
  private chroma = 0;
  private motion = 0;
  private speedLines = 0;
  private desat = 0;
  fade = 1;

  enabled = true;
  bloomStrength = 1;
  /**
   * MSAA on the scene target. The game renders to an offscreen buffer for the
   * post chain, so the canvas `antialias` flag does nothing — this is what
   * actually resolves the edges, and shipping without it is why the first
   * build looked crunchy.
   */
  set samples(n: number) {
    if (n === this.msaa) return;
    this.msaa = n;
    this.width = 0; // force the targets to be rebuilt at the new sample count
  }
  get samples() {
    return this.msaa;
  }
  exposure = 1.05;
  rays = 0.5;
  grain = 0.026;
  vignette = 0.42;
  filter: FilterId = "none";
  crt = false;
  retro = false;

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;

    const geo = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
    this.quad.frustumCulled = false;
    this.quadScene.add(this.quad);

    this.brightMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uThreshold: { value: 0.85 },
        uKnee: { value: 0.45 },
      },
      vertexShader: QUAD_VERT,
      fragmentShader: BRIGHT_FRAG,
      depthTest: false,
      depthWrite: false,
    });

    this.blurMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uDir: { value: new THREE.Vector2() },
      },
      vertexShader: QUAD_VERT,
      fragmentShader: BLUR_FRAG,
      depthTest: false,
      depthWrite: false,
    });

    this.compMat = new THREE.ShaderMaterial({
      uniforms: {
        tScene: { value: null },
        tBloom0: { value: null },
        tBloom1: { value: null },
        tBloom2: { value: null },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uBloom: { value: 1 },
        uExposure: { value: 1.05 },
        uVignette: { value: 0.42 },
        uGrain: { value: 0.035 },
        uChroma: { value: 0 },
        uMotion: { value: 0 },
        uMotionCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uSunPos: { value: new THREE.Vector2(0.5, 0.9) },
        uRays: { value: 0.5 },
        uFlash: { value: 0 },
        uFlashColor: { value: new THREE.Color(1, 1, 1) },
        uDesat: { value: 0 },
        uFilter: { value: 0 },
        uCrt: { value: 0 },
        uRetro: { value: 0 },
        uSpeedLines: { value: 0 },
        uFade: { value: 1 },
      },
      vertexShader: QUAD_VERT,
      fragmentShader: COMPOSITE_FRAG,
      depthTest: false,
      depthWrite: false,
    });
  }

  setSize(width: number, height: number, pixelRatio: number, scale = 1) {
    this.resScale = scale;
    const w = Math.max(2, Math.floor(width * pixelRatio * scale));
    const h = Math.max(2, Math.floor(height * pixelRatio * scale));
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;

    this.sceneRT?.dispose();
    const type = this.useHdr ? THREE.HalfFloatType : THREE.UnsignedByteType;
    this.sceneRT = new THREE.WebGLRenderTarget(w, h, {
      type,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true,
      stencilBuffer: false,
      samples: this.msaa,
    });
    this.sceneRT.texture.colorSpace = THREE.LinearSRGBColorSpace;

    for (const m of this.mips) {
      m.a.dispose();
      m.b.dispose();
    }
    this.mips = [];
    let mw = w;
    let mh = h;
    for (let i = 0; i < 3; i++) {
      mw = Math.max(2, Math.floor(mw / 2));
      mh = Math.max(2, Math.floor(mh / 2));
      const opts: THREE.RenderTargetOptions = {
        type,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
        stencilBuffer: false,
      };
      const a = new THREE.WebGLRenderTarget(mw, mh, opts);
      const b = new THREE.WebGLRenderTarget(mw, mh, opts);
      a.texture.colorSpace = THREE.LinearSRGBColorSpace;
      b.texture.colorSpace = THREE.LinearSRGBColorSpace;
      this.mips.push({ a, b });
    }

    (this.compMat.uniforms.uResolution.value as THREE.Vector2).set(w, h);
  }

  get target() {
    return this.sceneRT;
  }

  /** One-off white/coloured flash — perfect landings, big impacts. */
  addFlash(amount: number, color = "#ffffff") {
    this.flash = Math.min(1, this.flash + amount);
    this.flashColor.set(color);
  }

  addChroma(amount: number) {
    this.chroma = Math.min(0.02, this.chroma + amount);
  }

  update(
    dt: number,
    opts: {
      time: number;
      speed01: number;
      sun: THREE.Vector2;
      sunVisible: boolean;
      slowmo: number;
      bloomBoost?: number;
      exposure?: number;
    },
  ) {
    this.flash = damp(this.flash, 0, 0.00002, dt);
    this.chroma = damp(this.chroma, 0.0009 * opts.speed01, 0.0005, dt);
    this.motion = damp(this.motion, Math.max(0, opts.speed01 - 0.42) * 0.05, 0.002, dt);
    this.speedLines = damp(
      this.speedLines,
      Math.max(0, opts.speed01 - 0.62) * 0.42,
      0.004,
      dt,
    );
    this.desat = damp(this.desat, opts.slowmo, 0.004, dt);

    const u = this.compMat.uniforms;
    u.uTime.value = opts.time;
    u.uBloom.value = this.bloomStrength * (opts.bloomBoost ?? 1);
    u.uExposure.value = opts.exposure ?? this.exposure;
    u.uVignette.value = this.vignette + opts.speed01 * 0.22;
    u.uGrain.value = this.grain + (this.crt ? 0.05 : 0);
    u.uChroma.value = this.chroma;
    u.uMotion.value = this.motion;
    u.uRays.value = opts.sunVisible ? this.rays : 0;
    (u.uSunPos.value as THREE.Vector2).copy(opts.sun);
    u.uFlash.value = this.flash;
    (u.uFlashColor.value as THREE.Color).copy(this.flashColor);
    u.uDesat.value = this.desat;
    u.uFilter.value = FILTER_INDEX[this.filter] ?? 0;
    u.uCrt.value = this.crt ? 1 : 0;
    u.uRetro.value = this.retro ? 1 : 0;
    u.uSpeedLines.value = this.speedLines;
    u.uFade.value = this.fade;
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    const r = this.renderer;
    if (!this.enabled) {
      r.setRenderTarget(null);
      r.render(scene, camera);
      return;
    }

    r.setRenderTarget(this.sceneRT);
    r.clear();
    r.render(scene, camera);

    // Bright pass into mip 0.
    this.quad.material = this.brightMat;
    this.brightMat.uniforms.tDiffuse.value = this.sceneRT.texture;
    r.setRenderTarget(this.mips[0].a);
    r.render(this.quadScene, this.quadCam);

    // Blur each mip, feeding the next one down the chain.
    this.quad.material = this.blurMat;
    for (let i = 0; i < this.mips.length; i++) {
      const m = this.mips[i];
      const src = i === 0 ? m.a : this.mips[i - 1].a;
      const w = m.a.width;
      const h = m.a.height;

      this.blurMat.uniforms.tDiffuse.value = src.texture;
      (this.blurMat.uniforms.uDir.value as THREE.Vector2).set(1 / w, 0);
      r.setRenderTarget(m.b);
      r.render(this.quadScene, this.quadCam);

      this.blurMat.uniforms.tDiffuse.value = m.b.texture;
      (this.blurMat.uniforms.uDir.value as THREE.Vector2).set(0, 1 / h);
      r.setRenderTarget(m.a);
      r.render(this.quadScene, this.quadCam);
    }

    // Composite.
    this.quad.material = this.compMat;
    this.compMat.uniforms.tScene.value = this.sceneRT.texture;
    this.compMat.uniforms.tBloom0.value = this.mips[0].a.texture;
    this.compMat.uniforms.tBloom1.value = this.mips[1].a.texture;
    this.compMat.uniforms.tBloom2.value = this.mips[2].a.texture;
    r.setRenderTarget(null);
    r.render(this.quadScene, this.quadCam);
  }

  setMotionCenter(x: number, y: number) {
    (this.compMat.uniforms.uMotionCenter.value as THREE.Vector2).set(
      clamp01(x),
      clamp01(y),
    );
  }

  dispose() {
    this.sceneRT?.dispose();
    for (const m of this.mips) {
      m.a.dispose();
      m.b.dispose();
    }
    this.brightMat.dispose();
    this.blurMat.dispose();
    this.compMat.dispose();
    this.quad.geometry.dispose();
  }

  get scale() {
    return this.resScale;
  }
}
