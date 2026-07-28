/**
 * Feature set-pieces: wooden bridges, abandoned chairlifts, mountain villages,
 * cave arches, glacier seracs, park rails and trail markers.
 *
 * One `THREE.Group` is built per terrain segment the first time that segment
 * comes into view, then cached and released once it is well behind the rider.
 * Everything is low-poly and shares three materials so the draw-call cost stays
 * flat no matter how dense the mountain gets.
 */

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Feature, SEGMENT_LENGTH, TerrainGen } from "./TerrainGen";
import { WorldUniforms, stylizeMaterial, ensureMatAttribute } from "./SnowMaterial";
import { hash2v } from "../core/rng";
import { lerp } from "../core/math";

interface Mats {
  wood: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  rock: THREE.MeshStandardMaterial;
  ice: THREE.MeshStandardMaterial;
  paint: THREE.MeshStandardMaterial;
  glow: THREE.MeshBasicMaterial;
  snow: THREE.MeshStandardMaterial;
}

export class Props {
  readonly group = new THREE.Group();
  private gen: TerrainGen;
  private mats: Mats;
  private segments = new Map<number, THREE.Group>();

  constructor(gen: TerrainGen, uniforms: WorldUniforms) {
    this.gen = gen;
    this.group.name = "props";

    const mk = (params: THREE.MeshStandardMaterialParameters) =>
      stylizeMaterial(new THREE.MeshStandardMaterial(params), uniforms, {
        snow: false,
        sparkle: false,
      });

    this.mats = {
      wood: mk({ color: "#6b4b34", roughness: 0.95, flatShading: true }),
      metal: mk({ color: "#8d949e", roughness: 0.38, metalness: 0.75, envMapIntensity: 1.3 }),
      rock: mk({ color: "#2b2f38", roughness: 1, flatShading: true }),
      ice: mk({
        color: "#a9d8ea",
        roughness: 0.12,
        metalness: 0.05,
        envMapIntensity: 1.8,
        transparent: true,
        opacity: 0.86,
        flatShading: true,
      }),
      paint: mk({ color: "#e2453b", roughness: 0.7, flatShading: true }),
      glow: new THREE.MeshBasicMaterial({ color: "#ffcf87", toneMapped: false }),
      snow: mk({ color: "#eef4ff", roughness: 0.85, flatShading: true }),
    };
  }

  update(playerZ: number) {
    const seg = Math.floor(playerZ / SEGMENT_LENGTH);
    for (let s = seg - 2; s <= seg + 5; s++) {
      if (s < 0) continue;
      if (this.segments.has(s)) continue;
      // Claim the slot first: if a set-piece ever fails to build we skip it
      // once rather than retrying — and throwing — on every single frame.
      const placeholder = new THREE.Group();
      this.segments.set(s, placeholder);
      try {
        const g = this.buildSegment(this.gen.featureForSegment(s));
        // The finish gate belongs to whichever segment straddles the bottom.
        const finishZ = this.gen.preset.length;
        if (finishZ > 0 && finishZ >= s * SEGMENT_LENGTH && finishZ < (s + 1) * SEGMENT_LENGTH) {
          this.buildFinish(g, finishZ);
        }
        this.segments.set(s, g);
        if (g.children.length) this.group.add(g);
      } catch (err) {
        console.warn("[shred] prop build failed for segment", s, err);
      }
    }
    for (const [s, g] of this.segments) {
      if (s < seg - 3 || s > seg + 6) {
        this.group.remove(g);
        disposeGroup(g);
        this.segments.delete(s);
      }
    }
  }

  /**
   * The finish line, built once into whichever segment contains it.
   *
   * A banner across the corridor plus a pair of towers — the point is that you
   * can see it coming from a long way up, so the last few hundred metres of a
   * run have somewhere to be going.
   */
  private buildFinish(g: THREE.Group, z: number) {
    const gen = this.gen;
    const cx = gen.corridorCenter(z);
    const hw = Math.min(46, gen.corridorHalfWidth(z) * 0.7);
    const h = gen.heightAt(cx, z);

    for (const side of [-1, 1]) {
      const px = cx + side * hw;
      const py = gen.heightAt(px, z);
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.85, 11, 8), this.mats.metal);
      tower.position.set(px, py + 5.5, z);
      tower.castShadow = true;
      g.add(tower);
      // A flag on each tower so the gate reads at distance and in flat light.
      for (let i = 0; i < 3; i++) {
        const flag = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.7, 0.12), this.mats.paint);
        flag.position.set(px + side * 1.6, py + 8.2 - i * 2.1, z);
        g.add(flag);
      }
    }

    const span = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 2.6, 0.5), this.mats.paint);
    span.position.set(cx, h + 10.4, z);
    g.add(span);
    // Chequered banding under the banner.
    const n = Math.max(6, Math.round(hw / 3));
    for (let i = 0; i < n; i++) {
      const blk = new THREE.Mesh(
        new THREE.BoxGeometry((hw * 2) / n, 1.1, 0.56),
        i % 2 ? this.mats.snow : this.mats.rock,
      );
      blk.position.set(cx - hw + ((i + 0.5) * hw * 2) / n, h + 8.7, z);
      g.add(blk);
    }

    // Painted line on the snow, so the moment of crossing is unambiguous.
    const line = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 0.08, 2.2), this.mats.paint);
    line.position.set(cx, h + 0.1, z);
    g.add(line);
  }

  /**
   * Ice tunnel roof.
   *
   * The heightfield can only describe one surface per (x, z), so the trench is
   * terrain and the roof over it has to be a prop. Physics never touches it —
   * you ride the carved floor and the arch passes overhead.
   */
  private buildTunnel(g: THREE.Group, f: Feature) {
    const gen = this.gen;
    const step = 12;
    for (let z = f.z0 + 14; z < f.z1 - 14; z += step) {
      const cx = gen.corridorCenter(z);
      const floor = gen.heightAt(cx, z);
      // Half-torus ribs: an arch reads as a tunnel from inside and out, and
      // costs a fraction of a swept tube.
      const rib = new THREE.Mesh(
        new THREE.TorusGeometry(f.a * 1.05, 1.5, 6, 14, Math.PI),
        this.mats.ice,
      );
      rib.position.set(cx, floor + 1.2, z);
      rib.castShadow = true;
      g.add(rib);

      // Icicles hanging off alternate ribs.
      if (((z / step) | 0) % 2 === 0) {
        for (let i = -2; i <= 2; i++) {
          if (i === 0) continue;
          const len = 1.1 + Math.abs(i) * 0.5;
          const ice = new THREE.Mesh(new THREE.ConeGeometry(0.3, len, 5), this.mats.ice);
          ice.position.set(
            cx + i * f.a * 0.38,
            floor + f.a * 0.92 - len * 0.5 - Math.abs(i) * 1.1,
            z,
          );
          ice.rotation.x = Math.PI;
          g.add(ice);
        }
      }
    }
  }

  private buildSegment(f: Feature): THREE.Group {
    const g = new THREE.Group();
    g.matrixAutoUpdate = false;
    switch (f.kind) {
      case "bridge":
        this.buildBridge(g, f);
        break;
      case "village":
        this.buildVillage(g, f);
        break;
      case "cave":
        this.buildCave(g, f);
        break;
      case "glacier":
        this.buildSeracs(g, f);
        break;
      case "park":
        this.buildParkRails(g, f);
        break;
      case "shortcut":
        this.buildMarkers(g, f);
        break;
      case "halfpipe":
        this.buildPipeFlags(g, f);
        break;
      case "forest":
        this.buildLift(g, f);
        break;
      case "tunnel":
        this.buildTunnel(g, f);
        break;
      case "open":
      case "kickers":
        if (f.a > 0.62) this.buildLift(g, f);
        break;
      default:
        break;
    }
    g.updateMatrix();
    return g;
  }

  // ───────────────────────────────────────────────────────────── bridge ────

  private buildBridge(g: THREE.Group, f: Feature) {
    const zc = f.a;
    const halfLen = f.b;
    const depth = f.c;
    const cx = this.gen.corridorCenter(zc);
    const deckY = this.gen.heightAt(cx, zc) + 0.35;

    const planks: THREE.BufferGeometry[] = [];
    const n = Math.floor((halfLen * 2) / 1.1);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const z = lerp(zc - halfLen, zc + halfLen, t);
      const y = this.gen.heightAt(cx, z);
      const plank = new THREE.BoxGeometry(15, 0.22, 0.85);
      plank.translate(0, Math.max(deckY, y + 0.3) - deckY, z - zc);
      planks.push(plank);
    }
    // Rails.
    for (const side of [-1, 1]) {
      const rail = new THREE.BoxGeometry(0.28, 0.28, halfLen * 2);
      rail.translate(side * 7.2, 1.05, 0);
      planks.push(rail);
      for (let i = 0; i < 10; i++) {
        const post = new THREE.BoxGeometry(0.26, 1.15, 0.26);
        post.translate(side * 7.2, 0.55, lerp(-halfLen, halfLen, i / 9));
        planks.push(post);
      }
    }
    // Trusses dropping into the chasm.
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) / 4;
      const z = lerp(-halfLen * 0.8, halfLen * 0.8, t);
      for (const side of [-1, 1]) {
        const beam = new THREE.BoxGeometry(0.3, depth * 0.8, 0.3);
        beam.translate(side * 6.4, -depth * 0.4, z);
        planks.push(beam);
      }
      const cross = new THREE.BoxGeometry(13.5, 0.26, 0.26);
      cross.translate(0, -depth * 0.55, z);
      planks.push(cross);
    }

    g.add(this.mesh(planks, this.mats.wood, cx, deckY, zc, true));
  }

  // ──────────────────────────────────────────────────────────── village ────

  private buildVillage(g: THREE.Group, f: Feature) {
    const zc = (f.z0 + f.z1) * 0.5;
    const cx = this.gen.corridorCenter(zc);
    const hw = this.gen.corridorHalfWidth(zc);
    const shelfX = cx + f.side * hw * 0.85;

    const walls: THREE.BufferGeometry[] = [];
    const roofs: THREE.BufferGeometry[] = [];
    const windows: THREE.BufferGeometry[] = [];

    const count = 4 + Math.floor(f.b * 3);
    for (let i = 0; i < count; i++) {
      const [a0, a1, a2] = hash2v(f.seg * 91 + i, 17, this.gen.seed);
      const bx = shelfX + (a0 - 0.5) * 34;
      const bz = zc + (a1 - 0.5) * 90;
      const by = this.gen.heightAt(bx, bz);
      const w = lerp(4.5, 8, a2);
      const d = lerp(5, 9, a0);
      const h = lerp(3.2, 4.6, a1);

      const body = new THREE.BoxGeometry(w, h, d);
      body.translate(bx, by + h * 0.5, bz);
      walls.push(body);

      // A-frame roof from a rotated 3-sided cylinder — reads as a snowy gable.
      const roof = new THREE.CylinderGeometry(w * 0.78, w * 0.78, d * 1.12, 3, 1);
      roof.rotateZ(Math.PI / 2);
      roof.rotateY(Math.PI / 2);
      roof.rotateX(Math.PI / 2);
      roof.translate(bx, by + h + w * 0.28, bz);
      roofs.push(roof);

      const chimney = new THREE.BoxGeometry(0.7, 2.0, 0.7);
      chimney.translate(bx + w * 0.25, by + h + 1.4, bz - d * 0.2);
      walls.push(chimney);

      for (let k = 0; k < 2; k++) {
        const win = new THREE.BoxGeometry(1.05, 1.25, 0.12);
        win.translate(bx + (k - 0.5) * w * 0.5, by + h * 0.55, bz + d * 0.5 + 0.02);
        windows.push(win);
      }
    }

    // A fence line along the shelf edge.
    for (let i = 0; i < 18; i++) {
      const t = i / 17;
      const fz = zc + (t - 0.5) * 100;
      const fx = shelfX - f.side * 22;
      const fy = this.gen.heightAt(fx, fz);
      const post = new THREE.BoxGeometry(0.18, 1.4, 0.18);
      post.translate(fx, fy + 0.7, fz);
      walls.push(post);
    }

    g.add(this.mesh(walls, this.mats.wood, 0, 0, 0, true));
    g.add(this.mesh(roofs, this.mats.snow, 0, 0, 0, true));
    g.add(this.mesh(windows, this.mats.glow, 0, 0, 0, false));
  }

  // ─────────────────────────────────────────────────────────────── cave ────

  private buildCave(g: THREE.Group, f: Feature) {
    const zc = (f.z0 + f.z1) * 0.5;
    const cx = this.gen.corridorCenter(zc);
    const hw = this.gen.corridorHalfWidth(zc);
    const parts: THREE.BufferGeometry[] = [];

    // Three chunky ribs spanning the run — a rock tunnel you ride straight
    // through. The default torus already lies in the XY plane, so a half arc
    // is an arch across X with no rotation needed.
    const span = 52;
    const ribs = 3;
    const radius = Math.max(26, hw * 0.5);
    for (let i = 0; i < ribs; i++) {
      const t = i / (ribs - 1);
      const z = zc + (t - 0.5) * span;
      const y = this.gen.heightAt(cx, z);
      const arch = new THREE.TorusGeometry(radius, 5.5, 4, 14, Math.PI);
      arch.scale(1, 0.72, 1);
      arch.translate(cx, y - 2, z);
      parts.push(arch);
    }

    // Chunky rock buttresses either side of the mouth.
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const [a0, a1, a2] = hash2v(f.seg * 37 + i, side * 5, this.gen.seed);
        const bx = cx + side * (hw * 0.72 + a0 * 10);
        const bz = zc + (a1 - 0.5) * span;
        const by = this.gen.heightAt(bx, bz);
        const r = lerp(4, 9, a2);
        const blob = new THREE.IcosahedronGeometry(r, 0);
        blob.translate(bx, by + r * 0.25, bz);
        parts.push(blob);
      }
    }

    g.add(this.mesh(parts, this.mats.rock, 0, 0, 0, true));
  }

  // ───────────────────────────────────────────────────────────── seracs ────

  private buildSeracs(g: THREE.Group, f: Feature) {
    const parts: THREE.BufferGeometry[] = [];
    const zc = (f.z0 + f.z1) * 0.5;
    const cx = this.gen.corridorCenter(zc);
    const hw = this.gen.corridorHalfWidth(zc);
    for (let i = 0; i < 26; i++) {
      const [a0, a1, a2] = hash2v(f.seg * 131 + i, 61, this.gen.seed);
      const bx = cx + (a0 - 0.5) * hw * 2.1;
      const bz = f.z0 + a1 * SEGMENT_LENGTH;
      const by = this.gen.heightAt(bx, bz);
      const w = lerp(1.6, 4.4, a2);
      const h = lerp(2.5, 7.5, a0);
      const block = new THREE.BoxGeometry(w, h, w * lerp(0.6, 1.4, a1));
      block.rotateY(a1 * 3.14);
      block.rotateX((a2 - 0.5) * 0.3);
      block.translate(bx, by + h * 0.32, bz);
      parts.push(block);
    }
    g.add(this.mesh(parts, this.mats.ice, 0, 0, 0, true));
  }

  // ────────────────────────────────────────────────────────── park rails ────

  private buildParkRails(g: THREE.Group, f: Feature) {
    const metal: THREE.BufferGeometry[] = [];
    const wood: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 2; i++) {
      const [a0, a1] = hash2v(f.seg * 17 + i, 3, this.gen.seed);
      const z = f.z0 + 60 + i * 46;
      const cx = this.gen.corridorCenter(z);
      const hw = this.gen.corridorHalfWidth(z);
      const x = cx + (a0 < 0.5 ? -1 : 1) * hw * 0.62;
      const y = this.gen.heightAt(x, z);
      const len = lerp(14, 22, a1);

      const tube = new THREE.CylinderGeometry(0.18, 0.18, len, 8);
      tube.rotateX(Math.PI / 2);
      tube.translate(x, y + 1.15, z);
      metal.push(tube);

      for (let k = 0; k < 3; k++) {
        const t = k / 2;
        const pz = z + (t - 0.5) * len * 0.82;
        const py = this.gen.heightAt(x, pz);
        const leg = new THREE.CylinderGeometry(0.09, 0.09, 1.25, 6);
        leg.translate(x, py + 0.62, pz);
        metal.push(leg);
      }

      const box = new THREE.BoxGeometry(1.5, 0.7, len * 0.7);
      const bx = cx - (x - cx) * 0.35;
      const bz = z + 8;
      box.translate(bx, this.gen.heightAt(bx, bz) + 0.35, bz);
      wood.push(box);
    }
    g.add(this.mesh(metal, this.mats.metal, 0, 0, 0, true));
    g.add(this.mesh(wood, this.mats.wood, 0, 0, 0, true));
  }

  // ──────────────────────────────────────────────────────── trail markers ────

  private buildMarkers(g: THREE.Group, f: Feature) {
    const poles: THREE.BufferGeometry[] = [];
    const flags: THREE.BufferGeometry[] = [];
    const zc = (f.z0 + f.z1) * 0.5;
    const cx = this.gen.corridorCenter(zc);
    const hw = this.gen.corridorHalfWidth(zc);
    const chuteX = cx + f.side * (hw + 46);
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const z = f.z0 + 20 + t * (SEGMENT_LENGTH - 50);
      const x = lerp(cx + f.side * hw * 0.5, chuteX, t);
      const y = this.gen.heightAt(x, z);
      const pole = new THREE.CylinderGeometry(0.07, 0.07, 2.6, 5);
      pole.translate(x, y + 1.3, z);
      poles.push(pole);
      const flag = new THREE.BoxGeometry(0.9, 0.55, 0.05);
      flag.translate(x + 0.45, y + 2.2, z);
      flags.push(flag);
    }
    g.add(this.mesh(poles, this.mats.wood, 0, 0, 0, true));
    g.add(this.mesh(flags, this.mats.paint, 0, 0, 0, false));
  }

  private buildPipeFlags(g: THREE.Group, f: Feature) {
    const poles: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const z = f.z0 + 20 + t * (SEGMENT_LENGTH - 40);
      const cx = this.gen.corridorCenter(z);
      for (const side of [-1, 1]) {
        const x = cx + side * (f.a + 27);
        const y = this.gen.heightAt(x, z);
        const pole = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 5);
        pole.translate(x, y + 1.1, z);
        poles.push(pole);
      }
    }
    g.add(this.mesh(poles, this.mats.paint, 0, 0, 0, false));
  }

  // ───────────────────────────────────────────────── abandoned chairlift ────

  private buildLift(g: THREE.Group, f: Feature) {
    const metal: THREE.BufferGeometry[] = [];
    const side = f.side;
    const towers = 4;
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i < towers; i++) {
      const z = f.z0 + 18 + (i * (SEGMENT_LENGTH - 36)) / (towers - 1);
      const cx = this.gen.corridorCenter(z);
      const hw = this.gen.corridorHalfWidth(z);
      const x = cx + side * (hw * 0.95);
      const y = this.gen.heightAt(x, z);
      const h = 11 + ((i * 37) % 5);

      const mast = new THREE.CylinderGeometry(0.28, 0.42, h, 7);
      mast.translate(x, y + h * 0.5, z);
      metal.push(mast);

      const arm = new THREE.BoxGeometry(4.6, 0.3, 0.3);
      arm.translate(x - side * 1.9, y + h - 0.4, z);
      metal.push(arm);

      pts.push(new THREE.Vector3(x - side * 3.6, y + h - 0.6, z));
    }

    // Cable: a thin swept tube between tower tops with a little sag.
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const mid = a.clone().lerp(b, 0.5);
      mid.y -= 2.2;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const tube = new THREE.TubeGeometry(curve, 8, 0.075, 4, false);
      metal.push(tube);

      // A couple of chairs still hanging, slightly askew.
      for (let c = 1; c <= 2; c++) {
        const p = curve.getPoint(c / 3);
        const chair = new THREE.BoxGeometry(1.5, 0.16, 1.0);
        chair.rotateZ(((i + c) % 3) * 0.12 - 0.12);
        chair.translate(p.x, p.y - 1.7, p.z);
        metal.push(chair);
        const hanger = new THREE.CylinderGeometry(0.05, 0.05, 1.7, 4);
        hanger.translate(p.x, p.y - 0.85, p.z);
        metal.push(hanger);
      }
    }

    g.add(this.mesh(metal, this.mats.metal, 0, 0, 0, true));
  }

  // ──────────────────────────────────────────────────────────── plumbing ────

  private mesh(
    parts: THREE.BufferGeometry[],
    mat: THREE.Material,
    ox: number,
    oy: number,
    oz: number,
    shadows: boolean,
  ) {
    // `mergeGeometries` refuses to mix indexed and non-indexed sources, and the
    // primitives here are a mix (Icosahedron is non-indexed, Box/Tube are not),
    // so normalise everything to non-indexed first.
    const flat = parts.map((p) => (p.getIndex() ? p.toNonIndexed() : p));
    const merged = mergeGeometries(flat, false);
    for (let i = 0; i < parts.length; i++) {
      if (flat[i] !== parts[i]) flat[i].dispose();
      parts[i].dispose();
    }
    if (!merged) {
      // Should not happen, but a missing prop must never take the frame down.
      return new THREE.Mesh(new THREE.BufferGeometry(), mat);
    }
    merged.computeVertexNormals();
    ensureMatAttribute(merged);
    const m = new THREE.Mesh(merged, mat);
    m.position.set(ox, oy, oz);
    m.castShadow = shadows;
    m.receiveShadow = false;
    m.matrixAutoUpdate = false;
    m.updateMatrix();
    return m;
  }

  dispose() {
    for (const g of this.segments.values()) disposeGroup(g);
    this.segments.clear();
    this.group.clear();
    for (const m of Object.values(this.mats)) m.dispose();
  }
}

function disposeGroup(g: THREE.Group) {
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) m.geometry.dispose();
  });
  g.clear();
}
