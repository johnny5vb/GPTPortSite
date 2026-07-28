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
import { makeBoardTexture, makeBaseTexture, boardFinish } from "./BoardArt";
import { buildBoard, type BoardParts } from "./BoardBuild";
import { RiderPhysics } from "./Physics";
import { TrickSystem } from "./TrickSystem";
import { clamp01, damp, lerp } from "../core/math";
import { WorldUniforms, stylizeMaterial, ensureMatAttribute } from "../world/SnowMaterial";
import { bindLimbs, buildLimb } from "./RiderMesh";
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

/**
 * Where the ankles sit, in board-local space. The leg IK aims at these, which
 * is what keeps the boots in their bindings through every crouch, carve and
 * tuck. `y` is the height that reproduces a relaxed standing leg, so the rest
 * pose is unchanged from before the legs were solved.
 */
const FOOT_F: readonly [number, number, number] = [0, 0.128, 0.21];
/** Wrist to the middle of a closed fist — how much further than the arm a grab reaches. */
const HAND = 0.075;
const FOOT_B: readonly [number, number, number] = [0, 0.128, -0.21];

interface Parts {
  root: THREE.Group;
  boardRoot: THREE.Group;
  boardMid: THREE.Mesh;
  boardNose: THREE.Mesh;
  boardTail: THREE.Mesh;
  body: THREE.Group;
  hips: THREE.Group;
  stance: THREE.Group;
  /** Limb joints are Bones, so one skinned tube can span each of them. */
  legF: THREE.Bone;
  legB: THREE.Bone;
  kneeF: THREE.Bone;
  kneeB: THREE.Bone;
  torso: THREE.Group;
  head: THREE.Group;
  armF: THREE.Bone;
  armB: THREE.Bone;
  elbowF: THREE.Bone;
  elbowB: THREE.Bone;
  /** Ankle nodes. Rotating these keeps the soles flat on the deck. */
  footF: THREE.Group;
  footB: THREE.Group;
  /** Long hair hangs off this and lags behind the head. */
  hairTail?: THREE.Group;
  scarf?: THREE.Mesh;
  accessory?: THREE.Object3D;
}

export class RiderRig {
  readonly group = new THREE.Group();
  private p!: Parts;
  private mats: THREE.Material[] = [];
  private deck?: BoardParts;
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
  private ikTarget = new THREE.Vector3();
  private ikDir = new THREE.Vector3();
  private qAim = new THREE.Quaternion();
  private qBend = new THREE.Quaternion();
  private restDown = new THREE.Vector3(0, -1, 0);

  /** Limb segment lengths, kept here because the IK solver needs them. */
  private upperLen = 0.29;
  private foreLen = 0.28;
  private thighLen = 0.36;
  private shinLen = 0.36;

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
      { snow: false, sparkle: false, detail: false },
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

  // ─────────────────────────────────────────────────────────────── build ────

  private build() {
    const a = this.look;
    const kit = this.kit;
    const s = buildScale(a.build);

    const skin = this.mat(a.skin, { roughness: 0.74, flatShading: false });
    const pantsMat = this.cloth(a.pantsColor, { roughness: 0.93 });

    const root = new THREE.Group();

    // ── board ────────────────────────────────────────────────────────────
    // Built in its own module: it is four materials, a sidecut and a pair of
    // bindings, and it has nothing to do with what the rider is wearing.
    this.deck = buildBoard(kit, this.board);
    const boardRoot = this.deck.root;
    const boardMid = this.deck.mid;
    const boardNose = this.deck.nose;
    const boardTail = this.deck.tail;
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
    const limbs: THREE.SkinnedMesh[] = [];

    /**
     * A leg: one continuous tube from hip to ankle, skinned across the knee.
     * The thigh and shin used to be separate capsules that slid through each
     * other whenever the rider compressed — the crease is the whole point.
     */
    const knees: THREE.Bone[] = [];
    const thighLen = this.thighLen;
    const shinLen = this.shinLen;
    const leg = (z: number) => {
      const hip = new THREE.Bone();
      hip.position.set(0, 0, z);
      const knee = new THREE.Bone();
      knee.position.set(0, -thighLen, 0);
      hip.add(knee);
      knees.push(knee);

      const rTop = prof.thigh * s.girth * 1.2;
      const rKnee = prof.thigh * s.girth * 0.72;
      const rAnkle = prof.shin * s.girth * 0.78;
      const mesh = buildLimb(
        [
          { bone: hip, length: thighLen, r0: rTop, r1: rKnee },
          { bone: knee, length: shinLen, r0: rKnee, r1: rAnkle },
        ],
        pantsMat,
        {
          radial: 14,
          rings: 6,
          squash: prof.flare,
          capEnd: false,
          // Thighs converge on the pelvis; the shin stays over the binding.
          drift: (seg, t) => (seg === 0 ? -Math.sign(z) * 0.12 * (1 - t) * (1 - t) : 0),
        },
      );
      mesh.position.set(0, 0, z);
      limbs.push(mesh);

      if (a.pants === "cargo") {
        // Thigh pockets. Small, but they break up the leg and read instantly.
        const pocket = this.mesh(
          new THREE.BoxGeometry(0.018, 0.09, 0.075),
          pantsMat,
          prof.thigh * s.girth * 1.2,
          -0.21,
          0,
        );
        hip.add(pocket);
      }
      // The cuff of a baggy pant sits over the boot.
      if (a.pants !== "slim") {
        const cuff = this.mesh(
          new THREE.CylinderGeometry(prof.shin * 1.4, prof.shin * 1.6, 0.1, 14, 1, true),
          pantsMat,
          0,
          -0.29,
          0,
        );
        knee.add(cuff);
      }
      // The boot hangs off an ankle node rather than off the knee directly:
      // the sole has to stay flat on the deck however far the knee folds, and
      // that is a rotation about the ankle, not about the knee.
      const foot = new THREE.Group();
      foot.position.y = -shinLen;
      const boot = buildBoot(kit, a.bootColor, a.accent);
      boot.position.y = shinLen;
      foot.add(boot);
      knee.add(foot);
      feet.push(foot);
      return hip;
    };
    const feet: THREE.Group[] = [];
    const legF = leg(0.21);
    const legB = leg(-0.21);
    const kneeF = knees[0];
    const kneeB = knees[1];

    // Upper body: the stance node opens the shoulders; the torso node keeps
    // its own animated lean so the two never fight.
    const stance = new THREE.Group();
    const torso = new THREE.Group();

    // The pelvis belongs to the hips, not to the ribcage: parented to the torso
    // it swung away from the legs the moment the rider folded into a grab and
    // opened a gap at the waist.
    stance.add(buildPelvis(kit, a, s));
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
    const elbows: THREE.Bone[] = [];
    const upperLen = this.upperLen;
    const foreLen = this.foreLen;
    const arm = (z: number) => {
      const shoulder = new THREE.Bone();
      shoulder.position.set(0, 0.44 * s.height, z * s.shoulder);
      const elbow = new THREE.Bone();
      elbow.position.set(0, -upperLen, 0);
      shoulder.add(elbow);
      elbows.push(elbow);

      const rShoulder = 0.062 * s.girth;
      const rElbow = 0.046 * s.girth;
      const rWrist = 0.037 * s.girth;
      const mesh = buildLimb(
        [
          { bone: shoulder, length: upperLen, r0: rShoulder, r1: rElbow },
          { bone: elbow, length: foreLen, r0: rElbow, r1: rWrist },
        ],
        sleeve,
        {
          radial: 14,
          rings: 8,
          // A puffy sleeve is ribbed, not smooth — but it is still one surface.
          swell:
            a.jacket === "puffy" || a.jacket === "vest"
              ? (seg, t) => 1 + (Math.sin((seg + t) * Math.PI * 3.4) * 0.5 + 0.5) * 0.16
              : undefined,
        },
      );
      mesh.position.copy(shoulder.position);
      limbs.push(mesh);

      // buildHand's geometry is authored in the arm-root frame; the elbow sits
      // one upper-arm below it, so the group has to be lifted back up by that
      // much or the mitts float at knee height.
      const hand = buildHand(kit, a.hands, a.handsColor, a.jacketAlt);
      hand.position.y = upperLen;
      elbow.add(hand);
      return shoulder;
    };
    const armF = arm(0.165);
    const armB = arm(-0.165);
    const elbowF = elbows[0];
    const elbowB = elbows[1];

    torso.add(head, armF, armB);
    // Skinned meshes are siblings of the chain root, not children — their
    // geometry lives in the chain root's frame and the skeleton does the rest.
    for (const m of limbs) {
      if (m.userData.limbBones[0] === armF || m.userData.limbBones[0] === armB) torso.add(m);
      else hips.add(m);
    }
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
    // Bind last: `bind()` snapshots bone world matrices to build their
    // inverses, so it needs the finished hierarchy in its rest pose.
    bindLimbs(this.group, limbs);

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
      elbowF,
      elbowB,
      footF: feet[0],
      footB: feet[1],
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
    if (!this.deck) return;
    const top = makeBoardTexture(board);
    const base = makeBaseTexture(board);
    this.deck.topTex.dispose();
    this.deck.baseTex.dispose();
    this.deck.topTex = top;
    this.deck.baseTex = base;
    this.deck.topMat.map = top;
    Object.assign(this.deck.topMat, boardFinish(board.art));
    this.deck.topMat.needsUpdate = true;
    this.deck.baseMat.map = base;
    this.deck.baseMat.needsUpdate = true;
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
    // Same solver the run uses, so a garage card and the rider you drop in
    // with are standing the same way.
    this.group.updateMatrixWorld(true);
    this.reachLimb(p.legF, p.kneeF, FOOT_F, this.thighLen, this.shinLen, 1, this.axisZ, -1);
    this.reachLimb(p.legB, p.kneeB, FOOT_B, this.thighLen, this.shinLen, 1, this.axisZ, -1);
    this.alignFoot(p.footF);
    this.alignFoot(p.footB);

    // Squared up to the camera rather than open to the fall line.
    p.stance.rotation.y = 0.18;
    p.torso.rotation.set(0.06, 0, 0);
    p.head.rotation.set(-0.04, -0.18 + Math.sin(t * 0.31) * 0.22, 0);

    p.armF.rotation.set(-0.24, 0, -0.3 - breathe * 0.02);
    p.armB.rotation.set(-0.18, 0, 0.3 + breathe * 0.02);
    p.elbowF.rotation.set(-0.46, 0, 0);
    p.elbowB.rotation.set(-0.4, 0, 0);
  }

  // ────────────────────────────────────────────────────────────────── ik ────

  /**
   * Put the end of a two-bone chain on a point of the board.
   *
   * Analytic IK: the root joint, the mid joint and the target form a triangle
   * whose three sides are all known, so the law of cosines gives both angles
   * outright. No iteration, no solver loop, nothing that can converge somewhere
   * strange on one frame in a thousand.
   *
   * Both bones rest along -Y (the mid joint sits one upper segment *below* the
   * root), so:
   *   - `qAim` swings -Y onto the direction of the target;
   *   - the upper segment then backs off that direction by `a`, the angle
   *     between the chain's overall reach and its first segment — a rotation
   *     about `axis`, the same axis the joint folds on, which is what keeps the
   *     whole limb in one plane;
   *   - the joint closes by `e`, the angle between the two segments.
   *
   * `bendSign` picks which way that plane folds: an elbow and a knee bend
   * opposite ways relative to their own chain.
   *
   * `amount` blends the solved pose against whatever the limb was already
   * doing, so a grab reaches in over a few frames instead of snapping.
   *
   * Targets are given in **board-local** space, because everything worth
   * reaching for — the bindings, the deck between them, the nose — is fixed to
   * the board and moves with it.
   */
  private reachLimb(
    root: THREE.Bone,
    joint: THREE.Bone,
    target: readonly [number, number, number],
    upper: number,
    lower: number,
    amount: number,
    axis: THREE.Vector3,
    bendSign: number,
  ) {
    const parent = root.parent;
    if (!parent) return;

    // Board-local → world → the root's own parent space, which is the frame its
    // rotation is expressed in.
    this.ikTarget.set(target[0], target[1], target[2]);
    this.p.boardRoot.localToWorld(this.ikTarget);
    parent.worldToLocal(this.ikTarget);

    this.ikDir.subVectors(this.ikTarget, root.position);
    // Clamp into the reachable annulus. Past full extension the triangle has no
    // solution at all, and too close in it folds the limb through itself.
    const dist = Math.min(
      (upper + lower) * 0.995,
      Math.max(Math.abs(upper - lower) + 0.05, this.ikDir.length()),
    );
    if (dist < 1e-4) return;
    this.ikDir.normalize();

    const cosE = (dist * dist - upper * upper - lower * lower) / (2 * upper * lower);
    const e = Math.acos(Math.max(-1, Math.min(1, cosE)));
    const cosA = (upper * upper + dist * dist - lower * lower) / (2 * upper * dist);
    const a = Math.acos(Math.max(-1, Math.min(1, cosA)));

    this.qAim.setFromUnitVectors(this.restDown, this.ikDir);
    this.qBend.setFromAxisAngle(axis, -bendSign * a);
    this.qTarget.copy(this.qAim).multiply(this.qBend);
    root.quaternion.slerp(this.qTarget, amount);

    this.qBend.setFromAxisAngle(axis, bendSign * e);
    joint.quaternion.slerp(this.qBend, amount);
  }

  /**
   * Keep a sole flat on the deck.
   *
   * The boot inherits the shin's rotation, and once the knee is folding through
   * 100° that points the foot at the sky. Since the boot is bolted to a binding
   * in reality, the correct orientation is the board's, not the shin's — so
   * cancel the accumulated chain rotation and substitute the board's.
   */
  private alignFoot(foot: THREE.Group) {
    const parent = foot.parent;
    if (!parent) return;
    parent.getWorldQuaternion(this.qAim).invert();
    this.p.boardRoot.getWorldQuaternion(this.qBend);
    foot.quaternion.copy(this.qAim).multiply(this.qBend);
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
    // Edge angle: the board rolls up on its edge in a carve.
    p.boardRoot.rotation.z = -this.sTilt * 0.5 * clamp01(speed / 18);
    p.boardRoot.rotation.x = 0;

    // ── the grab tuck ────────────────────────────────────────────────────
    // A grab is a whole-body move, not an arm move. The knees pull the board
    // up toward the chest and the rider folds over it; the hand is the last
    // few centimetres of that, not the whole of it. Reaching with only the arm
    // is why the old grabs mimed at a board a metre away.
    //
    // This has to be settled *before* the limbs are solved, because both the
    // bindings and the grip point are expressed in the board's frame.
    const grab = tricks.currentGrab;
    const tuck = grab ? this.sGrab : 0;
    if (grab) {
      const [tx, , tz] = grab.tweak;
      const tweak = this.rider.style.tweak;
      // Negated: a tweak pulls the deck *toward* the hand that's holding it,
      // so the grabbed edge has to come up. Rolling it away was both wrong and
      // actively working against the reach.
      p.boardRoot.rotation.z -= tz * tuck * 0.55 * tweak;
      p.boardRoot.rotation.x = tx * tuck * 0.6 * tweak;
    }
    p.boardRoot.position.y = 0.055 - flex * 0.012 + tuck * 0.3;

    // Legs compress: the hips drop and the knees fold to take up the slack.
    // No scaling anywhere — squashing a bone squashes everything skinned to
    // it, and a folded knee is what actually reads as a rider absorbing
    // terrain.
    p.hips.position.y = lerp(0.9, 0.63, this.sCrouch);

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
    // The body is built facing +X (the toe edge), so a negative Z rotation
    // folds it forward over the toes and a positive one folds it back over the
    // heels — which is the direction a grab has to bend to get a shoulder
    // anywhere near the deck.
    // Edge grabs fold sideways; nose and tail grabs don't (they bow along the
    // board instead), so the fold is scaled by how far out on the edge the grip
    // actually is.
    const fold = grab
      ? -Math.sign(grab.grip[0] || 1) * Math.min(1, Math.abs(grab.grip[0]) / 0.14)
      : 0;
    p.torso.rotation.z = -this.sLean * 0.45 + fold * tuck * 1.05;
    // …and along the board toward whichever end is being grabbed, which is the
    // only thing that gets a shoulder out over the nose for a Nosegrab.
    p.torso.rotation.x =
      lerp(0.06, 0.3, this.sCrouch) - tuck * 0.1 + (grab ? grab.grip[2] * tuck * 2.6 : 0);
    p.torso.rotation.y = -this.sLean * 0.3 + tricks.spinSpeed * 0.02;
    // Built facing the toe edge, so it needs a quarter turn to look down the
    // fall line — then a little more when leaning into a turn.
    const headYaw = -1.15 - stanceYaw + this.sLean * 0.45;
    p.head.rotation.y = headYaw;
    p.head.rotation.x = -p.torso.rotation.x * 0.6;

    // Pull the board the rest of the way to the hand.
    //
    // The tuck above is a fixed shape, and some grabs — a Method, a Nose — ask
    // for more reach than any fixed shape gives. A rider finds it by hauling
    // the board further up, not by growing a longer arm: so measure what the
    // solver is about to fall short by and lift the deck by exactly that. It
    // is also why the extreme tweaks look extreme.
    if (grab && tuck > 0.02) {
      this.group.updateMatrixWorld(true);
      this.ikTarget.set(grab.grip[0], grab.grip[1], grab.grip[2]);
      p.boardRoot.localToWorld(this.ikTarget);
      (grab.front ? p.armF : p.armB).getWorldPosition(this.tmp);
      const short =
        this.ikTarget.distanceTo(this.tmp) - (this.upperLen + this.foreLen + HAND) * 0.96;
      // Capped: past about a third of a metre the knees are folded past what a
      // leg does, and a tuck that reads as athletic becomes one that reads as
      // broken. Anything still out of reach at the cap is left short.
      if (short > 0) {
        p.boardRoot.position.y = Math.min(p.boardRoot.position.y + short * tuck, 0.055 + 0.42);
      }
    }

    // ── legs ─────────────────────────────────────────────────────────────
    // The boots are bolted into the bindings, so the legs are solved onto the
    // deck rather than posed off the crouch value. Everything then follows for
    // free: the hips drop and the knees fold to take it up; the board rolls on
    // edge and the legs angle with it; the board comes up in a tuck and the
    // knees come with it. Posing the joints directly could only ever
    // approximate that, and the feet drifted off the bindings whenever it
    // guessed wrong.
    if (!phys.crashed) {
      // Knees fold toward the toe edge, which is a rotation about the board's
      // length axis. `-1` is the fold direction that puts the knee in front of
      // the hip and the ankle back under it.
      this.reachLimb(p.legF, p.kneeF, FOOT_F, this.thighLen, this.shinLen, 1, this.axisZ, -1);
      this.reachLimb(p.legB, p.kneeB, FOOT_B, this.thighLen, this.shinLen, 1, this.axisZ, -1);
      this.alignFoot(p.footF);
      this.alignFoot(p.footB);
    }

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
    const flap = Math.sin(time * 9 + this.bob) * 0.12 * clamp01(speed / 25);
    if (grab && this.sGrab > 0.02) {
      const g = this.sGrab;
      const armA = grab.front ? p.armF : p.armB;
      const elbowA = grab.front ? p.elbowF : p.elbowB;
      const armFree = grab.front ? p.armB : p.armF;
      const elbowFree = grab.front ? p.elbowB : p.elbowF;

      // The free arm counterbalances: up and away from the grab. Both arms
      // reaching down is the pose that reads as a falling mannequin.
      const side = grab.front ? 1 : -1;
      armFree.rotation.x = damp(armFree.rotation.x, -0.5 - g * 0.55, 0.0004, dt);
      armFree.rotation.z = damp(armFree.rotation.z, side * (0.45 + g * 0.6), 0.0004, dt);
      armFree.rotation.y = damp(armFree.rotation.y, 0, 0.0004, dt);
      elbowFree.rotation.x = damp(elbowFree.rotation.x, -0.8, 0.0004, dt);

      // Everything above only wrote local transforms; the solver reads world
      // matrices to move the grip point between frames, so refresh them here.
      this.group.updateMatrixWorld(true);
      // Elbows fold along the body's fore-aft axis, the way the arms are posed
      // everywhere else in this file.
      // Solved to the *fingers*, not the wrist: the forearm is extended by the
      // length of the mitt, which leaves the wrist a hand short of the deck and
      // the glove itself on it. It also buys back the reach the fold would
      // otherwise have to find by bending the rider in half.
      this.reachLimb(
        armA, elbowA, grab.grip,
        this.upperLen, this.foreLen + HAND,
        clamp01(g), this.axisX, -1,
      );
    } else {
      const spread = lerp(0.12, 0.5, clamp01(Math.abs(tricks.spinSpeed) / 6));
      p.armF.rotation.x = damp(p.armF.rotation.x, -0.35 + flap, 0.0006, dt);
      p.armF.rotation.z = damp(p.armF.rotation.z, -spread - this.sLean * 0.4, 0.0006, dt);
      p.armB.rotation.x = damp(p.armB.rotation.x, -0.25 - flap, 0.0006, dt);
      p.armB.rotation.z = damp(p.armB.rotation.z, spread - this.sLean * 0.4, 0.0006, dt);
      // Arms are never straight at rest — a slight carry is most of what makes
      // a riding stance look relaxed instead of mannequin-like.
      const rest = -0.42 - this.sCrouch * 0.3;
      p.elbowF.rotation.x = damp(p.elbowF.rotation.x, rest + flap * 0.5, 0.0006, dt);
      p.elbowB.rotation.x = damp(p.elbowB.rotation.x, rest - flap * 0.5, 0.0006, dt);
      // The IK writes a full quaternion, so a released grab leaves yaw on the
      // shoulder that nothing else here would ever clear.
      p.armF.rotation.y = damp(p.armF.rotation.y, 0, 0.0006, dt);
      p.armB.rotation.y = damp(p.armB.rotation.y, 0, 0.0006, dt);
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
      // Legs are the IK's business now; the lean only reaches the head.
      // Counter most of the fold: a rider looks at the landing through a grab,
      // they don't dive at the deck with it.
      p.head.rotation.z = damp(p.head.rotation.z, -this.sLean * 0.2 - fold * tuck * 0.85, 0.0008, dt);
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
    this.deck?.topTex.dispose();
    this.deck?.baseTex.dispose();
    this.scarfGeo?.dispose();
    this.group.clear();
  }
}
