"use client";

/**
 * A small turntable of one rider, used by the character creator.
 *
 * It runs its own tiny renderer rather than reusing the game's: the creator is
 * a menu, the game may not even be built yet, and a 260px canvas that only
 * draws one rig costs almost nothing. The rig is rebuilt whenever the
 * appearance changes, which is exactly what you want here — every option flip
 * should be visible immediately.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Appearance } from "../data/appearance";
import { RIDERS } from "../data/riders";
import { boardById } from "../data/boards";
import { RiderRig } from "../player/RiderRig";
import { createWorldUniforms } from "../world/SnowMaterial";

/**
 * One renderer for the whole page, reparented on mount.
 *
 * iOS caps the number of live WebGL contexts and does not reliably release
 * them, so building a fresh renderer every time the creator opens is the same
 * bug the game itself had (see `core/renderer.ts`). Open and close the creator
 * six times on an iPhone and the seventh would come back blank.
 */
let shared: { renderer: THREE.WebGLRenderer } | null = null;

function acquirePreviewRenderer() {
  if (shared) return shared.renderer;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  shared = { renderer };
  return renderer;
}

/** The game is already drawing behind this panel; 30fps is plenty here. */
const PREVIEW_INTERVAL = 1 / 30;

export function RiderPreview({
  appearance,
  board,
  height = 300,
  /** Which part of the rider to frame. */
  framing = "full",
}: {
  appearance: Appearance;
  board: string;
  height?: number;
  framing?: "full" | "head";
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<RiderRig | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const uniformsRef = useRef(createWorldUniforms());
  // Framing is read by the render loop rather than being an effect dependency:
  // making it one tore the renderer down and rebuilt it without the rig, so
  // switching tabs emptied the preview.
  const framingRef = useRef(framing);
  framingRef.current = framing;

  // Renderer, scene and loop: created once and kept for the panel's lifetime.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = acquirePreviewRenderer();
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 60);
    // Three lights is enough to read a silhouette: a warm key, a cool fill and
    // a rim that separates a dark jacket from a dark panel.
    scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x2a2f38, 1.5));
    const key = new THREE.DirectionalLight(0xffe8cc, 2.4);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9fc4ff, 1.5);
    rim.position.set(-4, 2, -4);
    scene.add(rim);

    const pivot = new THREE.Group();
    scene.add(pivot);
    (scene as THREE.Scene & { userData: { pivot: THREE.Group } }).userData.pivot = pivot;

    let raf = 0;
    let t = 0;
    let acc = 0;
    let last = performance.now();
    const resize = () => {
      const w = host.clientWidth || 260;
      const h = host.clientHeight || height;
      renderer.setSize(w, h, false);
      cam.aspect = w / Math.max(1, h);
      cam.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      acc += dt;
      if (acc < PREVIEW_INTERVAL) return;
      acc = 0;
      // A slow sweep rather than a full spin. The rig is built facing +X, so
      // -PI/2 is head-on; staying either side of that keeps the face — the part
      // you are actually editing — visible the whole time.
      pivot.rotation.y = -Math.PI / 2 + Math.sin(t * 0.45) * 0.6;
      rigRef.current?.poseStatic(t);
      const head = framingRef.current === "head";
      cam.position.set(0, head ? 1.56 : 1.02, head ? 1.05 : 3.25);
      cam.lookAt(0, head ? 1.53 : 0.84, 0);
      renderer.render(scene, cam);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      rigRef.current?.dispose();
      rigRef.current = null;
      // The renderer is shared and deliberately survives; only detach it.
      renderer.domElement.remove();
      sceneRef.current = null;
    };
  }, [height]);

  // Rebuild the rig whenever the outfit or the deck changes.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const pivot = (scene.userData as { pivot?: THREE.Group }).pivot;
    if (!pivot) return;

    rigRef.current?.dispose();
    const rider = { ...RIDERS[0], appearance };
    const rig = new RiderRig(rider, boardById(board), uniformsRef.current);
    // The rest pose leaves the deck at the origin; drop it under the boots so
    // the preview reads as someone standing on a board.
    rig.group.position.y = -0.05;
    rig.poseStatic(0);
    pivot.clear();
    pivot.add(rig.group);
    rigRef.current = rig;
  }, [appearance, board]);

  return (
    <div
      ref={hostRef}
      className="sh-preview"
      style={{ height, width: "100%" }}
      aria-hidden="true"
    />
  );
}
