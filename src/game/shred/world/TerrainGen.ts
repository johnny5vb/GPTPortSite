/**
 * SHRED 1999 — procedural mountain.
 *
 * The whole world is one analytic function, `height(x, z)`. The renderer
 * tessellates it into chunks and the physics samples it directly, so the board
 * is always *exactly* on the surface you can see — no collision mesh drift, no
 * falling through seams.
 *
 * Layout: the rider descends toward +Z. Base height falls off linearly with Z
 * (the fall line), a meandering corridor keeps the run readable, and the space
 * outside the corridor rises into ridged rock walls so the mountain funnels you
 * downhill without ever needing an invisible wall.
 *
 * Features (kickers, pipes, lakes, gullies…) are assigned per 150m segment from
 * a hash of the segment index, so the whole mountain is reproducible from a
 * single seed and any point is evaluable without generating its neighbours.
 */

import { Noise2D } from "../core/noise";
import { clamp, clamp01, lerp, smoothstep } from "../core/math";
import { hash2, hash2v } from "../core/rng";

export const SEGMENT_LENGTH = 150;

/** Shared "no jib here" result, so the hot path allocates nothing. */
const ZERO_JIB = { lift: 0, grip: 0, dx: 0 };

/**
 * Pitch modulation. A + B must stay comfortably under 1 or the run flattens
 * out, and a flat section on a snowboard is a dead section.
 */
const PITCH_A = 0.28;
const PITCH_L1 = 260;
const PITCH_B = 0.13;
const PITCH_L2 = 95;

export type FeatureKind =
  | "open"
  | "kickers"
  | "park"
  | "halfpipe"
  | "moguls"
  | "lake"
  | "cliff"
  | "gully"
  | "forest"
  | "glacier"
  | "village"
  | "bridge"
  | "cave"
  | "shortcut"
  | "ramps"
  | "gap"
  | "tunnel"
  | "jibs";

export interface Kicker {
  x: number;
  z: number;
  width: number;
  length: number;
  height: number;
  /** 0 = mellow floater, 1 = vertical booter. */
  kick: number;
}

/**
 * A rail or a box.
 *
 * Jibs are deliberately **not** part of `height()`. A rail is 40cm wide and the
 * terrain mesh is tessellated far coarser than that, so a rail in the
 * heightfield would be a surface the physics could feel and the renderer could
 * not draw. Instead the prop mesh is built from these numbers and the physics
 * reads them back through `sample()` — same source, so the board still sits
 * exactly on the thing you can see, which is the whole point of the analytic
 * mountain.
 */
export interface Jib {
  x: number;
  /** Centre of the jib along the run. */
  z: number;
  length: number;
  /** Half the rideable width. A rail is ~0.2, a box ~0.8. */
  halfWidth: number;
  /** How far it stands off the snow. */
  height: number;
  kind: "rail" | "box";
}

export interface Feature {
  seg: number;
  kind: FeatureKind;
  z0: number;
  z1: number;
  kickers: Kicker[];
  jibs: Jib[];
  /** Per-feature scratch parameters (meaning depends on `kind`). */
  a: number;
  b: number;
  c: number;
  /** Side (-1 / +1) used by village shelves, shortcuts, cliff drops. */
  side: number;
}

export interface MountainPreset {
  id: string;
  name: string;
  /** One line of character, shown on the garage card. */
  blurb: string;
  /** Vertical drop per metre travelled. 0.22 mellow, 0.42 steep. */
  slope: number;
  /**
   * Where the bottom of the mountain is, in metres. Every run has an end and a
   * finish line at it — a descent with no bottom is a screensaver. Endless mode
   * is the deliberate exception and ignores this.
   */
  length: number;
  /** Corridor half-width in metres. */
  corridor: number;
  /** Large-scale terrain roughness multiplier. */
  roughness: number;
  /** 0..1 — how much of the run is treed. */
  treeDensity: number;
  /** 0..1 — chance of icy surfaces. */
  iceBias: number;
  /** 0..1 — how deep the powder sits. */
  powderBias: number;
  featureWeights: Partial<Record<FeatureKind, number>>;
}

const DEFAULT_WEIGHTS: Record<FeatureKind, number> = {
  open: 10,
  kickers: 16,
  park: 9,
  halfpipe: 6,
  moguls: 6,
  lake: 5,
  cliff: 6,
  gully: 6,
  forest: 8,
  glacier: 4,
  village: 3,
  bridge: 4,
  cave: 3,
  shortcut: 4,
  ramps: 10,
  gap: 6,
  tunnel: 5,
  jibs: 9,
};

export interface Surface {
  h: number;
  /** Unit normal. */
  nx: number;
  ny: number;
  nz: number;
  /** 0..1 blend factors — they do not necessarily sum to 1. */
  ice: number;
  powder: number;
  rock: number;
  groom: number;
  /** Slope in radians (0 = flat). */
  steep: number;
  /** 0..1 — how squarely the point sits on a rail or box. */
  rail: number;
  /** Signed metres from the centre line of that jib. Drives the snap. */
  railDx: number;
}

export class TerrainGen {
  readonly seed: number;
  readonly preset: MountainPreset;

  private nBase: Noise2D;
  private nDetail: Noise2D;
  private nWall: Noise2D;
  private nSnow: Noise2D;
  private nPath: Noise2D;

  private featureCache = new Map<number, Feature>();
  private weights: Record<FeatureKind, number>;
  private weightTotal: number;
  /** Phase of the two pitch-modulation sines — per seed, so runs differ. */
  private ph1: number;
  private ph2: number;

  constructor(seed: number, preset: MountainPreset) {
    this.seed = seed >>> 0;
    this.preset = preset;
    this.nBase = new Noise2D(this.seed ^ 0x1a2b3c);
    this.nDetail = new Noise2D(this.seed ^ 0x51ee77);
    this.nWall = new Noise2D(this.seed ^ 0x9f0b21);
    this.nSnow = new Noise2D(this.seed ^ 0x33cc55);
    this.nPath = new Noise2D(this.seed ^ 0x7ab019);
    this.ph1 = hash2(1, 17, this.seed) * Math.PI * 2;
    this.ph2 = hash2(2, 29, this.seed) * Math.PI * 2;

    this.weights = { ...DEFAULT_WEIGHTS, ...preset.featureWeights } as Record<
      FeatureKind,
      number
    >;
    let total = 0;
    for (const k of Object.keys(this.weights) as FeatureKind[])
      total += this.weights[k];
    this.weightTotal = total;
  }

  // ─────────────────────────────────────────────────────────── corridor ────

  /** Centre-line X of the run at a given Z. The run wanders; the player reads it. */
  corridorCenter(z: number) {
    return (
      this.nPath.noise(z * 0.0014, 11.7) * 110 +
      this.nPath.noise(z * 0.0051, 3.1) * 34
    );
  }

  corridorHalfWidth(z: number) {
    const base = this.preset.corridor;
    return base + this.nPath.noise(z * 0.0033, 91.4) * base * 0.3;
  }

  // ──────────────────────────────────────────────────────────── features ────

  featureForSegment(seg: number): Feature {
    const cached = this.featureCache.get(seg);
    if (cached) return cached;

    // The first two segments are always a clean open roll-in so every run
    // starts with speed instead of a surprise.
    const [r0, r1, r2] = hash2v(seg, 7717, this.seed);
    let kind: FeatureKind;
    if (seg <= 1) {
      kind = "open";
    } else if (seg === 2) {
      kind = "kickers";
    } else {
      let pick = r0 * this.weightTotal;
      kind = "open";
      for (const k of Object.keys(this.weights) as FeatureKind[]) {
        pick -= this.weights[k];
        if (pick <= 0) {
          kind = k;
          break;
        }
      }
      // Never repeat the same feature back to back — variety is the whole point.
      const prev = this.featureCache.get(seg - 1);
      if (prev && prev.kind === kind && kind !== "open") kind = "open";
    }

    const z0 = seg * SEGMENT_LENGTH;
    const z1 = z0 + SEGMENT_LENGTH;
    const cx = this.corridorCenter(z0 + SEGMENT_LENGTH * 0.5);
    const hw = this.corridorHalfWidth(z0 + SEGMENT_LENGTH * 0.5);

    const f: Feature = {
      seg,
      kind,
      z0,
      z1,
      kickers: [],
      jibs: [],
      a: r1,
      b: r2,
      c: hash2(seg, 4231, this.seed ^ 0xabcdef),
      side: r2 < 0.5 ? -1 : 1,
    };

    if (kind === "kickers") {
      const count = 1 + Math.floor(r1 * 2.4);
      for (let i = 0; i < count; i++) {
        const [k0, k1, k2] = hash2v(seg * 31 + i, 99, this.seed);
        const big = k2 > 0.62;
        f.kickers.push({
          x: cx + (k0 * 2 - 1) * hw * 0.55,
          z: z0 + 40 + (SEGMENT_LENGTH - 80) * ((i + 0.5) / count),
          width: lerp(11, 26, k1),
          length: lerp(14, 26, k0),
          height: big ? lerp(5.0, 8.4, k1) : lerp(2.6, 4.6, k1),
          kick: big ? lerp(0.7, 1.0, k2) : lerp(0.35, 0.7, k2),
        });
      }
    } else if (kind === "park") {
      // A park is a rhythm section: three evenly spaced hits down the middle,
      // with a rail or a box tucked to one side of each so there is always a
      // second line through it.
      for (let i = 0; i < 3; i++) {
        const [k0, k1, k2] = hash2v(seg * 57 + i, 13, this.seed);
        f.kickers.push({
          x: cx + (i - 1) * hw * 0.42 + (k0 * 2 - 1) * 4,
          z: z0 + 34 + i * 38,
          width: 13,
          length: 16,
          height: lerp(3.2, 5.4, k1),
          kick: 0.85,
        });
        if (k2 > 0.35) {
          const box = k2 > 0.72;
          f.jibs.push({
            x: cx + (i - 1) * hw * 0.42 + (k0 < 0.5 ? -1 : 1) * 15,
            z: z0 + 34 + i * 38 + 6,
            length: lerp(13, 21, k1),
            halfWidth: box ? 0.8 : 0.22,
            height: box ? lerp(0.5, 0.8, k0) : lerp(0.8, 1.25, k0),
            kind: box ? "box" : "rail",
          });
        }
      }
    } else if (kind === "jibs") {
      // A jib line. Small hits and a lot of metal: the section you session
      // rather than survive. Two lanes so there's a choice at every step, and
      // the kickers are deliberately little — this is not where you go big.
      for (let i = 0; i < 5; i++) {
        const [k0, k1, k2] = hash2v(seg * 71 + i, 29, this.seed);
        const lane = (i % 2 === 0 ? -1 : 1) * hw * lerp(0.16, 0.36, k0);
        const z = z0 + 24 + i * 25;
        const box = k2 > 0.55;
        f.jibs.push({
          x: cx + lane,
          z,
          length: lerp(12, 22, k1),
          halfWidth: box ? lerp(0.62, 1.0, k1) : lerp(0.18, 0.26, k1),
          height: box ? lerp(0.45, 0.75, k2) : lerp(0.75, 1.3, k2),
          kind: box ? "box" : "rail",
        });
        // A tap in front of the metal, because a rail you have to ollie onto
        // is a rail most people ride past.
        if (k1 > 0.4) {
          f.kickers.push({
            x: cx + lane,
            z: z - lerp(12, 20, k1),
            width: 8,
            length: 9,
            height: lerp(1.1, 2.1, k2),
            kick: 0.55,
          });
        }
      }
      // One bigger hit to finish the line.
      f.kickers.push({
        x: cx + (r1 * 2 - 1) * hw * 0.2,
        z: z0 + 132,
        width: 15,
        length: 18,
        height: lerp(3.6, 5.2, r2),
        kick: 0.85,
      });
    } else if (kind === "ramps") {
      // A jump line: four hits that step up from a tap to a real booter, so
      // the section teaches you its own timing before it asks for commitment.
      const n = 4;
      for (let i = 0; i < n; i++) {
        const [k0, k1] = hash2v(seg * 83 + i, 41, this.seed);
        const t = i / (n - 1);
        f.kickers.push({
          x: cx + (k0 * 2 - 1) * hw * 0.2,
          z: z0 + 26 + i * 31,
          width: lerp(12, 20, t),
          length: lerp(11, 22, t),
          height: lerp(1.9, 7.6, t) * lerp(0.9, 1.1, k1),
          kick: lerp(0.45, 0.95, t),
        });
      }
    } else if (kind === "gap") {
      // A launch lip, a hole, and a landing ramp on the far side. Unlike the
      // bridge there is no way *across* — you clear it or you don't — but there
      // is always a way *out*: see the runout ramp in `singleFeatureHeight`.
      f.a = z0 + SEGMENT_LENGTH * 0.5; // chasm centre Z
      f.b = lerp(20, 34, r1); // chasm half length
      f.c = lerp(13, 21, r2); // chasm depth
      f.kickers.push({
        x: cx,
        z: f.a - f.b - 12,
        width: 34,
        length: 20,
        height: lerp(4.2, 6.8, r1),
        kick: 0.95,
      });
    } else if (kind === "tunnel") {
      // A narrow ice channel. The roof is a prop; the terrain just carves the
      // trench and turns the surface to hard ice inside it.
      f.a = lerp(11, 16, r1); // half width
      f.b = lerp(4.5, 7.5, r2); // depth
    } else if (kind === "shortcut") {
      // A tight chute off to one side. Faster, tighter, rewards commitment.
      f.a = lerp(26, 44, r1); // chute width
      f.b = lerp(5, 11, r2); // chute depth
    } else if (kind === "cliff") {
      f.a = lerp(6, 17, r1); // drop height
      f.b = z0 + lerp(50, 110, r2); // drop Z
    } else if (kind === "gully") {
      f.a = lerp(16, 34, r1); // half width
      f.b = lerp(5, 12, r2); // depth
    } else if (kind === "halfpipe") {
      f.a = lerp(15, 22, r1); // flat bottom half width
      f.b = lerp(6.5, 10, r2); // wall height
    } else if (kind === "bridge") {
      f.a = z0 + SEGMENT_LENGTH * 0.5; // chasm centre Z
      f.b = lerp(24, 38, r1); // chasm half length
      f.c = lerp(18, 34, r2); // chasm depth
    } else if (kind === "village" || kind === "cave" || kind === "glacier") {
      f.a = lerp(0.35, 0.75, r1);
      f.b = lerp(0.3, 0.9, r2);
    }

    this.featureCache.set(seg, f);
    if (this.featureCache.size > 4096) {
      // Trim the oldest entries; runs are one-directional so this is safe.
      const keys = [...this.featureCache.keys()].sort((a, b) => a - b);
      for (let i = 0; i < 1024; i++) this.featureCache.delete(keys[i]);
    }
    return f;
  }

  featureAtZ(z: number) {
    return this.featureForSegment(Math.floor(z / SEGMENT_LENGTH));
  }

  /** Smooth 0→1→0 window inside a segment so features never cause seams. */
  private static envelope(z: number, z0: number, z1: number, margin: number) {
    return (
      smoothstep(z0, z0 + margin, z) * (1 - smoothstep(z1 - margin, z1, z))
    );
  }

  // ────────────────────────────────────────────────────────────── height ────

  /**
   * Steepness of the fall line at `z`.
   *
   * A run at one constant grade is the reason a mountain reads as a treadmill:
   * every second feels like the last. The pitch is modulated by two sines — a
   * long one that gives the run its movements (a steep pitch, then somewhere
   * to breathe) and a short one that keeps individual rolls from being flat.
   * Amplitudes are chosen so the grade never approaches zero, because a flat
   * spot on a snowboard means walking.
   */
  pitchAt(z: number): number {
    const p = this.preset;
    return (
      p.slope *
      (1 + PITCH_A * Math.sin(z / PITCH_L1 + this.ph1) + PITCH_B * Math.sin(z / PITCH_L2 + this.ph2))
    );
  }

  /**
   * The integral of `pitchAt` from 0 to z, in closed form.
   *
   * This is the whole reason the pitch can vary at all: the renderer and the
   * physics both need `height(x, z)` to be evaluable at any point without
   * walking the run from the top, so the fall line has to be something with an
   * antiderivative rather than a per-segment accumulation.
   */
  private gradeDrop(z: number): number {
    const p = this.preset;
    return (
      p.slope *
      (z -
        PITCH_A * PITCH_L1 * (Math.cos(z / PITCH_L1 + this.ph1) - Math.cos(this.ph1)) -
        PITCH_B * PITCH_L2 * (Math.cos(z / PITCH_L2 + this.ph2) - Math.cos(this.ph2)))
    );
  }

  /** What this stretch of mountain is doing, for the HUD. */
  sectionAt(z: number): string {
    const kind = this.featureAtZ(z).kind;
    const named: Partial<Record<FeatureKind, string>> = {
      halfpipe: "Halfpipe",
      park: "Terrain park",
      ramps: "Jump line",
      jibs: "Jib line",
      gap: "Gap jump",
      tunnel: "Ice tunnel",
      lake: "Frozen lake",
      glacier: "Glacier",
      village: "Village",
      bridge: "Bridge",
      cave: "Cave",
      shortcut: "Shortcut",
      moguls: "Moguls",
      gully: "Gully",
      cliff: "Cliff band",
      forest: "Trees",
    };
    if (named[kind]) return named[kind]!;
    const rel = this.pitchAt(z) / this.preset.slope;
    return rel > 1.22 ? "Steep" : rel < 0.82 ? "Mellow" : "Open";
  }

  height(x: number, z: number): number {
    const p = this.preset;
    let h = -this.gradeDrop(z);

    // Rolling shape of the mountain face.
    h +=
      this.nBase.fbm(x * 0.0032, z * 0.0032, 4) * 26 * p.roughness +
      this.nBase.noise(x * 0.011, z * 0.011) * 4.2 * p.roughness +
      this.nDetail.fbm(x * 0.045, z * 0.045, 3) * 1.15;

    // Corridor walls.
    const cx = this.corridorCenter(z);
    const hw = this.corridorHalfWidth(z);
    const d = Math.abs(x - cx);

    // Gentle banking near the edges — reads as a natural bowl and quietly keeps
    // the player in play without a wall.
    h += smoothstep(hw * 0.5, hw, d) * 7.5;

    // Hard walls beyond the corridor.
    const wallT = smoothstep(hw, hw + 95, d);
    if (wallT > 0) {
      const ridge = this.nWall.ridged(x * 0.0075, z * 0.0075, 4);
      h += wallT * wallT * (60 + ridge * 70);
    }

    h += this.featureHeight(x, z, cx, hw);
    return h;
  }

  private featureHeight(x: number, z: number, cx: number, hw: number): number {
    const seg = Math.floor(z / SEGMENT_LENGTH);
    let h = 0;
    // Features can bleed one segment either way (kickers near a boundary).
    for (let s = seg - 1; s <= seg + 1; s++) {
      h += this.singleFeatureHeight(this.featureForSegment(s), x, z, cx, hw);
    }
    return h;
  }

  private singleFeatureHeight(
    f: Feature,
    x: number,
    z: number,
    cx: number,
    hw: number,
  ): number {
    switch (f.kind) {
      case "kickers":
      case "ramps":
      case "jibs":
      case "park": {
        let h = 0;
        for (const k of f.kickers) h += this.kickerHeight(k, x, z);
        for (const j of f.jibs) h += this.jibRampHeight(j, x, z);
        return h;
      }
      case "gap": {
        let h = 0;
        for (const k of f.kickers) h += this.kickerHeight(k, x, z);
        const near = f.a - f.b;
        const far = f.a + f.b;

        // The near lip is sheer. That is the gap: you clear it or you don't.
        const enter = smoothstep(near - 2, near + 5, z);

        // The far end is not a wall the whole way across — it is a diagonal.
        // Down the middle, where you land if you cleared it, the floor comes
        // back up inside 13m and you touch down on solid ground. Out at one
        // edge it runs out over several times the depth instead, so a rider who
        // *didn't* clear it has somewhere to go. The mountain keeps dropping the
        // whole length of that runout, so its net grade is downhill: missing the
        // gap costs a few seconds and every bit of speed, which is the right
        // price, rather than costing the run.
        const sideNorm = clamp01(0.5 + (0.5 * f.side * (x - cx)) / hw);
        const runout = 6 + smoothstep(0.6, 0.95, sideNorm) * f.c * 6.8;
        const inside = Math.min(enter, 1 - smoothstep(far - 2, far + runout, z));
        h -= inside * f.c;

        // And the floor drains toward that side. Without the tilt the trench is
        // flat, the wall is straight ahead, and a rider at the bottom has to
        // guess which way the opening is; with it, gravity answers.
        h -= inside * clamp((f.side * (x - cx)) / (hw * 0.55), -1, 1) * 3.6;

        // A landing transition on the far lip so clearing the gap ends in a
        // ramp rather than a kerb.
        const land = 1 - smoothstep(0, 26, z - far);
        const inRun = 1 - smoothstep(hw * 0.55, hw * 0.9, Math.abs(x - cx));
        h += land * inRun * Math.max(0, 1 - Math.abs(z - f.a) / (f.b + 26)) * 3.4;
        return h;
      }
      case "tunnel": {
        const env = TerrainGen.envelope(z, f.z0, f.z1, 26);
        if (env <= 0) return 0;
        const d = (x - cx) / f.a;
        // A U-shaped trench: flat-ish floor, walls that climb steeply.
        const inside = Math.exp(-d * d * 1.9);
        const walls = smoothstep(0.75, 1.5, Math.abs(d)) * 16;
        return env * (walls - inside * f.b);
      }
      case "halfpipe": {
        const env = TerrainGen.envelope(z, f.z0, f.z1, 34);
        if (env <= 0) return 0;
        const d = Math.abs(x - cx);
        const inner = f.a;
        const outer = inner + 26;
        const t = clamp01((d - inner) / (outer - inner));
        // Quarter-pipe transition: quadratic wall, vertical near the lip.
        const wall = t * t * (3 - 2 * t) * f.b + Math.pow(t, 6) * f.b * 0.55;
        // Flat bottom sits slightly below the natural grade.
        return env * (wall - 1.6);
      }
      case "moguls": {
        const env = TerrainGen.envelope(z, f.z0, f.z1, 26);
        if (env <= 0) return 0;
        const d = Math.abs(x - cx);
        const inField = 1 - smoothstep(hw * 0.7, hw, d);
        return (
          env *
          inField *
          1.7 *
          Math.sin(x * 0.36 + f.a * 6.28) *
          Math.sin(z * 0.34 + f.b * 6.28)
        );
      }
      case "lake": {
        const env = TerrainGen.envelope(z, f.z0, f.z1, 40);
        if (env <= 0) return 0;
        const d = Math.abs(x - cx);
        const inField = 1 - smoothstep(hw * 0.6, hw * 0.95, d);
        if (inField <= 0) return 0;
        // Flatten toward a plane through the segment mid-point.
        const zc = (f.z0 + f.z1) * 0.5;
        const planeH = -this.gradeDrop(zc) + 1.0;
        const raw = this.rawGrade(x, z);
        return env * inField * (planeH - raw);
      }
      case "cliff": {
        const drop = smoothstep(f.b - 5, f.b + 5, z) * f.a;
        const outT = 1 - smoothstep(f.z1 - 30, f.z1, z);
        return -drop * outT;
      }
      case "gully": {
        const env = TerrainGen.envelope(z, f.z0, f.z1, 30);
        if (env <= 0) return 0;
        const d = (x - cx) / f.a;
        return -env * f.b * Math.exp(-d * d * 1.4);
      }
      case "glacier": {
        const env = TerrainGen.envelope(z, f.z0, f.z1, 30);
        if (env <= 0) return 0;
        // Blocky seracs: quantised noise makes clean ice steps.
        const n = this.nWall.fbm(x * 0.02, z * 0.02, 3);
        const step = Math.round(n * 3) / 3;
        return env * step * 6.5 * f.b;
      }
      case "village": {
        const env = TerrainGen.envelope(z, f.z0, f.z1, 34);
        if (env <= 0) return 0;
        // A flat shelf beside the run for the buildings to sit on.
        const shelfX = cx + f.side * (hw * 0.85);
        const d = Math.abs(x - shelfX);
        const inShelf = 1 - smoothstep(20, 42, d);
        if (inShelf <= 0) return 0;
        const zc = (f.z0 + f.z1) * 0.5;
        const planeH = -this.gradeDrop(zc) + 2.5;
        return env * inShelf * (planeH - this.rawGrade(x, z));
      }
      case "bridge": {
        const dz = Math.abs(z - f.a);
        const chasm = 1 - smoothstep(f.b * 0.55, f.b, dz);
        if (chasm <= 0) return 0;
        const d = Math.abs(x - cx);
        // Deck: a narrow ribbon you can actually ride across.
        const onDeck = 1 - smoothstep(7.5, 10.5, d);
        const carve = -chasm * f.c;
        return carve * (1 - onDeck);
      }
      case "shortcut": {
        const env = TerrainGen.envelope(z, f.z0, f.z1, 32);
        if (env <= 0) return 0;
        // A carved chute outside the normal corridor — steeper and faster.
        const chuteX = cx + f.side * (hw + 46);
        const d = (x - chuteX) / f.a;
        const inChute = Math.exp(-d * d * 1.1);
        return -env * inChute * (60 + f.b * 4);
      }
      case "cave":
      case "forest":
      case "open":
      default:
        return 0;
    }
  }

  /** Height without features — used when a feature needs to flatten the grade. */
  private rawGrade(x: number, z: number) {
    const p = this.preset;
    return (
      -this.gradeDrop(z) +
      this.nBase.fbm(x * 0.0032, z * 0.0032, 4) * 26 * p.roughness +
      this.nBase.noise(x * 0.011, z * 0.011) * 4.2 * p.roughness +
      this.nDetail.fbm(x * 0.045, z * 0.045, 3) * 1.15
    );
  }

  /**
   * The snow ramp built up to a rail.
   *
   * This one *is* terrain — unlike the jib itself it is metres wide, so the
   * renderer can draw it. Without it a rail is a kerb: you arrive at speed and
   * hit a vertical 1.2m step. With it you roll up and on, which is the whole
   * difference between a rail people ride and a rail people ride past.
   */
  private jibRampHeight(j: Jib, x: number, z: number) {
    const half = j.length * 0.5;
    const rampLen = Math.max(5, j.height * 6.5);
    const dz = z - (j.z - half);
    if (dz < -rampLen || dz > j.length * 0.45) return 0;
    const w = Math.max(1.8, j.halfWidth * 2.4);
    const across = 1 - smoothstep(w * 0.5, w, Math.abs(x - j.x));
    if (across <= 0) return 0;
    const up = smoothstep(-rampLen, -0.4, dz);
    // Falls away under the first stretch of the rail, so the metal is proud
    // for most of its length rather than half buried.
    const fade = 1 - smoothstep(0, j.length * 0.4, Math.max(0, dz));
    return across * up * fade * j.height;
  }

  private kickerHeight(k: Kicker, x: number, z: number) {
    const dx = Math.abs(x - k.x);
    if (dx > k.width) return 0;
    const across = 1 - smoothstep(k.width * 0.55, k.width, dx);
    if (across <= 0) return 0;

    const t = (z - (k.z - k.length)) / k.length;
    if (t <= 0 || t > 1.35) return 0;

    if (t <= 1) {
      // Transition into the ramp, then a stiff kick at the lip.
      const ramp = Math.pow(smoothstep(0, 1, t), lerp(1.9, 1.15, k.kick));
      return ramp * k.height * across;
    }
    // Just past the lip the ramp falls away instantly — that gap is the air.
    const fall = 1 - smoothstep(1, 1.06, t);
    return fall * k.height * across;
  }

  // ────────────────────────────────────────────────────────────────── jibs ────

  /**
   * How far a jib stands above the snow at this point, and how squarely you are
   * on it.
   *
   * The top is a platform parallel to the slope, with short ramps at each end so
   * you can ride on rather than having to ollie. The sides fall away over a
   * fraction of a metre: on a rail that is the difference between riding it and
   * not, and making it any softer turns every rail into a mogul.
   */
  private jibProfile(
    j: Jib,
    x: number,
    z: number,
  ): { lift: number; grip: number; dx: number } {
    const dz = z - j.z;
    const half = j.length * 0.5;
    if (dz < -half || dz > half) return ZERO_JIB;
    const off = x - j.x;
    const dx = Math.abs(off);
    const edge = j.halfWidth + 0.45;
    if (dx > edge) return ZERO_JIB;

    // Only the exit is bevelled. There is deliberately no entry bevel: the
    // snow ramp already rises to the full standing height, and the `max(0, …)`
    // below means the metal simply fills whatever the ramp stops providing as
    // it fades out under the rail. The two curves add to a constant, so the
    // surface you ride is flat from the top of the ramp to the end of the rail
    // — and the snow being packed level with the first stretch of metal is
    // what a park rail entrance looks like anyway.
    const ends = 1 - smoothstep(half - 0.5, half, dz);
    const across = 1 - smoothstep(j.halfWidth * 0.5, edge, dx);
    // The metal only stands as proud as the snow under it leaves it. Its
    // approach ramp *is* terrain and is already in `height()`, so adding the
    // full standing height on top of it would build a hump at the entrance —
    // the one place a rail has to be smooth.
    const lift = Math.max(0, j.height * ends * across - this.jibRampHeight(j, x, z));
    // Grip is what the trick system reads. It used to demand the dead centre,
    // which on a 40cm rail meant a nine-centimetre target at 15 m/s — nobody
    // was ever going to hit that, so nobody ever saw a grind. Anywhere on the
    // thing counts; the snap below is what makes riding it possible.
    const grip = lift > 0.001 ? ends * (1 - smoothstep(j.halfWidth, edge, dx)) : 0;
    return { lift, grip, dx: off };
  }

  /**
   * The highest jib surface at a point, if any.
   *
   * Only `sample()` calls this — `height()` is the terrain and stays the
   * terrain, because a 40cm rail is far below the tessellation the renderer
   * works at. The prop mesh is built from the same `Jib` records, so the thing
   * the physics can feel and the thing you can see are the same object.
   */
  jibAt(x: number, z: number): { lift: number; grip: number; dx: number } {
    const seg = Math.floor(z / SEGMENT_LENGTH);
    let best = ZERO_JIB;
    for (let s = seg - 1; s <= seg + 1; s++) {
      const f = this.featureForSegment(s);
      for (const j of f.jibs) {
        const p = this.jibProfile(j, x, z);
        if (p.lift > best.lift) best = p;
      }
    }
    return best;
  }

  /** Every jib near a segment, for the prop builder. */
  jibsForSegment(seg: number): Jib[] {
    return this.featureForSegment(seg).jibs;
  }

  // ─────────────────────────────────────────────────────────────── sample ────

  /** Full surface description at a point: height, normal and material blend. */
  sample(x: number, z: number, out?: Surface): Surface {
    const o: Surface =
      out ??
      ({
        h: 0,
        nx: 0,
        ny: 1,
        nz: 0,
        ice: 0,
        powder: 0,
        rock: 0,
        groom: 0,
        steep: 0,
        rail: 0,
        railDx: 0,
      } as Surface);

    const e = 0.75;
    const h = this.height(x, z);
    const hx = this.height(x + e, z) - this.height(x - e, z);
    const hz = this.height(x, z + e) - this.height(x, z - e);

    let nx = -hx;
    let ny = 2 * e;
    let nz = -hz;
    const inv = 1 / Math.hypot(nx, ny, nz);
    nx *= inv;
    ny *= inv;
    nz *= inv;

    o.h = h;
    o.nx = nx;
    o.ny = ny;
    o.nz = nz;
    o.steep = Math.acos(clamp(ny, -1, 1));

    this.materialAt(x, z, o);

    // Jibs sit on top of all of that. The normal is left alone deliberately: a
    // rail's top is parallel to the slope, and taking a finite difference
    // across a 40cm-wide object with a 75cm epsilon would report a cliff and
    // fire the rider sideways off every box they touched.
    const jib = this.jibAt(x, z);
    if (jib.lift > 0.001) {
      o.h += jib.lift;
      o.rail = jib.grip;
      o.railDx = jib.dx;
      // Metal and waxed ply: fast, and nothing to carve into.
      o.ice = Math.max(o.ice, jib.grip * 0.85);
      o.powder *= 1 - jib.grip;
      o.groom = Math.max(o.groom, jib.grip);
    } else {
      o.rail = 0;
      o.railDx = 0;
    }
    return o;
  }

  /** Cheap height-only query for physics probes and scatter placement. */
  heightAt(x: number, z: number) {
    return this.height(x, z);
  }

  /**
   * The height of the surface a board actually rides on: the terrain, plus any
   * rail or box standing on it. Anything deciding whether the rider is on the
   * ground has to use this one — `heightAt` is the snow, and a rider standing
   * on a rail is a metre above the snow.
   */
  rideHeightAt(x: number, z: number) {
    return this.height(x, z) + this.jibAt(x, z).lift;
  }

  materialAt(x: number, z: number, o: Surface) {
    const p = this.preset;
    const f = this.featureAtZ(z);
    const steepT = clamp01((o.steep - 0.62) / 0.35);

    // Wind scours the steeps into ice and fills the flats with powder.
    const snowNoise = this.nSnow.fbm(x * 0.012, z * 0.012, 3) * 0.5 + 0.5;
    let ice = clamp01(steepT * 0.8 + (snowNoise - 0.62) * 1.6 * p.iceBias);
    let powder = clamp01(
      (1 - steepT) * (0.35 + snowNoise * 0.85) * (0.55 + p.powderBias),
    );
    let rock = clamp01(steepT * 1.55 - 0.35);
    let groom = 0;

    if (f.kind === "lake") {
      const d = Math.abs(x - this.corridorCenter(z));
      const t =
        TerrainGen.envelope(z, f.z0, f.z1, 40) *
        (1 - smoothstep(this.corridorHalfWidth(z) * 0.6, this.corridorHalfWidth(z) * 0.95, d));
      ice = lerp(ice, 1, t);
      powder = lerp(powder, 0.02, t);
      rock = lerp(rock, 0, t);
    } else if (f.kind === "glacier") {
      const t = TerrainGen.envelope(z, f.z0, f.z1, 30);
      ice = lerp(ice, 0.85, t);
      powder = lerp(powder, 0.15, t);
    } else if (f.kind === "park" || f.kind === "halfpipe") {
      const t = TerrainGen.envelope(z, f.z0, f.z1, 30);
      groom = t;
      ice = lerp(ice, 0.28, t);
      powder = lerp(powder, 0.18, t);
    } else if (f.kind === "shortcut") {
      const t = TerrainGen.envelope(z, f.z0, f.z1, 32);
      powder = lerp(powder, 1, t * 0.7);
    }

    // Kicker decks are always groomed — you should never wash out on a takeoff.
    for (const k of f.kickers) {
      const dx = Math.abs(x - k.x);
      const t = (z - (k.z - k.length)) / k.length;
      if (dx < k.width && t > -0.15 && t < 1.05) {
        const w = (1 - smoothstep(k.width * 0.5, k.width, dx)) * 0.9;
        groom = Math.max(groom, w);
        powder = lerp(powder, 0.1, w);
        ice = lerp(ice, 0.2, w);
      }
    }

    o.ice = ice;
    o.powder = powder;
    o.rock = rock;
    o.groom = groom;
  }

  /** True where trees may grow: below the treeline, not too steep, off-piste. */
  treeMask(x: number, z: number, h: number, steep: number) {
    const p = this.preset;
    if (steep > 0.72) return 0;
    const cx = this.corridorCenter(z);
    const hw = this.corridorHalfWidth(z);
    const d = Math.abs(x - cx);
    const f = this.featureAtZ(z);

    // The run itself stays clear, except forest segments which tighten it.
    const clearRadius = f.kind === "forest" ? hw * 0.45 : hw * 0.72;
    const near = smoothstep(clearRadius, clearRadius + 26, d);
    if (near <= 0) return 0;

    // Treeline: above a certain absolute height relative to the fall line the
    // trees give out and it's all rock and ice.
    const rel = h + this.gradeDrop(z);
    const line = 1 - smoothstep(46, 84, rel);

    const clump = this.nSnow.fbm(x * 0.008 + 40, z * 0.008 - 21, 3) * 0.5 + 0.5;
    const density = p.treeDensity * (f.kind === "forest" ? 1.5 : 1);
    return clamp01(near * line * clamp01(clump * 1.8 - 0.35) * density);
  }
}

export const MOUNTAINS: MountainPreset[] = [
  {
    id: "hollow-ridge",
    name: "Hollow Ridge",
    blurb:
      "Wide, treed, forgiving. Natural hits everywhere and a park hidden in the middle.",
    length: 2600,
    slope: 0.3,
    corridor: 78,
    roughness: 1,
    treeDensity: 0.9,
    iceBias: 0.35,
    powderBias: 0.55,
    featureWeights: { kickers: 20, park: 12, forest: 10 },
  },
  {
    id: "long-meadow",
    name: "Long Meadow",
    blurb:
      "The mellow one. Groomed corduroy, big lazy rollers and room to get a trick wrong.",
    length: 2200,
    slope: 0.22,
    corridor: 110,
    roughness: 0.6,
    treeDensity: 0.5,
    iceBias: 0.15,
    powderBias: 0.4,
    featureWeights: { open: 14, kickers: 14, park: 14, moguls: 8, cliff: 2 },
  },
  {
    id: "ember-pass",
    name: "Ember Pass",
    blurb:
      "Deep trees, a sleeping village and old bridges. Softest snow you'll find.",
    length: 2800,
    slope: 0.28,
    corridor: 86,
    roughness: 0.9,
    treeDensity: 1.1,
    iceBias: 0.2,
    powderBias: 0.95,
    featureWeights: { forest: 16, village: 9, bridge: 8, cave: 7, moguls: 9 },
  },
  {
    id: "glass-basin",
    name: "Glass Basin",
    blurb:
      "Frozen lakes and glacier steps. Fast and slick — carve early, or don't carve at all.",
    length: 3000,
    slope: 0.26,
    corridor: 96,
    roughness: 0.75,
    treeDensity: 0.45,
    iceBias: 0.8,
    powderBias: 0.25,
    featureWeights: { lake: 14, glacier: 12, halfpipe: 10, forest: 3 },
  },
  {
    id: "sawtooth",
    name: "Sawtooth Spine",
    blurb:
      "A ridge that never flattens out. Ribs, gullies and a bridge over most of them.",
    length: 3200,
    slope: 0.34,
    corridor: 64,
    roughness: 1.5,
    treeDensity: 0.6,
    iceBias: 0.45,
    powderBias: 0.5,
    featureWeights: { moguls: 12, gully: 12, bridge: 10, cliff: 10, shortcut: 8 },
  },
  {
    id: "north-cirque",
    name: "North Cirque",
    blurb: "Above the treeline. Ice, seracs and long, cold, empty pitches.",
    length: 3400,
    slope: 0.36,
    corridor: 70,
    roughness: 1.2,
    treeDensity: 0.35,
    iceBias: 0.65,
    powderBias: 0.6,
    featureWeights: { glacier: 14, cliff: 12, halfpipe: 9, cave: 8 },
  },
  {
    id: "midnight-mile",
    name: "Midnight Mile",
    blurb:
      "The last run of the night, lit end to end. Village rails, a pipe and hard old snow.",
    length: 2900,
    slope: 0.31,
    corridor: 74,
    roughness: 0.85,
    treeDensity: 0.75,
    iceBias: 0.6,
    powderBias: 0.35,
    featureWeights: { village: 14, park: 12, halfpipe: 10, bridge: 8, cave: 5 },
  },
  {
    id: "wolf-couloir",
    name: "Wolf Couloir",
    blurb:
      "Steep, narrow, mean. Cliff bands, gullies and the best shortcuts on the mountain.",
    length: 3600,
    slope: 0.42,
    corridor: 58,
    roughness: 1.35,
    treeDensity: 0.7,
    iceBias: 0.55,
    powderBias: 0.7,
    featureWeights: { cliff: 16, gully: 14, shortcut: 10, bridge: 8, park: 4 },
  },
];

export const mountainById = (id: string) =>
  MOUNTAINS.find((m) => m.id === id) ?? MOUNTAINS[0];
