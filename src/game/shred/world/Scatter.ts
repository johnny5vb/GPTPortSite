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

const MAX_TREES = 4200;
const MAX_ROCKS = 900;

function pineGeometry(seed: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const trunk = new THREE.CylinderGeometry(0.16, 0.26, 2.2, 5, 1);
  trunk.translate(0, 1.1, 0);
  paint(trunk, new THREE.Color("#3a2b22"), new THREE.Color("#4a382c"));
  parts.push(trunk);

  const tiers = 4;
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1);
    const r = lerp(2.1, 0.75, t);
    const h = lerp(3.0, 2.1, t);
    const y = lerp(1.7, 6.4, t);
    const cone = new THREE.ConeGeometry(r, h, 7, 1);
    cone.translate(0, y + h * 0.5 - 0.6, 0);
    // Deep evergreen at the base, snow-loaded toward the tips.
    const dark = new THREE.Color().setHSL(0.36 - t * 0.02, 0.35, lerp(0.1, 0.16, t));
    const light = new THREE.Color().setHSL(0.42, 0.16, lerp(0.42, 0.78, t));
    paint(cone, dark, light);
    parts.push(cone);
  }
  void seed;
  const merged = mergeGeometries(parts, false)!;
  for (const p of parts) p.dispose();
  merged.computeVertexNormals();
  return merged;
}

function firGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const trunk = new THREE.CylinderGeometry(0.13, 0.2, 1.6, 5, 1);
  trunk.translate(0, 0.8, 0);
  paint(trunk, new THREE.Color("#332521"), new THREE.Color("#42332a"));
  parts.push(trunk);

  // A single tall spire with a heavy snow cap — reads well at distance.
  const body = new THREE.ConeGeometry(1.5, 7.4, 6, 1);
  body.translate(0, 4.4, 0);
  paint(body, new THREE.Color("#12291f"), new THREE.Color("#9fc8d8"));
  parts.push(body);

  const cap = new THREE.ConeGeometry(0.95, 2.4, 6, 1);
  cap.translate(0, 6.9, 0);
  paint(cap, new THREE.Color("#cfe3f2"), new THREE.Color("#ffffff"));
  parts.push(cap);

  const merged = mergeGeometries(parts, false)!;
  for (const p of parts) p.dispose();
  merged.computeVertexNormals();
  return merged;
}

function rockGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  // Kick the vertices around so no two rocks read as the same silhouette.
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n =
      0.72 +
      0.34 * Math.sin(x * 3.1 + y * 2.2) * Math.cos(z * 2.7 + x * 1.3);
    pos.setXYZ(i, x * n, y * n * 0.7, z * n);
  }
  geo.computeVertexNormals();
  paint(geo, new THREE.Color("#20232b"), new THREE.Color("#7d8899"));
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
  private pines: THREE.InstancedMesh;
  private firs: THREE.InstancedMesh;
  private rocks: THREE.InstancedMesh;
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

    const pineGeo = pineGeometry(seed);
    const firGeo = firGeometry();
    const rockGeo = rockGeometry();
    ensureMatAttribute(pineGeo);
    ensureMatAttribute(firGeo);
    ensureMatAttribute(rockGeo, [0, 0, 1, 0]);

    this.pines = new THREE.InstancedMesh(pineGeo, treeMat, MAX_TREES);
    this.firs = new THREE.InstancedMesh(firGeo, treeMat, MAX_TREES >> 1);
    this.rocks = new THREE.InstancedMesh(rockGeo, rockMat, MAX_ROCKS);

    for (const im of [this.pines, this.firs, this.rocks]) {
      im.castShadow = true;
      im.receiveShadow = false;
      im.frustumCulled = false;
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.count = 0;
      this.group.add(im);
    }
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
    let pine = 0;
    let fir = 0;
    let rock = 0;
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
            this.euler.set((a0 - 0.5) * 0.12, a1 * Math.PI * 2, (a1 - 0.5) * 0.12);
            this.q.setFromEuler(this.euler);
            this.v.set(tx, ty - 0.4, tz);
            this.s.set(scale, scale * lerp(0.85, 1.25, a1), scale);
            this.m.compose(this.v, this.q, this.s);
            if (a2 > 0.62) {
              if (fir < this.firs.instanceMatrix.count)
                this.firs.setMatrixAt(fir++, this.m);
            } else if (pine < this.pines.instanceMatrix.count) {
              this.pines.setMatrixAt(pine++, this.m);
            }
          }
        }

        // Rocks: exposed on the steeps and along the corridor walls.
        if (steep > 0.5 && r2 > 0.72 && rock < MAX_ROCKS) {
          const scale = lerp(0.8, 4.2, r1);
          this.euler.set(r0 * 0.6, r1 * 6.28, r2 * 0.6);
          this.q.setFromEuler(this.euler);
          this.v.set(wx, h - scale * 0.35, wz);
          this.s.set(scale, scale * lerp(0.6, 1.1, r0), scale);
          this.m.compose(this.v, this.q, this.s);
          this.rocks.setMatrixAt(rock++, this.m);
        }
      }
    }

    this.pines.count = pine;
    this.firs.count = fir;
    this.rocks.count = rock;
    this.pines.instanceMatrix.needsUpdate = true;
    this.firs.instanceMatrix.needsUpdate = true;
    this.rocks.instanceMatrix.needsUpdate = true;
    this.pines.computeBoundingSphere();
  }

  dispose() {
    for (const im of [this.pines, this.firs, this.rocks]) {
      im.geometry.dispose();
      (im.material as THREE.Material).dispose();
      im.dispose();
    }
    this.group.clear();
  }
}
