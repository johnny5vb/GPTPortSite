/**
 * Stylised snow / world materials.
 *
 * These are `MeshStandardMaterial`s patched through `onBeforeCompile` rather
 * than raw ShaderMaterials, which keeps three's shadow mapping, fog and tone
 * mapping working while still giving us full control of the look:
 *
 *  - albedo is mixed per-vertex from four surface weights (ice / powder / rock
 *    / groomed corduroy) that the terrain builder bakes into an attribute;
 *  - drifting cloud shadows darken the direct light;
 *  - a world-anchored glint field makes the powder sparkle;
 *  - a cold rim term fakes the light wrapping through the snow at the edges;
 *  - a global "retro" uniform snaps vertices and posterises colour for the
 *    unlockable 1999 rendering mode.
 */

import * as THREE from "three";
import { surfaceMaps } from "./Textures";

export interface WorldUniforms {
  uTime: { value: number };
  uSunDir: { value: THREE.Vector3 };
  uSunColor: { value: THREE.Color };
  uSkyColor: { value: THREE.Color };
  uShadeColor: { value: THREE.Color };
  uCloudOffset: { value: THREE.Vector2 };
  uCloudStrength: { value: number };
  uSparkle: { value: number };
  uRetro: { value: number };
  uRetroRes: { value: number };
  uPlayer: { value: THREE.Vector3 };
  /** Detail normal / mask maps — see Textures.ts. */
  uSnowN: { value: THREE.Texture | null };
  uRockN: { value: THREE.Texture | null };
  uMask: { value: THREE.Texture | null };
  /** Global multiplier on surface relief, 0 disables it entirely. */
  uDetail: { value: number };
}

export function createWorldUniforms(): WorldUniforms {
  return {
    uTime: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0.3, 0.55, -0.78).normalize() },
    uSunColor: { value: new THREE.Color("#ffd8a8") },
    uSkyColor: { value: new THREE.Color("#8fb6ff") },
    uShadeColor: { value: new THREE.Color("#4a6ea8") },
    uCloudOffset: { value: new THREE.Vector2() },
    uCloudStrength: { value: 0.35 },
    uSparkle: { value: 1 },
    uRetro: { value: 0 },
    uRetroRes: { value: 160 },
    uPlayer: { value: new THREE.Vector3() },
    uSnowN: { value: null },
    uRockN: { value: null },
    uMask: { value: null },
    uDetail: { value: 1 },
  };
}

/**
 * Attach the procedural surface maps. Separate from `createWorldUniforms` so
 * the uniform object can exist before there is a document to build canvases in.
 */
export function attachSurfaceMaps(u: WorldUniforms) {
  const m = surfaceMaps();
  u.uSnowN.value = m.snow;
  u.uRockN.value = m.rock;
  u.uMask.value = m.mask;
}

const NOISE_GLSL = /* glsl */ `
  float shHash(vec2 p){
    p = fract(p * vec2(233.34, 851.73));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
  }
  float shHash3(vec3 p){
    p = fract(p * 0.3183099 + vec3(0.1, 0.71, 0.42));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float shValue(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = shHash(i), b = shHash(i + vec2(1.0, 0.0));
    float c = shHash(i + vec2(0.0, 1.0)), d = shHash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float shFbm(vec2 p){
    return shValue(p) * 0.6 + shValue(p * 2.13) * 0.28 + shValue(p * 4.7) * 0.12;
  }
`;

const VERTEX_PARS = /* glsl */ `
  attribute vec4 aMat;
  varying vec4 vMat;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  uniform float uRetro;
  uniform float uRetroRes;
`;

const VERTEX_MAIN = /* glsl */ `
  vMat = aMat;
  #ifdef USE_INSTANCING
    vWorldPos = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
  #else
    vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
  #endif
  vWorldNormal = normalize(inverseTransformDirection(transformedNormal, viewMatrix));
`;

const VERTEX_SNAP = /* glsl */ `
  if (uRetro > 0.5) {
    float g = uRetroRes;
    gl_Position.xy = floor(gl_Position.xy / gl_Position.w * g) / g * gl_Position.w;
  }
`;

const FRAGMENT_PARS = /* glsl */ `
  varying vec4 vMat;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  uniform float uTime;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uSkyColor;
  uniform vec3 uShadeColor;
  uniform vec2 uCloudOffset;
  uniform float uCloudStrength;
  uniform float uSparkle;
  uniform float uRetro;
  uniform vec3 uPlayer;
  uniform sampler2D uSnowN;
  uniform sampler2D uRockN;
  uniform sampler2D uMask;
  uniform float uDetail;
  ${NOISE_GLSL}

  /**
   * World-space detail normal.
   *
   * The terrain is a streamed heightfield with no meaningful UVs, so the maps
   * are projected from world space: XZ for anything roughly horizontal, and a
   * triplanar blend onto the vertical planes as the surface tips up, which is
   * what stops cliff faces from showing a smeared version of the snow grain.
   *
   * Two octaves at deliberately non-harmonic scales — a single projection at
   * one scale shows its tile from the air within a few seconds of riding.
   */
  vec3 shDetailNormal(vec3 wp, vec3 N, float rockAmt, float strength) {
    if (strength < 0.001) return N;

    // Relief fades out with distance. Normal maps alias badly at grazing
    // angles, and a snowfield two hundred metres away has no business showing
    // individual wind ripples anyway — mip bias alone doesn't get there.
    strength *= 1.0 - smoothstep(55.0, 240.0, length(cameraPosition - wp));
    if (strength < 0.001) return N;

    vec3 an = abs(N);
    float up = smoothstep(0.35, 0.85, an.y);

    vec2 uvA = wp.xz * 0.36;
    vec2 uvB = wp.xz * 0.0815 + 21.7;
    vec3 snowA = texture2D(uSnowN, uvA).xyz * 2.0 - 1.0;
    vec3 snowB = texture2D(uSnowN, uvB).xyz * 2.0 - 1.0;
    vec2 flat2 = snowA.xy * 0.55 + snowB.xy * 0.9;

    // Vertical projection for the steeps, picking whichever wall faces us.
    vec2 uvW = (an.x > an.z ? wp.zy : wp.xy) * 0.14;
    vec3 wall = texture2D(uRockN, uvW).xyz * 2.0 - 1.0;
    vec3 rockD = texture2D(uRockN, wp.xz * 0.11).xyz * 2.0 - 1.0;

    vec2 d = mix(wall.xy * 1.35, mix(flat2, rockD.xy * 1.15, rockAmt), up);

    // Build a frame around the geometric normal and lean it.
    vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), N) + vec3(1e-4, 0.0, 0.0));
    vec3 B = cross(N, T);
    return normalize(N + (T * d.x + B * d.y) * strength);
  }
`;

/** Albedo mix for the terrain. Runs in place of the usual map lookup. */
const FRAGMENT_SNOW_ALBEDO = /* glsl */ `
  vec3 snowLit   = vec3(0.955, 0.968, 0.995);
  vec3 snowDeep  = vec3(0.760, 0.845, 0.980);
  vec3 iceCol    = vec3(0.560, 0.780, 0.885);
  vec3 rockCol   = vec3(0.120, 0.132, 0.168);
  vec3 groomCol  = vec3(0.925, 0.945, 0.985);

  float ice = vMat.x, powder = vMat.y, rock = vMat.z, groom = vMat.w;

  // Powder pillows: soft large-scale variation so flat light still reads.
  float pill = shFbm(vWorldPos.xz * 0.055) - 0.5;
  vec3 albedo = mix(snowLit, snowDeep, clamp(powder * 0.9 + pill * 0.5, 0.0, 1.0));

  // Corduroy on groomed pitches — thin ridges running down the fall line.
  float cord = sin(vWorldPos.x * 3.4) * 0.5 + 0.5;
  albedo = mix(albedo, groomCol * (0.955 + cord * 0.045), groom * 0.85);

  // Wind texture on ice, then rock last so it always wins on the steeps.
  float iceGrain = shFbm(vWorldPos.xz * 0.35 + 3.1);
  albedo = mix(albedo, iceCol * (0.85 + iceGrain * 0.3), ice * 0.8);
  float rockGrain = shFbm(vWorldPos.xz * 0.22);
  albedo = mix(albedo, rockCol * (0.7 + rockGrain * 0.8), clamp(rock, 0.0, 1.0));

  diffuseColor.rgb *= albedo;
`;

/** Post-lighting stylisation shared by terrain and props. */
const FRAGMENT_STYLIZE = /* glsl */ `
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 N = normalize(vWorldNormal);

  // Drifting cloud shadows.
  float cloud = shFbm(vWorldPos.xz * 0.0016 + uCloudOffset);
  cloud = smoothstep(0.34, 0.72, cloud);
  float cloudMul = mix(1.0 - uCloudStrength, 1.0, cloud);
  outgoingLight *= cloudMul;

  // Cold wrap light at grazing angles — cheap stand-in for snow scattering.
  float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  outgoingLight += uShadeColor * rim * 0.14 * (0.35 + vMat.y * 0.9);

  // Sun sheen on ice and groomed snow.
  vec3 H = normalize(uSunDir + V);
  float sheen = pow(max(dot(N, H), 0.0), mix(28.0, 220.0, vMat.x));
  outgoingLight += uSunColor * sheen * (vMat.x * 0.85 + vMat.w * 0.22) * cloudMul;

  // Sparkle: a world-anchored glint field that twinkles as you move past it.
  if (uSparkle > 0.001) {
    vec3 cell = floor(vWorldPos * 7.0);
    float s = shHash3(cell);
    float tw = sin(uTime * 6.0 + s * 62.83) * 0.5 + 0.5;
    float glint = step(0.955, s) * pow(tw, 22.0);
    float facing = pow(max(dot(N, uSunDir), 0.0), 1.5);
    outgoingLight += uSunColor * glint * facing * 2.6 * uSparkle *
      (0.35 + vMat.y) * (1.0 - clamp(vMat.z, 0.0, 1.0)) * cloudMul;
  }

  // 1999 mode: posterise and dither.
  if (uRetro > 0.5) {
    float d = shHash(gl_FragCoord.xy) * 0.055;
    outgoingLight = floor((outgoingLight + d) * 14.0) / 14.0;
  }
`;

interface StylizeOptions {
  /** Terrain uses the four-way snow albedo mix; props keep their own colour. */
  snow?: boolean;
  /** Props still want cloud shadows + rim, but no sparkle. */
  sparkle?: boolean;
  /**
   * Procedural surface relief, projected from **world space**.
   *
   * That projection is free and seamless for anything bolted to the mountain,
   * and completely wrong for anything that moves through it: the pattern would
   * slide across a rider's jacket as they descend. Anything that moves must
   * pass `detail: false` and bring its own map.
   */
  detail?: boolean;
}

export function stylizeMaterial(
  mat: THREE.MeshStandardMaterial,
  uniforms: WorldUniforms,
  opts: StylizeOptions = {},
) {
  const snow = opts.snow ?? false;
  const sparkle = opts.sparkle ?? snow;
  const detail = opts.detail ?? true;

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${VERTEX_PARS}`)
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>\n${VERTEX_MAIN}`,
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>\n${VERTEX_SNAP}`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${FRAGMENT_PARS}`)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>\n${snow ? FRAGMENT_SNOW_ALBEDO : ""}`,
      )
      .replace(
        "#include <normal_fragment_begin>",
        `#include <normal_fragment_begin>
        ${detail ? `{` : `if (false) {`}
          vec3 wN = normalize(vWorldNormal);
          vec3 wD = shDetailNormal(vWorldPos, wN, ${snow ? "clamp(vMat.z, 0.0, 1.0)" : "0.35"}, uDetail * ${snow ? "0.75" : "0.55"});
          normal = normalize((viewMatrix * vec4(wD, 0.0)).xyz);
        }`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        ${
          snow
            ? `{
          // Ice is polished, powder is not, and wind crust sits between them.
          float crust = texture2D(uMask, vWorldPos.xz * 0.021).b;
          roughnessFactor *= mix(1.0, 0.34, clamp(vMat.x, 0.0, 1.0));
          roughnessFactor *= mix(1.0, 1.22, clamp(vMat.y, 0.0, 1.0));
          roughnessFactor = clamp(roughnessFactor * mix(0.9, 1.12, crust), 0.04, 1.0);
        }`
            : ""
        }`,
      )
      .replace(
        "#include <opaque_fragment>",
        `${FRAGMENT_STYLIZE.replace(
          "if (uSparkle > 0.001)",
          sparkle ? "if (uSparkle > 0.001)" : "if (false)",
        )}\n#include <opaque_fragment>`,
      );
  };
  // Force a recompile if the material was already used.
  mat.customProgramCacheKey = () => `shred-${snow ? "snow" : "prop"}-${detail ? "d" : "n"}`;
  mat.needsUpdate = true;
  return mat;
}

/** Geometries that don't carry `aMat` still need the attribute to exist. */
export function ensureMatAttribute(
  geo: THREE.BufferGeometry,
  fill: [number, number, number, number] = [0, 0, 0, 0],
) {
  if (geo.getAttribute("aMat")) return;
  const count = geo.getAttribute("position").count;
  const arr = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    arr[i * 4] = fill[0];
    arr[i * 4 + 1] = fill[1];
    arr[i * 4 + 2] = fill[2];
    arr[i * 4 + 3] = fill[3];
  }
  geo.setAttribute("aMat", new THREE.BufferAttribute(arr, 4));
}

export function createSnowMaterial(uniforms: WorldUniforms) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.78,
    metalness: 0.0,
    flatShading: false,
    dithering: true,
    // Snow is already near-white; taking the full environment on top of that
    // blows the highlights out, so it gets a reduced share.
    envMapIntensity: 0.42,
  });
  return stylizeMaterial(mat, uniforms, { snow: true, sparkle: true });
}

export function createPropMaterial(
  uniforms: WorldUniforms,
  params: THREE.MeshStandardMaterialParameters,
) {
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.9,
    metalness: 0,
    envMapIntensity: 0.75,
    ...params,
  });
  return stylizeMaterial(mat, uniforms, { snow: false, sparkle: false });
}
