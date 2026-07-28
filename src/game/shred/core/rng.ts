/**
 * Deterministic randomness. Every mountain in SHRED is generated from a single
 * 32-bit seed, so a seed is a shareable run: the daily challenge is just
 * `hashString(YYYY-MM-DD)`.
 */

/** mulberry32 — small, fast, good enough distribution for terrain + scatter. */
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = ReturnType<typeof makeRng>;

export const rngRange = (rng: Rng, lo: number, hi: number) =>
  lo + rng() * (hi - lo);

export const rngInt = (rng: Rng, lo: number, hi: number) =>
  Math.floor(lo + rng() * (hi - lo + 1));

export const rngPick = <T>(rng: Rng, arr: readonly T[]): T =>
  arr[Math.min(arr.length - 1, Math.floor(rng() * arr.length))];

export const rngSign = (rng: Rng) => (rng() < 0.5 ? -1 : 1);

/** Gaussian-ish via sum of uniforms. Cheap, plenty good for particle jitter. */
export const rngGauss = (rng: Rng) =>
  (rng() + rng() + rng() - 1.5) * 1.1547;

export function hashString(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable 2D integer hash → [0,1). Used for per-cell feature placement. */
export function hash2(x: number, y: number, seed = 0) {
  let h = (Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1)) >>> 0;
  h = (h ^ seed) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** Three decorrelated streams from one cell — saves calling hash2 with offsets. */
export function hash2v(x: number, y: number, seed = 0) {
  return [
    hash2(x, y, seed),
    hash2(x + 8191, y - 3571, seed ^ 0x9e3779b9),
    hash2(x - 4231, y + 6907, seed ^ 0x85ebca6b),
  ] as const;
}

export const seedToName = (seed: number) => {
  const A = [
    "GLASS",
    "IRON",
    "WOLF",
    "BLACK",
    "SILVER",
    "NORTH",
    "PALE",
    "STORM",
    "EMBER",
    "HOLLOW",
    "COLD",
    "WILD",
    "LOST",
    "RED",
    "BLUE",
    "LAST",
  ];
  const B = [
    "SPINE",
    "BOWL",
    "CIRQUE",
    "COULOIR",
    "RIDGE",
    "BASIN",
    "SHELF",
    "CHUTE",
    "GLADE",
    "PASS",
    "CORNICE",
    "SADDLE",
    "NOTCH",
    "GULLY",
    "FACE",
    "TRAVERSE",
  ];
  return `${A[seed % A.length]} ${B[(seed >>> 8) % B.length]}`;
};
