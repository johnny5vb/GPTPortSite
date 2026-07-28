/**
 * Rider physics — the part everything else is in service of.
 *
 * The model is arcade, not simulation, but it is built out of real quantities
 * so it stays predictable:
 *
 *   - velocity is split into a *forward* component along the board and a
 *     *lateral* one across it; grip decides how fast lateral speed bleeds off.
 *     High grip = a carve that holds. Low grip (ice, braking) = a drift.
 *   - a clean carve *adds* energy. Pumping through a turn should make you
 *     faster, because chasing speed through a turn is the whole feedback loop.
 *   - the board is snapped to the analytic terrain height every substep and
 *     the velocity is projected onto the surface plane, so rollers throw you
 *     into the air for free and kickers convert speed into height honestly.
 *
 * Everything is integrated in fixed 1/120s substeps so the feel does not change
 * with frame rate.
 */

import * as THREE from "three";
import { TerrainGen, Surface } from "../world/TerrainGen";
import {
  clamp,
  clamp01,
  damp,
  dampAngle,
  angleDelta,
  lerp,
  smoothstep,
  wrapAngle,
  DEG,
  MPH,
} from "../core/math";

export type LandingQuality = "perfect" | "good" | "sketchy" | "crash";

export interface RideStats {
  spin: number;
  pop: number;
  balance: number;
  speed: number;
  turn: number;
  stability: number;
}

export interface LandingInfo {
  quality: LandingQuality;
  /** Impact speed into the slope, m/s. */
  impact: number;
  /** How far off the board was from the direction of travel, degrees. */
  headingError: number;
  /** How far the flip axis was from flat, degrees. */
  flipError: number;
  airTime: number;
  speed: number;
}

export interface PhysicsInput {
  steer: number;
  tuck: boolean;
  brake: boolean;
  jumpHeld: boolean;
  jumpPressed: boolean;
  jumpReleased: boolean;
}

const SUBSTEP = 1 / 120;
const GRAVITY = 21.6;
const AIRBORNE_GAP = 0.15;
const COYOTE = 0.11;
const MAX_CHARGE = 0.34;

export class RiderPhysics {
  readonly pos = new THREE.Vector3();
  readonly vel = new THREE.Vector3();

  /**
   * `pos` advanced by the fraction of a substep that hasn't been simulated yet.
   *
   * The simulation runs in fixed 1/120s slices so the feel is frame-rate
   * independent, but that leaves up to 8ms of un-simulated time on any given
   * frame — and at 40 m/s that is a third of a metre of position that pops in
   * and out as the frame rate drifts against the substep rate. Everything that
   * *draws* the rider (the rig, the chase camera) reads this instead of `pos`;
   * everything that simulates keeps using `pos`.
   */
  readonly renderPos = new THREE.Vector3();

  /** Board heading. 0 points down the fall line (+Z). */
  yaw = 0;
  /** Flip rotation about the board's lateral axis (radians, accumulates). */
  pitch = 0;
  /** Off-axis roll — corks and the visual lean while carving. */
  roll = 0;

  grounded = true;
  airTime = 0;
  groundTime = 0;
  coyote = 0;

  /** 0 = tall, 1 = fully compressed. Drives the rider rig and the pop. */
  crouch = 0;
  /** Visual body lean into the turn, -1..1. */
  lean = 0;
  /** Signed edge load, -1..1. How hard the board is being carved. */
  edge = 0;
  /** Ollie charge, 0..1. */
  charge = 0;
  charging = false;

  speed = 0;
  /** Forward speed along the board, used for the speedo and audio. */
  forwardSpeed = 0;
  /** Sideways scrub — drives the spray and the scrape sound. */
  slip = 0;

  crashed = false;
  crashTimer = 0;
  crashSpin = 0;

  /** Short-lived speed boosts from perfect landings and shortcut chutes. */
  boost = 0;

  /**
   * Landing timing. Tapping jump in the last fraction of a second before
   * touchdown "stomps" the landing: it upgrades the grade one notch and gives
   * a free re-pop, which is how combos get chained together.
   */
  stompTimer = 0;
  stomped = false;

  distance = 0;
  airHeight = 0;
  peakAir = 0;

  surface: Surface = {
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
  };

  stats: RideStats = {
    spin: 1,
    pop: 1,
    balance: 1,
    speed: 1,
    turn: 1,
    stability: 1,
  };

  onLand?: (info: LandingInfo) => void;
  onTakeoff?: (power: number, popped: boolean) => void;
  onCrash?: (reason: "landing" | "wall", speed: number) => void;
  onBrush?: (intensity: number) => void;
  onCompress?: (force: number) => void;

  private gen: TerrainGen;
  private tmpN = new THREE.Vector3();
  private tmpV = new THREE.Vector3();
  private accum = 0;
  private pendingPop = 0;
  private lastGroundNormalY = 1;
  private brushTimer = 0;
  /** Rotation accumulated since take-off, in radians. Read by the trick system. */
  spinAccum = 0;
  flipAccum = 0;

  constructor(gen: TerrainGen) {
    this.gen = gen;
  }

  reset(x: number, z: number) {
    this.gen.sample(x, z, this.surface);
    this.pos.set(x, this.surface.h, z);
    this.renderPos.copy(this.pos);
    this.vel.set(0, 0, 12);
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.grounded = true;
    this.airTime = 0;
    this.groundTime = 0;
    this.crashed = false;
    this.crashTimer = 0;
    this.charge = 0;
    this.charging = false;
    this.boost = 0;
    this.speed = 0;
    this.spinAccum = 0;
    this.flipAccum = 0;
    this.peakAir = 0;
    this.accum = 0;
  }

  /** Direction the board points, on the XZ plane. */
  heading(out: THREE.Vector3) {
    return out.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
  }

  /** Direction of travel on the XZ plane. */
  travelHeading() {
    return Math.atan2(this.vel.x, this.vel.z);
  }

  step(dt: number, input: PhysicsInput) {
    this.accum += Math.min(dt, 0.1);
    let guard = 0;
    while (this.accum >= SUBSTEP && guard++ < 24) {
      this.substep(SUBSTEP, input);
      this.accum -= SUBSTEP;
      // Edge-triggered inputs must only fire on the first substep.
      input = {
        ...input,
        jumpPressed: false,
        jumpReleased: false,
      };
    }
    this.speed = this.vel.length();
    this.renderPos.copy(this.pos).addScaledVector(this.vel, this.accum);
  }

  private substep(dt: number, input: PhysicsInput) {
    const gen = this.gen;
    const s = this.surface;

    if (this.crashed) {
      this.stepCrash(dt);
      return;
    }

    gen.sample(this.pos.x, this.pos.z, s);
    const speed = this.vel.length();

    // ── charge / ollie ────────────────────────────────────────────────────
    if (this.grounded) {
      if (input.jumpPressed) this.charging = true;
      if (this.charging && input.jumpHeld) {
        this.charge = Math.min(1, this.charge + dt / MAX_CHARGE);
      }
      if (input.jumpReleased && this.charging) {
        this.pendingPop = 1 + this.charge * 0.55;
        this.charging = false;
      }
    }

    const targetCrouch = this.charging
      ? lerp(0.35, 1, this.charge)
      : input.tuck
        ? 0.55
        : input.brake
          ? 0.4
          : clamp01(Math.abs(this.edge) * 0.35);
    this.crouch = damp(this.crouch, targetCrouch, 0.0002, dt);

    if (this.grounded) this.groundStep(dt, input, s, speed);
    else this.airStep(dt, input, speed);

    // ── boosts decay ──────────────────────────────────────────────────────
    this.boost = damp(this.boost, 0, 0.08, dt);

    // ── shortcut chutes reward commitment with free speed ──────────────────
    const f = gen.featureAtZ(this.pos.z);
    if (f.kind === "shortcut" && this.grounded) {
      const cx = gen.corridorCenter(this.pos.z);
      const hw = gen.corridorHalfWidth(this.pos.z);
      const chuteX = cx + f.side * (hw + 46);
      const d = Math.abs(this.pos.x - chuteX);
      if (d < f.a * 0.9) this.boost = Math.max(this.boost, 5.5);
    }
  }

  // ────────────────────────────────────────────────────────────── ground ────

  private groundStep(dt: number, input: PhysicsInput, s: Surface, speed: number) {
    this.groundTime += dt;
    this.airTime = 0;
    this.coyote = COYOTE;

    const st = this.stats;

    // Surface response.
    const grip = clamp01(
      0.62 + s.groom * 0.26 + s.powder * 0.3 - s.ice * 0.62 - s.rock * 0.2,
    ) * st.stability;
    const friction =
      0.026 + s.powder * 0.075 - s.ice * 0.016 - s.groom * 0.006 + s.rock * 0.05;

    // ── steering ──────────────────────────────────────────────────────────
    const speedTurnFalloff = 1 / (1 + speed * 0.021);
    const turnRate =
      2.75 * st.turn * speedTurnFalloff * (input.tuck ? 0.6 : 1) *
      (input.brake ? 1.45 : 1);
    const steer = input.steer;
    this.yaw += steer * turnRate * dt;

    // Edge load ramps in — you can't flick from edge to edge instantly, and
    // that little bit of resistance is most of what makes carving feel good.
    this.edge = damp(this.edge, steer, 0.0004, dt);
    this.lean = damp(this.lean, steer * clamp01(speed / 22), 0.002, dt);

    // ── forces ────────────────────────────────────────────────────────────
    const n = this.tmpN.set(s.nx, s.ny, s.nz);
    // Gravity projected onto the slope.
    const g = this.tmpV.set(0, -GRAVITY, 0);
    const gDotN = g.dot(n);
    g.addScaledVector(n, -gDotN);
    this.vel.addScaledVector(g, dt);

    // Aerodynamic drag — tucking is a real, felt gain.
    const dragK = input.tuck ? 0.0028 : 0.0048;
    const dragMul = 1 / (st.speed * st.speed);
    this.vel.addScaledVector(
      this.vel,
      -dragK * dragMul * speed * dt * (input.brake ? 2.4 : 1),
    );

    // Snow friction.
    const fr = friction * GRAVITY * s.ny * (input.brake ? 7.5 : 1);
    if (speed > 0.01) {
      this.vel.addScaledVector(this.vel, (-fr * dt) / speed);
    }

    // ── carve: split velocity into forward / lateral ───────────────────────
    const fx = Math.sin(this.yaw);
    const fz = Math.cos(this.yaw);
    const rx = fz; // right vector = forward rotated -90° about Y
    const rz = -fx;

    const vf = this.vel.x * fx + this.vel.z * fz;
    const vr = this.vel.x * rx + this.vel.z * rz;

    // Lateral bleed. Braking deliberately wrecks it so you can scrub speed.
    const latSmoothing = input.brake
      ? 0.35
      : lerp(0.4, 0.00008, grip);
    const vr2 = vr * Math.pow(latSmoothing, dt);
    const scrubbed = vr - vr2;
    this.slip = damp(this.slip, Math.abs(vr), 0.0006, dt);

    // Carving converts part of the scrubbed lateral speed into drive, plus a
    // small pump bonus while the edge is loaded. Cap it so it never runs away.
    let vf2 = vf + Math.abs(scrubbed) * 0.55 * grip;
    const carveLoad = Math.abs(this.edge) * clamp01(speed / 14);
    if (!input.brake && speed > 6) {
      const headroom = clamp01(1 - speed / (54 * st.speed));
      vf2 += carveLoad * grip * 9.5 * headroom * dt * st.speed;
    }
    if (this.boost > 0.01) vf2 += this.boost * dt * 3.2;

    this.vel.x = fx * vf2 + rx * vr2;
    this.vel.z = fz * vf2 + rz * vr2;
    this.forwardSpeed = vf2;

    // Back-drift: the board slowly aligns to the direction of travel, which
    // keeps a slide from feeling like it's fighting you.
    const travel = Math.atan2(this.vel.x, this.vel.z);
    if (speed > 3) {
      this.yaw = dampAngle(
        this.yaw,
        travel,
        lerp(0.9, 0.35, clamp01(Math.abs(vr) / 8)),
        dt,
      );
    }

    // ── rail snap ─────────────────────────────────────────────────────────
    // A rail is 40cm wide and you arrive at 15 m/s. Without help the target is
    // a few centimetres and nobody ever lands a grind; with too much help the
    // rail drives the board and you are a passenger. So: a spring toward the
    // centre line, strong enough to hold you once you are on and to gather you
    // in from just off the edge, and a damper so it settles instead of
    // oscillating. Steering still wins — hold an edge and you ride off it.
    if (s.rail > 0.01) {
      const pull = s.rail * 26 * dt;
      this.vel.x -= s.railDx * pull;
      this.vel.x -= this.vel.x * Math.min(1, s.rail * 6 * dt);
    }

    // ── integrate along the slope ─────────────────────────────────────────
    this.vel.addScaledVector(n, -this.vel.dot(n));
    this.pos.addScaledVector(this.vel, dt);
    this.distance += Math.hypot(this.vel.x, this.vel.z) * dt;

    // ── stay on / leave the surface ───────────────────────────────────────
    const gen = this.gen;
    // The ride surface, not the snow: standing on a rail is a metre of air by
    // the terrain's reckoning, and using it here launched the rider off every
    // box they touched.
    const nh = gen.rideHeightAt(this.pos.x, this.pos.z);
    const gap = this.pos.y - nh;

    // Compression: landing back into a concavity should feel like it loads up.
    if (s.ny > this.lastGroundNormalY + 0.004 && speed > 16) {
      this.onCompress?.((s.ny - this.lastGroundNormalY) * speed);
    }
    this.lastGroundNormalY = s.ny;

    if (gap > AIRBORNE_GAP) {
      this.launch(false);
    } else {
      this.pos.y = nh;
      if (this.pendingPop > 0) {
        this.applyPop(this.pendingPop);
        this.pendingPop = 0;
      }
    }

    this.checkTerrainImpact(speed);
    this.checkTrees(dt, speed);

    // Roll settles back toward the carve lean when on the ground.
    this.roll = dampAngle(this.roll, this.lean * 0.55, 0.0008, dt);
    this.pitch = dampAngle(this.pitch, 0, 0.002, dt);
  }

  private applyPop(power: number) {
    const p = 7.6 * this.stats.pop * power;
    this.vel.y += p;
    this.pos.y += 0.05;
    this.charge = 0;
    this.launch(true, power);
  }

  private launch(popped: boolean, power = 1) {
    if (!this.grounded) return;
    this.grounded = false;
    this.airTime = 0;
    this.groundTime = 0;
    this.spinAccum = 0;
    this.flipAccum = 0;
    this.peakAir = 0;
    this.charging = false;
    // A charged ollie held into a natural lip still gets its pop.
    if (!popped && this.pendingPop > 0) {
      this.vel.y += 7.6 * this.stats.pop * this.pendingPop * 0.85;
      this.pendingPop = 0;
      popped = true;
      power = 1.2;
    }
    this.charge = 0;
    this.onTakeoff?.(power * clamp01(this.vel.y / 9), popped);
  }

  // ───────────────────────────────────────────────────────────────── air ────

  private airStep(dt: number, input: PhysicsInput, speed: number) {
    this.airTime += dt;
    this.coyote = Math.max(0, this.coyote - dt);

    // Arm the stomp window on a *press*, so holding jump the whole way down
    // earns nothing. You have to call the landing.
    if (input.jumpPressed && this.airTime > 0.12) this.stompTimer = 0.3;
    else this.stompTimer = Math.max(0, this.stompTimer - dt);

    this.vel.y -= GRAVITY * dt * 0.92;
    // Just enough air drag to keep long floats from getting silly.
    this.vel.addScaledVector(this.vel, -0.0016 * speed * dt);

    // A whisper of air steering. Not enough to fly — enough to save a landing.
    if (Math.abs(input.steer) > 0.01) {
      const fx = Math.sin(this.yaw);
      const fz = Math.cos(this.yaw);
      this.vel.x += fz * input.steer * 2.4 * dt;
      this.vel.z += -fx * input.steer * 2.4 * dt;
    }

    this.pos.addScaledVector(this.vel, dt);
    this.distance += Math.hypot(this.vel.x, this.vel.z) * dt;

    const nh = this.gen.rideHeightAt(this.pos.x, this.pos.z);
    this.airHeight = this.pos.y - nh;
    if (this.airHeight > this.peakAir) this.peakAir = this.airHeight;

    if (this.pos.y <= nh) {
      this.pos.y = nh;
      this.land();
    }
  }

  private land() {
    const gen = this.gen;
    gen.sample(this.pos.x, this.pos.z, this.surface);
    const s = this.surface;
    const n = this.tmpN.set(s.nx, s.ny, s.nz);

    const speed = this.vel.length();
    const impact = Math.max(0, -this.vel.dot(n));

    // How square are we?
    const travel = Math.atan2(this.vel.x, this.vel.z);
    const headingError = Math.abs(angleDelta(this.yaw, travel)) / DEG;

    // How close is the flip to a whole number of rotations?
    const flipTurns = this.flipAccum / (Math.PI * 2);
    const flipError =
      Math.abs(flipTurns - Math.round(flipTurns)) * 360;

    const bal = this.stats.balance;
    const impactBudget = 15.5 * bal + s.powder * 9 - s.ice * 3;

    let quality: LandingQuality;
    if (headingError < 17 * bal && flipError < 26 * bal && impact < impactBudget) {
      quality = "perfect";
    } else if (
      headingError < 45 * bal &&
      flipError < 60 * bal &&
      impact < impactBudget * 1.45
    ) {
      quality = "good";
    } else if (
      headingError < 78 * bal &&
      flipError < 105 * bal &&
      impact < impactBudget * 1.9
    ) {
      quality = "sketchy";
    } else {
      quality = "crash";
    }

    // Powder saves you. Ice does not.
    if (quality === "crash" && s.powder > 0.75 && impact < impactBudget * 2.2) {
      quality = "sketchy";
    }

    // A called landing upgrades the grade one notch.
    this.stomped = this.stompTimer > 0;
    if (this.stomped) {
      if (quality === "sketchy") quality = "good";
      else if (quality === "good") quality = "perfect";
      else if (quality === "crash" && headingError < 100 && impact < impactBudget * 2.1)
        quality = "sketchy";
    }
    this.stompTimer = 0;

    const info: LandingInfo = {
      quality,
      impact,
      headingError,
      flipError,
      airTime: this.airTime,
      speed,
    };

    this.grounded = true;
    this.groundTime = 0;
    this.pitch = 0;
    this.flipAccum = 0;
    this.spinAccum = 0;
    this.lastGroundNormalY = s.ny;

    // Kill the into-slope component, then apply the payoff.
    this.vel.addScaledVector(n, -this.vel.dot(n));

    switch (quality) {
      case "perfect":
        this.vel.multiplyScalar(1.055);
        this.boost = Math.max(this.boost, 4.5 + this.airTime * 2.2);
        break;
      case "good":
        this.vel.multiplyScalar(0.985);
        break;
      case "sketchy":
        this.vel.multiplyScalar(0.8);
        this.lean = Math.sign(angleDelta(this.yaw, this.travelHeading())) * 0.9;
        break;
      case "crash":
        this.startCrash("landing", speed);
        break;
    }

    // Stomping hands you the next ollie for free — that's the combo chain.
    if (this.stomped && quality !== "crash") this.pendingPop = 0.9;

    this.onLand?.(info);
  }

  // ─────────────────────────────────────────────────────────────── crash ────

  private startCrash(reason: "landing" | "wall", speed: number) {
    if (this.crashed) return;
    this.crashed = true;
    this.crashTimer = 0;
    this.crashSpin = (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 4);
    this.vel.multiplyScalar(0.28);
    this.vel.y = Math.max(this.vel.y, 3.5);
    this.onCrash?.(reason, speed);
  }

  private stepCrash(dt: number) {
    this.crashTimer += dt;
    const gen = this.gen;
    this.vel.y -= GRAVITY * dt;
    this.vel.addScaledVector(this.vel, -1.1 * dt);
    this.pos.addScaledVector(this.vel, dt);

    const nh = gen.heightAt(this.pos.x, this.pos.z);
    if (this.pos.y < nh) {
      this.pos.y = nh;
      this.vel.y = Math.abs(this.vel.y) * 0.32;
      this.vel.x *= 0.7;
      this.vel.z *= 0.7;
    }

    // Tumble.
    this.pitch += this.crashSpin * dt;
    this.roll += this.crashSpin * 0.55 * dt;
    this.yaw += this.crashSpin * 0.3 * dt;
    this.crouch = 1;

    if (this.crashTimer > 1.35 && this.vel.lengthSq() < 40) {
      // Pop back up, pointed downhill, with just enough speed to recover.
      this.crashed = false;
      this.grounded = true;
      gen.sample(this.pos.x, this.pos.z, this.surface);
      this.pos.y = this.surface.h;
      this.pitch = 0;
      this.roll = 0;
      this.yaw = 0;
      this.vel.set(0, 0, Math.max(7, this.vel.length()));
      this.edge = 0;
      this.lean = 0;
      this.charge = 0;
      this.spinAccum = 0;
      this.flipAccum = 0;
    }
  }

  // ───────────────────────────────────────────────────────────── hazards ────

  private checkTerrainImpact(speed: number) {
    if (speed < 11) return;
    const gen = this.gen;
    const inv = 1 / Math.max(1e-3, Math.hypot(this.vel.x, this.vel.z));
    const dx = this.vel.x * inv;
    const dz = this.vel.z * inv;
    const probe = 1.1 + speed * 0.045;
    const ahead = gen.heightAt(this.pos.x + dx * probe, this.pos.z + dz * probe);
    const rise = (ahead - this.pos.y) / probe;

    if (rise > 1.35 && speed > 19) {
      this.startCrash("wall", speed);
    } else if (rise > 0.72) {
      // Bogging into a bank — heavy, but recoverable.
      const bog = smoothstep(0.72, 1.35, rise);
      this.vel.multiplyScalar(1 - bog * 0.06);
    }
  }

  private checkTrees(dt: number, speed: number) {
    this.brushTimer -= dt;
    if (speed < 11 || this.brushTimer > 0) return;
    const gen = this.gen;
    const mask = gen.treeMask(
      this.pos.x,
      this.pos.z,
      this.pos.y,
      this.surface.steep,
    );
    if (mask > 0.42) {
      const intensity = clamp01((mask - 0.42) / 0.5) * clamp01(speed / 30);
      this.vel.multiplyScalar(1 - intensity * 0.03);
      this.onBrush?.(intensity);
      this.brushTimer = 0.12;
    }
  }

  // ────────────────────────────────────────────────────────── air rotation ──

  applyAirRotation(dYaw: number, dPitch: number, dRoll: number) {
    this.yaw = wrapAngle(this.yaw + dYaw);
    this.spinAccum += dYaw;
    this.pitch += dPitch;
    this.flipAccum += dPitch;
    this.roll += dRoll;
  }

  /** Signed spin in degrees since take-off. */
  get spinDegrees() {
    return (this.spinAccum / DEG) | 0;
  }

  get flipDegrees() {
    return (this.flipAccum / DEG) | 0;
  }

  /** 0..1 — how close the current air is to a "big" one. */
  get bigAir() {
    return clamp01((this.airTime - 0.65) / 1.5) * clamp01(this.peakAir / 6);
  }

  get mph() {
    return this.speed * MPH;
  }

  /** Where the board's contact patch is, for spray and trails. */
  contactPoint(out: THREE.Vector3) {
    return out.copy(this.pos);
  }

  surfaceKind(): "powder" | "ice" | "groom" | "rock" {
    const s = this.surface;
    if (s.rock > 0.5) return "rock";
    if (s.ice > 0.55) return "ice";
    if (s.powder > 0.5) return "powder";
    return "groom";
  }

  clampToCorridor() {
    // Safety net: if a crash tumble somehow puts the rider outside the world,
    // walk them back toward the run instead of stranding them.
    const cx = this.gen.corridorCenter(this.pos.z);
    const hw = this.gen.corridorHalfWidth(this.pos.z);
    const d = this.pos.x - cx;
    const limit = hw + 190;
    if (Math.abs(d) > limit) {
      this.pos.x = cx + Math.sign(d) * limit;
      this.vel.x *= -0.25;
    }
    void clamp;
  }
}
