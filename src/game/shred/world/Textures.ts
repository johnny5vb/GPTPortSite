/**
 * Procedural surface detail — normal and roughness maps, generated at runtime.
 *
 * Why generate rather than ship images: snow, ice, rock and bark are exactly
 * the surfaces noise is good at, the maps come out seamless by construction
 * (the noise is evaluated on a torus, so opposite edges are the same samples),
 * and the game keeps its zero-asset property with no download weight and no
 * licence tracking.
 *
 * The important output here is the **normal** map, not the colour. The terrain
 * already had believable albedo; what it had none of was micro-relief, so every
 * slope returned exactly one lighting value and read as painted cardboard. Wind
 * crust, sastrugi ridges, ice fracture and rock strata are all shape.
 */

import * as THREE from "three";

// ────────────────────────────────────────────────────────────────── noise ────

/** Hash for integer lattice points, wrapped so the tile is seamless. */
function lat(x: number, y: number, period: number, seed: number) {
  const xi = ((x % period) + period) % period;
  const yi = ((y % period) + period) % period;
  let h = xi * 374761393 + yi * 668265263 + seed * 1274126177;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Periodic value noise. `period` is in lattice cells, so tiles repeat exactly. */
function vnoise(x: number, y: number, period: number, seed: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = fade(x - x0);
  const fy = fade(y - y0);
  const a = lat(x0, y0, period, seed);
  const b = lat(x0 + 1, y0, period, seed);
  const c = lat(x0, y0 + 1, period, seed);
  const d = lat(x0 + 1, y0 + 1, period, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/** Multi-octave periodic noise. Each octave doubles the lattice period too. */
function fbm(x: number, y: number, period: number, octaves: number, seed: number, gain = 0.5) {
  let sum = 0;
  let amp = 1;
  let norm = 0;
  let p = period;
  let f = 1;
  for (let o = 0; o < octaves; o++) {
    sum += vnoise(x * f, y * f, p, seed + o * 31) * amp;
    norm += amp;
    amp *= gain;
    f *= 2;
    p *= 2;
  }
  return sum / norm;
}

/** Periodic ridged noise — the sharp creases of wind crust and rock strata. */
function ridged(x: number, y: number, period: number, octaves: number, seed: number) {
  let sum = 0;
  let amp = 1;
  let norm = 0;
  let p = period;
  let f = 1;
  for (let o = 0; o < octaves; o++) {
    const n = 1 - Math.abs(vnoise(x * f, y * f, p, seed + o * 17) * 2 - 1);
    sum += n * n * amp;
    norm += amp;
    amp *= 0.5;
    f *= 2;
    p *= 2;
  }
  return sum / norm;
}

// ──────────────────────────────────────────────────────────── height → map ────

/**
 * Turn a height field into a tangent-space normal map.
 *
 * Sobel rather than a plain difference: with only 8 bits per channel to land
 * in, the wider kernel is what keeps gentle slopes from banding into visible
 * terraces.
 */
function heightToNormal(h: Float32Array, size: number, strength: number) {
  const out = new Uint8ClampedArray(new ArrayBuffer(size * size * 4));
  const at = (x: number, y: number) => h[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tl = at(x - 1, y - 1), t = at(x, y - 1), tr = at(x + 1, y - 1);
      const l = at(x - 1, y), r = at(x + 1, y);
      const bl = at(x - 1, y + 1), b = at(x, y + 1), br = at(x + 1, y + 1);
      const dx = tl + 2 * l + bl - (tr + 2 * r + br);
      const dy = tl + 2 * t + tr - (bl + 2 * b + br);
      let nx = dx * strength;
      let ny = dy * strength;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      const i = (y * size + x) * 4;
      out[i] = (nx * 0.5 + 0.5) * 255;
      out[i + 1] = (ny * 0.5 + 0.5) * 255;
      out[i + 2] = (nz / len) * 0.5 * 255 + 127.5;
      out[i + 3] = 255;
    }
  }
  return out;
}

function toTexture(data: Uint8ClampedArray<ArrayBuffer>, size: number, srgb = false): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.putImageData(new ImageData(data, size, size), 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// ──────────────────────────────────────────────────────────────── surfaces ────

export interface SurfaceMaps {
  /** Packed detail normal for all four snow surface types. */
  snow: THREE.Texture;
  /** Coarser, higher-relief map used on rock, props and scatter. */
  rock: THREE.Texture;
  /**
   * R = snow roughness break-up, G = glitter mask, B = crust hardness.
   * One fetch instead of three, because this is sampled per pixel over the
   * entire screen.
   */
  mask: THREE.Texture;
}

let cached: SurfaceMaps | null = null;

/** Built once per page. ~30ms total, and it never has to be downloaded. */
export function surfaceMaps(): SurfaceMaps {
  if (cached) return cached;
  const S = 512;
  const P = 64; // lattice period in cells — the tile repeats every P cells

  // ── snow ────────────────────────────────────────────────────────────────
  // Fine wind grain, plus sastrugi: the long shallow ridges wind carves into
  // an exposed slope, which is what makes a snowfield read as weather rather
  // than as a smooth surface.
  const snowH = new Float32Array(S * S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = (x / S) * P;
      const v = (y / S) * P;
      const grain = fbm(u * 4, v * 4, P * 4, 4, 11);
      const sastrugi = ridged(u * 0.85, v * 0.28, P, 3, 23);
      const drift = fbm(u * 0.5, v * 0.5, P, 3, 41);
      snowH[y * S + x] = grain * 0.35 + sastrugi * 0.42 + drift * 0.5;
    }
  }
  const snow = toTexture(heightToNormal(snowH, S, 2.6), S);

  // ── rock ────────────────────────────────────────────────────────────────
  // Strata running one way, fracture running across them.
  const rockH = new Float32Array(S * S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = (x / S) * P;
      const v = (y / S) * P;
      const strata = ridged(u * 0.4, v * 1.6, P, 4, 7);
      const fracture = ridged(u * 2.1, v * 1.9, P * 2, 3, 53);
      const grit = fbm(u * 6, v * 6, P * 6, 3, 71);
      rockH[y * S + x] = strata * 0.55 + fracture * 0.3 + grit * 0.22;
    }
  }
  const rock = toTexture(heightToNormal(rockH, S, 5.2), S);

  // ── mask ────────────────────────────────────────────────────────────────
  const mask = new Uint8ClampedArray(new ArrayBuffer(S * S * 4));
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = (x / S) * P;
      const v = (y / S) * P;
      const patch = fbm(u * 1.4, v * 1.4, P, 4, 97);
      const glint = fbm(u * 9, v * 9, P * 9, 2, 131);
      const crust = ridged(u * 0.7, v * 0.7, P, 3, 151);
      const i = (y * S + x) * 4;
      mask[i] = patch * 255;
      mask[i + 1] = Math.pow(glint, 5) * 255;
      mask[i + 2] = crust * 255;
      mask[i + 3] = 255;
    }
  }

  cached = { snow, rock, mask: toTexture(mask, S) };
  return cached;
}
