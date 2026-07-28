/**
 * Board tracks.
 *
 * A ribbon laid down behind the rider, rebuilt from a rolling window of contact
 * points. The shader draws a shaded trench across the ribbon — darker in the
 * middle, with bright pushed-up ridges at the edges — which reads as a carved
 * groove in the snow without touching the terrain mesh.
 *
 * Width and depth track the edge angle and the amount of scrub, so a laid-over
 * carve leaves a fat trench and a straight schuss leaves a thin line.
 */

import * as THREE from "three";
import { clamp01 } from "../core/math";

const MAX_POINTS = 220;
const MIN_STEP = 0.42;

const VERT = /* glsl */ `
  attribute float aAge;
  attribute float aSide;
  attribute float aDepth;
  varying float vAge;
  varying float vSide;
  varying float vDepth;
  uniform float uTime;
  uniform float uFade;
  void main() {
    vAge = aAge;
    vSide = aSide;
    vDepth = aDepth;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying float vAge;
  varying float vSide;
  varying float vDepth;
  uniform float uTime;
  uniform float uFade;
  uniform vec3 uShade;
  uniform vec3 uRidge;
  void main() {
    float a = 1.0 - smoothstep(0.55, 1.0, vAge);
    // Across the ribbon: shadowed trench, bright ridges at the shoulders.
    float across = abs(vSide);
    float trench = 1.0 - smoothstep(0.0, 0.72, across);
    float ridge = smoothstep(0.62, 0.9, across) * (1.0 - smoothstep(0.9, 1.0, across));
    vec3 col = mix(uShade, uRidge, ridge);
    float alpha = (trench * 0.55 + ridge * 0.62) * a * uFade * clamp(vDepth, 0.2, 1.4);
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

interface TrailPoint {
  x: number;
  y: number;
  z: number;
  rx: number;
  rz: number;
  width: number;
  depth: number;
  t: number;
}

export class Trails {
  readonly mesh: THREE.Mesh;
  private geo = new THREE.BufferGeometry();
  private pos: THREE.BufferAttribute;
  private age: THREE.BufferAttribute;
  private side: THREE.BufferAttribute;
  private depth: THREE.BufferAttribute;
  private pts: TrailPoint[] = [];
  private time = 0;
  private life = 7.5;
  private uniforms: Record<string, THREE.IUniform>;

  constructor() {
    const verts = new Float32Array(MAX_POINTS * 2 * 3);
    const ages = new Float32Array(MAX_POINTS * 2);
    const sides = new Float32Array(MAX_POINTS * 2);
    const depths = new Float32Array(MAX_POINTS * 2);
    const idx = new Uint16Array((MAX_POINTS - 1) * 6);
    for (let i = 0; i < MAX_POINTS - 1; i++) {
      const a = i * 2;
      idx[i * 6] = a;
      idx[i * 6 + 1] = a + 1;
      idx[i * 6 + 2] = a + 2;
      idx[i * 6 + 3] = a + 2;
      idx[i * 6 + 4] = a + 1;
      idx[i * 6 + 5] = a + 3;
    }

    this.pos = new THREE.BufferAttribute(verts, 3).setUsage(THREE.DynamicDrawUsage);
    this.age = new THREE.BufferAttribute(ages, 1).setUsage(THREE.DynamicDrawUsage);
    this.side = new THREE.BufferAttribute(sides, 1).setUsage(THREE.DynamicDrawUsage);
    this.depth = new THREE.BufferAttribute(depths, 1).setUsage(THREE.DynamicDrawUsage);

    this.geo.setAttribute("position", this.pos);
    this.geo.setAttribute("aAge", this.age);
    this.geo.setAttribute("aSide", this.side);
    this.geo.setAttribute("aDepth", this.depth);
    this.geo.setIndex(new THREE.BufferAttribute(idx, 1));
    this.geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    this.geo.setDrawRange(0, 0);

    this.uniforms = {
      uTime: { value: 0 },
      uFade: { value: 1 },
      uShade: { value: new THREE.Color("#7d94b8") },
      uRidge: { value: new THREE.Color("#ffffff") },
    };

    this.mesh = new THREE.Mesh(
      this.geo,
      new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -8,
        side: THREE.DoubleSide,
      }),
    );
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 4;
  }

  clear() {
    this.pts.length = 0;
    this.geo.setDrawRange(0, 0);
  }

  /**
   * @param edge   signed edge load, -1..1
   * @param slip   sideways scrub in m/s
   */
  addPoint(
    p: THREE.Vector3,
    yaw: number,
    normalY: number,
    edge: number,
    slip: number,
    powder: number,
  ) {
    const last = this.pts[this.pts.length - 1];
    if (last) {
      const d = Math.hypot(p.x - last.x, p.z - last.z);
      if (d < MIN_STEP) return;
    }
    const rx = Math.cos(yaw);
    const rz = -Math.sin(yaw);
    const width =
      0.28 + Math.abs(edge) * 0.34 + clamp01(slip / 9) * 0.75 + powder * 0.22;
    const depth = 0.35 + Math.abs(edge) * 0.5 + clamp01(slip / 7) * 0.6 + powder * 0.5;

    this.pts.push({
      x: p.x,
      y: p.y + 0.045 + normalY * 0.02,
      z: p.z,
      rx,
      rz,
      width,
      depth,
      t: this.time,
    });
    if (this.pts.length > MAX_POINTS) this.pts.shift();
  }

  update(dt: number) {
    this.time += dt;
    while (this.pts.length && this.time - this.pts[0].t > this.life) this.pts.shift();

    const n = this.pts.length;
    if (n < 2) {
      this.geo.setDrawRange(0, 0);
      return;
    }

    for (let i = 0; i < n; i++) {
      const p = this.pts[i];
      const a = clamp01((this.time - p.t) / this.life);
      // Taper the very newest segment so the ribbon doesn't pop into existence.
      const taper = i === n - 1 ? 0.55 : 1;
      const w = p.width * taper;
      this.pos.setXYZ(i * 2, p.x - p.rx * w, p.y, p.z - p.rz * w);
      this.pos.setXYZ(i * 2 + 1, p.x + p.rx * w, p.y, p.z + p.rz * w);
      this.age.setX(i * 2, a);
      this.age.setX(i * 2 + 1, a);
      this.side.setX(i * 2, -1);
      this.side.setX(i * 2 + 1, 1);
      this.depth.setX(i * 2, p.depth);
      this.depth.setX(i * 2 + 1, p.depth);
    }

    this.pos.needsUpdate = true;
    this.age.needsUpdate = true;
    this.side.needsUpdate = true;
    this.depth.needsUpdate = true;
    this.geo.setDrawRange(0, (n - 1) * 6);
    this.uniforms.uTime.value = this.time;
  }

  setTint(shade: THREE.Color, ridge: THREE.Color) {
    (this.uniforms.uShade.value as THREE.Color).copy(shade);
    (this.uniforms.uRidge.value as THREE.Color).copy(ridge);
  }

  dispose() {
    this.geo.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
