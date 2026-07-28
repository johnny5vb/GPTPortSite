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
import { makeBoardTexture, boardFinish } from "./BoardArt";
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
  stance: THREE.Group;
  legF: THREE.Group;
  legB: THREE.Group;
  kneeF: THREE.Group;
  kneeB: THREE.Group;
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

  private mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
    ensureMatAttribute(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = false;
    return m;
  }

  /** Limb / torso volume. Capsules read as a body; boxes read as a toy. */
  private capsule(
    radius: number,
    length: number,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
  ) {
    return this.mesh(new THREE.CapsuleGeometry(radius, length, 6, 12), mat, x, y, z);
  }

  /**
   * One section of the deck: a rounded, side-cut plate rather than a slab.
   * Built as a 2D outline and extruded, so the nose and tail actually taper
   * and the edges catch a highlight.
   */
  private deckPlate(
    lengthZ: number,
    widthBack: number,
    widthFront: number,
    thickness: number,
    tipRound: number,
  ) {
    const shape = new THREE.Shape();
    const hb = widthBack / 2;
    const hf = widthFront / 2;
    // Waist is narrower than either end — that's the sidecut a board turns on.
    const waist = Math.min(hb, hf) * 0.88;

    shape.moveTo(-hb, 0);
    shape.quadraticCurveTo(-waist, lengthZ * 0.5, -hf, lengthZ - tipRound);
    if (tipRound > 0.001) {
      shape.quadraticCurveTo(-hf, lengthZ, 0, lengthZ);
      shape.quadraticCurveTo(hf, lengthZ, hf, lengthZ - tipRound);
    } else {
      shape.lineTo(hf, lengthZ);
    }
    shape.quadraticCurveTo(waist, lengthZ * 0.5, hb, 0);
    shape.lineTo(-hb, 0);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 2,
      curveSegments: 14,
    });
    geo.rotateX(Math.PI / 2);
    geo.translate(0, thickness, 0);

    // Re-map UVs from the bounding box so the topsheet artwork lands square.
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const sx = Math.max(1e-4, bb.max.x - bb.min.x);
    const sz = Math.max(1e-4, bb.max.z - bb.min.z);
    const pos = geo.getAttribute("position");
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = (pos.getX(i) - bb.min.x) / sx;
      uv[i * 2 + 1] = (pos.getZ(i) - bb.min.z) / sz;
    }
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    return geo;
  }

  private build() {
    const c = this.rider.colors;
    const jacket = this.mat(c.jacket, { roughness: 0.86, flatShading: false });
    const jacketAlt = this.mat(c.jacketAlt, { roughness: 0.84, flatShading: false });
    const pants = this.mat(c.pants, { roughness: 0.92, flatShading: false });
    const accent = this.mat(c.accent, { roughness: 0.6, flatShading: false });
    const skin = this.mat(c.skin, { roughness: 0.72, flatShading: false });
    const helmetMat = this.mat(c.helmet, { roughness: 0.34, flatShading: false });
    const goggles = this.mat(c.goggles, {
      roughness: 0.08,
      metalness: 0.8,
      envMapIntensity: 2.2,
      emissive: new THREE.Color(c.goggles).multiplyScalar(0.12),
      flatShading: false,
    });
    const boot = this.mat("#191a1e", { roughness: 0.7, flatShading: false });

    const root = new THREE.Group();

    // ── board ────────────────────────────────────────────────────────────
    this.boardTex = makeBoardTexture(this.board);
    const deck = stylizeMaterial(
      new THREE.MeshStandardMaterial({
        map: this.boardTex,
        ...boardFinish(this.board.art),
      }),
      this.uniforms,
      { snow: false, sparkle: false },
    );
    this.mats.push(deck);

    const boardRoot = new THREE.Group();
    const midLen = 0.78;
    const tipLen = 0.34;
    const thick = 0.026;

    const midGeo = this.deckPlate(midLen, 0.256, 0.256, thick, 0);
    midGeo.translate(0, 0, -midLen / 2);
    const boardMid = this.mesh(midGeo, deck);

    const mkTip = (sign: number) => {
      const g = this.deckPlate(tipLen, 0.256, 0.215, thick, 0.1);
      if (sign < 0) g.scale(1, 1, -1);
      const m = this.mesh(g, deck);
      m.position.z = (sign * midLen) / 2;
      return m;
    };
    const boardNose = mkTip(1);
    const boardTail = mkTip(-1);

    boardRoot.add(boardMid, boardNose, boardTail);

    const bindingGeo = new THREE.CapsuleGeometry(0.028, 0.2, 4, 8);
    bindingGeo.rotateZ(Math.PI / 2);
    const bindingF = this.mesh(bindingGeo, accent, 0, thick + 0.05, 0.2);
    const bindingB = this.mesh(bindingGeo.clone(), accent, 0, thick + 0.05, -0.2);
    const baseF = this.mesh(new THREE.BoxGeometry(0.2, 0.02, 0.26), boot, 0, thick + 0.01, 0.2);
    const baseB = this.mesh(new THREE.BoxGeometry(0.2, 0.02, 0.26), boot, 0, thick + 0.01, -0.2);
    boardRoot.add(bindingF, bindingB, baseF, baseB);
    root.add(boardRoot);

    // ── body ─────────────────────────────────────────────────────────────
    const body = new THREE.Group();
    const hips = new THREE.Group();
    hips.position.y = 0.92;

    // Legs hang along the board, NOT rotated with the stance — a snowboarder's
    // feet are bolted to the deck; only the upper body opens up.
    // Thigh and shin are separate nodes so the knee can actually bend as the
    // rider compresses — straight legs are the tell that a rig is fake.
    const knees: THREE.Group[] = [];
    const leg = (z: number) => {
      const g = new THREE.Group();
      g.position.set(0, 0, z);
      g.add(this.capsule(0.088, 0.2, pants, 0, -0.19, 0));

      const knee = new THREE.Group();
      knee.position.set(0, -0.36, 0);
      knee.add(this.capsule(0.072, 0.22, pants, 0, -0.17, 0));
      const bootMesh = this.mesh(new THREE.CapsuleGeometry(0.078, 0.09, 4, 10), boot, 0, -0.34, 0.015);
      bootMesh.scale.set(1, 1, 1.3);
      knee.add(bootMesh);
      knees.push(knee);
      g.add(knee);
      return g;
    };
    const legF = leg(0.21);
    const legB = leg(-0.21);
    const kneeF = knees[0];
    const kneeB = knees[1];

    // Upper body: the stance node opens the shoulders; the torso node keeps
    // its own animated lean so the two never fight.
    const stance = new THREE.Group();
    const torso = new THREE.Group();

    // Pelvis overlaps the jacket hem so the two never separate as the torso
    // pitches — a visible gap at the waist is the fastest way to look unfinished.
    const pelvis = this.capsule(0.128, 0.1, pants, 0, 0.0, 0);
    pelvis.scale.set(1.02, 1, 0.86);
    torso.add(pelvis);

    const chest = this.capsule(0.142, 0.2, jacket, 0, 0.28, 0);
    chest.scale.set(0.98, 1, 0.82);
    torso.add(chest);

    const shoulders = this.capsule(0.092, 0.24, jacket, 0, 0.44, 0);
    shoulders.rotation.x = Math.PI / 2;
    torso.add(shoulders);

    // A jacket skirt that sits *over* the pelvis, plus a colour break at the
    // chest. Both follow the body's curve instead of being flat slabs stuck on.
    const hem = this.capsule(0.148, 0.09, jacket, 0, 0.13, 0);
    hem.scale.set(1.0, 1, 0.84);
    torso.add(hem);
    const chestBand = this.capsule(0.144, 0.05, jacketAlt, 0, 0.33, 0);
    chestBand.scale.set(0.99, 1, 0.83);
    torso.add(chestBand);
    // Collar.
    const collar = this.capsule(0.088, 0.04, jacketAlt, 0, 0.5, 0);
    collar.scale.set(1, 1, 0.9);
    torso.add(collar);

    // ── head ─────────────────────────────────────────────────────────────
    // Neck, or the head floats.
    torso.add(this.capsule(0.052, 0.06, skin, 0, 0.53, 0));

    const head = new THREE.Group();
    head.position.y = 0.63;
    const skull = this.mesh(new THREE.SphereGeometry(0.098, 22, 18), skin, 0, 0.05, 0);
    skull.scale.set(0.9, 1.06, 0.98);
    head.add(skull);
    // A jaw wedge keeps the profile from reading as a ball.
    const jaw = this.mesh(new THREE.SphereGeometry(0.072, 16, 12), skin, 0.028, 0.008, 0);
    jaw.scale.set(0.9, 0.8, 0.9);
    head.add(jaw);

    // Helmet is a cap, not a shell — cover the crown and leave the face.
    const helmetShell = this.mesh(
      new THREE.SphereGeometry(0.112, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
      helmetMat,
      0,
      0.045,
      0,
    );
    helmetShell.scale.set(0.98, 1.12, 1.02);
    head.add(helmetShell);
    // Ear pads.
    for (const z of [-1, 1]) {
      const pad = this.mesh(new THREE.SphereGeometry(0.042, 12, 10), helmetMat, -0.005, 0.048, z * 0.093);
      pad.scale.set(0.75, 1.15, 0.6);
      head.add(pad);
    }

    // Goggles: a wide lens across the eyes plus a strap round the back, so the
    // most recognisable piece of snowboard kit actually reads as itself.
    const lens = this.mesh(new THREE.SphereGeometry(0.088, 24, 16), goggles, 0.042, 0.055, 0);
    lens.scale.set(0.85, 0.62, 1.28);
    head.add(lens);
    const strap = this.mesh(new THREE.TorusGeometry(0.101, 0.017, 8, 22), accent, 0, 0.055, 0);
    strap.rotation.y = Math.PI / 2;
    strap.scale.set(1, 0.78, 1);
    head.add(strap);

    const arm = (z: number) => {
      const g = new THREE.Group();
      g.position.set(0, 0.44, z);
      g.add(this.capsule(0.058, 0.19, jacket, 0, -0.155, 0));
      g.add(this.capsule(0.05, 0.17, jacket, 0, -0.38, 0));
      g.add(this.capsule(0.056, 0.03, jacketAlt, 0, -0.5, 0));
      const glove = this.mesh(new THREE.SphereGeometry(0.058, 14, 12), accent, 0, -0.555, 0.01);
      glove.scale.set(0.85, 1, 1.15);
      g.add(glove);
      return g;
    };
    const armF = arm(0.165);
    const armB = arm(-0.165);

    torso.add(head, armF, armB);
    stance.add(torso);
    hips.add(legF, legB, stance);
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
        const pack = this.capsule(0.1, 0.2, jacketAlt, -0.14, 0.3, 0);
        pack.scale.set(0.75, 1, 1.5);
        g.add(pack);
        g.add(this.mesh(new THREE.BoxGeometry(0.04, 0.03, 0.3), accent, -0.14, 0.2, 0));
        accessory = g;
        break;
      }
      case "camera": {
        const g = new THREE.Group();
        g.add(this.mesh(new THREE.BoxGeometry(0.13, 0.09, 0.08), this.mat("#1c2026"), 0.14, 0.3, 0));
        g.add(
          this.mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 0.06, 12),
            this.mat("#c9d4dd", { metalness: 0.7, roughness: 0.2 }),
            0.2,
            0.3,
            0,
          ),
        );
        accessory = g;
        break;
      }
      case "fanny": {
        // Slung across the front of the hips, so it sits below the torso node
        // and rides with the crouch rather than the shoulders.
        const g = new THREE.Group();
        const pouch = this.capsule(0.05, 0.12, accent, 0.11, -0.05, 0);
        pouch.rotation.z = Math.PI / 2;
        pouch.scale.set(1, 1, 0.62);
        g.add(pouch);
        const belt = this.mesh(
          new THREE.TorusGeometry(0.135, 0.011, 6, 18),
          jacketAlt,
          0.01,
          -0.05,
          0,
        );
        belt.rotation.x = Math.PI / 2;
        belt.scale.set(1, 0.72, 1);
        g.add(belt);
        accessory = g;
        break;
      }
      case "antenna": {
        const g = new THREE.Group();
        g.add(this.mesh(new THREE.CylinderGeometry(0.006, 0.01, 0.4, 6), accent, -0.06, 0.78, 0.09));
        g.add(this.mesh(new THREE.SphereGeometry(0.022, 10, 8), accent, -0.06, 0.99, 0.09));
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
      stance,
      legF,
      legB,
      kneeF,
      kneeB,
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
    Object.assign(deck, boardFinish(board.art));
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

    // Legs compress: the hips drop, the thighs pitch forward and the knees
    // fold. Scaling alone reads as a squashed cylinder; a folded knee reads as
    // a rider absorbing the terrain.
    const legScale = lerp(1, 0.86, this.sCrouch);
    p.legF.scale.y = legScale;
    p.legB.scale.y = legScale;
    p.hips.position.y = lerp(0.9, 0.63, this.sCrouch);
    const bend = lerp(0.22, 1.15, this.sCrouch);
    p.legF.rotation.x = bend * 0.45;
    p.legB.rotation.x = bend * 0.45;
    p.kneeF.rotation.x = -bend * 0.8;
    p.kneeB.rotation.x = -bend * 0.8;

    // The feet are bolted along the deck, so the stance angle only opens the
    // upper body. A modest opening is what a real stance looks like — rotating
    // the whole body is what made the legs sit across the board.
    const stanceYaw =
      this.rider.style.stance === "aggressive"
        ? 0.46
        : this.rider.style.stance === "technical"
          ? 0.26
          : 0.34;
    p.stance.rotation.y = stanceYaw;

    // Lean into the carve, and counter-rotate the shoulders.
    p.torso.rotation.z = -this.sLean * 0.45;
    p.torso.rotation.x = lerp(0.06, 0.3, this.sCrouch) - this.sGrab * 0.2;
    p.torso.rotation.y = -this.sLean * 0.3 + tricks.spinSpeed * 0.02;
    // Built facing the toe edge, so it needs a quarter turn to look down the
    // fall line — then a little more when leaning into a turn.
    p.head.rotation.y = -1.15 - stanceYaw + this.sLean * 0.45;
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
      const spread = lerp(0.12, 0.5, clamp01(Math.abs(tricks.spinSpeed) / 6));
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
      p.kneeF.rotation.x = -0.6 + Math.sin(t * 13) * 0.9;
      p.kneeB.rotation.x = -0.6 - Math.sin(t * 11) * 0.9;
      p.head.rotation.z = Math.sin(t * 25) * 0.4;
    } else {
      p.legF.rotation.z = damp(p.legF.rotation.z, this.sLean * 0.12, 0.0005, dt);
      p.legB.rotation.z = damp(p.legB.rotation.z, this.sLean * 0.12, 0.0005, dt);
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
