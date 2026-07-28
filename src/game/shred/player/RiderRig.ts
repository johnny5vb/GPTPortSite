/**
 * The rider rig.
 *
 * Everything is procedural: capsules and shells assembled into a hierarchy,
 * then posed every frame from the physics state. No skeletal animation, no
 * assets — which means the pose can respond continuously to speed, edge angle,
 * crouch, grab and rotation instead of blending between canned clips.
 *
 * The look is driven entirely by an `Appearance` (see `data/appearance.ts`),
 * and the gear itself is built in `RiderGear.ts`. The design principle there is
 * worth repeating here: the rig cannot sell a face, so it puts a helmet, a pair
 * of goggles and a neck gaiter in front of one instead. What remains is
 * silhouette, layering and colour.
 *
 * The parts that sell the motion:
 *   - the board flexes (nose and tail hinge) under compression and pop;
 *   - the rider counter-rotates into the carve and leans out of it;
 *   - the jacket tail, scarf and any long hair are driven by the airflow;
 *   - grabs reach with the correct hand and tweak the board with it.
 *
 * `update` runs at frame rate and is deliberately allocation-free — every
 * vector and quaternion it needs is preallocated on the instance. Allocating
 * per frame here is not a correctness problem, it is a smoothness problem: the
 * collections it causes land as visible hitches.
 */

import * as THREE from "three";
import type { Rider } from "../data/riders";
import type { Board } from "../data/boards";
import type { Appearance } from "../data/appearance";
import { makeBoardTexture, boardFinish } from "./BoardArt";
import { RiderPhysics } from "./Physics";
import { TrickSystem } from "./TrickSystem";
import { clamp01, damp, lerp } from "../core/math";
import { WorldUniforms, stylizeMaterial, ensureMatAttribute } from "../world/SnowMaterial";
import {
  buildBoot,
  buildEyewear,
  buildFaceGear,
  buildHair,
  buildHand,
  buildHeadwear,
  buildJacket,
  buildPelvis,
  buildScale,
  coversCrown,
  fabricTexture,
  pantsProfile,
  type GearKit,
} from "./RiderGear";

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
  /** Long hair hangs off this and lags behind the head. */
  hairTail?: THREE.Group;
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
  private uniforms: WorldUniforms;

  private rider: Rider;
  private board: Board;
  private look: Appearance;

  // Smoothed pose values.
  private sCrouch = 0;
  private sLean = 0;
  private sGrab = 0;
  private sFlex = 0;
  private sTilt = 0;
  private bob = 0;
  private hairSwingY = 0;
  private hairSwingX = 0;
  private lastHeadYaw = 0;

  // Preallocated scratch — see the note at the top of the file.
  private wind = new THREE.Vector3();
  private tmp = new THREE.Vector3();
  private up = new THREE.Vector3(0, 1, 0);
  private axisX = new THREE.Vector3(1, 0, 0);
  private axisY = new THREE.Vector3(0, 1, 0);
  private axisZ = new THREE.Vector3(0, 0, 1);
  private qAlign = new THREE.Quaternion();
  private qYaw = new THREE.Quaternion();
  private qPitch = new THREE.Quaternion();
  private qRoll = new THREE.Quaternion();
  private qTarget = new THREE.Quaternion();
  private clothDir = new THREE.Vector3();
  private clothSide = new THREE.Vector3();

  constructor(rider: Rider, board: Board, uniforms: WorldUniforms) {
    this.rider = rider;
    this.board = board;
    this.look = rider.appearance;
    this.uniforms = uniforms;
    this.build();
  }

  // ─────────────────────────────────────────────────────────── materials ────

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

  /**
   * Cloth gets a woven bump map. It costs one shared 128px canvas and lifts
   * every soft-goods surface out of the flat-plastic look that plain vertex
   * colour gives you.
   */
  private cloth(color: string, opts: THREE.MeshStandardMaterialParameters = {}) {
    return this.mat(color, {
      roughness: 0.9,
      flatShading: false,
      bumpMap: fabricTexture(),
      bumpScale: 0.6,
      ...opts,
    });
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
  private capsule(radius: number, length: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
    return this.mesh(new THREE.CapsuleGeometry(radius, length, 6, 14), mat, x, y, z);
  }

  private get kit(): GearKit {
    return {
      mat: (c, o) => this.mat(c, o),
      cloth: (c, o) => this.cloth(c, o),
      mesh: (g, m, x, y, z) => this.mesh(g, m, x, y, z),
      capsule: (r, l, m, x, y, z) => this.capsule(r, l, m, x, y, z),
    };
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

  // ─────────────────────────────────────────────────────────────── build ────

  private build() {
    const a = this.look;
    const kit = this.kit;
    const s = buildScale(a.build);

    const skin = this.mat(a.skin, { roughness: 0.74, flatShading: false });
    const accent = this.mat(a.accent, { roughness: 0.6, flatShading: false });
    const pantsMat = this.cloth(a.pantsColor, { roughness: 0.93 });

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

    // Binding baseplates — the boots carry their own straps and highbacks.
    for (const z of [0.2, -0.2]) {
      const base = this.mesh(new THREE.BoxGeometry(0.2, 0.018, 0.26), accent, 0, thick + 0.008, z);
      boardRoot.add(base);
    }
    root.add(boardRoot);

    // ── body ─────────────────────────────────────────────────────────────
    const body = new THREE.Group();
    const hips = new THREE.Group();
    hips.position.y = 0.92 * s.height;

    // Legs hang along the board, NOT rotated with the stance — a snowboarder's
    // feet are bolted to the deck; only the upper body opens up.
    // Thigh and shin are separate nodes so the knee can actually bend as the
    // rider compresses — straight legs are the tell that a rig is fake.
    const prof = pantsProfile(a.pants);
    const knees: THREE.Group[] = [];
    const leg = (z: number) => {
      const g = new THREE.Group();
      g.position.set(0, 0, z);
      const thigh = this.capsule(prof.thigh * s.girth, 0.2, pantsMat, 0, -0.19, 0);
      thigh.scale.set(prof.flare, 1, prof.flare);
      g.add(thigh);

      if (a.pants === "cargo") {
        // Thigh pockets. Small, but they break up the leg and read instantly.
        const pocket = this.mesh(
          new THREE.BoxGeometry(0.018, 0.09, 0.075),
          pantsMat,
          prof.thigh * s.girth * 1.05,
          -0.21,
          0,
        );
        g.add(pocket);
      }

      const knee = new THREE.Group();
      knee.position.set(0, -0.36, 0);
      const shin = this.capsule(prof.shin * s.girth, 0.22, pantsMat, 0, -0.17, 0);
      shin.scale.set(prof.flare, 1, prof.flare);
      knee.add(shin);
      // The cuff of a baggy pant sits over the boot.
      if (a.pants !== "slim") {
        const cuff = this.mesh(
          new THREE.CylinderGeometry(prof.shin * 1.35, prof.shin * 1.5, 0.09, 14, 1, true),
          pantsMat,
          0,
          -0.285,
          0,
        );
        knee.add(cuff);
      }
      knee.add(buildBoot(kit, a.bootColor, a.accent));
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

    torso.add(buildPelvis(kit, a, s));
    torso.add(buildJacket(kit, a, s));

    // ── head ─────────────────────────────────────────────────────────────
    // Neck, or the head floats.
    torso.add(this.capsule(0.052, 0.06, skin, 0, 0.53, 0));

    const head = new THREE.Group();
    head.position.y = 0.63;

    // The skin underneath. A balaclava covers all of it, so skip it entirely
    // rather than z-fighting a second shell against it.
    if (a.face !== "balaclava") {
      const skull = this.mesh(new THREE.SphereGeometry(0.098, 24, 18), skin, 0, 0.05, 0);
      skull.scale.set(0.9, 1.06, 0.98);
      head.add(skull);
      // A jaw wedge keeps the profile from reading as a ball.
      const jaw = this.mesh(new THREE.SphereGeometry(0.072, 18, 14), skin, 0.028, 0.008, 0);
      jaw.scale.set(0.9, 0.8, 0.9);
      head.add(jaw);
      // Ears, but only when nothing is over them.
      if (a.headwear === "none" || a.headwear === "cap") {
        for (const z of [-1, 1]) {
          const ear = this.mesh(new THREE.SphereGeometry(0.026, 10, 8), skin, -0.012, 0.04, z * 0.088);
          ear.scale.set(0.5, 1.1, 0.7);
          head.add(ear);
        }
      }
    }

    // Layered in the order they'd actually be worn.
    const hair = buildHair(kit, a.hair, a.hairColor, coversCrown(a.headwear));
    head.add(hair.group);
    head.add(buildFaceGear(kit, a.face, a.faceColor));
    head.add(buildHeadwear(kit, a.headwear, a.headwearColor, a.accent));
    head.add(buildEyewear(kit, a.eyewear, a.lensColor, a.frameColor));

    // ── arms ─────────────────────────────────────────────────────────────
    const sleeve = this.cloth(a.jacket === "vest" ? a.jacketAlt : a.jacketColor, {
      roughness: 0.88,
    });
    const arm = (z: number) => {
      const g = new THREE.Group();
      g.position.set(0, 0.44 * s.height, z * s.shoulder);
      const upper = this.capsule(0.058 * s.girth, 0.19, sleeve, 0, -0.155, 0);
      g.add(upper);
      const fore = this.capsule(0.05 * s.girth, 0.17, sleeve, 0, -0.38, 0);
      g.add(fore);
      if (a.jacket === "puffy" || a.jacket === "vest") {
        // Sleeve baffles, matching the torso.
        for (const y of [-0.1, -0.23, -0.36]) {
          const band = this.capsule(0.06 * s.girth, 0.03, sleeve, 0, y, 0);
          band.rotation.x = Math.PI / 2;
          g.add(band);
        }
      }
      g.add(buildHand(kit, a.hands, a.handsColor, a.jacketAlt));
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
    let scarfMesh: THREE.Mesh | undefined;
    if (a.accessory === "scarf") {
      this.scarfCloth = new Cloth(7, 0.13, new THREE.Vector3());
      this.scarfGeo = new THREE.BufferGeometry();
      const verts = new Float32Array(7 * 2 * 3);
      const idx: number[] = [];
      for (let i = 0; i < 6; i++) {
        const q = i * 2;
        idx.push(q, q + 1, q + 2, q + 2, q + 1, q + 3);
      }
      this.scarfGeo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
      this.scarfGeo.setIndex(idx);
      this.scarfGeo.computeVertexNormals();
      ensureMatAttribute(this.scarfGeo);
      const scarfMat = this.cloth(a.accent, { side: THREE.DoubleSide, roughness: 0.94 });
      scarfMesh = new THREE.Mesh(this.scarfGeo, scarfMat);
      scarfMesh.frustumCulled = false;
      scarfMesh.castShadow = true;
      this.group.add(scarfMesh);
    }

    const accessory = this.buildAccessory(a);
    if (accessory) torso.add(accessory);

    this.group.add(root);

    this.p = {
      root,
      boardRoot,
      boardMid,
      boardNose,
      boardTail,
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
      hairTail: hair.tail,
      scarf: scarfMesh,
      accessory,
    };
  }

  private buildAccessory(a: Appearance): THREE.Object3D | undefined {
    const accent = this.mat(a.accent, { roughness: 0.6, flatShading: false });
    const alt = this.cloth(a.jacketAlt, { roughness: 0.86 });

    switch (a.accessory) {
      case "backpack": {
        const g = new THREE.Group();
        const pack = this.capsule(0.082, 0.16, alt, -0.14, 0.3, 0);
        pack.scale.set(0.66, 1, 1.3);
        g.add(pack);
        // Compression straps and a lid buckle — a bag, not a lump.
        for (const y of [0.23, 0.35]) {
          const strapMesh = this.mesh(new THREE.BoxGeometry(0.026, 0.018, 0.21), accent, -0.152, y, 0);
          g.add(strapMesh);
        }
        for (const z of [-1, 1]) {
          const shoulderStrap = this.mesh(new THREE.BoxGeometry(0.05, 0.26, 0.03), alt, -0.045, 0.32, z * 0.1);
          shoulderStrap.rotation.z = 0.24;
          g.add(shoulderStrap);
        }
        return g;
      }
      case "camera": {
        const g = new THREE.Group();
        // Hanging against the chest, not floating in front of it.
        g.add(this.mesh(new THREE.BoxGeometry(0.075, 0.075, 0.11), this.mat("#1c2026"), 0.115, 0.29, 0));
        const barrel = this.mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 0.055, 14),
          this.mat("#c9d4dd", { metalness: 0.7, roughness: 0.2 }),
          0.165,
          0.29,
          0,
        );
        barrel.rotation.z = Math.PI / 2;
        g.add(barrel);
        const neckStrap = this.mesh(new THREE.TorusGeometry(0.1, 0.008, 6, 20), alt, 0.04, 0.42, 0);
        neckStrap.rotation.x = Math.PI / 2;
        neckStrap.scale.set(0.8, 1, 1);
        g.add(neckStrap);
        return g;
      }
      case "fanny": {
        const g = new THREE.Group();
        const pouch = this.capsule(0.05, 0.12, accent, 0.11, -0.05, 0);
        pouch.rotation.z = Math.PI / 2;
        pouch.scale.set(1, 1, 0.62);
        g.add(pouch);
        const belt = this.mesh(new THREE.TorusGeometry(0.135, 0.011, 6, 18), alt, 0.01, -0.05, 0);
        belt.rotation.x = Math.PI / 2;
        belt.scale.set(1, 0.72, 1);
        g.add(belt);
        return g;
      }
      case "antenna": {
        const g = new THREE.Group();
        g.add(this.mesh(new THREE.CylinderGeometry(0.006, 0.01, 0.4, 6), accent, -0.06, 0.78, 0.09));
        g.add(this.mesh(new THREE.SphereGeometry(0.022, 10, 8), accent, -0.06, 0.99, 0.09));
        return g;
      }
      default:
        return undefined;
    }
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

  /**
   * A neutral standing pose for menus, where there is no physics to read from.
   *
   * The riding pose turns the head down the fall line and opens the shoulders
   * to the stance angle — correct on the mountain, wrong in a character
   * creator, where you want the rider squared up and looking at you. This is
   * that: knees slightly bent, weight settled, a slow breath.
   */
  poseStatic(t = 0) {
    const p = this.p;
    const breathe = Math.sin(t * 0.9) * 0.5 + 0.5;

    p.boardRoot.position.y = 0.055;
    p.boardRoot.rotation.set(0, 0, 0);
    p.boardNose.rotation.x = -0.04;
    p.boardTail.rotation.x = 0.04;

    p.hips.position.y = 0.86 + breathe * 0.008;
    p.legF.rotation.x = 0.2;
    p.legB.rotation.x = 0.2;
    p.kneeF.rotation.x = -0.34;
    p.kneeB.rotation.x = -0.34;

    // Squared up to the camera rather than open to the fall line.
    p.stance.rotation.y = 0.18;
    p.torso.rotation.set(0.06, 0, 0);
    p.head.rotation.set(-0.04, -0.18 + Math.sin(t * 0.31) * 0.22, 0);

    p.armF.rotation.set(-0.24, 0, -0.3 - breathe * 0.02);
    p.armB.rotation.set(-0.18, 0, 0.3 + breathe * 0.02);
  }

  // ────────────────────────────────────────────────────────────── update ────

  update(dt: number, phys: RiderPhysics, tricks: TrickSystem, time: number) {
    const p = this.p;
    const speed = phys.speed;

    // ── root transform ───────────────────────────────────────────────────
    // `renderPos` is the physics position advanced by whatever fraction of a
    // substep is left over this frame. Using it instead of `pos` is what stops
    // the rider stepping in 120Hz quanta under a variable frame rate.
    this.group.position.copy(phys.renderPos);

    // Align to the surface while grounded; hold the last alignment in the air
    // so a spin doesn't wobble with whatever is passing underneath.
    const s = phys.surface;
    if (phys.grounded) this.tmp.set(s.nx, s.ny, s.nz).normalize();
    else this.tmp.set(0, 1, 0);
    this.qAlign.setFromUnitVectors(this.up, this.tmp);

    this.qYaw.setFromAxisAngle(this.axisY, phys.yaw);
    this.qPitch.setFromAxisAngle(this.axisX, phys.pitch);
    this.qRoll.setFromAxisAngle(this.axisZ, phys.roll);
    this.qTarget
      .copy(this.qAlign)
      .multiply(this.qYaw)
      .multiply(this.qPitch)
      .multiply(this.qRoll);
    this.group.quaternion.slerp(this.qTarget, 1 - Math.pow(0.00002, dt));

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
    const headYaw = -1.15 - stanceYaw + this.sLean * 0.45;
    p.head.rotation.y = headYaw;
    p.head.rotation.x = -p.torso.rotation.x * 0.6;

    // ── hair ─────────────────────────────────────────────────────────────
    // A ponytail that stays welded to the skull is worse than no ponytail, so
    // it lags the head's rotation and gets blown back by speed.
    if (p.hairTail) {
      const dYaw = headYaw - this.lastHeadYaw;
      this.lastHeadYaw = headYaw;
      const drag = clamp01(speed / 30) * 0.5 + (phys.grounded ? 0 : 0.2);
      this.hairSwingY = damp(this.hairSwingY - dYaw * 2.2, 0, 0.002, dt);
      this.hairSwingX = damp(this.hairSwingX, drag + Math.sin(time * 5.5) * 0.06, 0.004, dt);
      p.hairTail.rotation.y = clamp01(Math.abs(this.hairSwingY)) * Math.sign(this.hairSwingY) * 0.8;
      p.hairTail.rotation.z = -this.hairSwingX;
    }

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
  }

  private updateCloth(dt: number, phys: RiderPhysics) {
    if (!this.scarfCloth || !this.scarfGeo || !this.p.scarf) return;

    // Airflow is the rider's velocity reversed, in world space.
    this.wind.copy(phys.vel).multiplyScalar(-2.6);
    this.wind.y += 3.2;

    const anchor = this.tmp.set(0, 1.34, 0);
    this.p.torso.localToWorld(anchor);
    this.scarfCloth.step(Math.min(dt, 1 / 60), anchor, this.wind, 0.62);

    const pos = this.scarfGeo.getAttribute("position") as THREE.BufferAttribute;
    const pts = this.scarfCloth.pts;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[Math.min(i + 1, pts.length - 1)];
      this.clothDir.subVectors(b, a);
      if (this.clothDir.lengthSq() < 1e-6) this.clothDir.set(0, -1, 0);
      this.clothSide.crossVectors(this.clothDir, this.up).normalize();
      if (this.clothSide.lengthSq() < 1e-6) this.clothSide.set(1, 0, 0);
      const w = 0.075 * (1 - i / pts.length) + 0.02;
      pos.setXYZ(
        i * 2,
        a.x - this.clothSide.x * w,
        a.y - this.clothSide.y * w,
        a.z - this.clothSide.z * w,
      );
      pos.setXYZ(
        i * 2 + 1,
        a.x + this.clothSide.x * w,
        a.y + this.clothSide.y * w,
        a.z + this.clothSide.z * w,
      );
    }
    pos.needsUpdate = true;
    this.scarfGeo.computeVertexNormals();
    this.scarfGeo.computeBoundingSphere();
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
