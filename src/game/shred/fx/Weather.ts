/**
 * Weather: falling snow and the wind streaks that appear when you get moving.
 *
 * Both are single draw calls with the motion done entirely in the vertex
 * shader. The snow volume is a box that follows the camera and wraps its
 * particles modulo the box size, so an infinite snowfall costs a fixed 12k
 * points no matter how far you ride.
 */

import * as THREE from "three";
import { clamp01 } from "../core/math";

const SNOW_VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform vec3 uCam;
  uniform vec3 uBox;
  uniform vec3 uWind;
  uniform float uFall;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec3 p = position;
    // Drift + fall, then wrap into a box centred on the camera.
    p.x += uWind.x * uTime + sin(uTime * 0.7 + aSeed * 31.0) * 1.6;
    p.z += uWind.z * uTime + cos(uTime * 0.6 + aSeed * 17.0) * 1.6;
    p.y -= (uFall * (0.55 + aSeed * 0.9)) * uTime;

    vec3 rel = p - uCam;
    rel = mod(rel + uBox * 0.5, uBox) - uBox * 0.5;
    vec3 world = uCam + rel;

    vec4 mv = modelViewMatrix * vec4(world, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    gl_PointSize = aSize * uPixelRatio * 52.0 / max(0.5, dist);
    gl_PointSize = clamp(gl_PointSize, 0.6, 13.0);
    // Fade out anything close enough to read as a blob rather than a flake.
    vAlpha = smoothstep(2.5, 11.0, dist) * (1.0 - smoothstep(uBox.z * 0.32, uBox.z * 0.5, dist));
    vSeed = aSeed;
  }
`;

const SNOW_FRAG = /* glsl */ `
  precision highp float;
  varying float vAlpha;
  varying float vSeed;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float d = dot(uv, uv);
    if (d > 1.0) discard;
    float a = pow(1.0 - d, 1.5) * vAlpha * uOpacity;
    gl_FragColor = vec4(uColor * (0.85 + vSeed * 0.3), a);
    #include <colorspace_fragment>
  }
`;

export class Snowfall {
  readonly points: THREE.Points;
  private uniforms: Record<string, THREE.IUniform>;
  private time = 0;

  constructor(count = 12000, box = new THREE.Vector3(160, 90, 160)) {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * box.x;
      pos[i * 3 + 1] = (Math.random() - 0.5) * box.y;
      pos[i * 3 + 2] = (Math.random() - 0.5) * box.z;
      seed[i] = Math.random();
      size[i] = 0.5 + Math.random() * Math.random() * 2.6;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);

    this.uniforms = {
      uTime: { value: 0 },
      uCam: { value: new THREE.Vector3() },
      uBox: { value: box.clone() },
      uWind: { value: new THREE.Vector3(1.6, 0, 0.8) },
      uFall: { value: 5.5 },
      uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Color("#ffffff") },
      uOpacity: { value: 0.85 },
    };

    this.points = new THREE.Points(
      geo,
      new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: SNOW_VERT,
        fragmentShader: SNOW_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    );
    this.points.frustumCulled = false;
    this.points.renderOrder = 12;
  }

  update(dt: number, camera: THREE.Camera, pixelRatio: number) {
    this.time += dt;
    this.uniforms.uTime.value = this.time;
    (this.uniforms.uCam.value as THREE.Vector3).copy(camera.position);
    this.uniforms.uPixelRatio.value = pixelRatio;
  }

  configure(opts: {
    intensity?: number;
    fall?: number;
    wind?: [number, number, number];
    color?: THREE.Color;
  }) {
    if (opts.intensity !== undefined)
      this.uniforms.uOpacity.value = opts.intensity;
    if (opts.fall !== undefined) this.uniforms.uFall.value = opts.fall;
    if (opts.wind)
      (this.uniforms.uWind.value as THREE.Vector3).set(...opts.wind);
    if (opts.color) (this.uniforms.uColor.value as THREE.Color).copy(opts.color);
  }

  dispose() {
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}

// ─────────────────────────────────────────────────────────── wind streaks ────

const STREAK_VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aEnd;
  uniform float uTime;
  uniform vec3 uCam;
  uniform vec3 uForward;
  uniform float uSpeed;
  uniform float uLength;
  varying float vAlpha;
  varying float vT;

  void main() {
    float seed = aSeed;
    // Distribute streaks in a cylinder around the camera's forward axis.
    float ang = seed * 6.2831 + uTime * 0.35;
    float rad = 1.8 + fract(seed * 91.7) * 9.0;
    float along = fract(seed * 37.3 + uTime * (0.45 + uSpeed * 0.035)) * 46.0 - 8.0;

    vec3 fwd = normalize(uForward);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
    vec3 up = cross(fwd, right);

    vec3 base = uCam + fwd * along + right * cos(ang) * rad + up * sin(ang) * rad;
    vec3 p = base - fwd * (aEnd * uLength * uSpeed * 0.06);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vT = aEnd;
    vAlpha = smoothstep(6.0, 22.0, uSpeed) * (1.0 - smoothstep(30.0, 44.0, along));
  }
`;

const STREAK_FRAG = /* glsl */ `
  precision highp float;
  varying float vAlpha;
  varying float vT;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float a = vAlpha * (1.0 - vT) * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`;

export class WindStreaks {
  readonly lines: THREE.LineSegments;
  private uniforms: Record<string, THREE.IUniform>;
  private time = 0;

  constructor(count = 420) {
    const pos = new Float32Array(count * 2 * 3);
    const seed = new Float32Array(count * 2);
    const end = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const s = Math.random();
      seed[i * 2] = s;
      seed[i * 2 + 1] = s;
      end[i * 2] = 0;
      end[i * 2 + 1] = 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);

    this.uniforms = {
      uTime: { value: 0 },
      uCam: { value: new THREE.Vector3() },
      uForward: { value: new THREE.Vector3(0, 0, 1) },
      uSpeed: { value: 0 },
      uLength: { value: 1 },
      uColor: { value: new THREE.Color("#eaf4ff") },
      uOpacity: { value: 0.5 },
    };

    this.lines = new THREE.LineSegments(
      geo,
      new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: STREAK_VERT,
        fragmentShader: STREAK_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.lines.frustumCulled = false;
    this.lines.renderOrder = 20;
  }

  update(
    dt: number,
    camera: THREE.Camera,
    forward: THREE.Vector3,
    speed: number,
    intensity = 1,
  ) {
    this.time += dt;
    this.uniforms.uTime.value = this.time;
    (this.uniforms.uCam.value as THREE.Vector3).copy(camera.position);
    (this.uniforms.uForward.value as THREE.Vector3).copy(forward);
    this.uniforms.uSpeed.value = speed;
    this.uniforms.uOpacity.value = 0.42 * intensity * clamp01(speed / 26);
    this.lines.visible = speed > 8 && intensity > 0.02;
  }

  dispose() {
    this.lines.geometry.dispose();
    (this.lines.material as THREE.Material).dispose();
  }
}
