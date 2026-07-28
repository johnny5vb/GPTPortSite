/**
 * Gear builders for the rider rig.
 *
 * The rig can't sell a human face, so this file is the other half of the plan:
 * put real equipment in front of the parts that don't hold up. A helmet takes
 * the skull, goggles take the eyes, a gaiter takes the mouth and jaw, and a
 * baffled jacket takes the torso — and what's left is silhouette, layering and
 * colour, which is exactly what procedural geometry is good at.
 *
 * Everything here returns a `THREE.Group` positioned in the coordinate frame of
 * whatever node it attaches to. Head-local space is: +X forward (the face),
 * +Y up, ±Z the ears.
 */

import * as THREE from "three";
import type {
  Appearance,
  Eyewear,
  FaceGear,
  HairStyle,
  HandsStyle,
  Headwear,
} from "../data/appearance";

/** Everything a builder needs from the rig, without reaching into it. */
export interface GearKit {
  mat(color: string, opts?: THREE.MeshStandardMaterialParameters): THREE.Material;
  cloth(color: string, opts?: THREE.MeshStandardMaterialParameters): THREE.Material;
  mesh(
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x?: number,
    y?: number,
    z?: number,
  ): THREE.Mesh;
  capsule(
    radius: number,
    length: number,
    mat: THREE.Material,
    x?: number,
    y?: number,
    z?: number,
  ): THREE.Mesh;
}

// ───────────────────────────────────────────────────────── fabric texture ────


/**
 * A tiling weave. Used as a bump map on cloth so a jacket stops reading as a
 * solid-colour plastic shape — it is a small change that does more for
 * perceived quality than any amount of extra geometry.
 */
/**
 * Technical fabric, as a normal map and a roughness map.
 *
 * The old version was a 128px greyscale bump of two sine waves. At any distance
 * you could actually see a rider from, it was invisible — which is what makes a
 * jacket read as painted plastic rather than as cloth.
 *
 * What sells snow gear specifically is not the weave, which is far too fine to
 * resolve: it is the **ripstop grid**, the coarse reinforcement squares every
 * few millimetres that catch light along their edges. So that is drawn at a
 * scale you can see, with the weave and fibre noise underneath it for the
 * surface to sit on.
 *
 * A roughness map comes out of the same pass. Uniform roughness is the other
 * half of the plastic look: real shell fabric is duller in the weave and
 * shinier along the ripstop threads, and that variation is what makes a
 * highlight travel across it instead of sitting on it.
 *
 * Both are seamless — the grids divide the tile exactly and the noise is
 * generated on a torus — so `RepeatWrapping` can't show a seam.
 */
let fabricNormalTex: THREE.CanvasTexture | null = null;
let fabricRoughTex: THREE.CanvasTexture | null = null;

function buildFabricMaps() {
  const S = 512;
  /** Ripstop squares per tile, and weave threads per tile. Both divide S. */
  const RIP = 16;
  const WEAVE = 128;

  // Height field first; the normal map is its gradient.
  const h = new Float32Array(S * S);
  const rough = new Float32Array(S * S);
  const hash = (x: number, y: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = y * S + x;

      // Weave: over-under, which is two half-phase-offset square-ish waves.
      const wx = Math.sin((x / S) * Math.PI * 2 * WEAVE);
      const wy = Math.sin((y / S) * Math.PI * 2 * WEAVE + Math.PI * 0.5);
      let v = (wx + wy) * 0.16;

      // Ripstop: a raised thread every RIP squares, in both directions. The
      // thread is a couple of texels wide and stands proud of the weave.
      const px = ((x % (S / RIP)) / (S / RIP)) * 2 - 1;
      const py = ((y % (S / RIP)) / (S / RIP)) * 2 - 1;
      const ripX = Math.exp(-px * px * 220);
      const ripY = Math.exp(-py * py * 220);
      const rip = Math.max(ripX, ripY);
      v += rip * 0.85;

      // Fibre noise, wrapped so the tile stays seamless.
      v += (hash(x % S, y % S) - 0.5) * 0.16;

      h[i] = v;
      // Duller in the weave, brighter along the ripstop threads, with a slow
      // wander so a highlight has something to break up on.
      const wander = Math.sin((x / S) * Math.PI * 2 * 3 + (y / S) * Math.PI * 2 * 2) * 0.5 + 0.5;
      rough[i] = 0.94 - rip * 0.3 - wander * 0.07;
    }
  }

  const nc = document.createElement("canvas");
  nc.width = nc.height = S;
  const ng = nc.getContext("2d")!;
  const nimg = ng.createImageData(S, S);
  const rc = document.createElement("canvas");
  rc.width = rc.height = S;
  const rg = rc.getContext("2d")!;
  const rimg = rg.createImageData(S, S);

  const at = (x: number, y: number) => h[((y + S) % S) * S + ((x + S) % S)];
  const STRENGTH = 2.6;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      // Sobel, wrapped — the same reason the terrain maps use one.
      const dx =
        at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) -
        (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1));
      const dy =
        at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) -
        (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1));
      let nx = -dx * STRENGTH;
      let ny = -dy * STRENGTH;
      const nz = 1;
      const inv = 1 / Math.hypot(nx, ny, nz);
      nx *= inv;
      ny *= inv;
      nimg.data[i] = (nx * 0.5 + 0.5) * 255;
      nimg.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      nimg.data[i + 2] = nz * inv * 255;
      nimg.data[i + 3] = 255;

      const r = Math.max(0, Math.min(1, rough[y * S + x])) * 255;
      rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = r;
      rimg.data[i + 3] = 255;
    }
  }
  ng.putImageData(nimg, 0, 0);
  rg.putImageData(rimg, 0, 0);

  const mk = (canvas: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    // Roughly square on the body: the torso UV runs 0..1 around the ring and
    // 0..1 up, over surfaces of similar size, so an even repeat keeps the
    // ripstop grid square. Uneven repeats turn it into corduroy.
    t.repeat.set(6, 6);
    t.anisotropy = 8;
    return t;
  };
  fabricNormalTex = mk(nc);
  fabricRoughTex = mk(rc);
}

export function fabricNormal(): THREE.CanvasTexture {
  if (!fabricNormalTex) buildFabricMaps();
  return fabricNormalTex!;
}

export function fabricRoughness(): THREE.CanvasTexture {
  if (!fabricRoughTex) buildFabricMaps();
  return fabricRoughTex!;
}

// ───────────────────────────────────────────────────────────────── build ────

export interface BuildScale {
  /** Torso and limb girth. */
  girth: number;
  /** Shoulder width. */
  shoulder: number;
  /** Overall height. */
  height: number;
}

export function buildScale(b: Appearance["build"]): BuildScale {
  switch (b) {
    case "slim":
      return { girth: 0.9, shoulder: 0.93, height: 1.03 };
    case "stocky":
      return { girth: 1.14, shoulder: 1.1, height: 0.96 };
    default:
      return { girth: 1, shoulder: 1, height: 1 };
  }
}

/** Does this headwear cover the crown, so hair should only show at the edges? */
export function coversCrown(h: Headwear): boolean {
  return h !== "none";
}

// ────────────────────────────────────────────────────────────────── hair ────

export interface HairParts {
  group: THREE.Group;
  /** Ponytails, braids and locs swing; the node they hang from. */
  tail?: THREE.Group;
}

/**
 * Hair, as a surface.
 *
 * Hair on a procedural rig is never going to be strands, so the job is to make
 * a *shell* read as hair rather than as a painted scalp. Two things do that and
 * nothing else really does: a strong directional grain running root-to-tip, and
 * a sheen band — hair is one of the few everyday materials with a visibly
 * anisotropic highlight, and a uniform matte dome is unmistakably not it.
 *
 * So: a normal map of fine strands, and a roughness map that runs a brighter
 * band through the middle of them. Same trick as the fabric, different axis.
 */
let hairNormalTex: THREE.CanvasTexture | null = null;
let hairRoughTex: THREE.CanvasTexture | null = null;

function buildHairMaps() {
  const S = 256;
  const nc = document.createElement("canvas");
  nc.width = nc.height = S;
  const rc = document.createElement("canvas");
  rc.width = rc.height = S;
  const ng = nc.getContext("2d")!;
  const rg = rc.getContext("2d")!;
  const nimg = ng.createImageData(S, S);
  const rimg = rg.createImageData(S, S);

  // Strand centres, wrapped so the tile is seamless across u.
  const STRANDS = 46;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      // Where we sit across the nearest strand, -1..1. A little wander down
      // the length so strands aren't dead straight.
      const wander = Math.sin((y / S) * Math.PI * 2 * 2.3 + x * 0.11) * 1.4;
      const u = ((x + wander) / S) * STRANDS;
      const across = (u - Math.floor(u)) * 2 - 1;
      // A rounded strand: the normal sweeps across it.
      const nx = across * Math.sqrt(Math.max(0, 1 - across * across)) * 1.9;
      const inv = 1 / Math.hypot(nx, 0, 1);
      nimg.data[i] = (nx * inv * 0.5 + 0.5) * 255;
      nimg.data[i + 1] = 0.5 * 255;
      nimg.data[i + 2] = inv * 255;
      nimg.data[i + 3] = 255;

      // Sheen: smoother along the crest of each strand, and a slow band down
      // the length so the highlight travels rather than covering everything.
      const crest = 1 - Math.min(1, Math.abs(across) * 2.2);
      const band = Math.sin((y / S) * Math.PI * 2 + 1.2) * 0.5 + 0.5;
      const r = 0.86 - crest * 0.34 - band * 0.1;
      rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = Math.max(0, Math.min(1, r)) * 255;
      rimg.data[i + 3] = 255;
    }
  }
  ng.putImageData(nimg, 0, 0);
  rg.putImageData(rimg, 0, 0);

  const mk = (canvas: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    t.anisotropy = 8;
    return t;
  };
  hairNormalTex = mk(nc);
  hairRoughTex = mk(rc);
}

export function hairNormal(): THREE.CanvasTexture {
  if (!hairNormalTex) buildHairMaps();
  return hairNormalTex!;
}

export function hairRoughness(): THREE.CanvasTexture {
  if (!hairRoughTex) buildHairMaps();
  return hairRoughTex!;
}

export function buildHair(
  kit: GearKit,
  style: HairStyle,
  color: string,
  covered: boolean,
): HairParts {
  const group = new THREE.Group();
  if (style === "none") return { group };
  const hair = kit.mat(color, {
    roughness: 0.74,
    flatShading: false,
    normalMap: hairNormal(),
    normalScale: new THREE.Vector2(1.1, 1.1),
    roughnessMap: hairRoughness(),
  });

  /** The part that sits on the skull. Skipped entirely under a hat. */
  const crown = (r: number, yScale = 1) => {
    const m = kit.mesh(
      new THREE.SphereGeometry(r, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62),
      hair,
      -0.004,
      0.045,
      0,
    );
    m.scale.set(0.92, 1.04 * yScale, 1.0);
    group.add(m);
    return m;
  };

  /**
   * Strands over the crown.
   *
   * A dome is a dome however it's shaded — what stops it reading as a swim cap
   * is an outline with pieces in it. These are tapered slabs laid over the
   * skull, each rotated a little differently, so the silhouette breaks up and
   * the light has edges to catch.
   */
  const strands = (count: number, len: number, spread: number, seed = 1) => {
    for (let i = 0; i < count; i++) {
      const t = i / count;
      // Deterministic scatter — the same rider must build the same head twice.
      const h1 = Math.abs(Math.sin((i + seed) * 12.9898) * 43758.5453) % 1;
      const h2 = Math.abs(Math.sin((i + seed) * 78.233) * 12345.6789) % 1;
      const yaw = t * Math.PI * 2 + (h1 - 0.5) * 0.5;
      const tilt = 0.5 + h2 * spread;
      const l = len * (0.72 + h1 * 0.55);

      const geo = new THREE.CylinderGeometry(0.02, 0.006, l, 5, 1);
      geo.translate(0, -l * 0.5, 0);
      const m = kit.mesh(geo, hair, 0, 0.1, 0);
      m.scale.set(1, 1, 2.1);
      m.rotation.order = "YXZ";
      m.rotation.y = yaw;
      m.rotation.x = tilt;
      m.position.set(
        Math.cos(yaw) * 0.052 * Math.sin(tilt),
        0.095 - Math.cos(tilt) * 0.02,
        Math.sin(yaw) * 0.052 * Math.sin(tilt),
      );
      group.add(m);
    }
  };

  /** Hair escaping under the front brim of a hat — the detail that makes
   *  headwear look worn rather than pasted on. */
  const fringe = () => {
    const f = kit.mesh(new THREE.SphereGeometry(0.062, 14, 10), hair, 0.058, 0.03, 0);
    f.scale.set(0.6, 0.42, 1.16);
    group.add(f);
  };

  /** Hair at the nape, visible under everything except a full helmet. */
  const nape = (len = 0.05) => {
    const n = kit.mesh(new THREE.SphereGeometry(0.078, 14, 10), hair, -0.052, 0.0, 0);
    n.scale.set(0.62, 0.9 + len * 4, 1.02);
    group.add(n);
  };

  let tail: THREE.Group | undefined;

  switch (style) {
    case "buzz":
      if (!covered) crown(0.101, 0.94);
      break;
    case "short":
      if (!covered) {
        crown(0.106);
        strands(11, 0.075, 0.5, 3);
      } else fringe();
      nape();
      break;
    case "shag": {
      if (!covered) {
        crown(0.112);
        strands(16, 0.13, 0.75, 7);
      } else fringe();
      nape(0.09);
      // Uneven flicks so the outline isn't a clean dome.
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const flick = kit.mesh(
          new THREE.SphereGeometry(0.036, 10, 8),
          hair,
          -0.02 + Math.cos(a) * 0.055,
          -0.005 - (i % 2) * 0.02,
          Math.sin(a) * 0.088,
        );
        flick.scale.set(0.9, 1.5, 0.9);
        flick.rotation.z = Math.cos(a) * 0.4;
        group.add(flick);
      }
      break;
    }
    case "ponytail": {
      if (!covered) {
        crown(0.104);
        strands(9, 0.06, 0.4, 11);
      } else fringe();
      tail = new THREE.Group();
      tail.position.set(-0.082, 0.03, 0);
      const band = kit.mesh(new THREE.TorusGeometry(0.024, 0.008, 6, 12), hair, 0, 0, 0);
      band.rotation.y = Math.PI / 2;
      tail.add(band);
      // Three tapering segments so it bends rather than swinging as a rod.
      let node: THREE.Object3D = tail;
      for (let i = 0; i < 3; i++) {
        const seg = new THREE.Group();
        seg.position.set(-0.02, -0.055, 0);
        const m = kit.capsule(0.032 - i * 0.006, 0.07, hair, -0.012, -0.045, 0);
        m.rotation.z = 0.45;
        seg.add(m);
        node.add(seg);
        node = seg;
      }
      group.add(tail);
      break;
    }
    case "braids": {
      if (!covered) crown(0.104);
      else fringe();
      tail = new THREE.Group();
      tail.position.set(-0.05, 0.02, 0);
      for (const side of [-1, 1]) {
        const braid = new THREE.Group();
        braid.position.set(0, 0, side * 0.072);
        let node: THREE.Object3D = braid;
        for (let i = 0; i < 4; i++) {
          const seg = new THREE.Group();
          seg.position.set(-0.008, -0.052, 0);
          // Beads read as a plait at this scale better than a twisted tube.
          const bead = kit.mesh(new THREE.SphereGeometry(0.026 - i * 0.003, 10, 8), hair, 0, -0.03, 0);
          bead.scale.set(1, 1.5, 1);
          seg.add(bead);
          node.add(seg);
          node = seg;
        }
        tail.add(braid);
      }
      group.add(tail);
      break;
    }
    case "locs": {
      if (!covered) {
        crown(0.108);
        strands(13, 0.1, 0.7, 17);
      } else fringe();
      tail = new THREE.Group();
      tail.position.set(-0.035, 0.035, 0);
      for (let i = 0; i < 7; i++) {
        const a = (i / 6 - 0.5) * 2.2;
        const loc = new THREE.Group();
        loc.position.set(-0.03 * Math.cos(a * 0.5), 0, Math.sin(a) * 0.078);
        let node: THREE.Object3D = loc;
        for (let s = 0; s < 3; s++) {
          const seg = new THREE.Group();
          seg.position.set(-0.006, -0.058, 0);
          seg.add(kit.capsule(0.017, 0.05, hair, 0, -0.035, 0));
          node.add(seg);
          node = seg;
        }
        tail.add(loc);
      }
      group.add(tail);
      break;
    }
    case "bun": {
      if (!covered) {
        crown(0.102);
        const bun = kit.mesh(new THREE.SphereGeometry(0.05, 14, 12), hair, -0.03, 0.15, 0);
        bun.scale.set(1, 0.9, 1);
        group.add(bun);
      } else {
        // A top knot can't sit on top of a hat, so it moves to the nape.
        fringe();
        const bun = kit.mesh(new THREE.SphereGeometry(0.046, 14, 12), hair, -0.088, 0.01, 0);
        bun.scale.set(0.9, 0.95, 1);
        group.add(bun);
      }
      break;
    }
    case "mohawk": {
      if (!covered) {
        // A fin along the crown, tallest in the middle.
        for (let i = 0; i < 7; i++) {
          const t = i / 6;
          const h = Math.sin(t * Math.PI) * 0.075 + 0.02;
          const fin = kit.mesh(
            new THREE.BoxGeometry(0.026, h, 0.03),
            hair,
            0.075 - t * 0.15,
            0.135 + h * 0.4,
            0,
          );
          fin.rotation.z = (0.5 - t) * 0.5;
          group.add(fin);
        }
      }
      break;
    }
  }
  return { group, tail };
}

// ────────────────────────────────────────────────────────────── headwear ────

export function buildHeadwear(
  kit: GearKit,
  kind: Headwear,
  color: string,
  accent: string,
): THREE.Group {
  const g = new THREE.Group();
  if (kind === "none") return g;

  const shell = kit.mat(color, {
    roughness: kind === "helmet" || kind === "visor-helmet" ? 0.3 : 0.95,
    flatShading: false,
  });
  const trim = kit.mat(accent, { roughness: 0.7, flatShading: false });

  /** A dome over the crown, shared by every hat. */
  const dome = (r: number, sweep: number, y: number, yScale: number) => {
    const m = kit.mesh(
      new THREE.SphereGeometry(r, 26, 18, 0, Math.PI * 2, 0, Math.PI * sweep),
      shell,
      0,
      y,
      0,
    );
    m.scale.set(0.98, yScale, 1.02);
    g.add(m);
    return m;
  };

  switch (kind) {
    case "helmet": {
      dome(0.114, 0.6, 0.045, 1.1);
      // Ear pads and a chin strap: the parts that stop a helmet reading as a bowl.
      for (const z of [-1, 1]) {
        const pad = kit.mesh(new THREE.SphereGeometry(0.044, 14, 10), shell, -0.006, 0.042, z * 0.094);
        pad.scale.set(0.72, 1.2, 0.6);
        g.add(pad);
      }
      const strap = kit.mesh(new THREE.TorusGeometry(0.088, 0.007, 6, 20), trim, 0.004, -0.005, 0);
      strap.rotation.y = Math.PI / 2;
      strap.scale.set(1, 1.15, 1);
      g.add(strap);
      // Vent ridge along the crown.
      for (let i = 0; i < 3; i++) {
        const v = kit.mesh(new THREE.BoxGeometry(0.05, 0.008, 0.016), trim, 0.03 - i * 0.045, 0.152 - i * 0.006, 0);
        g.add(v);
      }
      break;
    }
    case "visor-helmet": {
      // Full shell — the face is gone, which is exactly the point.
      const d = dome(0.118, 0.78, 0.04, 1.06);
      d.scale.set(1, 1.06, 1.04);
      const visorMat = kit.mat(accent, {
        roughness: 0.06,
        metalness: 0.9,
        envMapIntensity: 2.4,
        transparent: true,
        opacity: 0.92,
        flatShading: false,
      });
      const visor = kit.mesh(new THREE.SphereGeometry(0.113, 26, 18), visorMat, 0.026, 0.028, 0);
      visor.scale.set(0.86, 0.72, 1.02);
      g.add(visor);
      const lip = kit.mesh(new THREE.TorusGeometry(0.104, 0.011, 8, 22), shell, 0.012, 0.088, 0);
      lip.rotation.x = Math.PI / 2;
      lip.rotation.z = 0.12;
      g.add(lip);
      break;
    }
    case "beanie":
    case "pom-beanie": {
      const d = dome(0.117, 0.66, 0.04, 1.16);
      d.scale.set(0.99, 1.2, 1.03);
      // Rolled brim.
      const brim = kit.mesh(new THREE.TorusGeometry(0.101, 0.02, 8, 24), shell, 0, 0.074, 0);
      brim.rotation.x = Math.PI / 2;
      brim.scale.set(1, 1, 0.85);
      g.add(brim);
      if (kind === "pom-beanie") {
        const pom = kit.mesh(new THREE.SphereGeometry(0.046, 14, 12), trim, -0.01, 0.19, 0);
        pom.scale.set(1, 0.92, 1);
        g.add(pom);
      }
      break;
    }
    case "hood": {
      // Sits behind and around the head, open at the face.
      const h = kit.mesh(
        new THREE.SphereGeometry(0.145, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.72),
        shell,
        -0.03,
        0.015,
        0,
      );
      h.scale.set(1.0, 1.05, 1.02);
      g.add(h);
      // The opening: a ring pushed forward so the face reads as recessed.
      const rim = kit.mesh(new THREE.TorusGeometry(0.108, 0.024, 10, 24), shell, 0.05, 0.04, 0);
      rim.rotation.y = Math.PI / 2;
      rim.rotation.x = 0.22;
      rim.scale.set(1, 1.06, 1);
      g.add(rim);
      const cord = kit.mesh(new THREE.TorusGeometry(0.096, 0.006, 6, 20), trim, 0.052, 0.038, 0);
      cord.rotation.y = Math.PI / 2;
      cord.rotation.x = 0.22;
      g.add(cord);
      break;
    }
    case "cap": {
      const d = dome(0.108, 0.56, 0.05, 1.02);
      d.scale.set(0.96, 1.0, 1.0);
      // Curved brim, built as a flattened half-torus so it bends round the head.
      const brim = kit.mesh(
        new THREE.TorusGeometry(0.088, 0.03, 8, 20, Math.PI * 0.9),
        shell,
        0.052,
        0.076,
        0,
      );
      brim.rotation.x = Math.PI / 2;
      brim.rotation.z = Math.PI * 0.55;
      brim.scale.set(1, 1, 0.22);
      g.add(brim);
      const button = kit.mesh(new THREE.SphereGeometry(0.014, 8, 6), trim, -0.004, 0.152, 0);
      g.add(button);
      break;
    }
    case "bucket": {
      const d = dome(0.112, 0.58, 0.05, 0.98);
      d.scale.set(0.98, 0.92, 1.0);
      // A full brim that droops — a cone section reads better than a flat disc.
      const brim = kit.mesh(new THREE.ConeGeometry(0.178, 0.075, 28, 1, true), shell, 0, 0.098, 0);
      brim.rotation.x = Math.PI;
      g.add(brim);
      // A rolled edge, or the cone reads as a paper plate.
      const edge = kit.mesh(new THREE.TorusGeometry(0.176, 0.012, 8, 28), shell, 0, 0.062, 0);
      edge.rotation.x = Math.PI / 2;
      g.add(edge);
      const band = kit.mesh(new THREE.TorusGeometry(0.106, 0.012, 8, 24), trim, 0, 0.096, 0);
      band.rotation.x = Math.PI / 2;
      g.add(band);
      break;
    }
  }
  return g;
}

// ────────────────────────────────────────────────────────────── face gear ────

export function buildFaceGear(kit: GearKit, kind: FaceGear, color: string): THREE.Group {
  const g = new THREE.Group();
  if (kind === "none") return g;
  const cloth = kit.cloth(color, { roughness: 0.95, flatShading: false });

  switch (kind) {
    case "gaiter": {
      // A tube from the collarbone up over the chin, stopping under the eyes.
      const tube = kit.mesh(new THREE.CylinderGeometry(0.076, 0.066, 0.11, 20, 1, true), cloth, 0.006, -0.048, 0);
      g.add(tube);
      // The pulled-up top edge, bulging over the chin and nose but stopping
      // well below the eyes so the goggles still have something to sit on.
      const top = kit.mesh(new THREE.SphereGeometry(1, 18, 14), cloth, 0.018, -0.004, 0);
      top.scale.set(0.076, 0.048, 0.079);
      g.add(top);
      break;
    }
    case "bandana": {
      // A triangle across the nose and mouth with a knot behind.
      const face = kit.mesh(new THREE.SphereGeometry(0.084, 18, 12), cloth, 0.02, -0.005, 0);
      face.scale.set(0.92, 0.72, 0.9);
      g.add(face);
      const tie = kit.mesh(new THREE.TorusGeometry(0.082, 0.011, 6, 20), cloth, 0.006, 0.008, 0);
      tie.rotation.y = Math.PI / 2;
      tie.scale.set(1, 0.86, 1);
      g.add(tie);
      const knot = kit.mesh(new THREE.SphereGeometry(0.022, 8, 8), cloth, -0.078, 0.006, 0);
      g.add(knot);
      const tail = kit.capsule(0.012, 0.05, cloth, -0.086, -0.036, 0.01);
      tail.rotation.z = 0.5;
      g.add(tail);
      break;
    }
    case "balaclava": {
      // Covers everything but the eye port — the strongest concealer here, and
      // the reason NULL-9 and the backcountry riders read as clean.
      const shellMesh = kit.mesh(new THREE.SphereGeometry(0.101, 22, 16), cloth, 0, 0.045, 0);
      shellMesh.scale.set(0.93, 1.06, 1.0);
      g.add(shellMesh);
      const jaw = kit.mesh(new THREE.SphereGeometry(0.076, 16, 12), cloth, 0.026, 0.006, 0);
      jaw.scale.set(0.92, 0.84, 0.92);
      g.add(jaw);
      const neck = kit.mesh(new THREE.CylinderGeometry(0.062, 0.072, 0.09, 16, 1, true), cloth, 0, -0.075, 0);
      g.add(neck);
      break;
    }
  }
  return g;
}

// ─────────────────────────────────────────────────────────────── eyewear ────

export function buildEyewear(
  kit: GearKit,
  kind: Eyewear,
  lensColor: string,
  frameColor: string,
): THREE.Group {
  const g = new THREE.Group();
  if (kind === "none") return g;

  // A mirrored lens: low roughness, high env intensity and a touch of emissive
  // so it still catches light on a flat grey day.
  const lens = kit.mat(lensColor, {
    roughness: 0.05,
    metalness: 0.88,
    envMapIntensity: 2.4,
    emissive: new THREE.Color(lensColor).multiplyScalar(0.14),
    flatShading: false,
  });
  const frame = kit.mat(frameColor, { roughness: 0.55, flatShading: false });

  switch (kind) {
    case "sport": {
      const l = kit.mesh(new THREE.SphereGeometry(0.088, 26, 18), lens, 0.042, 0.055, 0);
      l.scale.set(0.85, 0.6, 1.26);
      g.add(l);
      const f = kit.mesh(new THREE.TorusGeometry(0.086, 0.013, 10, 26), frame, 0.03, 0.055, 0);
      f.rotation.y = Math.PI / 2;
      f.scale.set(1, 0.66, 1);
      g.add(f);
      strap(kit, g, frame, 0.055);
      break;
    }
    case "oversize": {
      const l = kit.mesh(new THREE.SphereGeometry(0.098, 26, 18), lens, 0.038, 0.056, 0);
      l.scale.set(0.86, 0.72, 1.24);
      g.add(l);
      const f = kit.mesh(new THREE.TorusGeometry(0.096, 0.017, 10, 28), frame, 0.024, 0.056, 0);
      f.rotation.y = Math.PI / 2;
      f.scale.set(1, 0.78, 1);
      g.add(f);
      strap(kit, g, frame, 0.056, 0.021);
      break;
    }
    case "retro": {
      // Twin round lenses in a thick frame — the '80s/'90s shape.
      for (const z of [-1, 1]) {
        const l = kit.mesh(new THREE.SphereGeometry(0.043, 18, 14), lens, 0.062, 0.055, z * 0.042);
        l.scale.set(0.6, 1, 1);
        g.add(l);
        const f = kit.mesh(new THREE.TorusGeometry(0.044, 0.013, 8, 20), frame, 0.05, 0.055, z * 0.042);
        f.rotation.y = Math.PI / 2;
        g.add(f);
      }
      const bridge = kit.mesh(new THREE.BoxGeometry(0.022, 0.016, 0.04), frame, 0.056, 0.055, 0);
      g.add(bridge);
      strap(kit, g, frame, 0.055, 0.014);
      break;
    }
    case "shades": {
      for (const z of [-1, 1]) {
        const l = kit.mesh(new THREE.BoxGeometry(0.024, 0.042, 0.062), lens, 0.056, 0.046, z * 0.038);
        l.rotation.z = -0.14;
        l.rotation.y = z * 0.18;
        g.add(l);
      }
      const bridge = kit.mesh(new THREE.BoxGeometry(0.018, 0.01, 0.03), frame, 0.064, 0.056, 0);
      g.add(bridge);
      for (const z of [-1, 1]) {
        const arm = kit.mesh(new THREE.BoxGeometry(0.09, 0.008, 0.008), frame, 0.008, 0.054, z * 0.066);
        g.add(arm);
      }
      break;
    }
  }
  return g;
}

function strap(kit: GearKit, g: THREE.Group, frame: THREE.Material, y: number, r = 0.017) {
  const s = kit.mesh(new THREE.TorusGeometry(0.119, r, 8, 26), frame, 0, y, 0);
  s.rotation.y = Math.PI / 2;
  s.scale.set(1, 0.76, 1);
  g.add(s);
  // The clip on the back of the strap.
  const clip = kit.mesh(new THREE.BoxGeometry(0.024, 0.032, 0.028), frame, -0.119, y, 0);
  g.add(clip);
}

// ──────────────────────────────────────────────────────────────── hands ────

export function buildHand(
  kit: GearKit,
  kind: HandsStyle,
  color: string,
  cuffColor: string,
): THREE.Group {
  const g = new THREE.Group();
  const glove = kit.cloth(color, { roughness: 0.8, flatShading: false });
  const cuffMat = kit.cloth(cuffColor, { roughness: 0.85, flatShading: false });

  switch (kind) {
    case "mitts": {
      const m = kit.mesh(new THREE.SphereGeometry(0.062, 16, 14), glove, 0, -0.555, 0.012);
      m.scale.set(0.82, 1.02, 1.2);
      g.add(m);
      const thumb = kit.capsule(0.02, 0.026, glove, 0.03, -0.542, -0.03);
      thumb.rotation.x = 0.5;
      g.add(thumb);
      const cuff = kit.mesh(new THREE.TorusGeometry(0.05, 0.014, 8, 18), cuffMat, 0, -0.502, 0);
      cuff.rotation.x = Math.PI / 2;
      g.add(cuff);
      break;
    }
    case "gloves": {
      const palm = kit.mesh(new THREE.SphereGeometry(0.052, 16, 14), glove, 0, -0.548, 0.008);
      palm.scale.set(0.78, 1, 1.08);
      g.add(palm);
      // Four short fingers read as a hand; individual joints do not, at this size.
      for (let i = 0; i < 4; i++) {
        const f = kit.capsule(0.0125, 0.026, glove, 0, -0.594, 0.03 - i * 0.02);
        g.add(f);
      }
      const thumb = kit.capsule(0.015, 0.022, glove, 0.028, -0.552, -0.036);
      thumb.rotation.x = 0.6;
      g.add(thumb);
      const cuff = kit.mesh(new THREE.TorusGeometry(0.048, 0.012, 8, 18), cuffMat, 0, -0.505, 0);
      cuff.rotation.x = Math.PI / 2;
      g.add(cuff);
      break;
    }
    case "gauntlets": {
      const m = kit.mesh(new THREE.SphereGeometry(0.06, 16, 14), glove, 0, -0.558, 0.012);
      m.scale.set(0.82, 1, 1.18);
      g.add(m);
      const thumb = kit.capsule(0.019, 0.024, glove, 0.03, -0.545, -0.03);
      thumb.rotation.x = 0.5;
      g.add(thumb);
      // A long flared cuff up the forearm — the piece that says "deep snow".
      const cuff = kit.mesh(
        new THREE.CylinderGeometry(0.072, 0.05, 0.1, 16, 1, true),
        cuffMat,
        0,
        -0.472,
        0,
      );
      g.add(cuff);
      const rim = kit.mesh(new THREE.TorusGeometry(0.071, 0.009, 8, 20), glove, 0, -0.522, 0);
      rim.rotation.x = Math.PI / 2;
      g.add(rim);
      break;
    }
  }
  return g;
}

// ─────────────────────────────────────────────────────────────── jacket ────

/**
 * The torso. Anchors are fixed so the pose code doesn't care which style is
 * on: pelvis at y=0, hem 0.13, chest 0.28, shoulders 0.44, collar 0.5.
 *
 * `puffy` is the one that matters most — a stack of horizontal baffles is the
 * single most recognisable shape in snow kit, and it breaks the torso's
 * outline into bands so it stops reading as one extruded blob.
 */
/**
 * The torso, as **one continuous lofted surface** from hip to shoulder.
 *
 * This used to be a stack of separate spheres — a hem blob, a chest blob, a
 * collar blob — and no amount of colour hid the fact that you could see where
 * each one ended. A body is one skin; the jacket style changes its *profile*,
 * not how many objects it is made of.
 *
 * Rings are elliptical (a torso is deeper than it is wide is wrong — it is
 * wider than it is deep) and their radius is modulated along the body: puffy
 * gets baffle ribs rolled into the surface, a shell stays smooth, an anorak
 * swells at the pouch. Colour is baked per-vertex so a contrast yoke or a belt
 * is a band in the same mesh rather than another object stuck on top.
 */
function torsoSurface(
  app: Appearance,
  s: BuildScale,
  main: THREE.Color,
  alt: THREE.Color,
): THREE.BufferGeometry {
  const RINGS = 46;
  const RADIAL = 22;
  const y0 = -0.06;
  const y1 = 0.5;
  const w = s.girth;

  // Half-depth (front-back) and half-width (shoulder-shoulder) up the body.
  const shape = (t: number): [number, number] => {
    const y = y0 + (y1 - y0) * t;
    // Waist in, chest out, shoulders wide — the base silhouette every cut shares.
    const base =
      0.088 + 0.03 * Math.sin(t * Math.PI * 0.92) + 0.022 * smoothstep01((t - 0.55) / 0.35);
    const taper = 1 - smoothstep01((t - 0.86) / 0.14) * 0.42; // neck
    let depth = base * taper;
    let width = (base * 1.24 + 0.012) * taper;

    switch (app.jacket) {
      case "puffy": {
        // Baffles: a ripple rolled into the radius. Continuous surface, ribbed
        // profile — which is what a down jacket actually is.
        const rib = Math.sin(t * Math.PI * 9.5) * 0.5 + 0.5;
        depth *= 1.06 + rib * 0.1;
        width *= 1.04 + rib * 0.07;
        break;
      }
      case "vest": {
        // Slab-sided over the chest, cut away at the shoulders for sleeves.
        const body = 1 - smoothstep01((t - 0.66) / 0.16);
        const rib = Math.sin(t * Math.PI * 7.5) * 0.5 + 0.5;
        depth *= 1 + body * (0.1 + rib * 0.09);
        width *= 1 + body * (0.05 + rib * 0.05);
        break;
      }
      case "anorak": {
        const pouch = Math.exp(-Math.pow((t - 0.3) / 0.13, 2));
        depth *= 1.03 + pouch * 0.16;
        width *= 1.02;
        break;
      }
      case "onesie":
        depth *= 0.99;
        width *= 0.99;
        break;
      default: // shell
        depth *= 1.0;
        width *= 1.0;
        break;
    }
    void y;
    return [depth * w, width * w];
  };

  // Where the second colour lands, per cut.
  const bandAt = (t: number) => {
    switch (app.jacket) {
      case "puffy":
        return t > 0.46 && t < 0.58 ? 1 : t > 0.9 ? 1 : 0;
      case "shell":
        return t > 0.6 && t < 0.7 ? 1 : t > 0.9 ? 1 : 0;
      case "anorak":
        return t > 0.66 ? 1 : 0;
      case "vest":
        return t > 0.66 ? 1 : 0;
      default:
        return t > 0.34 && t < 0.42 ? 1 : t > 0.9 ? 1 : 0;
    }
  };

  const pos: number[] = [];
  const col: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const c = new THREE.Color();

  for (let r = 0; r <= RINGS; r++) {
    const t = r / RINGS;
    const y = y0 + (y1 - y0) * t;
    const [depth, width] = shape(t);
    const band = bandAt(t);
    for (let a = 0; a <= RADIAL; a++) {
      const ang = (a / RADIAL) * Math.PI * 2;
      const cx = Math.cos(ang) * depth;
      const cz = Math.sin(ang) * width;
      pos.push(cx, y, cz);
      uv.push(a / RADIAL, t);
      c.copy(band ? alt : main);
      // Cheap ambient occlusion into the ribs and under the arms.
      const shade = 0.86 + 0.14 * Math.abs(Math.cos(ang * 1.0));
      col.push(c.r * shade, c.g * shade, c.b * shade);
    }
  }
  const per = RADIAL + 1;
  for (let r = 0; r < RINGS; r++) {
    for (let a = 0; a < RADIAL; a++) {
      const i0 = r * per + a;
      idx.push(i0, i0 + per, i0 + 1, i0 + 1, i0 + per, i0 + per + 1);
    }
  }
  // Cap the top so the neck opening isn't a hole.
  const capCentre = pos.length / 3;
  pos.push(0, y1, 0);
  uv.push(0.5, 1);
  c.copy(alt);
  col.push(c.r, c.g, c.b);
  for (let a = 0; a < RADIAL; a++) {
    const i0 = RINGS * per + a;
    idx.push(i0, capCentre, i0 + 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

const smoothstep01 = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

/**
 * The torso. Anchors are unchanged so the pose code doesn't care which cut is
 * on: the surface spans the pelvis to the collar, and only the small hard
 * pieces (buckles, pockets, a hood lump) are separate objects.
 */
export function buildJacket(
  kit: GearKit,
  app: Appearance,
  s: BuildScale,
): THREE.Group {
  const g = new THREE.Group();
  const main = new THREE.Color(app.jacketColor);
  const alt = new THREE.Color(app.jacketAlt);
  const trim = kit.mat(app.accent, { roughness: 0.6, flatShading: false });
  const w = s.girth;

  const skin = kit.cloth("#ffffff", { roughness: 0.88, vertexColors: true });
  g.add(kit.mesh(torsoSurface(app, s, main, alt), skin));

  // Shoulder caps: where the sleeve meets the body, so the join isn't a seam.
  const capMat = kit.cloth(app.jacket === "vest" ? app.jacketAlt : app.jacketColor, {
    roughness: 0.88,
  });
  for (const z of [-1, 1]) {
    const cap = kit.mesh(new THREE.SphereGeometry(1, 16, 12), capMat, 0, 0.44 * s.height, z * 0.15 * s.shoulder);
    cap.scale.set(0.062 * w, 0.07, 0.07 * w);
    g.add(cap);
  }

  // ── the edges of the garment ──────────────────────────────────────────────
  // A jacket that simply stops reads as a shape; a jacket with a hem, a collar
  // and a cuff reads as something someone put on. These are the three places
  // fabric is doubled over in real outerwear, and they are what the eye uses to
  // tell a coat from a shell of colour.
  const edge = kit.cloth(app.jacketAlt, { roughness: 0.86, flatShading: false });

  // Hem: a band around the bottom, slightly proud of the body.
  const hemProfile = app.jacket === "anorak" ? 0.098 : 0.104;
  const hem = kit.mesh(
    new THREE.CylinderGeometry(hemProfile * w * 1.3, hemProfile * w * 1.28, 0.032, 26, 1, true),
    edge,
    0,
    -0.028,
    0,
  );
  hem.scale.set(1, 1, 0.84);
  g.add(hem);

  // Collar: a short stand at the neck, open at the front so it doesn't read as
  // a ring floating under the chin.
  const collar = kit.mesh(
    new THREE.CylinderGeometry(0.072 * w, 0.079 * w, 0.062, 20, 1, true, Math.PI * 0.22, Math.PI * 1.56),
    edge,
    0,
    0.5,
    0,
  );
  collar.scale.set(1, 1, 0.9);
  g.add(collar);


  if (app.jacket !== "onesie") {
    const zip = kit.mesh(
      new THREE.BoxGeometry(0.012, app.jacket === "anorak" ? 0.16 : 0.34, 0.018),
      trim,
      0.112 * w,
      app.jacket === "anorak" ? 0.38 : 0.28,
      0,
    );
    g.add(zip);
  }

  switch (app.jacket) {
    case "vest": {
      const hoodLump = kit.mesh(new THREE.SphereGeometry(0.084, 16, 12), capMat, -0.088 * w, 0.46, 0);
      hoodLump.scale.set(0.82, 0.86, 1.06);
      g.add(hoodLump);
      break;
    }
    case "onesie": {
      const buckle = kit.mesh(new THREE.BoxGeometry(0.02, 0.034, 0.05), trim, 0.108 * w, 0.15, 0);
      g.add(buckle);
      for (const dir of [-1, 1]) {
        const bar = kit.mesh(new THREE.BoxGeometry(0.018, 0.03, 0.1), trim, 0.1 * w, 0.33, dir * 0.05);
        bar.rotation.x = dir * 0.5;
        g.add(bar);
      }
      break;
    }
    case "shell": {
      const pocket = kit.mesh(new THREE.BoxGeometry(0.014, 0.048, 0.066), trim, 0.108 * w, 0.32, 0.05);
      g.add(pocket);
      break;
    }
    default:
      break;
  }
  return g;
}

/** Waist and hips, drawn in whatever the pants are made of. */
export function buildPelvis(kit: GearKit, app: Appearance, s: BuildScale): THREE.Group {
  const g = new THREE.Group();
  const pantsMat = kit.cloth(app.pantsColor, { roughness: 0.93, flatShading: false });
  const alt = kit.cloth(app.jacketAlt, { roughness: 0.9, flatShading: false });
  const trim = kit.mat(app.accent, { roughness: 0.6, flatShading: false });

  const pelvis = kit.capsule(0.128 * s.girth, 0.1, pantsMat, 0, 0, 0);
  pelvis.scale.set(1.02, 1, 0.86);
  g.add(pelvis);

  // The bib front and its straps only exist where a jacket isn't already over
  // them. Drawing them under a puffy just pushes dark wedges out through the
  // baffles, which reads as broken rather than as layered.
  const bibVisible = app.jacket === "vest" || app.jacket === "shell";
  if (app.pants === "bib" && bibVisible) {
    const panel = kit.mesh(new THREE.SphereGeometry(1, 16, 12), pantsMat, 0.086 * s.girth, 0.2, 0);
    panel.scale.set(0.05, 0.09, 0.078);
    g.add(panel);
    for (const z of [-1, 1]) {
      const strapMesh = kit.mesh(new THREE.BoxGeometry(0.024, 0.3, 0.032), pantsMat, 0.104, 0.36, z * 0.056);
      strapMesh.rotation.z = -0.2;
      g.add(strapMesh);
      const clip = kit.mesh(new THREE.BoxGeometry(0.03, 0.028, 0.04), trim, 0.115, 0.27, z * 0.058);
      g.add(clip);
    }
  } else if (app.pants !== "bib") {
    // Sits just under the jacket hem, so it wants to be narrow and quiet.
    const beltMesh = kit.mesh(new THREE.SphereGeometry(1, 16, 12), trim, 0, 0.045, 0);
    beltMesh.scale.set(0.116 * s.girth, 0.016, 0.13 * s.girth);
    g.add(beltMesh);
  }
  return g;
}

/** One leg's worth of cloth, added to the thigh and shin nodes by the rig. */
export function pantsProfile(style: Appearance["pants"]) {
  switch (style) {
    case "baggy":
      return { thigh: 0.09, shin: 0.08, flare: 1.1 };
    case "cargo":
      return { thigh: 0.088, shin: 0.078, flare: 1.06 };
    case "bib":
      return { thigh: 0.086, shin: 0.075, flare: 1.04 };
    default:
      return { thigh: 0.076, shin: 0.066, flare: 1.0 };
  }
}

// ──────────────────────────────────────────────────────────────── boots ────

/** Boot, highback and two binding straps, as one unit under the shin. */
export function buildBoot(kit: GearKit, bootColor: string, accent: string): THREE.Group {
  const g = new THREE.Group();
  const shell = kit.cloth(bootColor, { roughness: 0.62, flatShading: false });
  const strapMat = kit.mat(accent, { roughness: 0.5, flatShading: false });

  // Ankle cuff into a foot: two volumes, not one capsule.
  const cuff = kit.capsule(0.062, 0.07, shell, 0, -0.3, 0);
  cuff.scale.set(1, 1, 1.05);
  g.add(cuff);

  const foot = kit.mesh(new THREE.SphereGeometry(0.072, 16, 12), shell, 0, -0.372, 0.022);
  foot.scale.set(0.92, 0.62, 1.5);
  g.add(foot);

  const toe = kit.mesh(new THREE.SphereGeometry(0.05, 14, 10), shell, 0, -0.382, 0.088);
  toe.scale.set(0.9, 0.55, 0.9);
  g.add(toe);

  // Highback: the plate behind the ankle you actually lean against.
  const high = kit.mesh(new THREE.CylinderGeometry(0.062, 0.058, 0.13, 14, 1, true, Math.PI * 0.62, Math.PI * 0.76), strapMat, 0, -0.312, 0);
  high.rotation.y = Math.PI / 2;
  g.add(high);

  // Ankle and toe straps.
  const ankle = kit.mesh(new THREE.BoxGeometry(0.15, 0.024, 0.05), strapMat, 0, -0.336, 0.012);
  g.add(ankle);
  const toeStrap = kit.mesh(new THREE.BoxGeometry(0.13, 0.02, 0.042), strapMat, 0, -0.372, 0.082);
  toeStrap.rotation.x = -0.3;
  g.add(toeStrap);

  return g;
}
