/**
 * Value + gradient noise used by the terrain generator.
 *
 * This is deliberately allocation-free and branch-light: `heightAt()` is called
 * both by the mesh builder (tens of thousands of times per chunk) and by the
 * physics step (a handful of times per frame), so it has to stay cheap.
 */

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

/** Permutation-table simplex noise, seeded. Returns roughly [-1, 1]. */
export class Noise2D {
  private perm = new Uint8Array(512);
  private permMod12 = new Uint8Array(512);

  private static GRAD3 = new Int8Array([
    1, 1, -1, 1, 1, -1, -1, -1, 1, 0, -1, 0, 1, 0, -1, 0, 0, 1, 0, -1, 0, 1, 0,
    -1,
  ]);

  constructor(seed = 1337) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    // Fisher–Yates with a small LCG so the table is fully seed-determined.
    let s = seed >>> 0 || 1;
    for (let i = 255; i > 0; i--) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      const j = s % (i + 1);
      const t = p[i];
      p[i] = p[j];
      p[j] = t;
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  noise(xin: number, yin: number): number {
    const perm = this.perm;
    const permMod12 = this.permMod12;
    const G = Noise2D.GRAD3;

    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - (i - t);
    const y0 = yin - (j - t);

    let i1: number, j1: number;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    let n0 = 0,
      n1 = 0,
      n2 = 0;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) {
      const gi0 = permMod12[ii + perm[jj]] * 2;
      t0 *= t0;
      n0 = t0 * t0 * (G[gi0] * x0 + G[gi0 + 1] * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) {
      const gi1 = permMod12[ii + i1 + perm[jj + j1]] * 2;
      t1 *= t1;
      n1 = t1 * t1 * (G[gi1] * x1 + G[gi1 + 1] * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) {
      const gi2 = permMod12[ii + 1 + perm[jj + 1]] * 2;
      t2 *= t2;
      n2 = t2 * t2 * (G[gi2] * x2 + G[gi2 + 1] * y2);
    }

    return 70 * (n0 + n1 + n2);
  }

  /** Fractal brownian motion. */
  fbm(x: number, y: number, octaves = 4, lacunarity = 2.03, gain = 0.5) {
    let amp = 1;
    let freq = 1;
    let sum = 0;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += amp * this.noise(x * freq, y * freq);
      norm += amp;
      amp *= gain;
      freq *= lacunarity;
    }
    return sum / norm;
  }

  /** Ridged multifractal — makes the spines and cliff bands read as rock. */
  ridged(x: number, y: number, octaves = 4, lacunarity = 2.07, gain = 0.5) {
    let amp = 1;
    let freq = 1;
    let sum = 0;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      const n = 1 - Math.abs(this.noise(x * freq, y * freq));
      sum += amp * n * n;
      norm += amp;
      amp *= gain;
      freq *= lacunarity;
    }
    return sum / norm;
  }

  /** Billowy noise — soft powder pillows and wind drift. */
  billow(x: number, y: number, octaves = 3) {
    let amp = 1;
    let freq = 1;
    let sum = 0;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += amp * Math.abs(this.noise(x * freq, y * freq));
      norm += amp;
      amp *= 0.5;
      freq *= 2.0;
    }
    return (sum / norm) * 2 - 1;
  }
}
