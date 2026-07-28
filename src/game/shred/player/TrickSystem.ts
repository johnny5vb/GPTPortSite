/**
 * Tricks, naming, scoring and combos.
 *
 * Controls, in the air:
 *   ← →      spin
 *   ↑ ↓      front / back flip
 *   A S D F  grabs (Indy / Melon / Nose / Tail)
 *   Shift+…  the tweaked variants (Japan / Method / Mute / Stalefish)
 *
 * Spin plus flip automatically becomes an off-axis trick — Misty, Rodeo or a
 * full Cork depending on which way the flip goes and how much spin is on it.
 * There are no button combos to memorise: the name is *derived* from what you
 * actually did, which is why a first-timer can throw a Cork 720 Melon by
 * accident and immediately want to do it again.
 */

import { RiderPhysics, LandingInfo, LandingQuality } from "./Physics";
import { clamp01, damp, lerp, smoothstep, DEG, snapTo } from "../core/math";
import type { Rider } from "../data/riders";

export interface GrabDef {
  key: "A" | "S" | "D" | "F";
  shift: boolean;
  name: string;
  /** Which way the grab pulls the board — [nose/tail, lift, edge]. */
  tweak: [number, number, number];
  /**
   * Where on the deck the hand actually goes, in board-local space
   * (X = toe/heel edge, Z = tail/nose). The arm is solved onto this point, so
   * a grab grips the board instead of miming at it.
   */
  grip: [number, number, number];
  /**
   * Which hand takes it. Not cosmetic — it's most of what distinguishes the
   * grabs from each other: a Melon and a Stalefish are both the heel edge, and
   * the hand is the difference.
   */
  front: boolean;
}

// prettier-ignore
export const GRABS: GrabDef[] = [
  { key: "A", shift: false, name: "Indy",      tweak: [ 0.1,  0,   -0.25], grip: [ 0.14, 0.05, -0.08], front: false },
  { key: "S", shift: false, name: "Melon",     tweak: [-0.1,  0,    0.3 ], grip: [-0.14, 0.05,  0.06], front: true  },
  { key: "D", shift: false, name: "Nose",      tweak: [ 0.45, 0,    0   ], grip: [ 0,    0.06,  0.44], front: true  },
  { key: "F", shift: false, name: "Tail",      tweak: [-0.5,  0,    0   ], grip: [ 0,    0.06, -0.5 ], front: false },
  { key: "A", shift: true,  name: "Japan",     tweak: [ 0.35, 0.2, -0.45], grip: [ 0.15, 0.05,  0.3 ], front: true  },
  { key: "S", shift: true,  name: "Method",    tweak: [-0.2,  0.1,  0.65], grip: [-0.15, 0.05, -0.02], front: true  },
  { key: "D", shift: true,  name: "Mute",      tweak: [ 0.25, 0,   -0.4 ], grip: [ 0.15, 0.05,  0.12], front: true  },
  { key: "F", shift: true,  name: "Stalefish", tweak: [-0.3,  0.1,  0.5 ], grip: [-0.15, 0.05, -0.26], front: false },
];

export function findGrab(key: "A" | "S" | "D" | "F", shift: boolean) {
  return (
    GRABS.find((g) => g.key === key && g.shift === shift) ??
    GRABS.find((g) => g.key === key && !g.shift)!
  );
}

export interface TrickResult {
  name: string;
  points: number;
  multiplier: number;
  chain: number;
  quality: LandingQuality;
  stomped: boolean;
  airTime: number;
  spin: number;
  flips: number;
  grabs: string[];
  total: number;
}

export interface TrickInput {
  steer: number;
  pitch: number;
  grabKey: "A" | "S" | "D" | "F" | null;
  shift: boolean;
}

const SPIN_RATE = 6.6; // rad/s ≈ 378°/s
const FLIP_RATE = 7.5; // rad/s ≈ 430°/s

/**
 * Rotation eases in over roughly a quarter second and carries momentum for
 * about twice that when you let go. Snapping instantly to full rate — and
 * stopping dead — is what made spins feel like a switch rather than a body.
 */
const SPIN_UP = 0.0012;
const SPIN_DOWN = 0.035;

/** How long before touchdown the landing assist starts helping you square up. */
const ASSIST_WINDOW = 0.6;
const GRAVITY = 21.6;

export class TrickSystem {
  score = 0;
  chain = 0;
  chainTimer = 0;
  /** Points banked in the air but not yet landed. */
  pending = 0;
  pendingName = "";

  totalTricks = 0;
  bestTrick = 0;
  perfectLandings = 0;
  crashes = 0;
  longestAir = 0;

  /** Live state for the rig + HUD. */
  currentGrab: GrabDef | null = null;
  grabTime = 0;
  grabAmount = 0;
  spinSpeed = 0;
  flipSpeed = 0;
  corkAmount = 0;
  /** 0..1 — how hard the landing assist is currently working. Drives the HUD. */
  assist = 0;

  /** Unlockable: rider signature trick (Shift + A + F). */
  specialsUnlocked = false;
  private signatureArmed = false;

  onTrick?: (result: TrickResult) => void;
  onNameChange?: (name: string) => void;
  onGrab?: (name: string) => void;
  onCrash?: () => void;

  private grabs: string[] = [];
  private grabHold = 0;
  private rider: Rider;
  private lastName = "";

  constructor(rider: Rider) {
    this.rider = rider;
  }

  setRider(r: Rider) {
    this.rider = r;
  }

  reset() {
    this.score = 0;
    this.chain = 0;
    this.chainTimer = 0;
    this.pending = 0;
    this.pendingName = "";
    this.totalTricks = 0;
    this.bestTrick = 0;
    this.perfectLandings = 0;
    this.crashes = 0;
    this.longestAir = 0;
    this.grabs.length = 0;
    this.currentGrab = null;
    this.grabAmount = 0;
    this.corkAmount = 0;
  }

  update(dt: number, input: TrickInput, phys: RiderPhysics) {
    if (this.chainTimer > 0) {
      this.chainTimer -= dt;
      if (this.chainTimer <= 0) this.chain = 0;
    }

    if (phys.crashed) {
      this.currentGrab = null;
      this.grabAmount = damp(this.grabAmount, 0, 0.0001, dt);
      this.spinSpeed = 0;
      this.flipSpeed = 0;
      this.assist = 0;
      return;
    }

    if (!phys.grounded) {
      this.airUpdate(dt, input, phys);
    } else {
      this.currentGrab = null;
      this.grabAmount = damp(this.grabAmount, 0, 0.0002, dt);
      this.spinSpeed = damp(this.spinSpeed, 0, 0.0001, dt);
      this.flipSpeed = damp(this.flipSpeed, 0, 0.0001, dt);
      this.corkAmount = damp(this.corkAmount, 0, 0.0005, dt);
      this.assist = damp(this.assist, 0, 0.0005, dt);
      if (this.grabs.length) this.grabs.length = 0;
      this.grabHold = 0;
    }
  }

  private airUpdate(dt: number, input: TrickInput, phys: RiderPhysics) {
    const spinStat = this.rider.stats.spin;

    // Asymmetric easing: winding up takes effort, and letting go leaves
    // momentum behind rather than stopping the rider mid-rotation.
    const targetSpin = input.steer * SPIN_RATE * spinStat;
    const targetFlip = -input.pitch * FLIP_RATE * spinStat;
    const spinEase =
      Math.abs(targetSpin) > Math.abs(this.spinSpeed) ? SPIN_UP : SPIN_DOWN;
    const flipEase =
      Math.abs(targetFlip) > Math.abs(this.flipSpeed) ? SPIN_UP : SPIN_DOWN;
    this.spinSpeed = damp(this.spinSpeed, targetSpin, spinEase, dt);
    this.flipSpeed = damp(this.flipSpeed, targetFlip, flipEase, dt);

    // Off-axis: spinning while flipping tips the axis over, which is a cork.
    const cork =
      clamp01(Math.abs(this.spinSpeed) / SPIN_RATE) *
      clamp01(Math.abs(this.flipSpeed) / FLIP_RATE);
    this.corkAmount = damp(this.corkAmount, cork, 0.0006, dt);
    const rollRate = this.corkAmount * Math.sign(this.spinSpeed || 1) * 2.4;

    // ── landing assist ────────────────────────────────────────────────────
    // Coming down, ease the rotation toward the nearest clean 180 (and the
    // nearest whole flip). It never picks the trick for you — it only removes
    // the last few degrees that would otherwise turn a well-judged 540 into a
    // sketchy landing for reasons the player can't see.
    let assistYaw = 0;
    let assistPitch = 0;
    if (phys.vel.y < 0 && phys.airTime > 0.22) {
      const t = timeToLand(phys.airHeight, phys.vel.y);
      if (t < ASSIST_WINDOW) {
        const urgency = smoothstep(ASSIST_WINDOW, 0.08, t);
        // Back off while the player is still actively rotating.
        const holding = Math.max(Math.abs(input.steer), Math.abs(input.pitch));
        const strength =
          urgency * (1 - holding * 0.7) * this.rider.stats.balance * 6.5;
        const k = clamp01(strength * dt);
        assistYaw = (snapTo(phys.spinAccum, Math.PI) - phys.spinAccum) * k;
        assistPitch =
          (snapTo(phys.flipAccum, Math.PI * 2) - phys.flipAccum) * k;
        this.assist = urgency * (1 - holding);
      }
    } else {
      this.assist = damp(this.assist, 0, 0.001, dt);
    }

    phys.applyAirRotation(
      this.spinSpeed * dt + assistYaw,
      this.flipSpeed * dt + assistPitch,
      rollRate * dt,
    );

    // Grabs.
    if (input.grabKey) {
      const g = findGrab(input.grabKey, input.shift);
      if (this.currentGrab?.name !== g.name) {
        this.currentGrab = g;
        this.grabTime = 0;
        if (!this.grabs.includes(g.name)) this.grabs.push(g.name);
        this.onGrab?.(g.name);
      }
      this.grabTime += dt;
      this.grabHold += dt;
      this.grabAmount = damp(this.grabAmount, 1, 0.0001, dt);
    } else {
      this.currentGrab = null;
      this.grabAmount = damp(this.grabAmount, 0, 0.0004, dt);
    }

    // Rider signature: Shift held with a grab, deep into a big air.
    if (
      this.specialsUnlocked &&
      input.shift &&
      input.grabKey &&
      phys.airTime > 1.1 &&
      Math.abs(phys.spinAccum) > Math.PI * 2
    ) {
      this.signatureArmed = true;
    }

    const name = this.describe(phys);
    if (name !== this.lastName) {
      this.lastName = name;
      this.pendingName = name;
      this.onNameChange?.(name);
    }
    this.pending = this.rawPoints(phys);
  }

  /** Human-readable name for what's currently being thrown. */
  describe(phys: RiderPhysics): string {
    const spinDeg = Math.abs(phys.spinAccum / DEG);
    const spinSnap = snapTo(spinDeg, 180);
    const flipTurns = Math.abs(phys.flipAccum) / (Math.PI * 2);
    const flips = Math.floor(flipTurns + 0.32);
    const forward = phys.flipAccum < 0;

    const parts: string[] = [];

    if (flips >= 1 && spinSnap >= 360) {
      const base = spinSnap >= 540 ? "Cork" : forward ? "Misty" : "Rodeo";
      parts.push(flips >= 2 ? `Double ${base}` : base);
      parts.push(String(spinSnap));
    } else if (flips >= 1) {
      const base = forward ? "Frontflip" : "Backflip";
      parts.push(flips >= 3 ? `Triple ${base}` : flips === 2 ? `Double ${base}` : base);
      if (spinSnap >= 180) parts.push(String(spinSnap));
    } else if (spinSnap >= 180) {
      parts.push(String(spinSnap));
    }

    if (this.grabs.length === 1) parts.push(this.grabs[0]);
    else if (this.grabs.length > 1)
      parts.push(this.grabs.slice(0, 3).join(" to "));

    if (this.signatureArmed) parts.unshift(this.rider.style.signature.toUpperCase());

    if (!parts.length) {
      if (phys.airTime > 0.75) return "Air";
      return "";
    }
    return parts.join(" ");
  }

  private rawPoints(phys: RiderPhysics) {
    const spinDeg = Math.abs(phys.spinAccum / DEG);
    const spinSnap = snapTo(spinDeg, 180);
    const flipTurns = Math.abs(phys.flipAccum) / (Math.PI * 2);
    const flips = Math.floor(flipTurns + 0.32);

    let pts = 0;
    // Spin value grows faster than linearly — a 900 should feel like a 900.
    pts += (spinSnap / 180) * 110 * (1 + spinSnap / 1440);
    pts += flips * 380 * (1 + flips * 0.35);
    if (flips >= 1 && spinSnap >= 360) pts *= 1 + this.corkAmount * 0.5;
    pts += this.grabs.length * 70 + Math.min(this.grabHold, 4) * 95;
    pts += Math.max(0, phys.airTime - 0.5) * 190;
    pts += Math.max(0, phys.peakAir - 3) * 30;
    if (this.signatureArmed) pts *= 1.6;
    return Math.round(pts);
  }

  /** Called from the physics landing callback. */
  land(info: LandingInfo, phys: RiderPhysics): TrickResult | null {
    const raw = this.pending;
    const name = this.pendingName || this.lastName;
    this.longestAir = Math.max(this.longestAir, info.airTime);

    const spin = Math.abs(snapTo(phys.spinDegrees, 180));
    const flips = Math.floor(Math.abs(phys.flipDegrees) / 360 + 0.32);
    const grabs = [...this.grabs];

    this.grabs.length = 0;
    this.grabHold = 0;
    this.pending = 0;
    this.pendingName = "";
    this.lastName = "";
    const wasSignature = this.signatureArmed;
    this.signatureArmed = false;
    this.corkAmount = 0;

    if (info.quality === "crash") {
      this.chain = 0;
      this.chainTimer = 0;
      this.crashes++;
      this.onCrash?.();
      return null;
    }

    if (raw < 40 || !name) {
      // Not a trick — just a landing. Doesn't break the chain, doesn't score.
      return null;
    }

    const qualityMul =
      info.quality === "perfect" ? 1.5 : info.quality === "good" ? 1 : 0.55;

    this.chain = Math.min(this.chain + 1, 24);
    this.chainTimer = 2.8;
    const multiplier = 1 + (this.chain - 1) * 0.5;

    const points = Math.round(raw * qualityMul);
    const total = Math.round(points * multiplier);
    this.score += total;
    this.totalTricks++;
    if (info.quality === "perfect") this.perfectLandings++;
    if (total > this.bestTrick) this.bestTrick = total;

    const result: TrickResult = {
      name: wasSignature ? `${name} [SIGNATURE]` : name,
      points,
      multiplier,
      chain: this.chain,
      quality: info.quality,
      stomped: phys.stomped,
      airTime: info.airTime,
      spin,
      flips,
      grabs,
      total,
    };
    this.onTrick?.(result);
    return result;
  }

  /** Flow bonus: points for holding a fast, clean carve. */
  addFlow(points: number) {
    this.score += points;
  }

  get comboAlive() {
    return this.chain > 0 && this.chainTimer > 0;
  }

  get comboFraction() {
    return clamp01(this.chainTimer / 2.8);
  }
}

/** Every trick the game can name — used by the trick list in the menus. */
export const TRICK_INDEX = [
  { name: "180 / 360 / 540 / 720 / 900", how: "Hold ← or → in the air" },
  { name: "Frontflip", how: "Hold ↑ in the air" },
  { name: "Backflip", how: "Hold ↓ in the air" },
  { name: "Misty / Rodeo", how: "Flip and spin at the same time" },
  { name: "Cork 540+", how: "Flip with 540 or more of spin" },
  { name: "Indy", how: "A" },
  { name: "Melon", how: "S" },
  { name: "Nose", how: "D" },
  { name: "Tail", how: "F" },
  { name: "Japan", how: "Shift + A" },
  { name: "Method", how: "Shift + S" },
  { name: "Mute", how: "Shift + D" },
  { name: "Stalefish", how: "Shift + F" },
  { name: "Stomp", how: "Tap Space just before you touch down" },
];

/** Seconds until the rider reaches the surface, from height and vertical speed. */
function timeToLand(height: number, vy: number) {
  const disc = vy * vy + 2 * GRAVITY * Math.max(0, height);
  if (disc <= 0) return Infinity;
  return (vy + Math.sqrt(disc)) / GRAVITY;
}

void lerp;
