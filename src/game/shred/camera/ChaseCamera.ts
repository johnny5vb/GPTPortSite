/**
 * The chase camera.
 *
 * Rules it follows, in priority order:
 *   1. Never clip the mountain. The boom is height-clamped against the terrain
 *      every frame, and it lifts rather than pushes in, so you never lose the
 *      rider behind a roller.
 *   2. Track the direction of *travel*, not the direction the board points.
 *      That is what makes a 720 read as the rider spinning in front of you
 *      instead of the world spinning around them. A small fraction of the spin
 *      does leak into the camera, which adds the drama back.
 *   3. Everything is spring-damped with frame-rate independent constants, and
 *      the springs are asymmetric: the camera falls behind fast under
 *      acceleration and catches up slowly, so speed *feels* like speed.
 *   4. FOV, boom length and shake are all functions of speed, air and impact,
 *      layered additively so no single effect ever dominates.
 */

import * as THREE from "three";
import { TerrainGen } from "../world/TerrainGen";
import { RiderPhysics } from "../player/Physics";
import {
  clamp,
  clamp01,
  damp,
  dampAngle,
  lerp,
  smoothstep,
  wrapAngle,
} from "../core/math";

export interface CameraTuning {
  distance: number;
  height: number;
  lookAhead: number;
  lookHeight: number;
  fov: number;
  fovSpeedGain: number;
}

const DEFAULT_TUNING: CameraTuning = {
  distance: 4.7,
  height: 1.9,
  lookAhead: 8.0,
  lookHeight: 1.5,
  fov: 62,
  fovSpeedGain: 22,
};

export type CameraMode = "chase" | "photo" | "orbit" | "cinematic";

export class ChaseCamera {
  readonly camera: THREE.PerspectiveCamera;
  tuning: CameraTuning = { ...DEFAULT_TUNING };
  mode: CameraMode = "chase";

  /** 0..1 global intensity — Zen mode dials the drama down. */
  intensity = 1;

  private gen: TerrainGen;
  private yaw = 0;
  private pos = new THREE.Vector3();
  private look = new THREE.Vector3();
  private targetLook = new THREE.Vector3();
  private roll = 0;
  private shake = 0;
  private shakeRot = 0;
  private trauma = 0;
  private fov = DEFAULT_TUNING.fov;
  private boom = DEFAULT_TUNING.distance;
  private height = DEFAULT_TUNING.height;
  private noiseT = Math.random() * 100;
  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();
  private up = new THREE.Vector3(0, 1, 0);
  /**
   * 0 on a wide screen, 1 on a tall one. A portrait frame shows far less of
   * the mountain sideways and far more sky, so we widen slightly and — much
   * more importantly — aim down, which trades useless sky for the terrain you
   * are about to ride into.
   */
  private tallBias = 0;

  // Photo / orbit mode state.
  orbitYaw = 0;
  orbitPitch = 0.25;
  orbitDist = 9;

  constructor(gen: TerrainGen, aspect: number) {
    this.gen = gen;
    this.camera = new THREE.PerspectiveCamera(DEFAULT_TUNING.fov, aspect, 0.35, 5200);
    this.camera.position.set(0, 6, -10);
  }

  reset(phys: RiderPhysics) {
    this.yaw = phys.yaw;
    this.pos
      .copy(phys.renderPos)
      .addScaledVector(
        this.tmp.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)),
        -this.tuning.distance,
      );
    this.pos.y += this.tuning.height;
    this.look.copy(phys.renderPos);
    this.camera.position.copy(this.pos);
    this.camera.lookAt(this.look);
    this.trauma = 0;
    this.shake = 0;
    this.boom = this.tuning.distance;
    this.fov = this.tuning.fov;
  }

  /** Add a shake impulse. 0..1; they accumulate but saturate. */
  addTrauma(amount: number) {
    this.trauma = clamp01(this.trauma + amount * this.intensity);
  }

  update(dt: number, phys: RiderPhysics, timeScale: number, spinSpeed: number) {
    if (this.mode === "photo" || this.mode === "orbit") {
      this.updateOrbit(dt, phys);
      return;
    }

    const t = this.tuning;
    const speed = phys.speed;
    const speed01 = clamp01(speed / 42);
    const air = clamp01(phys.airTime / 1.6);
    const bigAir = phys.bigAir;

    // ── boom yaw ─────────────────────────────────────────────────────────
    // Follow travel direction; leak a little of the spin in for drama.
    const travel =
      speed > 3 ? Math.atan2(phys.vel.x, phys.vel.z) : phys.yaw;
    const spinLeak = clamp(spinSpeed * 0.055, -0.5, 0.5);
    const targetYaw = travel + spinLeak;

    // Asymmetric: snap in behind quickly at low speed, trail at high speed.
    const yawSmoothing = lerp(0.0006, 0.02, speed01) * (phys.grounded ? 1 : 2.2);
    this.yaw = dampAngle(this.yaw, targetYaw, yawSmoothing, dt);

    // ── boom length / height ─────────────────────────────────────────────
    const targetBoom =
      t.distance +
      speed01 * 2.0 +
      bigAir * 5.4 +
      air * 1.6 +
      (phys.crashed ? 4.5 : 0) +
      Math.abs(phys.edge) * 0.5;
    const targetHeight =
      t.height +
      this.tallBias * 1.5 +
      bigAir * 2.3 +
      clamp01(phys.airHeight / 14) * 2.2 +
      (phys.crashed ? 1.8 : 0);

    this.boom = damp(this.boom, targetBoom, phys.crashed ? 0.05 : 0.0025, dt);
    this.height = damp(this.height, targetHeight, 0.004, dt);

    // ── desired position ─────────────────────────────────────────────────
    const back = this.tmp.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const desired = this.tmp2
      .copy(phys.renderPos)
      .addScaledVector(back, -this.boom);
    desired.y = phys.renderPos.y + this.height;

    // Follow the terrain grade so the camera doesn't dig into the hill on the
    // steeps or fly off the back on a rollover.
    const gradeAhead = this.gen.heightAt(
      phys.renderPos.x + back.x * 14,
      phys.renderPos.z + back.z * 14,
    );
    desired.y += clamp((gradeAhead - phys.renderPos.y) * 0.28, -3.5, 5.5);

    // Position spring — tighter vertically than horizontally.
    this.pos.x = damp(this.pos.x, desired.x, 0.0009, dt);
    this.pos.z = damp(this.pos.z, desired.z, 0.0009, dt);
    this.pos.y = damp(this.pos.y, desired.y, phys.grounded ? 0.0008 : 0.004, dt);

    // ── never clip the mountain ──────────────────────────────────────────
    const groundAtCam = this.gen.heightAt(this.pos.x, this.pos.z);
    const minY = groundAtCam + 1.15;
    if (this.pos.y < minY) this.pos.y = lerp(this.pos.y, minY, 0.65);
    // Sample a couple of points along the boom too, so a ridge between the
    // camera and the rider lifts us over instead of eating the shot.
    for (let i = 1; i <= 3; i++) {
      const f = i / 4;
      const sx = lerp(this.pos.x, phys.renderPos.x, f);
      const sz = lerp(this.pos.z, phys.renderPos.z, f);
      const h = this.gen.heightAt(sx, sz) + 0.9;
      const lineY = lerp(this.pos.y, phys.renderPos.y + 1.2, f);
      if (lineY < h) this.pos.y += (h - lineY) * 0.8;
    }

    // ── look target ──────────────────────────────────────────────────────
    const fwd = this.tmp.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    this.targetLook
      .copy(phys.renderPos)
      .addScaledVector(fwd, t.lookAhead * (0.6 + speed01 * 0.8));
    this.targetLook.y =
      phys.renderPos.y + t.lookHeight - this.tallBias * 2.6 + air * 1.1;
    // Bias toward where the rider will be, not where they are.
    this.targetLook.addScaledVector(phys.vel, 0.06);
    this.look.lerp(this.targetLook, 1 - Math.pow(0.002, dt));

    // ── roll: lean into the turn ─────────────────────────────────────────
    const turnLean =
      -phys.edge * 0.11 * clamp01(speed / 20) -
      clamp(spinSpeed * 0.012, -0.2, 0.2);
    this.roll = damp(this.roll, turnLean * this.intensity, 0.002, dt);

    // ── shake ────────────────────────────────────────────────────────────
    this.noiseT += dt * (18 + speed * 0.7);
    const speedShake = smoothstep(26, 52, speed) * 0.055;
    this.trauma = Math.max(0, this.trauma - dt * 1.35);
    const traumaShake = this.trauma * this.trauma * 0.55;
    this.shake = (speedShake + traumaShake) * this.intensity * (phys.grounded ? 1 : 0.45);
    this.shakeRot = traumaShake * 0.35 * this.intensity;

    // ── fov ──────────────────────────────────────────────────────────────
    const targetFov =
      t.fov * (1 + this.tallBias * 0.14) +
      speed01 * t.fovSpeedGain +
      (phys.boost > 0.5 ? 5 : 0) -
      bigAir * 7 +
      (timeScale < 0.9 ? -6 : 0);
    this.fov = damp(this.fov, targetFov, 0.008, dt);

    this.apply(dt);
  }

  private apply(dt: number) {
    const cam = this.camera;
    const s = this.shake;
    const n = this.noiseT;

    cam.position.copy(this.pos);
    if (s > 0.0001) {
      cam.position.x += Math.sin(n * 1.7) * s * 0.9;
      cam.position.y += Math.sin(n * 2.3 + 1.7) * s;
      cam.position.z += Math.sin(n * 1.3 + 4.1) * s * 0.9;
    }

    // Build the orientation by hand so we can roll the camera.
    this.up.set(0, 1, 0);
    cam.up.copy(this.up);
    cam.lookAt(this.look);

    const rollTotal = this.roll + Math.sin(n * 3.1) * this.shakeRot;
    if (Math.abs(rollTotal) > 1e-5) {
      cam.rotateZ(rollTotal);
    }
    if (this.shakeRot > 1e-5) {
      cam.rotateX(Math.sin(n * 2.7 + 2.2) * this.shakeRot * 0.6);
      cam.rotateY(Math.sin(n * 2.1 + 5.5) * this.shakeRot * 0.6);
    }

    if (Math.abs(cam.fov - this.fov) > 0.01) {
      cam.fov = this.fov;
      cam.updateProjectionMatrix();
    }
    void dt;
  }

  private updateOrbit(dt: number, phys: RiderPhysics) {
    const cam = this.camera;
    const target = this.tmp.copy(phys.renderPos);
    target.y += 1.1;
    const cp = Math.cos(this.orbitPitch);
    this.pos.set(
      target.x + Math.sin(this.orbitYaw) * cp * this.orbitDist,
      target.y + Math.sin(this.orbitPitch) * this.orbitDist,
      target.z + Math.cos(this.orbitYaw) * cp * this.orbitDist,
    );
    const ground = this.gen.heightAt(this.pos.x, this.pos.z) + 0.6;
    if (this.pos.y < ground) this.pos.y = ground;
    cam.position.copy(this.pos);
    cam.up.set(0, 1, 0);
    cam.lookAt(target);
    this.look.copy(target);
    void dt;
  }

  setAspect(aspect: number) {
    this.camera.aspect = aspect;
    this.tallBias = clamp01((1.35 - aspect) / 0.85);
    this.camera.updateProjectionMatrix();
  }

  get forward() {
    return this.tmp2.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
  }

  get currentRoll() {
    return this.roll;
  }

  get currentYaw() {
    return wrapAngle(this.yaw);
  }
}
