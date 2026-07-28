/**
 * Card thumbnails for the garage.
 *
 * A rider card that shows a name and four colour chips tells you nothing about
 * what you are picking. These render the actual thing.
 *
 * Two different jobs, two different methods:
 *
 * - **Boards** already have their artwork on a canvas — `makeBoardTexture`
 *   paints the topsheet — so the thumbnail is that canvas, straight out. No
 *   renderer, no cost.
 * - **Riders** need the rig, so they go through one shared offscreen
 *   `WebGLRenderer` that is created on first use and kept for the page. The
 *   same iOS context-cap reasoning as `core/renderer.ts`: one context, reused,
 *   never disposed per card.
 *
 * Results are cached by id, and rendering is deliberately one-per-frame at the
 * call site so opening the garage doesn't stall on twenty rig builds.
 */

import * as THREE from "three";
import type { Rider } from "../data/riders";
import type { Board } from "../data/boards";
import { makeBoardTexture } from "../player/BoardArt";
import { RiderRig } from "../player/RiderRig";
import { createWorldUniforms } from "../world/SnowMaterial";
import { RIDER_ART } from "./rider-art";

const riderCache = new Map<string, string>();
const boardCache = new Map<string, string>();

const W = 260;
const H = 300;

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let uniforms: ReturnType<typeof createWorldUniforms> | null = null;

function setup() {
  if (renderer && scene && camera && uniforms) return { renderer, scene, camera, uniforms };
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    // Required: without it the drawing buffer is cleared on composite and
    // `toDataURL` hands back a blank image. This renderer exists purely to be
    // read back, so the cost is the point.
    preserveDrawingBuffer: true,
  });
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(Math.min(2, (globalThis.devicePixelRatio || 1)));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  scene = new THREE.Scene();
  // Warm key, cool fill, cold rim — enough to read a silhouette against a
  // dark card without the figure going flat.
  scene.add(new THREE.HemisphereLight(0xd4e4ff, 0x2a2f38, 1.5));
  const key = new THREE.DirectionalLight(0xffe8cc, 2.6);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fc4ff, 1.6);
  rim.position.set(-4, 2, -5);
  scene.add(rim);

  camera = new THREE.PerspectiveCamera(26, W / H, 0.1, 40);
  camera.position.set(0, 1.06, 3.65);
  camera.lookAt(0, 0.8, 0);

  uniforms = createWorldUniforms();
  return { renderer, scene, camera, uniforms };
}

/**
 * The rider's card image.
 *
 * A roster rider has a painted portrait, and that is what goes on the card —
 * it says who they are in a way a 26mm render of the rig never will. Custom
 * riders have no portrait and never will, so they fall through to the rig,
 * which is also the right answer for them: the whole point of the creator is
 * seeing the thing you actually built. Cached by rider id.
 */
export function riderThumb(rider: Rider, board: Board): string {
  const portrait = RIDER_ART[rider.id];
  if (portrait) return portrait;

  const key = `${rider.id}:${board.id}`;
  const hit = riderCache.get(key);
  if (hit) return hit;

  const ctx = setup();
  const rig = new RiderRig(rider, board, ctx.uniforms);
  rig.poseStatic(0);
  // Angled so the face, the jacket front and the board are all readable.
  rig.group.rotation.y = -1.15;
  ctx.scene.add(rig.group);
  ctx.renderer.render(ctx.scene, ctx.camera);
  const url = ctx.renderer.domElement.toDataURL("image/png");
  ctx.scene.remove(rig.group);
  rig.dispose();

  riderCache.set(key, url);
  return url;
}

/**
 * The deck graphic itself, straight off the canvas that painted it — rotated
 * into landscape here rather than with a CSS transform, so the card doesn't
 * have to reason about a tall image inside a short box.
 */
export function boardThumb(board: Board): string {
  const hit = boardCache.get(board.id);
  if (hit) return hit;

  const tex = makeBoardTexture(board);
  const src = tex.image as HTMLCanvasElement;
  const out = document.createElement("canvas");
  out.width = src.height;
  out.height = src.width;
  const g = out.getContext("2d")!;
  g.translate(out.width / 2, out.height / 2);
  g.rotate(-Math.PI / 2);
  g.drawImage(src, -src.width / 2, -src.height / 2);
  const url = out.toDataURL("image/png");
  tex.dispose();

  boardCache.set(board.id, url);
  return url;
}
