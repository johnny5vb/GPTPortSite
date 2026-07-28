/**
 * Sky, sun, light rig and the far ridgelines.
 *
 * The sky is a single inverted sphere with an analytic shader: gradient,
 * sun disc + multi-lobe halo, a horizon haze band, stars, and aurora curtains
 * for night runs. The whole look of a run is driven from one `SkyPreset`, and
 * the lights, fog and world-material uniforms are all derived from it so
 * nothing can drift out of sync.
 */

import * as THREE from "three";
import { WorldUniforms } from "./SnowMaterial";
import { Noise2D } from "../core/noise";
import { damp } from "../core/math";

export interface SkyPreset {
  id: string;
  name: string;
  /** Sun direction (will be normalised). */
  sun: [number, number, number];
  zenith: string;
  horizon: string;
  ground: string;
  sunColor: string;
  sunIntensity: number;
  ambientSky: string;
  ambientGround: string;
  ambientIntensity: number;
  fog: string;
  fogDensity: number;
  stars: number;
  aurora: number;
  haze: number;
  cloudStrength: number;
  sparkle: number;
  /** Post-processing hints. */
  bloom: number;
  exposure: number;
}

export const SKY_PRESETS: SkyPreset[] = [
  {
    id: "golden",
    name: "Golden Hour",
    sun: [0.42, 0.17, -0.9],
    zenith: "#2f5fa8",
    horizon: "#ffb469",
    ground: "#c97a4e",
    sunColor: "#ffd39a",
    sunIntensity: 1.35,
    ambientSky: "#8fb9ff",
    ambientGround: "#ffb27a",
    ambientIntensity: 0.85,
    fog: "#f0a86e",
    fogDensity: 0.0022,
    stars: 0,
    aurora: 0,
    haze: 0.9,
    cloudStrength: 0.3,
    sparkle: 1.25,
    bloom: 1.0,
    exposure: 1.05,
  },
  {
    id: "bluebird",
    name: "Bluebird",
    sun: [0.35, 0.72, -0.6],
    zenith: "#1b4fa8",
    horizon: "#a9d8ff",
    ground: "#dbeaff",
    sunColor: "#fff6e2",
    sunIntensity: 1.6,
    ambientSky: "#9ecbff",
    ambientGround: "#e8f2ff",
    ambientIntensity: 1.0,
    fog: "#cfe6ff",
    fogDensity: 0.0016,
    stars: 0,
    aurora: 0,
    haze: 0.45,
    cloudStrength: 0.4,
    sparkle: 1.6,
    bloom: 0.75,
    exposure: 1.0,
  },
  {
    id: "dusk",
    name: "Alpenglow",
    sun: [-0.5, 0.08, -0.86],
    zenith: "#171a48",
    horizon: "#ff7a8a",
    ground: "#5d3a68",
    sunColor: "#ff9d7a",
    sunIntensity: 1.1,
    ambientSky: "#6f7fd6",
    ambientGround: "#c96f8c",
    ambientIntensity: 0.7,
    fog: "#8c5b90",
    fogDensity: 0.0026,
    stars: 0.35,
    aurora: 0,
    haze: 1.0,
    cloudStrength: 0.32,
    sparkle: 1.1,
    bloom: 1.2,
    exposure: 1.1,
  },
  {
    id: "night",
    name: "Northern Lights",
    sun: [0.2, 0.42, -0.88],
    zenith: "#050b1c",
    horizon: "#0f2a44",
    ground: "#0a1428",
    sunColor: "#b9d4ff",
    sunIntensity: 0.5,
    ambientSky: "#3d6bb5",
    ambientGround: "#101d38",
    ambientIntensity: 0.55,
    fog: "#0b1730",
    fogDensity: 0.0021,
    stars: 1,
    aurora: 1,
    haze: 0.35,
    cloudStrength: 0.15,
    sparkle: 2.2,
    bloom: 1.5,
    exposure: 1.25,
  },
  {
    id: "storm",
    name: "Whiteout",
    sun: [0.1, 0.5, -0.85],
    zenith: "#5e6a7d",
    horizon: "#c3ccd8",
    ground: "#dfe6ee",
    sunColor: "#e8eef6",
    sunIntensity: 0.55,
    ambientSky: "#b9c6d6",
    ambientGround: "#dfe6ee",
    ambientIntensity: 1.1,
    fog: "#cdd6e0",
    fogDensity: 0.0052,
    stars: 0,
    aurora: 0,
    haze: 1.0,
    cloudStrength: 0.05,
    sparkle: 0.4,
    bloom: 0.55,
    exposure: 0.95,
  },
  {
    id: "dawn",
    name: "First Chair",
    sun: [-0.3, 0.12, -0.92],
    zenith: "#20407a",
    horizon: "#ffd6b0",
    ground: "#b9c3e0",
    sunColor: "#ffe0bb",
    sunIntensity: 1.05,
    ambientSky: "#9fb6e8",
    ambientGround: "#ffd6c0",
    ambientIntensity: 0.8,
    fog: "#d9c6da",
    fogDensity: 0.0028,
    stars: 0.15,
    aurora: 0,
    haze: 1.0,
    cloudStrength: 0.25,
    sparkle: 1.2,
    bloom: 1.05,
    exposure: 1.05,
  },
];

export const skyById = (id: string) =>
  SKY_PRESETS.find((s) => s.id === id) ?? SKY_PRESETS[0];

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_Position.z = gl_Position.w; // pin to the far plane
  }
`;

const SKY_FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vDir;

  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uGround;
  uniform vec3 uSunColor;
  uniform vec3 uSunDir;
  uniform float uSunIntensity;
  uniform float uStars;
  uniform float uAurora;
  uniform float uHaze;
  uniform float uTime;
  uniform float uRetro;

  float hash13(vec3 p){
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }
  float hash12(vec2 p){
    p = fract(p * vec2(443.897, 441.423));
    p += dot(p, p.yx + 19.19);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash12(i), b = hash12(i + vec2(1,0));
    float c = hash12(i + vec2(0,1)), d = hash12(i + vec2(1,1));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
  }
  float fbm(vec2 p){
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; }
    return s;
  }

  void main() {
    vec3 dir = normalize(vDir);
    float h = dir.y;

    // Base gradient with a compressed, glowing horizon band.
    float t = pow(clamp(h, 0.0, 1.0), 0.42);
    vec3 col = mix(uHorizon, uZenith, t);
    col = mix(uGround, col, smoothstep(-0.12, 0.03, h));

    // Horizon haze — the thing that makes distant ridges sit *in* the air.
    float haze = exp(-max(h, 0.0) * 9.0) * uHaze;
    col = mix(col, uHorizon * 1.06, haze * 0.55);

    // Sun: hard disc, tight bloom lobe, wide atmospheric scatter.
    float sd = max(dot(dir, uSunDir), 0.0);
    float disc = smoothstep(0.9992, 0.99965, sd);
    float lobe = pow(sd, 1400.0) * 1.4 + pow(sd, 60.0) * 0.42 + pow(sd, 6.0) * 0.16;
    col += uSunColor * (disc * 9.0 + lobe * uSunIntensity * 1.6);

    // Stars, thinned toward the horizon.
    if (uStars > 0.001) {
      vec3 sp = dir * 190.0;
      float s = hash13(floor(sp));
      float star = smoothstep(0.9965, 0.9995, s);
      float tw = 0.65 + 0.35 * sin(uTime * 2.4 + s * 400.0);
      col += vec3(0.85, 0.9, 1.0) * star * tw * uStars *
             smoothstep(0.02, 0.35, h);
    }

    // Aurora: two curtains drifting in opposite directions.
    if (uAurora > 0.001) {
      vec2 ap = vec2(atan(dir.z, dir.x) * 1.9, h * 3.4);
      float band1 = fbm(ap * vec2(1.0, 2.2) + vec2(uTime * 0.045, uTime * 0.02));
      float band2 = fbm(ap * vec2(1.7, 3.1) + vec2(-uTime * 0.03, 5.2));
      float curtain = smoothstep(0.48, 0.86, band1) * smoothstep(0.35, 0.9, band2);
      float vert = smoothstep(0.02, 0.22, h) * (1.0 - smoothstep(0.35, 0.95, h));
      vec3 auroraCol = mix(vec3(0.11, 0.95, 0.62), vec3(0.55, 0.32, 0.95), band2);
      col += auroraCol * curtain * vert * uAurora * 1.15;
    }

    if (uRetro > 0.5) col = floor(col * 13.0) / 13.0;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

/** Jagged silhouette ridges that sit behind everything and sell the scale. */
function buildRidge(
  radius: number,
  height: number,
  seed: number,
  segments = 220,
): THREE.BufferGeometry {
  const noise = new Noise2D(seed);
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const n =
      noise.ridged(Math.cos(a) * 2.4, Math.sin(a) * 2.4, 4) * 0.75 +
      noise.fbm(Math.cos(a) * 6.1, Math.sin(a) * 6.1, 3) * 0.35;
    const y = Math.max(0.06, n) * height;
    pos.push(Math.cos(a) * radius, -height * 0.35, Math.sin(a) * radius);
    pos.push(Math.cos(a) * radius, y, Math.sin(a) * radius);
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

const RIDGE_VERT = /* glsl */ `
  varying float vH;
  varying vec3 vWorld;
  void main() {
    vH = position.y;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const RIDGE_FRAG = /* glsl */ `
  varying float vH;
  varying vec3 vWorld;
  uniform vec3 uNear;
  uniform vec3 uFar;
  uniform float uHeight;
  void main() {
    float t = clamp(vH / uHeight, 0.0, 1.0);
    // Snowy caps up top, hazed rock below, dissolving into the sky at the base.
    vec3 col = mix(uNear, uFar, 1.0 - t);
    col = mix(col, vec3(1.0), smoothstep(0.55, 0.95, t) * 0.35);
    float alpha = smoothstep(-0.02, 0.14, t);
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

export class Environment {
  readonly group = new THREE.Group();
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  readonly sunTarget = new THREE.Object3D();

  private sky: THREE.Mesh;
  private skyUniforms: Record<string, THREE.IUniform>;
  private ridges: THREE.Mesh[] = [];
  private ridgeUniforms: Record<string, THREE.IUniform>[] = [];
  private world: WorldUniforms;
  private scene: THREE.Scene;

  preset: SkyPreset;
  /** Smoothed values so a preset change cross-fades instead of snapping. */
  private cur = {
    zenith: new THREE.Color(),
    horizon: new THREE.Color(),
    ground: new THREE.Color(),
    sunColor: new THREE.Color(),
    fog: new THREE.Color(),
    ambSky: new THREE.Color(),
    ambGround: new THREE.Color(),
    sunIntensity: 1,
    ambIntensity: 1,
    fogDensity: 0.002,
    stars: 0,
    aurora: 0,
    haze: 1,
    sparkle: 1,
    cloud: 0.3,
  };

  constructor(scene: THREE.Scene, world: WorldUniforms, preset: SkyPreset) {
    this.scene = scene;
    this.world = world;
    this.preset = preset;
    this.group.name = "environment";

    this.skyUniforms = {
      uZenith: { value: new THREE.Color(preset.zenith) },
      uHorizon: { value: new THREE.Color(preset.horizon) },
      uGround: { value: new THREE.Color(preset.ground) },
      uSunColor: { value: new THREE.Color(preset.sunColor) },
      uSunDir: { value: new THREE.Vector3(...preset.sun).normalize() },
      uSunIntensity: { value: preset.sunIntensity },
      uStars: { value: preset.stars },
      uAurora: { value: preset.aurora },
      uHaze: { value: preset.haze },
      uTime: { value: 0 },
      uRetro: { value: 0 },
    };

    const skyGeo = new THREE.SphereGeometry(1, 40, 24);
    this.sky = new THREE.Mesh(
      skyGeo,
      new THREE.ShaderMaterial({
        uniforms: this.skyUniforms,
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        fog: false,
      }),
    );
    this.sky.renderOrder = -1000;
    this.sky.frustumCulled = false;
    this.sky.scale.setScalar(1);
    this.group.add(this.sky);

    // Three ridge layers at different distances for parallax.
    const layers = [
      { r: 1500, h: 320, seed: 11, near: "#2b3550", far: "#4c5f84" },
      { r: 2600, h: 520, seed: 27, near: "#3c4a68", far: "#68789c" },
      { r: 3900, h: 760, seed: 43, near: "#55658c", far: "#8b9bbd" },
    ];
    for (const l of layers) {
      const u = {
        uNear: { value: new THREE.Color(l.near) },
        uFar: { value: new THREE.Color(l.far) },
        uHeight: { value: l.h },
      };
      const mesh = new THREE.Mesh(
        buildRidge(l.r, l.h, l.seed),
        new THREE.ShaderMaterial({
          uniforms: u,
          vertexShader: RIDGE_VERT,
          fragmentShader: RIDGE_FRAG,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          fog: false,
        }),
      );
      mesh.renderOrder = -900;
      mesh.frustumCulled = false;
      this.ridges.push(mesh);
      this.ridgeUniforms.push(u);
      this.group.add(mesh);
    }

    this.sun = new THREE.DirectionalLight(
      new THREE.Color(preset.sunColor),
      preset.sunIntensity,
    );
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1536, 1536);
    const cam = this.sun.shadow.camera as THREE.OrthographicCamera;
    cam.left = -95;
    cam.right = 95;
    cam.top = 95;
    cam.bottom = -95;
    cam.near = 1;
    cam.far = 460;
    this.sun.shadow.bias = -0.0009;
    this.sun.shadow.normalBias = 0.6;
    this.sun.target = this.sunTarget;
    this.group.add(this.sun);
    this.group.add(this.sunTarget);

    this.hemi = new THREE.HemisphereLight(
      new THREE.Color(preset.ambientSky),
      new THREE.Color(preset.ambientGround),
      preset.ambientIntensity,
    );
    this.group.add(this.hemi);

    scene.fog = new THREE.FogExp2(new THREE.Color(preset.fog), preset.fogDensity);

    // Seed the smoothed state so the first frame is already correct.
    this.cur.zenith.set(preset.zenith);
    this.cur.horizon.set(preset.horizon);
    this.cur.ground.set(preset.ground);
    this.cur.sunColor.set(preset.sunColor);
    this.cur.fog.set(preset.fog);
    this.cur.ambSky.set(preset.ambientSky);
    this.cur.ambGround.set(preset.ambientGround);
    this.cur.sunIntensity = preset.sunIntensity;
    this.cur.ambIntensity = preset.ambientIntensity;
    this.cur.fogDensity = preset.fogDensity;
    this.cur.stars = preset.stars;
    this.cur.aurora = preset.aurora;
    this.cur.haze = preset.haze;
    this.cur.sparkle = preset.sparkle;
    this.cur.cloud = preset.cloudStrength;
  }

  setPreset(p: SkyPreset) {
    this.preset = p;
  }

  get sunDirection() {
    return this.skyUniforms.uSunDir.value as THREE.Vector3;
  }

  update(dt: number, camera: THREE.Camera, time: number, retro: number) {
    const p = this.preset;
    const k = 0.0006; // cross-fade smoothing

    const c = this.cur;
    c.zenith.lerp(new THREE.Color(p.zenith), 1 - Math.pow(k, dt));
    c.horizon.lerp(new THREE.Color(p.horizon), 1 - Math.pow(k, dt));
    c.ground.lerp(new THREE.Color(p.ground), 1 - Math.pow(k, dt));
    c.sunColor.lerp(new THREE.Color(p.sunColor), 1 - Math.pow(k, dt));
    c.fog.lerp(new THREE.Color(p.fog), 1 - Math.pow(k, dt));
    c.ambSky.lerp(new THREE.Color(p.ambientSky), 1 - Math.pow(k, dt));
    c.ambGround.lerp(new THREE.Color(p.ambientGround), 1 - Math.pow(k, dt));
    c.sunIntensity = damp(c.sunIntensity, p.sunIntensity, k, dt);
    c.ambIntensity = damp(c.ambIntensity, p.ambientIntensity, k, dt);
    c.fogDensity = damp(c.fogDensity, p.fogDensity, k, dt);
    c.stars = damp(c.stars, p.stars, k, dt);
    c.aurora = damp(c.aurora, p.aurora, k, dt);
    c.haze = damp(c.haze, p.haze, k, dt);
    c.sparkle = damp(c.sparkle, p.sparkle, k, dt);
    c.cloud = damp(c.cloud, p.cloudStrength, k, dt);

    const dir = (this.skyUniforms.uSunDir.value as THREE.Vector3);
    dir.lerp(
      new THREE.Vector3(...p.sun).normalize(),
      1 - Math.pow(k, dt),
    ).normalize();

    (this.skyUniforms.uZenith.value as THREE.Color).copy(c.zenith);
    (this.skyUniforms.uHorizon.value as THREE.Color).copy(c.horizon);
    (this.skyUniforms.uGround.value as THREE.Color).copy(c.ground);
    (this.skyUniforms.uSunColor.value as THREE.Color).copy(c.sunColor);
    this.skyUniforms.uSunIntensity.value = c.sunIntensity;
    this.skyUniforms.uStars.value = c.stars;
    this.skyUniforms.uAurora.value = c.aurora;
    this.skyUniforms.uHaze.value = c.haze;
    this.skyUniforms.uTime.value = time;
    this.skyUniforms.uRetro.value = retro;

    // Keep the dome and ridges centred on the camera.
    const cp = camera.position;
    this.sky.position.copy(cp);
    this.sky.scale.setScalar(1);
    for (let i = 0; i < this.ridges.length; i++) {
      this.ridges[i].position.set(cp.x, 0, cp.z);
      const u = this.ridgeUniforms[i];
      (u.uNear.value as THREE.Color).lerp(c.fog, 0.55 - i * 0.12);
      (u.uFar.value as THREE.Color).lerp(c.fog, 0.75 - i * 0.12);
    }

    // Lights follow the rider so the shadow map stays tight and crisp.
    this.sun.color.copy(c.sunColor);
    this.sun.intensity = c.sunIntensity;
    this.hemi.color.copy(c.ambSky);
    this.hemi.groundColor.copy(c.ambGround);
    this.hemi.intensity = c.ambIntensity;

    const focus = this.world.uPlayer.value;
    this.sunTarget.position.copy(focus);
    this.sun.position.copy(focus).addScaledVector(dir, 190);

    const fog = this.scene.fog as THREE.FogExp2;
    fog.color.copy(c.fog);
    fog.density = c.fogDensity;

    // Feed the shared world uniforms.
    this.world.uSunDir.value.copy(dir);
    this.world.uSunColor.value.copy(c.sunColor);
    this.world.uSkyColor.value.copy(c.ambSky);
    this.world.uShadeColor.value.copy(c.ambSky).multiplyScalar(0.9);
    this.world.uSparkle.value = c.sparkle;
    this.world.uCloudStrength.value = c.cloud;
    this.world.uCloudOffset.value.set(time * 0.004, time * 0.0016);
    this.world.uTime.value = time;
    this.world.uRetro.value = retro;
  }

  /** Sun position in normalised screen space, for god rays and lens flare. */
  sunScreenPosition(camera: THREE.Camera, out: THREE.Vector2) {
    const v = new THREE.Vector3()
      .copy(this.sunDirection)
      .multiplyScalar(4000)
      .add(camera.position);
    v.project(camera);
    out.set(v.x * 0.5 + 0.5, v.y * 0.5 + 0.5);
    return v.z < 1;
  }

  dispose() {
    this.sky.geometry.dispose();
    (this.sky.material as THREE.Material).dispose();
    for (const r of this.ridges) {
      r.geometry.dispose();
      (r.material as THREE.Material).dispose();
    }
    this.group.clear();
  }
}
