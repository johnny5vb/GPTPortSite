/**
 * The rider rig.
 *
 * Everything is procedural: boxes and capsules assembled into a hierarchy, then
 * posed every frame from the physics state. No skeletal animation, no assets —
 * which means the pose can respond continuously to speed, edge angle, crouch,
 * grab and rotation instead of blending between canned clips.
 *
 * The parts that sell it:
 *   - the board flexes (nose and tail hinge) under compression and pop;
 *   - the rider counter-rotates into the carve and leans out of it;
 *   - the jacket tail and scarf are verlet chains driven by the airflow;
 *   - grabs reach with the correct hand and tweak the board with it.
 */

import * as THREE from "three";
import type { Rider } from "../data/riders";
import type { Board } from "../data/boards";
import { makeBoardTexture } from "./BoardArt";
import { RiderPhysics } from "./Physics";
import { TrickSystem } from "./TrickSystem";
import { clamp, clamp01, damp, lerp, smoothstep } from "../core/math";
import { WorldUniforms, stylizeMaterial, ensureMatAttribute } from "../world/SnowMaterial";

/** A short verlet chain used for the scarf and the jacket tail. */
class Cloth {
  pts: THREE.Vector3[] = [];
  prev: THREE.Vector3[] = [];
  seg: number;
  constructor(count: number, seg: number, origin: THREE.Vector3) {
    this.seg = seg;
    for (let i = 0; i < count; i++) {
      this.pts.push(origin.clone());
      this.prev.push(origin.clone());
    }
  }
  step(dt: number, anchor: THREE.Vector3, wind: THREE.Vector3, stiffness = 0.55) {
    this.pts[0].copy(anchor);
    this.prev[0].copy(anchor);
    const g = -16 * dt * dt;
    for (let i = 1; i < this.pts.length; i++) {
      const p = this.pts[i];
      const pv = this.prev[i];
      const vx = (p.x - pv.x) * 0.94;
      const vy = (p.y - pv.y) * 0.94;
      const vz = (p.z - pv.z) * 0.94;
      pv.copy(p);
      p.x += vx + wind.x * dt * dt;
      p.y += vy + g + wind.y * dt * dt;
      p.z += vz + wind.z * dt * dt;
    }
    for (let iter = 0; iter < 3; iter++) {
      for (let i = 1; i < this.pts.length; i++) {
        const a = this.pts[i - 1];
        const b = this.pts[i];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const d = Math.hypot(dx, dy, dz) || 1e-5;
        const diff = ((d - this.seg) / d) * stiffness;
        b.x -= dx * diff;
        b.y -= dy * diff;
        b.z -= dz * diff;
      }
    }
  }
}

interface Parts {
  root: THREE.Group;
  boardRoot: THREE.Group;
  boardMid: THREE.Mesh;
  boardNose: THREE.Mesh;
  boardTail: THREE.Mesh;
  bindingF: THREE.Mesh;
  bindingB: THREE.Mesh;
  body: THREE.Group;
  hips: THREE.Group;
  legF: THREE.Group;
  legB: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  armF: THREE.Group;
  armB: THREE.Group;
  scarf?: THREE.Mesh;
  accessory?: THREE.Object3D;
}

export class RiderRig {
  readonly group = new THREE.Group();
  private p!: Parts;
  private mats: THREE.Material[] = [];
  private boardTex?: THREE.CanvasTexture;
  private scarfCloth?: Cloth;
  private scarfGeo?: THREE.BufferGeometry;
  private wind = new THREE.Vector3();
  private tmp = new THREE.Vector3();
  private tmpQ = new THREE.Quaternion();
  private tmpM = new THREE.Matrix4();
  private uniforms: WorldUniforms;

  private rider: Rider;
  private board: Board;

  // Smoothed pose values.
  private sCrouch = 0;
  private sLean = 0;
  private sGrab = 0;
  private sFlex = 0;
  private sTilt = 0;
  private bob = 0;

  constructor(rider: Rider, board: Board, uniforms: WorldUniforms) {
    this.rider = rider;
    this.board = board;
    this.uniforms = uniforms;
    this.build();
  }

  private mat(color: string, opts: THREE.MeshStandardMaterialParameters = {}) {
    const m = stylizeMaterial(
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.78,
        metalness: 0,
        flatShading: true,
        ...opts,
      }),
      this.uniforms,
      { snow: false, sparkle: false },
    );
    this.mats.push(m);
    return m;
  }

  private box(
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
  ) {
    const g = new THREE.BoxGeometry(w, h, d);
    ensureMatAttribute(g);
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = false;
    return m;
  }

  private build() {
    const c = this.rider.colors;
    const jacket = this.mat(c.jacket);
    const jacketAlt = this.mat(c.jacketAlt);
    const pants = this.mat(c.pants);
    const accent = this.mat(c.accent, { roughness: 0.5 });
    const skin = this.mat(c.skin, { roughness: 0.85 });
    const helmet = this.mat(c.helmet, { roughness: 0.42 });
    const goggles = this.mat(c.goggles, {
      roughness: 0.12,
      metalness: 0.55,
      emissive: new THREE.Color(c.goggles).multiplyScalar(0.25),
    });
    const boot = this.mat("#1b1b1e");

    const root = new THREE.Group();

    // ── board ────────────────────────────────────────────────────────────
    this.boardTex = makeBoardTexture(this.board);
    const deck = stylizeMaterial(
      new THREE.MeshStandardMaterial({
        map: this.boardTex,
        roughness: 0.35,
        metalness: 0.1,
        flatShading: false,
      }),
      this.uniforms,
      { snow: false, sparkle: false },
    );
    this.mats.push(deck);

    const boardRoot = new THREE.Group();
    const midLen = 0.78;
    const tipLen = 0.34;

    const midGeo = new THREE.BoxGeometry(0.31, 0.045, midLen);
    ensureMatAttribute(midGeo);
    const boardMid = new THREE.Mesh(midGeo, deck);
    boardMid.castShadow = true;

    const mkTip = (sign: number) => {
      const g = new THREE.BoxGeometry(0.28, 0.04, tipLen);
      ensureMatAttribute(g);
      g.translate(0, 0, (sign * tipLen) / 2);
      const m = new THREE.Mesh(g, deck);
      m.position.z = (sign * midLen) / 2;
      m.castShadow = true;
      return m;
    };
    const boardNose = mkTip(1);
    const boardTail = mkTip(-1);
    boardRoot.add(boardMid, boardNose, boardTail);

    const bindingF = this.box(0.26, 0.09, 0.2, accent, 0, 0.07, 0.2);
    const bindingB = this.box(0.26, 0.09, 0.2, accent, 0, 0.07, -0.2);
    boardRoot.add(bindingF, bindingB);
    root.add(boardRoot);

    // ── body ─────────────────────────────────────────────────────────────
    const body = new THREE.Group();
    const hips = new THREE.Group();
    hips.position.y = 0.78;

    const legF = new THREE.Group();
    legF.position.set(0, 0, 0.2);
    legF.add(this.box(0.19, 0.5, 0.21, pants, 0, -0.25, 0));
    legF.add(this.box(0.2, 0.14, 0.26, boot, 0, -0.54, 0.01));

    const legB = new THREE.Group();
    legB.position.set(0, 0, -0.2);
    legB.add(this.box(0.19, 0.5, 0.21, pants, 0, -0.25, 0));
    legB.add(this.box(0.2, 0.14, 0.26, boot, 0, -0.54, 0.01));

    const torso = new THREE.Group();
    torso.add(this.box(0.36, 0.46, 0.28, jacket, 0, 0.23, 0));
    torso.add(this.box(0.37, 0.12, 0.29, jacketAlt, 0, 0.1, 0));
    torso.add(this.box(0.2, 0.1, 0.3, accent, 0, 0.4, 0));

    const head = new THREE.Group();
    head.position.y = 0.56;
    head.add(this.box(0.2, 0.21, 0.2, skin, 0, 0.1, 0));
    head.add(this.box(0.23, 0.13, 0.23, helmet, 0, 0.2, 0));
    head.add(this.box(0.22, 0.075, 0.06, goggles, 0, 0.105, 0.1));

    const armF = new THREE.Group();
    armF.position.set(0, 0.42, 0.13);
    armF.add(this.box(0.11, 0.42, 0.12, jacket, 0, -0.21, 0));
    armF.add(this.box(0.12, 0.11, 0.13, accent, 0, -0.45, 0));

    const armB = new THREE.Group();
    armB.position.set(0, 0.42, -0.13);
    armB.add(this.box(0.11, 0.42, 0.12, jacket, 0, -0.21, 0));
    armB.add(this.box(0.12, 0.11, 0.13, accent, 0, -0.45, 0));

    torso.add(head, armF, armB);
    hips.add(legF, legB, torso);
    body.add(hips);
    root.add(body);

    // ── cloth ────────────────────────────────────────────────────────────
    if (this.rider.accessory === "scarf") {
      this.scarfCloth = new Cloth(7, 0.13, new THREE.Vector3());
      this.scarfGeo = new THREE.BufferGeometry();
      const verts = new Float32Array(7 * 2 * 3);
      const idx: number[] = [];
      for (let i = 0; i < 6; i++) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
      }
      this.scarfGeo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
      this.scarfGeo.setIndex(idx);
      this.scarfGeo.computeVertexNormals();
      ensureMatAttribute(this.scarfGeo);
      const scarfMat = this.mat(c.accent, { side: THREE.DoubleSide, roughness: 0.9 });
      const scarf = new THREE.Mesh(this.scarfGeo, scarfMat);
      scarf.frustumCulled = false;
      scarf.castShadow = true;
      this.group.add(scarf);
      this.p = { scarf } as unknown as Parts;
    }

    // ── accessory ────────────────────────────────────────────────────────
    let accessory: THREE.Object3D | undefined;
    switch (this.rider.accessory) {
      case "backpack": {
        const g = new THREE.Group();
        g.add(this.box(0.3, 0.34, 0.16, jacketAlt, 0, 0.26, -0.2));
        g.add(this.box(0.32, 0.06, 0.17, accent, 0, 0.14, -0.2));
        accessory = g;
        break;
      }
      case "camera": {
        const g = new THREE.Group();
        g.add(this.box(0.17, 0.12, 0.09, this.mat("#20242a"), 0.0, 0.3, 0.17));
        g.add(this.box(0.07, 0.07, 0.07, this.mat("#c9d4dd"), 0, 0.3, 0.23));
        accessory = g;
        break;
      }
      case "antenna": {
        const g = new THREE.Group();
        const rod = this.box(0.02, 0.42, 0.02, accent, 0.09, 0.78, -0.08);
        const tip = this.box(0.05, 0.05, 0.05, accent, 0.09, 1.0, -0.08);
        g.add(rod, tip);
        accessory = g;
        break;
      }
      default:
        break;
    }
    if (accessory) torso.add(accessory);

    this.group.add(root);

    const scarfMesh = this.p?.scarf;
    this.p = {
      root,
      boardRoot,
      boardMid,
      boardNose,
      boardTail,
      bindingF,
      bindingB,
      body,
      hips,
      legF,
      legB,
      torso,
      head,
      armF,
      armB,
      scarf: scarfMesh,
      accessory,
    };
  }

  /** Swap the deck without rebuilding the rig. */
  setBoard(board: Board) {
    this.board = board;
    const tex = makeBoardTexture(board);
    const deck = this.p.boardMid.material as THREE.MeshStandardMaterial;
    this.boardTex?.dispose();
    this.boardTex = tex;
    deck.map = tex;
    deck.needsUpdate = true;
  }

  update(
    dt: number,
    phys: RiderPhysics,
    tricks: TrickSystem,
    time: number,
  ) {
    const p = this.p;
    const speed = phys.speed;

    // ── root transform ───────────────────────────────────────────────────
    this.group.position.copy(phys.pos);

    // Align to the surface while grounded; hold the last alignment in the air
    // so a spin doesn't wobble with whatever is passing underneath.
    const s = phys.surface;
    const upTarget = this.tmp.set(s.nx, s.ny, s.nz);
    if (!phys.grounded) upTarget.set(0, 1, 0);
    const align = this.tmpQ.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      upTarget.normalize(),
    );

    const yawQ = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      phys.yaw,
    );
    const pitchQ = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      phys.pitch,
    );
    const rollQ = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      phys.roll,
    );

    const q = align.clone().multiply(yawQ).multiply(pitchQ).multiply(rollQ);
    this.group.quaternion.slerp(q, 1 - Math.pow(0.00002, dt));

    // ── pose ─────────────────────────────────────────────────────────────
    const crouchTarget = phys.crashed ? 1 : phys.crouch;
    this.sCrouch = damp(this.sCrouch, crouchTarget, 0.0004, dt);
    this.sLean = damp(this.sLean, phys.lean, 0.0009, dt);
    this.sGrab = damp(this.sGrab, tricks.grabAmount, 0.00008, dt);
    this.sTilt = damp(this.sTilt, phys.edge, 0.0006, dt);

    // Board flex: compression bends the middle down and lifts the tips.
    const compress = this.sCrouch * 0.7 + clamp01(phys.charge) * 0.5;
    this.sFlex = damp(this.sFlex, compress, 0.0002, dt);
    const flex = this.sFlex;
    p.boardNose.rotation.x = -0.32 * flex - this.sGrab * 0.1;
    p.boardTail.rotation.x = 0.32 * flex + this.sGrab * 0.1;
    p.boardRoot.position.y = 0.055 - flex * 0.012;
    // Edge angle: the board rolls up on its edge in a carve.
    p.boardRoot.rotation.z = -this.sTilt * 0.5 * clamp01(speed / 18);

    // Legs compress and the hips drop.
    const legScale = lerp(1, 0.58, this.sCrouch);
    p.legF.scale.y = legScale;
    p.legB.scale.y = legScale;
    p.hips.position.y = lerp(0.78, 0.5, this.sCrouch);

    // Riding stance: the board is across the direction of travel, so the body
    // sits rotated relative to it.
    // Riders stand across the board. Anything much less than ~60° reads as
    // a skier from behind, which is the fastest way to break the illusion.
    const stanceYaw =
      this.rider.style.stance === "aggressive"
        ? 1.32
        : this.rider.style.stance === "technical"
          ? 1.1
          : 1.18;
    p.hips.rotation.y = stanceYaw;

    // Lean into the carve, and counter-rotate the shoulders.
    p.torso.rotation.z = -this.sLean * 0.45;
    p.torso.rotation.x = lerp(0.12, 0.5, this.sCrouch) - this.sGrab * 0.25;
    p.torso.rotation.y = -this.sLean * 0.3 + tricks.spinSpeed * 0.02;
    // …and look back down the fall line over the leading shoulder.
    p.head.rotation.y = -stanceYaw * 0.62 + this.sLean * 0.4;
    p.head.rotation.x = -p.torso.rotation.x * 0.6;

    // ── arms ─────────────────────────────────────────────────────────────
    const grab = tricks.currentGrab;
    const flap = Math.sin(time * 9 + this.bob) * 0.12 * clamp01(speed / 25);
    if (grab && this.sGrab > 0.02) {
      const g = this.sGrab;
      const [tx, ty, tz] = grab.tweak;
      const front = grab.key === "D" || (grab.key === "A" && grab.shift);
      const armA = front ? p.armF : p.armB;
      const armB = front ? p.armB : p.armF;
      armA.rotation.x = lerp(-0.2, 2.15 + ty, g);
      armA.rotation.z = lerp(0.15, -0.55 + tz * 0.6, g);
      armA.rotation.y = lerp(0, tx, g);
      armB.rotation.x = lerp(-0.2, -0.9, g);
      armB.rotation.z = lerp(-0.15, 0.85, g);
      // Tweak the board out with the grab.
      p.boardRoot.rotation.z += tz * g * 0.55 * this.rider.style.tweak;
      p.boardRoot.rotation.x = tx * g * 0.6 * this.rider.style.tweak;
      p.torso.rotation.z += tz * g * 0.35;
    } else {
      const spread = lerp(0.25, 0.75, clamp01(Math.abs(tricks.spinSpeed) / 6));
      p.armF.rotation.x = damp(p.armF.rotation.x, -0.35 + flap, 0.0006, dt);
      p.armF.rotation.z = damp(p.armF.rotation.z, -spread - this.sLean * 0.4, 0.0006, dt);
      p.armB.rotation.x = damp(p.armB.rotation.x, -0.25 - flap, 0.0006, dt);
      p.armB.rotation.z = damp(p.armB.rotation.z, spread - this.sLean * 0.4, 0.0006, dt);
      p.boardRoot.rotation.x = damp(p.boardRoot.rotation.x, 0, 0.0006, dt);
    }

    if (phys.crashed) {
      const t = phys.crashTimer;
      p.armF.rotation.x = Math.sin(t * 22) * 1.6;
      p.armB.rotation.x = Math.cos(t * 19) * 1.6;
      p.armF.rotation.z = Math.sin(t * 15) * 1.2;
      p.armB.rotation.z = -Math.cos(t * 17) * 1.2;
      p.legF.rotation.x = Math.sin(t * 13) * 0.9;
      p.legB.rotation.x = -Math.sin(t * 11) * 0.9;
      p.head.rotation.z = Math.sin(t * 25) * 0.4;
    } else {
      p.legF.rotation.x = damp(p.legF.rotation.x, this.sLean * 0.1, 0.0005, dt);
      p.legB.rotation.x = damp(p.legB.rotation.x, -this.sLean * 0.1, 0.0005, dt);
      p.head.rotation.z = damp(p.head.rotation.z, -this.sLean * 0.2, 0.0008, dt);
    }

    // Idle chatter at speed — the board is never perfectly still.
    this.bob += dt * (4 + speed * 0.25);
    const chatter =
      phys.grounded && !phys.crashed
        ? Math.sin(this.bob * 3.1) * 0.004 * clamp01(speed / 22) * (1 - s.powder * 0.8)
        : 0;
    p.boardRoot.position.y += chatter;

    // ── cloth ────────────────────────────────────────────────────────────
    this.updateCloth(dt, phys);

    void smoothstep;
    void clamp;
    void this.tmpM;
  }

  private updateCloth(dt: number, phys: RiderPhysics) {
    // Airflow is the rider's velocity reversed, in world space.
    this.wind.copy(phys.vel).multiplyScalar(-2.6);
    this.wind.y += 3.2;

    if (this.scarfCloth && this.scarfGeo && this.p.scarf) {
      const anchor = this.tmp.set(0, 1.34, 0);
      this.p.torso.localToWorld(anchor);
      this.scarfCloth.step(Math.min(dt, 1 / 60), anchor, this.wind, 0.62);

      const pos = this.scarfGeo.getAttribute("position") as THREE.BufferAttribute;
      const side = new THREE.Vector3();
      const dir = new THREE.Vector3();
      for (let i = 0; i < this.scarfCloth.pts.length; i++) {
        const a = this.scarfCloth.pts[i];
        const b = this.scarfCloth.pts[Math.min(i + 1, this.scarfCloth.pts.length - 1)];
        dir.subVectors(b, a);
        if (dir.lengthSq() < 1e-6) dir.set(0, -1, 0);
        side.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
        if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
        const w = 0.075 * (1 - i / this.scarfCloth.pts.length) + 0.02;
        pos.setXYZ(i * 2, a.x - side.x * w, a.y - side.y * w, a.z - side.z * w);
        pos.setXYZ(i * 2 + 1, a.x + side.x * w, a.y + side.y * w, a.z + side.z * w);
      }
      pos.needsUpdate = true;
      this.scarfGeo.computeVertexNormals();
      this.scarfGeo.computeBoundingSphere();
    }
  }

  dispose() {
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.geometry.dispose();
    });
    for (const m of this.mats) m.dispose();
    this.boardTex?.dispose();
    this.scarfGeo?.dispose();
    this.group.clear();
  }
}
