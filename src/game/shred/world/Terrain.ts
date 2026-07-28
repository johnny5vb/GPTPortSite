/**
 * Terrain streaming.
 *
 * The mountain is tessellated into 96m chunks around the rider with three
 * levels of detail. Chunks are built incrementally (a small budget per frame)
 * so nothing ever hitches mid-run, and the very first ring is built up front
 * behind the loading screen.
 *
 * Normals come from a 1-cell border of extra height samples rather than from
 * the triangle mesh, which makes lighting continuous across chunk seams even
 * where two chunks meet at different LODs.
 */

import * as THREE from "three";
import { TerrainGen, Surface } from "./TerrainGen";
import {
  createSnowMaterial,
  WorldUniforms,
} from "./SnowMaterial";

export const CHUNK_SIZE = 96;

const LODS = [
  { maxDist: 2, segs: 40 },
  { maxDist: 4, segs: 20 },
  { maxDist: 99, segs: 10 },
];

const COLS = 3; // ± chunks in X
const ROWS_BEHIND = 2;
const ROWS_AHEAD = 8;

/** How far the chunk window reaches, as a fraction of the full budget. */
export type TerrainDetail = number;

interface Chunk {
  xi: number;
  zi: number;
  lod: number;
  mesh: THREE.Mesh;
}

function lodFor(dist: number) {
  for (let i = 0; i < LODS.length; i++) if (dist <= LODS[i].maxDist) return i;
  return LODS.length - 1;
}

export class Terrain {
  readonly group = new THREE.Group();
  readonly gen: TerrainGen;
  readonly material: THREE.MeshStandardMaterial;

  private chunks = new Map<string, Chunk>();
  private queue: { xi: number; zi: number; lod: number; pri: number }[] = [];
  private scratch: Surface = {
    h: 0,
    nx: 0,
    ny: 1,
    nz: 0,
    ice: 0,
    powder: 0,
    rock: 0,
    groom: 0,
    steep: 0,
  };

  /** Chunks built per frame once the run is live. */
  budgetPerFrame = 2;

  /**
   * 0.5 .. 1 — scales the chunk window. Phones don't need 800m of terrain
   * behind a wall of fog, and every chunk dropped is a draw call saved.
   */
  private cols = COLS;
  private rowsAhead = ROWS_AHEAD;

  setDetail(detail: TerrainDetail) {
    this.cols = Math.max(2, Math.round(COLS * detail));
    this.rowsAhead = Math.max(4, Math.round(ROWS_AHEAD * detail));
  }

  constructor(gen: TerrainGen, uniforms: WorldUniforms) {
    this.gen = gen;
    this.material = createSnowMaterial(uniforms);
    this.group.name = "terrain";
    this.group.matrixAutoUpdate = false;
  }

  private key(xi: number, zi: number) {
    return `${xi}|${zi}`;
  }

  /** Recompute which chunks should exist. Cheap; call once per frame. */
  update(playerX: number, playerZ: number, dt: number, immediate = false) {
    const px = Math.floor(playerX / CHUNK_SIZE);
    const pz = Math.floor(playerZ / CHUNK_SIZE);

    this.queue.length = 0;
    const wanted = new Set<string>();

    for (let dz = -ROWS_BEHIND; dz <= this.rowsAhead; dz++) {
      for (let dx = -this.cols; dx <= this.cols; dx++) {
        const xi = px + dx;
        const zi = pz + dz;
        const dist = Math.max(Math.abs(dx), Math.abs(dz));
        const lod = lodFor(dist);
        const k = this.key(xi, zi);
        wanted.add(k);
        const existing = this.chunks.get(k);
        if (!existing) {
          this.queue.push({ xi, zi, lod, pri: dist });
        } else if (existing.lod !== lod && lod < existing.lod) {
          // Only ever refine; never coarsen a chunk we already paid for.
          this.queue.push({ xi, zi, lod, pri: dist + 0.5 });
        }
      }
    }

    // Evict chunks that fell outside the window.
    for (const [k, c] of this.chunks) {
      if (!wanted.has(k)) {
        this.group.remove(c.mesh);
        c.mesh.geometry.dispose();
        this.chunks.delete(k);
      }
    }

    this.queue.sort((a, b) => a.pri - b.pri);
    const budget = immediate ? this.queue.length : this.budgetPerFrame;
    for (let i = 0; i < Math.min(budget, this.queue.length); i++) {
      const q = this.queue[i];
      this.build(q.xi, q.zi, q.lod);
    }
    void dt;
  }

  /** Build every pending chunk. Used once, behind the loading screen. */
  prime(playerX: number, playerZ: number) {
    this.update(playerX, playerZ, 0, true);
  }

  private build(xi: number, zi: number, lod: number) {
    const k = this.key(xi, zi);
    const prev = this.chunks.get(k);
    if (prev) {
      this.group.remove(prev.mesh);
      prev.mesh.geometry.dispose();
    }

    const segs = LODS[lod].segs;
    const step = CHUNK_SIZE / segs;
    const ox = xi * CHUNK_SIZE;
    const oz = zi * CHUNK_SIZE;

    // Height grid with a 1-cell border on every side for seamless normals.
    const gw = segs + 3;
    const heights = new Float32Array(gw * gw);
    for (let j = -1; j <= segs + 1; j++) {
      const wz = oz + j * step;
      for (let i = -1; i <= segs + 1; i++) {
        heights[(j + 1) * gw + (i + 1)] = this.gen.heightAt(ox + i * step, wz);
      }
    }

    const vcount = (segs + 1) * (segs + 1);
    const positions = new Float32Array(vcount * 3);
    const normals = new Float32Array(vcount * 3);
    const mats = new Float32Array(vcount * 4);

    const inv2 = 1 / (2 * step);
    let v = 0;
    for (let j = 0; j <= segs; j++) {
      const wz = oz + j * step;
      for (let i = 0; i <= segs; i++) {
        const wx = ox + i * step;
        const gi = (j + 1) * gw + (i + 1);
        const h = heights[gi];

        const hx = (heights[gi + 1] - heights[gi - 1]) * inv2;
        const hz = (heights[gi + gw] - heights[gi - gw]) * inv2;
        let nx = -hx;
        let ny = 1;
        let nz = -hz;
        const len = Math.hypot(nx, ny, nz) || 1;
        nx /= len;
        ny /= len;
        nz /= len;

        positions[v * 3] = wx - ox;
        positions[v * 3 + 1] = h;
        positions[v * 3 + 2] = wz - oz;
        normals[v * 3] = nx;
        normals[v * 3 + 1] = ny;
        normals[v * 3 + 2] = nz;

        const s = this.scratch;
        s.h = h;
        s.nx = nx;
        s.ny = ny;
        s.nz = nz;
        s.steep = Math.acos(Math.min(1, Math.max(-1, ny)));
        this.gen.materialAt(wx, wz, s);
        mats[v * 4] = s.ice;
        mats[v * 4 + 1] = s.powder;
        mats[v * 4 + 2] = s.rock;
        mats[v * 4 + 3] = s.groom;

        v++;
      }
    }

    const indices =
      vcount > 65535 ? new Uint32Array(segs * segs * 6) : new Uint16Array(segs * segs * 6);
    let t = 0;
    for (let j = 0; j < segs; j++) {
      for (let i = 0; i < segs; i++) {
        const a = j * (segs + 1) + i;
        const b = a + 1;
        const c = a + segs + 1;
        const d = c + 1;
        indices[t++] = a;
        indices[t++] = c;
        indices[t++] = b;
        indices[t++] = b;
        indices[t++] = c;
        indices[t++] = d;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    geo.setAttribute("aMat", new THREE.BufferAttribute(mats, 4));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeBoundingSphere();

    const mesh = new THREE.Mesh(geo, this.material);
    mesh.position.set(ox, 0, oz);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    mesh.frustumCulled = true;

    this.group.add(mesh);
    this.chunks.set(k, { xi, zi, lod, mesh });
  }

  dispose() {
    for (const c of this.chunks.values()) {
      c.mesh.geometry.dispose();
    }
    this.chunks.clear();
    this.group.clear();
    this.material.dispose();
  }
}
