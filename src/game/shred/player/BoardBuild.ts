/**
 * The board.
 *
 * It used to be three extruded plates wearing the topsheet graphic on every
 * face, with a box for each binding. That is the single most-looked-at object
 * in the game — it is on screen every frame, it fills the shot in every grab,
 * and it turns over on every crash — so it is worth building like the object it
 * actually is.
 *
 * A real board is layers, and the layers are what read at a glance:
 *
 *   topsheet   the graphic, and the only face that carries it
 *   sidewall   dark, matte, slightly proud of the deck
 *   steel edge a bright band running the whole perimeter at the base — the
 *              thing that catches the sun through a carve
 *   base       near-black sintered p-tex, glossy, with its own graphic
 *
 * All four come out of **one extrusion**. The geometry is split into material
 * groups after the fact by face normal and height (`splitByLayer`), which costs
 * one pass over the triangles at build time and nothing at all per frame. The
 * alternative — four separate meshes — would quadruple the draw calls on the
 * object that is never off screen.
 *
 * The UVs are laid out in **board space**, not per section, so the graphic runs
 * once from tail to nose instead of repeating three times.
 */

import * as THREE from "three";
import type { Board } from "../data/boards";
import { makeBoardTexture, makeBaseTexture, boardFinish } from "./BoardArt";
import type { GearKit } from "./RiderGear";

export const BOARD_MID = 0.78;
export const BOARD_TIP = 0.34;
export const BOARD_THICK = 0.026;
export const BOARD_LEN = BOARD_MID + BOARD_TIP * 2;

/** Material slots, in the order `splitByLayer` writes its groups. */
const TOP = 0;
const BASE = 1;
const WALL = 2;
const EDGE = 3;

export interface BoardParts {
  root: THREE.Group;
  mid: THREE.Mesh;
  nose: THREE.Mesh;
  tail: THREE.Mesh;
  /** Kept so the deck can be swapped without rebuilding the rig. */
  topMat: THREE.MeshStandardMaterial;
  baseMat: THREE.MeshStandardMaterial;
  topTex: THREE.CanvasTexture;
  baseTex: THREE.CanvasTexture;
}

/**
 * Sort a non-indexed extrusion's triangles into topsheet / base / sidewall /
 * steel edge, and hand back the geometry with one group per layer.
 *
 * Classification is face normal first (a face pointing up is the deck, down is
 * the base), then height for what's left: the bottom third of the wall is the
 * steel edge. Bevel faces fall out of this correctly — the chamfer along the
 * base is exactly where a real edge is.
 */
function splitByLayer(geo: THREE.BufferGeometry, thickness: number) {
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const uv = geo.getAttribute("uv") as THREE.BufferAttribute;
  const tris = pos.count / 3;

  const buckets: number[][] = [[], [], [], []];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const n = new THREE.Vector3();

  for (let t = 0; t < tris; t++) {
    const i = t * 3;
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    n.crossVectors(ab.subVectors(b, a), ac.subVectors(c, a)).normalize();
    const midY = (a.y + b.y + c.y) / 3;
    let slot: number;
    if (n.y > 0.55) slot = TOP;
    else if (n.y < -0.55) slot = BASE;
    else slot = midY < thickness * 0.4 ? EDGE : WALL;
    buckets[slot].push(t);
  }

  const p2 = new Float32Array(pos.count * 3);
  const u2 = new Float32Array(pos.count * 2);
  let w = 0;
  const groups: [number, number][] = [];
  for (const bucket of buckets) {
    const start = w;
    for (const t of bucket) {
      for (let k = 0; k < 3; k++) {
        const src = (t * 3 + k) * 3;
        p2[w * 3] = pos.array[src];
        p2[w * 3 + 1] = pos.array[src + 1];
        p2[w * 3 + 2] = pos.array[src + 2];
        u2[w * 2] = uv.array[(t * 3 + k) * 2];
        u2[w * 2 + 1] = uv.array[(t * 3 + k) * 2 + 1];
        w++;
      }
    }
    groups.push([start * 1, (w - start) * 1]);
  }

  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(p2, 3));
  out.setAttribute("uv", new THREE.BufferAttribute(u2, 2));
  out.computeVertexNormals();
  groups.forEach(([start, count], i) => {
    if (count > 0) out.addGroup(start, count, i);
  });
  geo.dispose();
  return out;
}

/**
 * One section of the deck: a rounded, side-cut plate rather than a slab.
 *
 * `uvShift` / `uvSign` place the section along the board, so the topsheet
 * artwork is laid out across the whole length instead of restarting at every
 * hinge. `uvSign` is -1 for the tail, whose geometry is mirrored after this.
 */
function boardSection(
  lengthZ: number,
  widthBack: number,
  widthFront: number,
  thickness: number,
  tipRound: number,
  uvShift: number,
  uvSign: number,
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
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
    curveSegments: 16,
    // The sidewall has to be banded vertically or there is nothing to split:
    // one quad spanning the full thickness can only be all edge or all wall,
    // and classifying its two triangles separately saws a zigzag down the side
    // of the board. Three steps gives the steel edge a band of its own.
    steps: 3,
  });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, thickness, 0);

  // UVs across the width and along the *whole board*, so one graphic runs from
  // tail to nose. u is mirrored either side of the centre line so the artwork
  // reads the same from both edges.
  const pos = geo.getAttribute("position");
  const uv = new Float32Array(pos.count * 2);
  const halfW = 0.256 / 2;
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) + halfW) / (halfW * 2);
    uv[i * 2 + 1] = (pos.getZ(i) * uvSign + uvShift + BOARD_LEN / 2) / BOARD_LEN;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return splitByLayer(geo, thickness);
}

/**
 * A binding: baseplate, heel cup, and a mounting disc with four screws.
 *
 * The straps and the highback live on the boot (they wrap it, so they have to
 * move with it). What's left here is the hardware that stays bolted to the
 * board — which is exactly the part that used to be a plain box.
 */
function binding(kit: GearKit, accent: string, angleDeg: number, thickness: number) {
  const g = new THREE.Group();
  // Dark shell, accent only on the heel cup — bindings are mostly black
  // plastic in real life, and a whole binding in the board's brightest colour
  // fights the topsheet it's bolted to.
  const shell = kit.mat("#20242b", { roughness: 0.46, metalness: 0.12, flatShading: false });
  const cupMat = kit.mat(accent, { roughness: 0.4, metalness: 0.14, flatShading: false });
  const hardware = kit.mat("#8f97a3", { roughness: 0.3, metalness: 0.85, flatShading: false });
  const dark = kit.mat("#15181d", { roughness: 0.55, metalness: 0.1, flatShading: false });

  // Baseplate, with a little canted lift under the heel.
  const plate = kit.mesh(
    new THREE.CylinderGeometry(0.108, 0.104, 0.012, 22),
    shell, 0, thickness + 0.007, 0,
  );
  plate.scale.set(0.86, 1, 1.05);
  g.add(plate);

  // Heel cup: the wall you actually lean against, open at the toe.
  const cup = kit.mesh(
    new THREE.CylinderGeometry(0.1, 0.096, 0.056, 20, 1, true, Math.PI * 0.58, Math.PI * 0.84),
    cupMat, 0, thickness + 0.036, 0,
  );
  cup.scale.set(0.88, 1, 1.02);
  g.add(cup);

  // Mounting disc and its four screws — small, but it is the detail that says
  // "this bolts to something" rather than "this is painted on".
  const disc = kit.mesh(
    new THREE.CylinderGeometry(0.042, 0.042, 0.005, 18),
    hardware, 0, thickness + 0.014, 0,
  );
  g.add(disc);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    g.add(kit.mesh(
      new THREE.CylinderGeometry(0.0075, 0.0075, 0.004, 8),
      dark, sx * 0.026, thickness + 0.018, sz * 0.026,
    ));
  }

  g.rotation.y = (angleDeg * Math.PI) / 180;
  return g;
}

export function buildBoard(kit: GearKit, board: Board): BoardParts {
  const topTex = makeBoardTexture(board);
  const baseTex = makeBaseTexture(board);

  const topMat = kit.mat("#ffffff", {
    map: topTex,
    flatShading: false,
    ...boardFinish(board.art),
  }) as THREE.MeshStandardMaterial;

  const baseMat = kit.mat("#ffffff", {
    map: baseTex,
    // Sintered and waxed: gloss, almost no metal. This is what makes the board
    // flash white when it tips toward the sun mid-grab.
    roughness: 0.24,
    metalness: 0.06,
    envMapIntensity: 1.25,
    flatShading: false,
  }) as THREE.MeshStandardMaterial;

  const wallMat = kit.mat("#1a1d23", {
    roughness: 0.72,
    metalness: 0.05,
    flatShading: false,
  }) as THREE.MeshStandardMaterial;

  // Real steel, tinted a touch toward the board's own edge colour so a deck
  // with a warm palette doesn't get a cold blue line down each side.
  const edgeMat = kit.mat(board.colors.edge, {
    roughness: 0.18,
    metalness: 0.92,
    envMapIntensity: 1.7,
    flatShading: false,
  }) as THREE.MeshStandardMaterial;
  edgeMat.color.lerp(new THREE.Color("#c4cad3"), 0.72);

  const mats: THREE.Material[] = [];
  mats[TOP] = topMat;
  mats[BASE] = baseMat;
  mats[WALL] = wallMat;
  mats[EDGE] = edgeMat;

  const root = new THREE.Group();

  const midGeo = boardSection(BOARD_MID, 0.256, 0.256, BOARD_THICK, 0, -BOARD_MID / 2, 1);
  midGeo.translate(0, 0, -BOARD_MID / 2);
  const mid = kit.mesh(midGeo, topMat);
  mid.material = mats;

  const mkTip = (sign: number) => {
    const g = boardSection(
      BOARD_TIP, 0.256, 0.212, BOARD_THICK, 0.1, (sign * BOARD_MID) / 2, sign,
    );
    if (sign < 0) {
      g.scale(1, 1, -1);
      // Mirroring flips the winding, and with it every normal.
      g.computeVertexNormals();
    }
    const m = kit.mesh(g, topMat);
    m.material = mats;
    m.position.z = (sign * BOARD_MID) / 2;
    return m;
  };
  const nose = mkTip(1);
  const tail = mkTip(-1);
  root.add(mid, nose, tail);

  // Front foot points toward the nose, back foot sits nearly square — the
  // stance angles a real rider sets, and the reason the boots aren't parallel.
  const front = binding(kit, board.colors.accent, 15, BOARD_THICK);
  front.position.z = 0.2;
  const back = binding(kit, board.colors.accent, -6, BOARD_THICK);
  back.position.z = -0.2;
  root.add(front, back);

  return { root, mid, nose, tail, topMat, baseMat, topTex, baseTex };
}
