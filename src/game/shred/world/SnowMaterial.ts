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
  };
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
  ${NOISE_GLSL}
`;

/** Albedo mix for the terrain. Runs in place of the usual map lookup. */
const FRAGMENT_SNOW_ALBEDO = /* glsl */ `
  vec3 snowLit   = vec3(0.960, 0.972, 0.995);
  vec3 snowDeep  = vec3(0.855, 0.905, 0.985);
  vec3 iceCol    = vec3(0.560, 0.780, 0.885);
  vec3 rockCol   = vec3(0.190, 0.205, 0.250);
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
  outgoingLight += uShadeColor * rim * 0.28 * (0.35 + vMat.y * 0.9);

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
}

export function stylizeMaterial(
  mat: THREE.MeshStandardMaterial,
  uniforms: WorldUniforms,
  opts: StylizeOptions = {},
) {
  const snow = opts.snow ?? false;
  const sparkle = opts.sparkle ?? snow;

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
        "#include <opaque_fragment>",
        `${FRAGMENT_STYLIZE.replace(
          "if (uSparkle > 0.001)",
          sparkle ? "if (uSparkle > 0.001)" : "if (false)",
        )}\n#include <opaque_fragment>`,
      );
  };
  // Force a recompile if the material was already used.
  mat.customProgramCacheKey = () => `shred-${snow ? "snow" : "prop"}`;
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
    roughness: 0.82,
    metalness: 0.0,
    flatShading: false,
    dithering: true,
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
    ...params,
  });
  return stylizeMaterial(mat, uniforms, { snow: false, sparkle: false });
}
