/**
 * Pooled particle system.
 *
 * One draw call, one ring buffer, zero per-frame CPU simulation: each particle
 * stores its spawn state and the shader integrates position analytically from
 * the elapsed time. That means tens of thousands of snow crystals cost the CPU
 * only what it takes to *spawn* them.
 *
 * Kinds:
 *   0 spray    – the rooster tail off a carve; heavy drag, tiny gravity
 *   1 powder   – slow expanding puffs, the explosion out of deep snow
 *   2 chunk    – landing debris and crash spray; real gravity
 *   3 sparkle  – additive glints kicked up in the light
 *   4 ice      – hard bright chips off a scraped edge
 */

import * as THREE from "three";

export const enum PKind {
  Spray = 0,
  Powder = 1,
  Chunk = 2,
  Sparkle = 3,
  Ice = 4,
}

const VERT = /* glsl */ `
  attribute vec3 aVel;
  attribute vec4 aData;   // birth, life, size, kind
  attribute vec3 aColor;
  attribute float aSeed;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uWind;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vKind;
  varying float vSeed;

  void main() {
    float age = uTime - aData.x;
    float life = aData.y;
    float t = age / life;
    vKind = aData.w;
    vSeed = aSeed;

    if (t < 0.0 || t > 1.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // cull offscreen
      gl_PointSize = 0.0;
      vAlpha = 0.0;
      return;
    }

    // Per-kind integration constants.
    float drag = 2.6;
    float grav = 2.0;
    float grow = 1.0;
    if (aData.w < 0.5)      { drag = 2.2; grav = 5.5;  grow = 1.9; }   // spray
    else if (aData.w < 1.5) { drag = 3.4; grav = 0.55; grow = 1.9; }   // powder
    else if (aData.w < 2.5) { drag = 0.7; grav = 17.0; grow = 1.0; }   // chunk
    else if (aData.w < 3.5) { drag = 1.6; grav = 2.4;  grow = 0.7; }   // sparkle
    else                    { drag = 1.1; grav = 14.0; grow = 0.8; }   // ice

    // Exponential drag has a closed form: x = v0/k * (1 - e^-kt)
    float k = drag;
    float ed = (1.0 - exp(-k * age)) / k;
    vec3 pos = position + aVel * ed + uWind * (age * age * 0.5) * 0.2;
    pos.y -= 0.5 * grav * age * age;

    // A little swirl so nothing travels in a dead straight line.
    float sw = aSeed * 6.283;
    pos.x += sin(age * 4.0 + sw) * 0.16 * age * grow;
    pos.z += cos(age * 3.4 + sw) * 0.16 * age * grow;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float size = aData.z * (1.0 + t * (grow - 1.0));
    gl_PointSize = size * uPixelRatio * 210.0 / max(0.001, -mv.z);
    gl_PointSize = min(gl_PointSize, 90.0);

    // Fade in fast, out slow — and fade out entirely up against the lens,
    // where size attenuation would otherwise turn one flake into a beach ball.
    float fadeIn = smoothstep(0.0, 0.08, t);
    float fadeOut = 1.0 - smoothstep(0.55, 1.0, t);
    float near = smoothstep(1.6, 6.5, -mv.z);
    vAlpha = fadeIn * fadeOut * near;
    vColor = aColor;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vKind;
  varying float vSeed;

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float d = dot(uv, uv);
    if (d > 1.0) discard;

    float a = vAlpha;
    vec3 col = vColor;

    if (vKind > 2.5 && vKind < 3.5) {
      // Sparkle: a tight star with a cross flare.
      float core = pow(1.0 - clamp(d, 0.0, 1.0), 6.0);
      float cross = pow(max(0.0, 1.0 - abs(uv.x) * 6.0), 3.0)
                  + pow(max(0.0, 1.0 - abs(uv.y) * 6.0), 3.0);
      a *= core + cross * 0.5;
      col *= 1.6;
    } else {
      // Snow: soft round puff with a slightly bright core.
      float soft = pow(1.0 - clamp(d, 0.0, 1.0), 1.6);
      a *= soft;
      col *= 0.92 + 0.25 * pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
    }

    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

export class Particles {
  readonly points: THREE.Points;
  private geo = new THREE.BufferGeometry();
  private capacity: number;
  private cursor = 0;
  private time = 0;

  private aPos: THREE.BufferAttribute;
  private aVel: THREE.BufferAttribute;
  private aData: THREE.BufferAttribute;
  private aColor: THREE.BufferAttribute;
  private aSeed: THREE.BufferAttribute;

  private dirtyLo = Infinity;
  private dirtyHi = -Infinity;
  private uniforms: Record<string, THREE.IUniform>;
  private col = new THREE.Color();

  constructor(capacity = 9000, additive = false) {
    this.capacity = capacity;
    const pos = new Float32Array(capacity * 3);
    const vel = new Float32Array(capacity * 3);
    const data = new Float32Array(capacity * 4);
    const color = new Float32Array(capacity * 3);
    const seed = new Float32Array(capacity);
    for (let i = 0; i < capacity; i++) {
      data[i * 4] = -1e9;
      data[i * 4 + 1] = 1;
      seed[i] = Math.random();
    }

    this.aPos = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.aVel = new THREE.BufferAttribute(vel, 3).setUsage(THREE.DynamicDrawUsage);
    this.aData = new THREE.BufferAttribute(data, 4).setUsage(THREE.DynamicDrawUsage);
    this.aColor = new THREE.BufferAttribute(color, 3).setUsage(THREE.DynamicDrawUsage);
    this.aSeed = new THREE.BufferAttribute(seed, 1);

    this.geo.setAttribute("position", this.aPos);
    this.geo.setAttribute("aVel", this.aVel);
    this.geo.setAttribute("aData", this.aData);
    this.geo.setAttribute("aColor", this.aColor);
    this.geo.setAttribute("aSeed", this.aSeed);
    this.geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);

    this.uniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uWind: { value: new THREE.Vector3() },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    this.points = new THREE.Points(this.geo, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 10;
  }

  setPixelRatio(r: number) {
    this.uniforms.uPixelRatio.value = r;
  }

  setWind(x: number, y: number, z: number) {
    (this.uniforms.uWind.value as THREE.Vector3).set(x, y, z);
  }

  update(dt: number) {
    this.time += dt;
    this.uniforms.uTime.value = this.time;
    if (this.dirtyHi >= this.dirtyLo) {
      const start = this.dirtyLo;
      const count = this.dirtyHi - this.dirtyLo + 1;
      for (const a of [this.aPos, this.aVel, this.aData, this.aColor]) {
        a.clearUpdateRanges();
        a.addUpdateRange(start * a.itemSize, count * a.itemSize);
        a.needsUpdate = true;
      }
      this.dirtyLo = Infinity;
      this.dirtyHi = -Infinity;
    }
  }

  emit(
    kind: PKind,
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    size: number,
    life: number,
    color: THREE.Color | number,
  ) {
    const i = this.cursor;
    this.cursor = (this.cursor + 1) % this.capacity;

    this.aPos.setXYZ(i, x, y, z);
    this.aVel.setXYZ(i, vx, vy, vz);
    this.aData.setXYZW(i, this.time, life, size, kind);
    if (typeof color === "number") this.col.setHex(color);
    else this.col.copy(color);
    this.aColor.setXYZ(i, this.col.r, this.col.g, this.col.b);

    if (i < this.dirtyLo) this.dirtyLo = i;
    if (i > this.dirtyHi) this.dirtyHi = i;
    // Wrapping the ring invalidates the tidy range; just flag the whole buffer.
    if (i === 0) {
      this.dirtyLo = 0;
      this.dirtyHi = this.capacity - 1;
    }
  }

  /** Cone burst helper used by landings, crashes and pops. */
  burst(
    kind: PKind,
    origin: THREE.Vector3,
    count: number,
    speed: number,
    spread: number,
    size: number,
    life: number,
    color: THREE.Color | number,
    bias?: THREE.Vector3,
  ) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.55);
      const up = 0.35 + Math.random() * spread;
      const sp = speed * (0.45 + Math.random() * 0.9);
      let vx = Math.cos(a) * r * sp;
      let vz = Math.sin(a) * r * sp;
      let vy = up * sp;
      if (bias) {
        vx += bias.x;
        vy += bias.y;
        vz += bias.z;
      }
      this.emit(
        kind,
        origin.x + (Math.random() - 0.5) * 0.55,
        origin.y + Math.random() * 0.35,
        origin.z + (Math.random() - 0.5) * 0.55,
        vx,
        vy,
        vz,
        size * (0.6 + Math.random() * 0.9),
        life * (0.7 + Math.random() * 0.7),
        color,
      );
    }
  }

  dispose() {
    this.geo.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}
