/**
 * Skinned limbs.
 *
 * The rig used to be a stack of rigid capsules: an upper arm and a forearm that
 * interpenetrated at the elbow, a thigh and a shin that interpenetrated at the
 * knee. That is the single biggest reason the characters read as "blocky" — not
 * the polygon count, but the fact that you can see where one part ends and the
 * next begins, and that nothing deforms when a joint bends.
 *
 * This builds each limb as **one continuous tapered tube skinned to a bone
 * chain**, so bending the elbow creases the surface instead of sliding two
 * solids through each other. Everything is still generated at runtime from the
 * `Appearance` — no meshes are downloaded and nothing is rigged by hand.
 *
 * Bones hang along **-Y** in their rest pose, which is the convention the whole
 * rig already used for limb groups, so the existing pose code drives these
 * unchanged.
 */

import * as THREE from "three";
import { ensureMatAttribute } from "../world/SnowMaterial";

export interface LimbSegment {
  /** Bone this segment hangs from. Its rest position is already set. */
  bone: THREE.Bone;
  /** Length down -Y. */
  length: number;
  /** Radius at the top and bottom of the segment. */
  r0: number;
  r1: number;
}

interface LimbOptions {
  /**
   * Lateral offset of a ring, by segment and position along it.
   *
   * Legs need this: a snowboarder's feet are bolted to the bindings but the
   * thighs come off a narrow pelvis, so a leg is an A, not a post. Drifting the
   * top rings inward is what removes the goal-post read without touching the
   * bones — which matters, because the pose code overwrites their rotation
   * every frame.
   */
  drift?: (segment: number, t: number) => number;
  /**
   * Multiplier on the ring radius. Sleeve baffles used to be separate rings
   * stuck around the arm, which defeated the point of making the limb one
   * surface — rolling the ripple into the radius keeps it continuous.
   */
  swell?: (segment: number, t: number) => number;
  radial?: number;
  /** Rings per segment. More rings = a smoother crease at the joint. */
  rings?: number;
  /** Flatten the tube across Z (a thigh is not a cylinder). */
  squash?: number;
  /** Round the far end off instead of leaving it open. */
  capEnd?: boolean;
}

/**
 * Build a skinned tube down a bone chain.
 *
 * Weighting is the part that matters: a vertex takes its bone from where it
 * sits along the chain, and within about a quarter of a segment either side of
 * a joint it blends smoothly between the two. Too narrow a blend and the joint
 * pinches; too wide and the whole limb goes rubbery.
 */
export function buildLimb(
  segments: LimbSegment[],
  material: THREE.Material,
  opts: LimbOptions = {},
): THREE.SkinnedMesh {
  const radial = opts.radial ?? 12;
  const rings = opts.rings ?? 5;
  const squash = opts.squash ?? 1;
  const capEnd = opts.capEnd ?? true;
  const drift = opts.drift ?? (() => 0);
  const swell = opts.swell ?? (() => 1);

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const skinIndices: number[] = [];
  const skinWeights: number[] = [];
  const indices: number[] = [];

  // Rest-pose offset of each bone from the chain root, accumulated down -Y.
  const originY: number[] = [];
  let acc = 0;
  for (let i = 0; i < segments.length; i++) {
    originY.push(acc);
    acc -= segments[i].length;
  }
  const totalLen = -acc;

  const ringCount: number[] = [];
  let vertexRows = 0;

  const pushRing = (
    y: number,
    r: number,
    boneA: number,
    boneB: number,
    blend: number,
    v: number,
    dz = 0,
  ) => {
    for (let s = 0; s <= radial; s++) {
      const a = (s / radial) * Math.PI * 2;
      const cx = Math.cos(a) * r;
      const cz = Math.sin(a) * r * squash + dz;
      positions.push(cx, y, cz);
      const n = new THREE.Vector3(cx, 0, cz / (squash * squash || 1));
      if (n.lengthSq() < 1e-8) n.set(1, 0, 0);
      n.normalize();
      normals.push(n.x, n.y, n.z);
      uvs.push(s / radial, v);
      skinIndices.push(boneA, boneB, 0, 0);
      skinWeights.push(1 - blend, blend, 0, 0);
    }
    vertexRows++;
  };

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const first = i === 0;
    const startRing = first ? 0 : 1; // don't duplicate the shared joint ring
    let made = 0;
    for (let k = startRing; k <= rings; k++) {
      const t = k / rings;
      const y = originY[i] - seg.length * t;
      const r = (seg.r0 + (seg.r1 - seg.r0) * t) * swell(i, t);

      // Blend toward the *next* bone as we approach the joint, and toward the
      // previous one just past it.
      let boneA = i;
      let boneB = i;
      let blend = 0;
      const JOINT = 0.3;
      if (i + 1 < segments.length && t > 1 - JOINT) {
        boneA = i;
        boneB = i + 1;
        blend = ((t - (1 - JOINT)) / JOINT) * 0.5;
      } else if (i > 0 && t < JOINT) {
        boneA = i;
        boneB = i - 1;
        blend = (1 - t / JOINT) * 0.5;
      }
      pushRing(y, r, boneA, boneB, blend, -y / totalLen, drift(i, t));
      made++;
    }
    ringCount.push(made);
  }

  // Rounded cap on the last ring so a forearm ends in a wrist, not a pipe.
  if (capEnd) {
    const last = segments[segments.length - 1];
    const baseY = originY[segments.length - 1] - last.length;
    const capRings = 3;
    for (let k = 1; k <= capRings; k++) {
      const a = (k / capRings) * (Math.PI / 2);
      const r = last.r1 * Math.cos(a);
      const y = baseY - last.r1 * Math.sin(a) * 0.9;
      pushRing(y, Math.max(r, 0.0015), segments.length - 1, segments.length - 1, 0, 1, drift(segments.length - 1, 1));
    }
  }

  // Stitch consecutive rings.
  const perRow = radial + 1;
  for (let row = 0; row + 1 < vertexRows; row++) {
    for (let s = 0; s < radial; s++) {
      const a = row * perRow + s;
      const b = a + perRow;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndices, 4));
  geo.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  ensureMatAttribute(geo);

  const mesh = new THREE.SkinnedMesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  // Deliberately NOT bound yet. `bind()` snapshots the bones' world matrices to
  // build their inverses, so it can only run once the chain is parented into
  // the rig and world matrices are up to date — see `bindLimbs`.
  mesh.userData.limbBones = segments.map((s) => s.bone);
  return mesh;
}

/**
 * Bind every limb, after the hierarchy exists.
 *
 * Two things have to be true at this moment or the mesh collapses to a point:
 * the bones must be in their rest pose, and every world matrix in the chain —
 * including the mesh's own — must be current. The mesh's frame must also match
 * the frame its geometry was authored in, which is why each limb is parented to
 * the chain root's *parent* at the chain root's offset.
 */
export function bindLimbs(root: THREE.Object3D, limbs: THREE.SkinnedMesh[]) {
  root.updateMatrixWorld(true);
  for (const mesh of limbs) {
    const bones = mesh.userData.limbBones as THREE.Bone[];
    mesh.bind(new THREE.Skeleton(bones));
  }
}

/** A bone at a local offset, ready to be chained. */
export function bone(y: number, z = 0): THREE.Bone {
  const b = new THREE.Bone();
  b.position.set(0, y, z);
  return b;
}
