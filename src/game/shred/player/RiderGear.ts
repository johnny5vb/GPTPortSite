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

let fabricTex: THREE.CanvasTexture | null = null;

/**
 * A tiling weave. Used as a bump map on cloth so a jacket stops reading as a
 * solid-colour plastic shape — it is a small change that does more for
 * perceived quality than any amount of extra geometry.
 */
export function fabricTexture(): THREE.CanvasTexture {
  if (fabricTex) return fabricTex;
  const S = 128;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, S, S);

  // Weave: alternating warp and weft, then noise on top for the fibres.
  const img = g.getImageData(0, 0, S, S);
  const d = img.data;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const warp = Math.sin((x / S) * Math.PI * 2 * 32) * 6;
      const weft = Math.sin((y / S) * Math.PI * 2 * 32) * 6;
      const grain = (Math.random() - 0.5) * 22;
      const v = 128 + warp + weft + grain;
      d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, v));
      d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);

  fabricTex = new THREE.CanvasTexture(c);
  fabricTex.wrapS = fabricTex.wrapT = THREE.RepeatWrapping;
  fabricTex.repeat.set(3, 3);
  fabricTex.anisotropy = 4;
  return fabricTex;
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

export function buildHair(
  kit: GearKit,
  style: HairStyle,
  color: string,
  covered: boolean,
): HairParts {
  const group = new THREE.Group();
  if (style === "none") return { group };
  const hair = kit.mat(color, { roughness: 0.92, flatShading: false });

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
      if (!covered) crown(0.106);
      else fringe();
      nape();
      break;
    case "shag": {
      if (!covered) crown(0.112);
      else fringe();
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
      if (!covered) crown(0.104);
      else fringe();
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
      if (!covered) crown(0.108);
      else fringe();
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
export function buildJacket(
  kit: GearKit,
  app: Appearance,
  s: BuildScale,
): THREE.Group {
  const g = new THREE.Group();
  const main = kit.cloth(app.jacketColor, { roughness: 0.88, flatShading: false });
  const alt = kit.cloth(app.jacketAlt, { roughness: 0.86, flatShading: false });
  const trim = kit.mat(app.accent, { roughness: 0.6, flatShading: false });
  const w = s.girth;

  /**
   * A body volume as an explicit box of dimensions rather than a rotated
   * capsule. Depth is front-to-back (+X is the face), width is shoulder to
   * shoulder (±Z). Getting this the wrong way round buries the arms inside the
   * torso, which is exactly what a rotated capsule did here first time.
   */
  const blob = (
    mat: THREE.Material,
    y: number,
    depth: number,
    height: number,
    width: number,
  ) => {
    const m = kit.mesh(new THREE.SphereGeometry(1, 22, 16), mat, 0, y, 0);
    m.scale.set(depth, height, width);
    g.add(m);
    return m;
  };

  // Arms hang at |z| = 0.165, so nothing on the torso may exceed that.
  const HALF_W = 0.152;

  // Shoulders are shared by every style — the sleeves hang off them.
  const shoulders = kit.capsule(0.092 * s.shoulder, 0.24 * s.shoulder, main, 0, 0.44, 0);
  shoulders.rotation.x = Math.PI / 2;
  g.add(shoulders);

  const collar = kit.mesh(new THREE.SphereGeometry(1, 18, 12), alt, 0, 0.495, 0);
  collar.scale.set(0.084 * w, 0.036, 0.096 * w);
  g.add(collar);

  switch (app.jacket) {
    case "puffy": {
      // Five baffles, widest at the chest, tapering to the hem. Each one is a
      // squashed sphere, so the depth and width are stated rather than implied.
      const bands: [number, number, number][] = [
        [0.105, 0.116, 0.052],
        [0.195, 0.122, 0.05],
        [0.28, 0.126, 0.05],
        [0.36, 0.121, 0.046],
        [0.428, 0.106, 0.04],
      ];
      bands.forEach(([y, depth, height], i) => {
        const width = Math.min(HALF_W, depth * 1.24) * w;
        blob(i === 2 ? alt : main, y, depth * w, height, width);
      });
      // A vertical zip placket so the bands read as a garment, not as rings.
      const zip = kit.mesh(new THREE.BoxGeometry(0.022, 0.35, 0.026), trim, 0.108 * w, 0.27, 0);
      g.add(zip);
      break;
    }
    case "shell": {
      blob(main, 0.29, 0.118 * w, 0.15, 0.146 * w);
      blob(main, 0.14, 0.124 * w, 0.075, 0.15 * w);
      blob(alt, 0.345, 0.12 * w, 0.036, 0.146 * w);
      // Chest pocket + hem drawcord: small, but they scale the figure.
      const pocket = kit.mesh(new THREE.BoxGeometry(0.016, 0.05, 0.07), alt, 0.112 * w, 0.35, 0.05);
      g.add(pocket);
      const cord = kit.mesh(new THREE.TorusGeometry(0.128 * w, 0.008, 6, 22), trim, 0, 0.086, 0);
      cord.rotation.x = Math.PI / 2;
      cord.scale.set(1, 1, 1.16);
      g.add(cord);
      break;
    }
    case "anorak": {
      blob(main, 0.29, 0.12 * w, 0.16, 0.148 * w);
      blob(main, 0.14, 0.126 * w, 0.07, 0.152 * w);
      // Kangaroo pocket across the belly — a flattened patch, not a lump.
      const pouch = kit.mesh(new THREE.SphereGeometry(1, 18, 14), alt, 0.062 * w, 0.185, 0);
      pouch.scale.set(0.072 * w, 0.056, 0.118 * w);
      g.add(pouch);
      // Contrast yoke across the chest and a half zip down to it.
      blob(alt, 0.395, 0.117 * w, 0.045, 0.145 * w);
      const zip = kit.mesh(new THREE.BoxGeometry(0.018, 0.16, 0.024), trim, 0.11 * w, 0.35, 0);
      g.add(zip);
      break;
    }
    case "vest": {
      // A hoodie underneath in the alt colour...
      blob(alt, 0.29, 0.108 * w, 0.16, 0.132 * w);
      const hoodLump = kit.mesh(new THREE.SphereGeometry(0.082, 16, 12), alt, -0.082 * w, 0.47, 0);
      hoodLump.scale.set(0.8, 0.85, 1.05);
      g.add(hoodLump);
      // ...with a sleeveless puffy over the top, narrower so the sleeves show.
      const bands: [number, number][] = [
        [0.165, 0.122],
        [0.25, 0.126],
        [0.335, 0.12],
      ];
      bands.forEach(([y, depth]) => {
        blob(main, y, depth * w, 0.05, Math.min(0.138, depth * 1.14) * w);
      });
      const zip = kit.mesh(new THREE.BoxGeometry(0.022, 0.24, 0.024), trim, 0.108 * w, 0.25, 0);
      g.add(zip);
      break;
    }
    case "onesie": {
      // One continuous volume from chest to hip, with a belt and a chevron —
      // the '90s one-piece read.
      blob(main, 0.3, 0.116 * w, 0.17, 0.144 * w);
      blob(main, 0.13, 0.118 * w, 0.09, 0.14 * w);
      blob(alt, 0.165, 0.12 * w, 0.022, 0.142 * w);
      const buckle = kit.mesh(new THREE.BoxGeometry(0.022, 0.036, 0.05), trim, 0.112 * w, 0.165, 0);
      g.add(buckle);
      // Chevron across the chest.
      for (const dir of [-1, 1]) {
        const bar = kit.mesh(new THREE.BoxGeometry(0.02, 0.032, 0.11), alt, 0.104 * w, 0.34, dir * 0.05);
        bar.rotation.x = dir * 0.5;
        g.add(bar);
      }
      break;
    }
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
