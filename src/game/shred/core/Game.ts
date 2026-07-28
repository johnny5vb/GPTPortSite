/**
 * SHRED // 1999 — game orchestrator.
 *
 * Owns the renderer, the world, the rider and the loop. Everything else is a
 * system it drives. The React layer never touches three.js: it calls
 * `start/pause/restart` and reads a plain snapshot object.
 *
 * Time is deliberately not linear. `timeScale` is driven by three things —
 * freeze frames on a perfect landing, slow motion on a big air, and a hard stop
 * in photo mode — and *everything* reads the scaled dt so the whole world,
 * camera and audio bend together.
 */

import * as THREE from "three";
import { Input } from "./input";
import {
  clamp,
  clamp01,
  damp,
  lerp,
  smoothstep,
} from "./math";
import { hashString, makeRng } from "./rng";
import { TerrainGen, mountainById, MountainPreset } from "../world/TerrainGen";
import { Terrain } from "../world/Terrain";
import { Scatter } from "../world/Scatter";
import { Props } from "../world/Props";
import { Environment, skyById, SkyPreset } from "../world/Sky";
import { createWorldUniforms, WorldUniforms, stylizeMaterial, ensureMatAttribute } from "../world/SnowMaterial";
import { RiderPhysics, LandingInfo } from "../player/Physics";
import { TrickSystem, TrickResult } from "../player/TrickSystem";
import { RiderRig } from "../player/RiderRig";
import { ChaseCamera } from "../camera/ChaseCamera";
import { Particles, PKind } from "../fx/Particles";
import { Trails } from "../fx/Trails";
import { Snowfall, WindStreaks } from "../fx/Weather";
import { PostFX, FilterId, FILTERS } from "../fx/PostFX";
import { AudioEngine } from "../audio/Audio";
import { customToRider, riderById } from "../data/riders";
import { boardById } from "../data/boards";
import { ModeDef, modeById, ModeId } from "../data/modes";
import type { SaveData } from "./save";
import { acquireRenderer, probeCaps, type RenderCaps } from "./renderer";

export type RunStatus = "loading" | "ready" | "riding" | "paused" | "photo" | "finished";

export interface HudSnapshot {
  status: RunStatus;
  speedKmh: number;
  speed01: number;
  score: number;
  chain: number;
  chainFraction: number;
  pendingScore: number;
  trickName: string;
  airTime: number;
  airHeight: number;
  bigAir: number;
  time: number;
  timeLeft: number;
  distance: number;
  distanceLeft: number;
  crashes: number;
  gatesPassed: number;
  gatesMissed: number;
  airsLeft: number;
  grounded: boolean;
  charge: number;
  boost: number;
  surface: string;
  mountainName: string;
  modeName: string;
  /** What the terrain is doing right now — "Steep", "Ice tunnel", "Gap jump". */
  section: string;
  hud: ModeDef["hud"];
  fps: number;
}

export type GameEvent =
  | { type: "trick"; result: TrickResult }
  | { type: "landing"; quality: LandingInfo["quality"]; stomped: boolean }
  | { type: "crash" }
  | { type: "gate"; passed: boolean }
  | { type: "finish"; summary: RunSummary }
  | { type: "photo"; dataUrl: string }
  | { type: "ready" };

export interface RunSummary {
  mode: ModeId;
  mountain: string;
  score: number;
  time: number;
  distance: number;
  tricks: number;
  perfects: number;
  crashes: number;
  bestTrick: number;
  longestAir: number;
  topSpeed: number;
  gatesPassed: number;
  gatesMissed: number;
  bestAirScore: number;
}

export interface GameOptions {
  canvas: HTMLCanvasElement;
  save: SaveData;
  mode: ModeId;
  seed?: number;
  onHud?: (s: HudSnapshot) => void;
  onEvent?: (e: GameEvent) => void;
}

interface Gate {
  z: number;
  x: number;
  half: number;
  state: 0 | 1 | 2; // pending / passed / missed
  group: THREE.Group;
}

const QUALITY: Record<
  SaveData["settings"]["quality"],
  {
    pr: number;
    scale: number;
    shadow: number;
    particles: number;
    snow: number;
    shadows: boolean;
    detail: number;
    /** MSAA samples on the scene target. 0 disables it. */
    samples: number;
  }
> = {
  low: { pr: 1, scale: 0.8, shadow: 512, particles: 0.45, snow: 3500, shadows: false, detail: 0.62, samples: 0 },
  medium: { pr: 1.5, scale: 1, shadow: 1024, particles: 0.7, snow: 7000, shadows: true, detail: 0.8, samples: 2 },
  high: { pr: 2, scale: 1, shadow: 2048, particles: 1, snow: 11000, shadows: true, detail: 1, samples: 4 },
  ultra: { pr: 2, scale: 1, shadow: 4096, particles: 1.35, snow: 16000, shadows: true, detail: 1, samples: 8 },
};

export class Game {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly input = new Input();
  readonly audio = new AudioEngine();

  private canvas: HTMLCanvasElement;
  private saveData: SaveData;
  private mode: ModeDef;
  private seed: number;

  private uniforms: WorldUniforms;
  private gen!: TerrainGen;
  private terrain!: Terrain;
  private scatter!: Scatter;
  private props!: Props;
  private env!: Environment;
  private phys!: RiderPhysics;
  private tricks!: TrickSystem;
  private rig!: RiderRig;
  private chase!: ChaseCamera;
  private post: PostFX;
  readonly caps: RenderCaps;
  private pmrem: THREE.PMREMGenerator;
  private envTarget: THREE.WebGLRenderTarget | null = null;
  private envDirty = true;

  private snowParticles!: Particles;
  private glintParticles!: Particles;
  private snowfall!: Snowfall;
  private streaks!: WindStreaks;
  private trails!: Trails;

  private gates: Gate[] = [];
  private gateGroup = new THREE.Group();
  private gateMats: THREE.Material[] = [];
  private nextGateZ = 0;

  private raf = 0;
  private lastTime = 0;
  private elapsed = 0;
  private runTime = 0;
  private timeScale = 1;
  private targetTimeScale = 1;
  private freezeTimer = 0;
  private slowmo = 0;

  private crashCount = 0;
  private airsLanded = 0;
  private bestAirScore = 0;
  private topSpeed = 0;
  private gatesPassed = 0;
  private gatesMissed = 0;
  private penalty = 0;

  private status: RunStatus = "loading";
  private hudTimer = 0;
  private fps = 60;
  private fpsAvg = 60;
  private adaptTimer = 0;
  private qualityScale = 1;
  private errorCount = 0;

  private sprayAccum = 0;
  private sunScreen = new THREE.Vector2(0.5, 0.9);
  private tmpV = new THREE.Vector3();
  private tmpV2 = new THREE.Vector3();
  private colWhite = new THREE.Color("#ffffff");
  private colPowder = new THREE.Color("#eaf3ff");
  private colIce = new THREE.Color("#bfe6f5");
  private colSpark = new THREE.Color("#fff2c8");

  onHud?: (s: HudSnapshot) => void;
  onEvent?: (e: GameEvent) => void;

  private hud: HudSnapshot = {
    status: "loading",
    speedKmh: 0,
    speed01: 0,
    score: 0,
    chain: 0,
    chainFraction: 0,
    pendingScore: 0,
    trickName: "",
    airTime: 0,
    airHeight: 0,
    bigAir: 0,
    time: 0,
    timeLeft: 0,
    distance: 0,
    distanceLeft: 0,
    crashes: 0,
    gatesPassed: 0,
    gatesMissed: 0,
    airsLeft: 0,
    grounded: true,
    charge: 0,
    boost: 0,
    surface: "groom",
    mountainName: "",
    modeName: "",
    section: "",
    hud: "full",
    fps: 60,
  };

  constructor(opts: GameOptions) {
    this.canvas = opts.canvas;
    this.saveData = opts.save;
    this.mode = modeById(opts.mode);
    this.onHud = opts.onHud;
    this.onEvent = opts.onEvent;
    this.seed =
      opts.seed ??
      (this.mode.id === "daily"
        ? hashString(new Date().toISOString().slice(0, 10))
        : (Math.random() * 0xffffffff) >>> 0);

    // One renderer per canvas for the lifetime of the page — see renderer.ts.
    this.renderer = acquireRenderer(this.canvas);
    this.caps = probeCaps(this.renderer);

    this.uniforms = createWorldUniforms();
    this.post = new PostFX(this.renderer);
    this.pmrem = new THREE.PMREMGenerator(this.renderer);

    this.build();
    this.applyQuality();
    this.resize();
  }

  // ──────────────────────────────────────────────────────────────── build ────

  private build() {
    const s = this.saveData;
    const preset: MountainPreset = mountainById(s.selected.mountain);
    const sky: SkyPreset = skyById(
      this.mode.id === "zen" ? "dawn" : s.selected.sky,
    );

    this.gen = new TerrainGen(this.seed, preset);
    this.terrain = new Terrain(this.gen, this.uniforms);
    this.terrain.setDetail(QUALITY[s.settings.quality].detail);
    this.scatter = new Scatter(this.gen, this.uniforms, this.seed);
    this.props = new Props(this.gen, this.uniforms);
    this.env = new Environment(this.scene, this.uniforms, sky);

    this.scene.add(this.env.group);
    this.scene.add(this.terrain.group);
    this.scene.add(this.scatter.group);
    this.scene.add(this.props.group);
    this.scene.add(this.gateGroup);

    this.phys = new RiderPhysics(this.gen);
    // Riders you built yourself live in the save file, not in the roster.
    const rider = riderById(s.selected.rider, s.customRiders.map(customToRider));
    const board = boardById(s.selected.board);
    this.phys.stats = {
      spin: rider.stats.spin,
      pop: rider.stats.pop * board.stats.pop,
      balance: rider.stats.balance,
      speed: rider.stats.speed * board.stats.speed,
      turn: board.stats.turn,
      stability: board.stats.stability,
    };

    this.tricks = new TrickSystem(rider);
    this.tricks.specialsUnlocked = s.unlocked.includes("feature:specials");

    this.rig = new RiderRig(rider, board, this.uniforms);
    this.scene.add(this.rig.group);

    this.chase = new ChaseCamera(this.gen, 16 / 9);
    this.chase.intensity = this.mode.cameraIntensity * s.settings.shake;

    const q = QUALITY[s.settings.quality];
    this.snowParticles = new Particles(Math.floor(9000 * q.particles), false);
    this.glintParticles = new Particles(Math.floor(2200 * q.particles), true);
    this.snowfall = new Snowfall(q.snow);
    this.streaks = new WindStreaks(360);
    this.trails = new Trails();

    this.scene.add(this.trails.mesh);
    this.scene.add(this.snowParticles.points);
    this.scene.add(this.glintParticles.points);
    this.scene.add(this.snowfall.points);
    this.scene.add(this.streaks.lines);

    this.post.filter = (s.selected.filter as FilterId) ?? "none";
    this.post.retro = s.settings.retro && s.unlocked.includes("feature:retro");
    this.post.crt = s.settings.crt && s.unlocked.includes("feature:crt");
    this.post.bloomStrength = sky.bloom;
    this.post.exposure = sky.exposure;

    this.refreshEnvironment();
    this.wirePhysics();
    if (this.mode.gates) this.buildGateMaterials();

    this.audio.setTrack(s.selected.track);
    this.audio.setMusicVolume(s.settings.music);
    this.audio.setSfxVolume(s.settings.sfx);

    this.hud.mountainName = preset.name;
    this.hud.modeName = this.mode.name;
    this.hud.hud = this.mode.hud;

    this.resetRun();
  }

  private wirePhysics() {
    this.phys.onTakeoff = (power, popped) => {
      this.audio.pop(power);
      if (popped) this.chase.addTrauma(0.1 + power * 0.12);
      const p = this.phys;
      this.snowParticles.burst(
        PKind.Powder,
        p.pos,
        Math.round(18 + power * 30),
        3.2 + power * 4,
        0.9,
        0.2,
        0.7,
        this.surfaceColor(),
      );
    };

    this.phys.onLand = (info) => {
      const p = this.phys;
      const result = this.tricks.land(info, p);
      this.audio.land(info.quality, info.impact);
      this.onEvent?.({ type: "landing", quality: info.quality, stomped: p.stomped });

      const impact01 = clamp01(info.impact / 20);
      const count = Math.round(26 + impact01 * 64);
      this.snowParticles.burst(
        PKind.Powder,
        p.pos,
        count,
        4 + impact01 * 9,
        0.85,
        0.21,
        0.85,
        this.surfaceColor(),
      );
      this.snowParticles.burst(
        PKind.Chunk,
        p.pos,
        Math.round(8 + impact01 * 22),
        5 + impact01 * 10,
        1.1,
        0.13,
        0.8,
        this.surfaceColor(),
      );

      if (info.quality === "perfect") {
        this.chase.addTrauma(0.22 + impact01 * 0.3);
        this.post.addFlash(0.16 + impact01 * 0.14, "#ffffff");
        this.post.addChroma(0.004);
        this.freezeTimer = 0.055 + impact01 * 0.045;
        this.glintParticles.burst(
          PKind.Sparkle,
          p.pos,
          22,
          6,
          1.2,
          0.2,
          0.7,
          this.colSpark,
        );
      } else if (info.quality === "sketchy") {
        this.chase.addTrauma(0.3);
      }

      if (result) {
        this.onEvent?.({ type: "trick", result });
        this.audio.trick(Math.min(7, result.chain));
        this.audio.setComboIntensity(result.chain / 8);
        if (result.total > this.bestAirScore) this.bestAirScore = result.total;
        if (result.total > 4000 || result.chain >= 4) this.audio.cheer(clamp01(result.total / 20000));
      }

      if (info.airTime > 0.45) this.airsLanded++;
      if (this.mode.bestAirs > 0 && this.airsLanded >= this.mode.bestAirs) {
        this.finish();
      }
    };

    this.phys.onCrash = (reason, speed) => {
      this.crashCount++;
      this.audio.crash();
      this.audio.setComboIntensity(0);
      this.chase.addTrauma(0.85);
      this.post.addFlash(0.1, "#dfe8ff");
      this.post.addChroma(0.01);
      this.onEvent?.({ type: "crash" });
      const p = this.phys;
      this.snowParticles.burst(
        PKind.Powder,
        p.pos,
        110,
        7 + clamp01(speed / 30) * 8,
        1.1,
        0.26,
        1.1,
        this.surfaceColor(),
      );
      this.snowParticles.burst(PKind.Chunk, p.pos, 34, 11, 1.3, 0.15, 1.0, this.surfaceColor());
      void reason;
      if (this.mode.crashLimit > 0 && this.crashCount >= this.mode.crashLimit) {
        window.setTimeout(() => this.finish(), 1400);
      }
    };

    this.phys.onBrush = (intensity) => {
      this.chase.addTrauma(intensity * 0.12);
      this.snowParticles.burst(
        PKind.Powder,
        this.phys.pos,
        Math.round(3 + intensity * 8),
        3,
        1.2,
        0.24,
        0.6,
        this.colWhite,
      );
    };

    this.phys.onCompress = (force) => {
      this.chase.addTrauma(clamp01(force / 60) * 0.08);
    };

    this.tricks.onNameChange = (name) => {
      this.hud.trickName = name;
    };
  }

  /**
   * Bake the sky into a prefiltered environment map. This is the single
   * biggest lighting upgrade available without shipping an HDRI: every
   * material now picks up real directional colour from the actual sky — snow
   * goes warm under golden hour, ice reflects the horizon, the rider sits in
   * the scene instead of on top of it. Cheap because it is baked once per
   * light preset, not per frame.
   */
  private refreshEnvironment() {
    const prev = this.envTarget;
    this.envTarget = this.pmrem.fromScene(this.env.envScene, 0.04, 1, 100);
    this.scene.environment = this.envTarget.texture;
    // Restrained: the rim term, the hemisphere light and the sun were all
    // tuned without an environment. Taking the full IBL on top of them turns
    // the mountain into flat milk.
    this.scene.environmentIntensity = 0.7;
    prev?.dispose();
    this.envDirty = false;
  }

  private surfaceColor() {
    switch (this.phys.surfaceKind()) {
      case "ice":
        return this.colIce;
      case "powder":
        return this.colPowder;
      case "rock":
        return this.colWhite;
      default:
        return this.colWhite;
    }
  }

  // ─────────────────────────────────────────────────────────────── gates ────

  private buildGateMaterials() {
    const red = stylizeMaterial(
      new THREE.MeshStandardMaterial({ color: "#e2453b", roughness: 0.7, flatShading: true }),
      this.uniforms,
      {},
    );
    const blue = stylizeMaterial(
      new THREE.MeshStandardMaterial({ color: "#3f7fb8", roughness: 0.7, flatShading: true }),
      this.uniforms,
      {},
    );
    this.gateMats = [red, blue];
  }

  private updateGates() {
    if (!this.mode.gates) return;
    const pz = this.phys.pos.z;

    while (this.nextGateZ < pz + 420) {
      const z = this.nextGateZ;
      const cx = this.gen.corridorCenter(z);
      const hw = this.gen.corridorHalfWidth(z);
      const side = this.gates.length % 2 === 0 ? -1 : 1;
      const x = cx + side * hw * 0.42;
      const half = 5.2;

      const group = new THREE.Group();
      const mat = this.gateMats[this.gates.length % 2];
      for (const s of [-1, 1]) {
        const px = x + s * half;
        const py = this.gen.heightAt(px, z);
        const geo = new THREE.CylinderGeometry(0.09, 0.09, 3.2, 6);
        ensureMatAttribute(geo);
        const pole = new THREE.Mesh(geo, mat);
        pole.position.set(px, py + 1.6, z);
        pole.castShadow = true;
        group.add(pole);
        const fgeo = new THREE.BoxGeometry(0.9, 0.6, 0.04);
        ensureMatAttribute(fgeo);
        const flag = new THREE.Mesh(fgeo, mat);
        flag.position.set(px + s * 0.45, py + 2.8, z);
        group.add(flag);
      }
      this.gateGroup.add(group);
      this.gates.push({ z, x, half, state: 0, group });
      this.nextGateZ += 42;
    }

    for (const g of this.gates) {
      if (g.state === 0 && pz > g.z) {
        const inside = Math.abs(this.phys.pos.x - g.x) < g.half + 1.2;
        g.state = inside ? 1 : 2;
        if (inside) {
          this.gatesPassed++;
          this.tricks.addFlow(180);
          this.audio.ui("move");
        } else {
          this.gatesMissed++;
          this.penalty += 2;
          this.post.addFlash(0.08, "#ff6b6b");
        }
        this.onEvent?.({ type: "gate", passed: inside });
        for (const child of g.group.children) {
          const m = child as THREE.Mesh;
          m.scale.setScalar(inside ? 1.15 : 0.75);
        }
      }
    }

    // Retire gates well behind the rider.
    while (this.gates.length && this.gates[0].z < pz - 120) {
      const g = this.gates.shift()!;
      this.gateGroup.remove(g.group);
      g.group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) m.geometry.dispose();
      });
    }
  }

  // ──────────────────────────────────────────────────────────────── run ────

  resetRun() {
    const startZ = 40;
    const startX = this.gen.corridorCenter(startZ);
    this.phys.reset(startX, startZ);
    this.tricks.reset();
    this.trails.clear();
    this.chase.reset(this.phys);
    this.runTime = 0;
    this.crashCount = 0;
    this.airsLanded = 0;
    this.bestAirScore = 0;
    this.topSpeed = 0;
    this.gatesPassed = 0;
    this.gatesMissed = 0;
    this.penalty = 0;
    this.timeScale = 1;
    this.targetTimeScale = 1;
    this.freezeTimer = 0;
    this.post.fade = 1;

    for (const g of this.gates) this.gateGroup.remove(g.group);
    this.gates.length = 0;
    this.nextGateZ = startZ + 120;

    this.terrain.prime(startX, startZ);
    this.scatter.update(startX, startZ);
    this.props.update(startZ);
    this.uniforms.uPlayer.value.copy(this.phys.pos);
    this.env.update(0.016, this.chase.camera, 0, this.post.retro ? 1 : 0);

    this.status = "ready";
    this.hud.status = "ready";
    this.onEvent?.({ type: "ready" });
  }

  start() {
    if (this.status === "ready" || this.status === "paused") {
      this.status = "riding";
      this.hud.status = "riding";
      this.input.enabled = true;
      this.audio.resume();
    }
  }

  pause() {
    if (this.status !== "riding") return;
    this.status = "paused";
    this.hud.status = "paused";
    this.input.releaseAll();
  }

  resume() {
    if (this.status !== "paused") return;
    this.status = "riding";
    this.hud.status = "riding";
  }

  togglePhoto() {
    if (!this.saveData.unlocked.includes("feature:photo")) return;
    if (this.status === "photo") {
      this.status = "riding";
      this.hud.status = "riding";
      this.chase.mode = "chase";
    } else if (this.status === "riding" || this.status === "paused") {
      this.status = "photo";
      this.hud.status = "photo";
      this.chase.mode = "photo";
      this.chase.orbitYaw = this.chase.currentYaw + Math.PI;
      this.chase.orbitPitch = 0.22;
      this.chase.orbitDist = 8;
    }
  }

  capturePhoto() {
    this.audio.shutter();
    this.post.addFlash(0.35);
    // Render one clean frame, then read it back before the browser clears it.
    this.renderFrame();
    const url = this.renderer.domElement.toDataURL("image/png");
    this.onEvent?.({ type: "photo", dataUrl: url });
    return url;
  }

  finish() {
    if (this.status === "finished") return;
    this.status = "finished";
    this.hud.status = "finished";
    this.audio.setComboIntensity(0);
    this.onEvent?.({ type: "finish", summary: this.summary() });
  }

  summary(): RunSummary {
    return {
      mode: this.mode.id,
      mountain: this.saveData.selected.mountain,
      score: Math.round(this.tricks.score),
      time: this.runTime + this.penalty,
      distance: this.phys.distance,
      tricks: this.tricks.totalTricks,
      perfects: this.tricks.perfectLandings,
      crashes: this.crashCount,
      bestTrick: this.tricks.bestTrick,
      longestAir: this.tricks.longestAir,
      topSpeed: this.topSpeed,
      gatesPassed: this.gatesPassed,
      gatesMissed: this.gatesMissed,
      bestAirScore: this.bestAirScore,
    };
  }

  // ─────────────────────────────────────────────────────────────── loop ────

  run() {
    this.input.attach(window);
    this.lastTime = performance.now();
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      const rawDt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.tick(rawDt);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.input.detach(window);
  }

  private tick(rawDt: number) {
    // ── fps + adaptive resolution ────────────────────────────────────────
    const inst = 1 / Math.max(1e-4, rawDt);
    this.fpsAvg = this.fpsAvg * 0.94 + inst * 0.06;
    this.fps = this.fpsAvg;
    this.adaptTimer += rawDt;
    if (this.adaptTimer > 1.4) {
      this.adaptTimer = 0;
      const base = QUALITY[this.saveData.settings.quality].scale;
      if (this.fpsAvg < 46 && this.qualityScale > 0.7) {
        this.qualityScale = Math.max(0.7, this.qualityScale - 0.08);
        this.resize();
      } else if (this.fpsAvg > 58 && this.qualityScale < base) {
        this.qualityScale = Math.min(base, this.qualityScale + 0.06);
        this.resize();
      }
      // Chunk building is the one piece of per-frame work whose cost we can
      // choose. When frames are already long, building two chunks in one of
      // them is what turns a slow frame into a visible hitch.
      this.terrain.budgetPerFrame = this.fpsAvg < 45 ? 1 : this.fpsAvg > 56 ? 3 : 2;
    }

    // ── global input that works in any state ─────────────────────────────
    if (this.input.pressed("pause")) {
      if (this.status === "photo") this.togglePhoto();
      else if (this.status === "riding") this.pause();
      else if (this.status === "paused") this.resume();
    }
    if (this.input.pressed("photo")) this.togglePhoto();

    // ── time scaling ─────────────────────────────────────────────────────
    let dt = rawDt;
    if (this.status === "photo") {
      dt = 0;
    } else if (this.status === "paused" || this.status === "finished") {
      dt = 0;
    } else {
      if (this.freezeTimer > 0) {
        this.freezeTimer -= rawDt;
        this.targetTimeScale = 0.045;
      } else {
        const big = this.phys.bigAir;
        this.slowmo = damp(this.slowmo, big > 0.55 ? clamp01((big - 0.55) / 0.4) : 0, 0.004, rawDt);
        this.targetTimeScale = lerp(1, 0.42, this.slowmo);
      }
      this.timeScale = damp(this.timeScale, this.targetTimeScale, 0.0008, rawDt);
      dt = rawDt * this.timeScale;
    }

    if (this.status === "riding") {
      this.stepGameplay(dt, rawDt);
    } else if (this.status === "photo") {
      this.stepPhoto(rawDt);
    } else if (this.status === "ready") {
      // Idle: keep the world alive behind the menu.
      this.stepWorldOnly(rawDt);
    }

    // World streaming builds geometry on the fly. A single bad prop should
    // cost one frame of scenery, never the whole run.
    try {
      this.updateVisuals(dt === 0 ? rawDt * 0.15 : dt, rawDt);
    } catch (err) {
      if (this.errorCount < 3) {
        this.errorCount++;
        console.warn("[shred] frame update failed", err);
      }
    }
    this.renderFrame();

    this.hudTimer += rawDt;
    if (this.hudTimer > 1 / 20) {
      this.hudTimer = 0;
      this.publishHud();
    }

    this.input.endFrame(rawDt);
  }

  private stepGameplay(dt: number, rawDt: number) {
    // The chase camera looks down +Z, which puts world +X on the *left* of the
    // screen — so a positive steer axis has to decrease yaw for the right arrow
    // to actually send you right. This sign was backwards.
    const inv = this.saveData.settings.invertSteer ? 1 : -1;
    const steer = this.input.steer() * inv;

    this.phys.step(dt, {
      steer,
      tuck: this.input.held("tuck") && this.phys.grounded,
      brake: this.input.held("brake") && this.phys.grounded,
      jumpHeld: this.input.held("jump"),
      jumpPressed: this.input.pressed("jump"),
      jumpReleased: this.input.released("jump"),
    });

    this.tricks.update(dt, {
      steer: this.phys.grounded ? 0 : this.input.steerRaw() * inv,
      pitch: this.phys.grounded ? 0 : this.input.pitchRaw(),
      grabKey: this.phys.grounded ? null : this.input.anyTrickHeld(),
      shift: this.input.held("grab"),
    }, this.phys);

    this.phys.clampToCorridor();

    this.runTime += dt;
    this.topSpeed = Math.max(this.topSpeed, this.phys.speed);

    // Flow bonus — rewards holding a fast clean line without touching a button.
    if (this.phys.grounded && !this.phys.crashed && this.phys.speed > 26) {
      this.tricks.addFlow(dt * (this.phys.speed - 26) * 2.2);
    }

    this.updateGates();
    this.checkEnd();
    void rawDt;
  }

  private stepWorldOnly(rawDt: number) {
    // Loop the demo rider back to the top so the menu backdrop stays in the
    // interesting part of the mountain (and stops streaming terrain forever).
    if (this.phys.pos.z > 1200 || this.phys.crashed) this.resetRun();
    // Gentle drift so the menu background isn't a still frame.
    this.phys.step(rawDt, {
      steer: Math.sin(this.elapsed * 0.4) * 0.5,
      tuck: false,
      brake: false,
      jumpHeld: false,
      jumpPressed: false,
      jumpReleased: false,
    });
    this.tricks.update(rawDt, { steer: 0, pitch: 0, grabKey: null, shift: false }, this.phys);
  }

  private stepPhoto(rawDt: number) {
    const c = this.chase;
    const sp = 1.6 * rawDt;
    if (this.input.held("left")) c.orbitYaw -= sp;
    if (this.input.held("right")) c.orbitYaw += sp;
    if (this.input.held("tuck")) c.orbitPitch = clamp(c.orbitPitch + sp * 0.6, -0.4, 1.35);
    if (this.input.held("brake")) c.orbitPitch = clamp(c.orbitPitch - sp * 0.6, -0.4, 1.35);
    if (this.input.held("trickA")) c.orbitDist = clamp(c.orbitDist - sp * 6, 2.2, 40);
    if (this.input.held("trickD")) c.orbitDist = clamp(c.orbitDist + sp * 6, 2.2, 40);
    if (this.input.pressed("jump")) this.capturePhoto();
    if (this.input.pressed("swap")) this.cycleFilter();
  }

  private cycleFilter() {
    const owned = ["none", "kodachrome", "sunset", "vhs", "bleach", "noir", "infra", "ps1"].filter(
      (f) => this.saveData.unlocked.includes(`filter:${f}`),
    ) as FilterId[];
    if (!owned.length) return;
    const i = owned.indexOf(this.post.filter);
    this.post.filter = owned[(i + 1) % owned.length];
    this.audio.ui("move");
  }

  private checkEnd() {
    const m = this.mode;
    if (m.duration > 0 && this.runTime >= m.duration) this.finish();
    if (m.distance > 0 && this.phys.pos.z >= m.distance) this.finish();
    // Every mountain has a bottom. Endless is the deliberate exception.
    if (this.finishZ > 0 && this.phys.pos.z >= this.finishZ) this.finish();
  }

  /** Z of the finish line for this run, or 0 if the run has no bottom. */
  private get finishZ() {
    if (this.mode.id === "endless") return 0;
    const len = this.gen.preset.length;
    // A mode with its own shorter distance target still owns the ending.
    if (this.mode.distance > 0 && this.mode.distance < len) return 0;
    return len;
  }

  // ────────────────────────────────────────────────────────────── visuals ────

  private updateVisuals(dt: number, rawDt: number) {
    this.elapsed += rawDt;
    const p = this.phys;

    this.uniforms.uPlayer.value.copy(p.pos);

    // World streaming.
    this.terrain.update(p.pos.x, p.pos.z, dt);
    this.scatter.update(p.pos.x, p.pos.z);
    this.props.update(p.pos.z);

    // Rider + camera.
    this.rig.update(rawDt, p, this.tricks, this.elapsed);
    this.chase.update(
      Math.max(rawDt * 0.25, dt),
      p,
      this.timeScale,
      this.tricks.spinSpeed,
    );

    this.env.update(rawDt, this.chase.camera, this.elapsed, this.post.retro ? 1 : 0);
    if (this.envDirty) this.refreshEnvironment();

    // Trails + spray.
    if (p.grounded && !p.crashed && p.speed > 2) {
      this.trails.addPoint(
        p.pos,
        p.yaw,
        p.surface.ny,
        p.edge,
        p.slip,
        p.surface.powder,
      );
      this.emitSpray(dt);
    }
    this.trails.update(rawDt);
    this.trails.setTint(
      this.tmpColorShade(),
      this.tmpColorRidge(),
    );

    // Particles.
    this.snowParticles.update(dt);
    this.glintParticles.update(dt);
    this.snowParticles.setPixelRatio(this.renderer.getPixelRatio());
    this.glintParticles.setPixelRatio(this.renderer.getPixelRatio());

    // Weather.
    this.snowfall.update(rawDt, this.chase.camera, this.renderer.getPixelRatio());
    const sky = this.env.preset;
    this.snowfall.configure({
      intensity: sky.id === "storm" ? 1.4 : sky.id === "night" ? 0.5 : 0.75,
      fall: sky.id === "storm" ? 9 : 5,
      wind: sky.id === "storm" ? [7, 0, 3] : [1.8, 0, 0.9],
    });
    this.streaks.update(
      rawDt,
      this.chase.camera,
      this.chase.forward,
      p.speed,
      this.saveData.settings.shake,
    );

    // Audio bed.
    this.audio.speed01 = clamp01(p.speed / 46);
    this.audio.slip01 = clamp01(p.slip / 9);
    this.audio.surface = p.surfaceKind();
    this.audio.airborne = !p.grounded;
    this.audio.slowmo = 1 - clamp01((this.timeScale - 0.4) / 0.6);
    this.audio.update(rawDt);

    // Post.
    const sunVisible = this.env.sunScreenPosition(this.chase.camera, this.sunScreen);
    this.post.setMotionCenter(0.5, 0.52);
    this.post.update(rawDt, {
      time: this.elapsed,
      speed01: clamp01(p.speed / 46),
      sun: this.sunScreen,
      sunVisible,
      slowmo: 1 - clamp01((this.timeScale - 0.35) / 0.65),
      bloomBoost: sky.bloom,
      exposure: sky.exposure,
    });
  }

  private tmpColorShade() {
    return this.tmpShade.copy(this.uniforms.uShadeColor.value).multiplyScalar(0.85);
  }
  private tmpColorRidge() {
    return this.tmpRidge.copy(this.colWhite);
  }
  private tmpShade = new THREE.Color();
  private tmpRidge = new THREE.Color();

  private emitSpray(dt: number) {
    const p = this.phys;
    const speed = p.speed;
    if (speed < 4) return;

    const kind = p.surfaceKind();
    const powder = p.surface.powder;
    const scrub = clamp01(p.slip / 8);
    const edge = Math.abs(p.edge);

    // Rate: a straight schuss trickles, a laid-over carve erupts.
    const rate =
      (6 + speed * 1.1) * (0.25 + edge * 1.4 + scrub * 2.6) * (0.55 + powder * 1.5);
    this.sprayAccum += rate * dt;
    const n = Math.floor(this.sprayAccum);
    this.sprayAccum -= n;
    if (n <= 0) return;

    const fx = Math.sin(p.yaw);
    const fz = Math.cos(p.yaw);
    // Spray flies off the uphill edge, backward and out.
    const side = -Math.sign(p.edge || 1);
    const rx = fz * side;
    const rz = -fx * side;

    const color = kind === "ice" ? this.colIce : this.colPowder;
    const isIce = kind === "ice" || kind === "rock";

    for (let i = 0; i < n && i < 26; i++) {
      const jitter = (Math.random() - 0.5) * 0.6;
      const up = 1.4 + Math.random() * (2.2 + powder * 5.5) + edge * 3.2;
      const back = -(1.5 + Math.random() * 3.5) - speed * 0.06;
      const out = (0.6 + Math.random() * 2.2) * (0.5 + edge * 2.4 + scrub * 2.2);

      this.tmpV.set(
        p.pos.x + rx * 0.25 + jitter * 0.4,
        p.pos.y + 0.06,
        p.pos.z + rz * 0.25 + jitter * 0.4,
      );
      this.tmpV2.set(
        fx * back + rx * out + p.vel.x * 0.28,
        up,
        fz * back + rz * out + p.vel.z * 0.28,
      );

      this.snowParticles.emit(
        isIce ? PKind.Ice : PKind.Spray,
        this.tmpV.x,
        this.tmpV.y,
        this.tmpV.z,
        this.tmpV2.x,
        this.tmpV2.y,
        this.tmpV2.z,
        isIce ? 0.075 : 0.15 + powder * 0.26 + edge * 0.14,
        isIce ? 0.5 : 0.55 + powder * 0.75,
        color,
      );
    }

    // A few airborne glints in the spray, when the sun is on it.
    if (powder > 0.3 && Math.random() < 0.35 * clamp01(speed / 25)) {
      this.glintParticles.emit(
        PKind.Sparkle,
        p.pos.x + (Math.random() - 0.5) * 2,
        p.pos.y + 0.8 + Math.random() * 1.4,
        p.pos.z + (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        1 + Math.random() * 2,
        (Math.random() - 0.5) * 2,
        0.16,
        0.7,
        this.colSpark,
      );
    }
  }

  private renderFrame() {
    this.post.render(this.scene, this.chase.camera);
  }

  private publishHud() {
    const p = this.phys;
    const m = this.mode;
    const h = this.hud;
    h.status = this.status;
    h.speedKmh = p.kmh;
    h.speed01 = clamp01(p.speed / 46);
    h.score = Math.round(this.tricks.score);
    h.chain = this.tricks.chain;
    h.chainFraction = this.tricks.comboFraction;
    h.pendingScore = this.tricks.pending;
    h.trickName = p.grounded ? "" : this.tricks.pendingName;
    h.airTime = p.airTime;
    h.airHeight = p.airHeight;
    h.bigAir = p.bigAir;
    h.time = this.runTime + this.penalty;
    h.timeLeft = m.duration > 0 ? Math.max(0, m.duration - this.runTime) : 0;
    h.distance = p.distance;
    const fz = this.finishZ;
    h.distanceLeft =
      m.distance > 0
        ? Math.max(0, m.distance - p.pos.z)
        : fz > 0
          ? Math.max(0, fz - p.pos.z)
          : 0;
    h.section = this.gen.sectionAt(p.pos.z);
    h.crashes = this.crashCount;
    h.gatesPassed = this.gatesPassed;
    h.gatesMissed = this.gatesMissed;
    h.airsLeft = m.bestAirs > 0 ? Math.max(0, m.bestAirs - this.airsLanded) : 0;
    h.grounded = p.grounded;
    h.charge = p.charge;
    h.boost = clamp01(p.boost / 6);
    h.surface = p.surfaceKind();
    h.fps = Math.round(this.fps);
    this.onHud?.(h);
  }

  // ────────────────────────────────────────────────────────────── config ────

  applyQuality() {
    const q = QUALITY[this.saveData.settings.quality];
    this.qualityScale = q.scale;
    this.terrain.setDetail(q.detail);
    // Never ask for more MSAA than the driver proved it can give us; on Safari
    // that is regularly zero, and an incomplete framebuffer renders black.
    this.post.samples = Math.min(q.samples, this.caps.maxSamples);
    this.post.hdr = this.caps.halfFloat;
    this.renderer.setPixelRatio(Math.min(this.caps.maxPixelRatio, q.pr));
    this.renderer.shadowMap.enabled = q.shadows;
    if (q.shadows) {
      this.env.sun.shadow.mapSize.set(q.shadow, q.shadow);
      this.env.sun.shadow.map?.dispose();
      this.env.sun.shadow.map = null;
    }
    this.env.sun.castShadow = q.shadows;
  }

  setSky(id: string) {
    const p = skyById(id);
    this.env.setPreset(p);
    this.post.bloomStrength = p.bloom;
    this.post.exposure = p.exposure;
    // The sky cross-fades over about a second, so re-bake after it settles.
    this.envDirty = true;
    window.setTimeout(() => {
      this.envDirty = true;
    }, 1200);
  }

  setFilter(id: FilterId) {
    this.post.filter = id;
  }

  setRetro(on: boolean) {
    this.post.retro = on;
  }

  setCrt(on: boolean) {
    this.post.crt = on;
  }

  setShake(v: number) {
    this.chase.intensity = this.mode.cameraIntensity * v;
  }

  /** Photo-mode camera, driven by drag / pinch on touch. */
  orbitBy(dYaw: number, dPitch: number) {
    this.chase.orbitYaw += dYaw;
    this.chase.orbitPitch = clamp(this.chase.orbitPitch + dPitch, -0.4, 1.35);
  }

  zoomBy(delta: number) {
    this.chase.orbitDist = clamp(this.chase.orbitDist + delta, 2.2, 40);
  }

  nextFilter() {
    this.cycleFilter();
  }

  get currentFilterName() {
    return FILTERS.find((f) => f.id === this.post.filter)?.name ?? "Clean";
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.chase.setAspect(w / Math.max(1, h));
    this.post.setSize(w, h, this.renderer.getPixelRatio(), this.qualityScale);
  }

  get seedValue() {
    return this.seed;
  }

  get modeDef() {
    return this.mode;
  }

  dispose() {
    this.stop();
    this.terrain.dispose();
    this.scatter.dispose();
    this.props.dispose();
    this.env.dispose();
    this.rig.dispose();
    this.snowParticles.dispose();
    this.glintParticles.dispose();
    this.snowfall.dispose();
    this.streaks.dispose();
    this.trails.dispose();
    this.post.dispose();
    this.envTarget?.dispose();
    this.pmrem.dispose();
    for (const m of this.gateMats) m.dispose();
    this.audio.dispose();
    // The renderer is shared and deliberately outlives this Game — disposing
    // it here is what used to leave the second run with a dead context.
    this.renderer.setRenderTarget(null);
    this.scene.clear();
  }
}

void smoothstep;
void makeRng;
