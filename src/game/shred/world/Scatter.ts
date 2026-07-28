/**
 * Instanced scatter — pines, snow-loaded firs, rocks and buried boulders.
 *
 * Placement is a pure function of (cell, seed), so the forest is identical
 * every time you replay a seed and no state has to be kept for cells that
 * scroll out of view. The instance buffers are rebuilt only when the rider
 * crosses a scatter-cell boundary, roughly every few seconds.
 */

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { TerrainGen } from "./TerrainGen";
import { WorldUniforms, stylizeMaterial, ensureMatAttribute } from "./SnowMaterial";
import { hash2v } from "../core/rng";
import { lerp } from "../core/math";

const CELL = 24;
const RADIUS_X = 9; // ± cells in X  → ±216m
const AHEAD = 26; // cells ahead      → 624m
const BEHIND = 4;

const MAX_ROCKS = 900;

/**
 * Organic noise on a surface of revolution.
 *
 * A cone is a cone — the tell that a forest is procedural is that every
 * silhouette is a perfectly straight taper. Pushing each ring in and out by a
 * few percent, with the displacement varying around the trunk as well as up
 * it, is what turns "geometry" into "a tree" at almost no vertex cost.
 */
function roughen(geo: THREE.BufferGeometry, amount: number, freq: number, seed: number) {
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const a = Math.atan2(z, x);
    const n =
      Math.sin(a * 3 + y * freq + seed) * 0.6 +
      Math.sin(a * 7 - y * freq * 1.7 + seed * 2.3) * 0.28 +
      Math.sin(a * 13 + y * freq * 0.6 - seed) * 0.12;
    const k = 1 + n * amount;
    pos.setXYZ(i, x * k, y, z * k);
  }
  geo.computeVertexNormals();
}

/** Tapered trunk with a lean, so the tree isn't a plumb line. */
function trunkGeometry(h: number, r0: number, r1: number, lean: number, seed: number) {
  const g = new THREE.CylinderGeometry(r1, r0, h, 7, 3);
  g.translate(0, h / 2, 0);
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = y / h;
    // Bend, and swell where roots meet the ground.
    pos.setX(i, pos.getX(i) + Math.sin(t * 1.6 + seed) * lean * t * t);
    pos.setZ(i, pos.getZ(i) + Math.cos(t * 1.3 - seed) * lean * 0.6 * t * t);
  }
  roughen(g, 0.16, 2.2, seed);
  paint(g, new THREE.Color("#33261e"), new THREE.Color("#4c3a2d"));
  return g;
}

/**
 * A conifer. `variant` shifts the whole species: how many tiers, how wide, how
 * much snow sits on it, how far the branches droop.
 */
function coniferGeometry(variant: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const seed = variant * 2.399 + 0.7;
  const wide = variant % 3 === 0;
  const snowy = variant % 2 === 0;
  const tiers = 5 + (variant % 3);
  const height = lerp(6.2, 9.4, ((variant * 37) % 11) / 10);

  parts.push(trunkGeometry(height * 0.45, 0.3, 0.12, 0.26, seed));

  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1);
    // Tiers taper unevenly, and each one is rotated so the notches don't line
    // up into a visible seam running up the tree.
    const jitter = Math.sin(seed * 9 + i * 2.7) * 0.5 + 0.5;
    const r = lerp(wide ? 2.4 : 1.9, 0.55, t) * lerp(0.86, 1.1, jitter);
    const hh = lerp(2.6, 1.7, t) * lerp(0.9, 1.15, jitter);
    const y = lerp(height * 0.22, height * 0.86, t);

    const cone = new THREE.ConeGeometry(r, hh, 9, 2);
    cone.translate(0, hh * 0.5, 0);
    roughen(cone, 0.13, 1.5, seed + i);
    // Branches droop more at the bottom of the tree than at the top.
    const cpos = cone.getAttribute("position") as THREE.BufferAttribute;
    const droop = lerp(0.5, 0.12, t);
    for (let v = 0; v < cpos.count; v++) {
      const rad = Math.hypot(cpos.getX(v), cpos.getZ(v));
      cpos.setY(v, cpos.getY(v) - rad * droop);
    }
    cone.computeVertexNormals();
    cone.rotateY(i * 1.13 + seed);
    cone.translate(Math.sin(seed + i) * 0.1, y, Math.cos(seed * 1.7 + i) * 0.1);

    const dark = new THREE.Color().setHSL(0.36 - t * 0.03, lerp(0.42, 0.28, t), lerp(0.07, 0.14, t));
    const light = new THREE.Color().setHSL(0.4, 0.2, lerp(0.3, snowy ? 0.82 : 0.5, t));
    paint(cone, dark, light);
    parts.push(cone);

    // Snow sitting on the upper branches, as a separate shallow shell.
    if (snowy && t > 0.25) {
      const cap = new THREE.ConeGeometry(r * 0.82, hh * 0.42, 9, 1);
      cap.translate(0, hh * 0.62, 0);
      roughen(cap, 0.2, 2.4, seed + i * 3);
      cap.rotateY(i * 1.13 + seed);
      cap.translate(0, y, 0);
      paint(cap, new THREE.Color("#cddcec"), new THREE.Color("#ffffff"));
      parts.push(cap);
    }
  }

  const merged = mergeGeometries(parts, false)!;
  for (const p of parts) p.dispose();
  merged.computeVertexNormals();
  return merged;
}

/** A bare, wind-killed tree. Breaks up a solid wall of green. */
function deadTreeGeometry(variant: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const seed = variant * 5.71;
  const height = lerp(4.4, 7.2, ((variant * 53) % 7) / 6);
  parts.push(trunkGeometry(height, 0.26, 0.07, 0.5, seed));

  const branches = 5 + (variant % 4);
  for (let i = 0; i < branches; i++) {
    const t = 0.35 + (i / branches) * 0.6;
    const len = lerp(2.1, 0.7, t) * lerp(0.7, 1.2, ((i * 17) % 9) / 8);
    const b = new THREE.CylinderGeometry(0.025, 0.075, len, 5, 1);
    b.translate(0, len / 2, 0);
    b.rotateZ(lerp(1.15, 0.55, t) * (i % 2 ? 1 : -1));
    b.rotateY(i * 2.1 + seed);
    b.translate(0, height * t, 0);
    paint(b, new THREE.Color("#3a2d24"), new THREE.Color("#6b5a49"));
    parts.push(b);
  }
  const merged = mergeGeometries(parts, false)!;
  for (const p of parts) p.dispose();
  merged.computeVertexNormals();
  return merged;
}

/** A snow-buried shrub / young growth. Ground-level texture, cheap. */
function shrubGeometry(variant: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const seed = variant * 3.17;
  const lumps = 3 + (variant % 3);
  for (let i = 0; i < lumps; i++) {
    const r = lerp(0.55, 1.05, ((i * 29) % 7) / 6);
    const g = new THREE.IcosahedronGeometry(r, 1);
    roughen(g, 0.26, 3.1, seed + i);
    g.translate(
      Math.cos(i * 2.4 + seed) * 0.7,
      r * 0.55,
      Math.sin(i * 2.4 + seed) * 0.7,
    );
    paint(
      g,
      new THREE.Color(i % 2 ? "#1b2c22" : "#243528"),
      new THREE.Color(i % 2 ? "#dbe8f4" : "#9fb4c4"),
    );
    parts.push(g);
  }
  const merged = mergeGeometries(parts, false)!;
  for (const p of parts) p.dispose();
  merged.computeVertexNormals();
  return merged;
}

/**
 * Rock variants. `kind` picks a proportion — boulder, slab or spire — and the
 * displacement is multi-octave so the facets read as weathered stone rather
 * than as a subdivided icosahedron.
 */
function rockGeometry(kind: number): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const seed = kind * 4.3 + 1.1;
  const shape: [number, number, number] =
    kind % 3 === 0 ? [1, 0.62, 1.05] : kind % 3 === 1 ? [1.35, 0.4, 0.9] : [0.72, 1.5, 0.78];

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n =
      0.78 +
      0.26 * Math.sin(x * 3.1 + y * 2.2 + seed) * Math.cos(z * 2.7 + x * 1.3) +
      0.12 * Math.sin(x * 7.4 - z * 6.1 + seed * 2) +
      0.05 * Math.sin(y * 15.2 + x * 11.7);
    pos.setXYZ(i, x * n * shape[0], y * n * shape[1], z * n * shape[2]);
  }
  geo.computeVertexNormals();
  paint(geo, new THREE.Color("#1b1e26"), new THREE.Color("#8b97a8"));
  return geo;
}

/** Bake a vertical gradient into vertex colours (cheap stylised shading). */
function paint(geo: THREE.BufferGeometry, low: THREE.Color, high: THREE.Color) {
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const span = Math.max(1e-4, maxY - minY);
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) - minY) / span;
    c.copy(low).lerp(high, t * t);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

export class Scatter {
  readonly group = new THREE.Group();
  /**
   * One instanced mesh per variant. Trees are the single most repeated object
   * on screen, so a pool of distinct silhouettes — several conifer species,
   * bare deadfall, buried shrubs — is what stops a hillside reading as one
   * shape stamped four thousand times.
   */
  private trees: THREE.InstancedMesh[] = [];
  private rocks: THREE.InstancedMesh[] = [];
  private treeCount: number[] = [];
  private rockCount: number[] = [];
  private gen: TerrainGen;
  private lastCellX = Infinity;
  private lastCellZ = Infinity;
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private v = new THREE.Vector3();
  private s = new THREE.Vector3();
  private euler = new THREE.Euler();

  constructor(gen: TerrainGen, uniforms: WorldUniforms, seed: number) {
    this.gen = gen;
    this.group.name = "scatter";

    const treeMat = stylizeMaterial(
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.92,
        metalness: 0,
      }),
      uniforms,
      { snow: false, sparkle: false },
    );
    const rockMat = stylizeMaterial(
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.95,
        metalness: 0,
        flatShading: true,
      }),
      uniforms,
      { snow: false, sparkle: false },
    );

    // Four conifers, two deadfall, two shrubs. The budget is split so the
    // common species get most of the instances.
    const treeGeos: [THREE.BufferGeometry, number][] = [
      [coniferGeometry(0), 1400],
      [coniferGeometry(1), 1200],
      [coniferGeometry(2), 900],
      [coniferGeometry(3), 700],
      [deadTreeGeometry(0), 320],
      [deadTreeGeometry(1), 260],
      [shrubGeometry(0), 700],
      [shrubGeometry(1), 600],
    ];
    for (const [geo, cap] of treeGeos) {
      ensureMatAttribute(geo);
      const im = new THREE.InstancedMesh(geo, treeMat, cap);
      this.trees.push(im);
      this.treeCount.push(0);
    }

    for (let k = 0; k < 3; k++) {
      const geo = rockGeometry(k);
      ensureMatAttribute(geo, [0, 0, 1, 0]);
      const im = new THREE.InstancedMesh(geo, rockMat, MAX_ROCKS);
      this.rocks.push(im);
      this.rockCount.push(0);
    }

    for (const im of [...this.trees, ...this.rocks]) {
      im.castShadow = true;
      im.receiveShadow = false;
      im.frustumCulled = false;
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.count = 0;
      this.group.add(im);
    }
    void seed;
  }

  /** Push one matrix into whichever variant bucket the hash picked. */
  private place(pool: THREE.InstancedMesh[], counts: number[], which: number) {
    const i = which % pool.length;
    const im = pool[i];
    if (counts[i] >= im.instanceMatrix.count) return false;
    im.setMatrixAt(counts[i]++, this.m);
    return true;
  }

  update(playerX: number, playerZ: number) {
    const cx = Math.floor(playerX / CELL);
    const cz = Math.floor(playerZ / CELL);
    if (cx === this.lastCellX && cz === this.lastCellZ) return;
    this.lastCellX = cx;
    this.lastCellZ = cz;
    this.rebuild(cx, cz);
  }

  private rebuild(cx: number, cz: number) {
    this.treeCount.fill(0);
    this.rockCount.fill(0);
    const gen = this.gen;

    for (let dz = -BEHIND; dz <= AHEAD; dz++) {
      const zi = cz + dz;
      // Thin the forest out with distance so the far field stays cheap.
      const far = dz > 14;
      for (let dx = -RADIUS_X; dx <= RADIUS_X; dx++) {
        const xi = cx + dx;
        const [r0, r1, r2] = hash2v(xi, zi, gen.seed);
        if (far && r0 > 0.55) continue;

        const wx = xi * CELL + r0 * CELL;
        const wz = zi * CELL + r1 * CELL;
        const h = gen.heightAt(wx, wz);

        // Slope from a coarse probe — cheaper than a full surface sample.
        const hx = gen.heightAt(wx + 2, wz) - gen.heightAt(wx - 2, wz);
        const hz = gen.heightAt(wx, wz + 2) - gen.heightAt(wx, wz - 2);
        const steep = Math.atan(Math.hypot(hx, hz) / 4);

        const mask = gen.treeMask(wx, wz, h, steep);

        if (mask > 0.02 && r2 < mask) {
          // Two or three trees per cell where the mask is strong.
          const clusters = mask > 0.6 ? 3 : mask > 0.32 ? 2 : 1;
          for (let c = 0; c < clusters; c++) {
            const [a0, a1, a2] = hash2v(xi * 71 + c, zi * 13 - c, gen.seed);
            const tx = wx + (a0 - 0.5) * CELL * 0.9;
            const tz = wz + (a1 - 0.5) * CELL * 0.9;
            const ty = gen.heightAt(tx, tz);
            const scale = lerp(0.75, 1.55, a2);
            this.euler.set((a0 - 0.5) * 0.14, a1 * Math.PI * 2, (a1 - 0.5) * 0.14);
            this.q.setFromEuler(this.euler);
            this.v.set(tx, ty - 0.4, tz);
            this.s.set(scale, scale * lerp(0.82, 1.3, a1), scale);
            this.m.compose(this.v, this.q, this.s);

            // Species mix: mostly conifers, some deadfall high up where the
            // trees are struggling anyway, shrubs where cover is thinnest.
            let variant: number;
            if (mask < 0.22) variant = 6 + ((a0 * 97) | 0) % 2;
            else if (a2 > 0.9) variant = 4 + ((a1 * 61) | 0) % 2;
            else variant = ((a0 * 131) | 0) % 4;
            this.place(this.trees, this.treeCount, variant);
          }
        }

        // Rocks: exposed on the steeps and along the corridor walls.
        if (steep > 0.5 && r2 > 0.72) {
          const scale = lerp(0.8, 4.2, r1);
          this.euler.set(r0 * 0.6, r1 * 6.28, r2 * 0.6);
          this.q.setFromEuler(this.euler);
          this.v.set(wx, h - scale * 0.35, wz);
          this.s.set(scale, scale * lerp(0.6, 1.1, r0), scale);
          this.m.compose(this.v, this.q, this.s);
          this.place(this.rocks, this.rockCount, (r0 * 89) | 0);
        }
      }
    }

    this.trees.forEach((im, i) => {
      im.count = this.treeCount[i];
      im.instanceMatrix.needsUpdate = true;
    });
    this.rocks.forEach((im, i) => {
      im.count = this.rockCount[i];
      im.instanceMatrix.needsUpdate = true;
    });
    this.trees[0].computeBoundingSphere();
  }

  dispose() {
    for (const im of [...this.trees, ...this.rocks]) {
      im.geometry.dispose();
      (im.material as THREE.Material).dispose();
      im.dispose();
    }
    this.group.clear();
  }
}
