/**
 * Renderer acquisition and capability probing.
 *
 * Two things here exist specifically because of Safari / iOS:
 *
 * 1. **One renderer per canvas, ever.** Starting a run used to tear the whole
 *    Game down and build a new `WebGLRenderer` on the same canvas. Chrome
 *    tolerates that; iOS has a hard cap on live WebGL contexts and does not
 *    reliably release the old one, so the second run could come back with a
 *    dead context. The renderer is now memoised and outlives the Game.
 *
 * 2. **Probe, don't assume.** The post chain wants a half-float, multisampled
 *    target. Safari's support for multisampled RGBA16F has been patchy, and a
 *    framebuffer that fails to complete produces a black screen rather than an
 *    exception. So we actually try it and fall back: MSAA off first, then
 *    plain 8-bit targets.
 */

import * as THREE from "three";

export interface RenderCaps {
  /** Highest usable MSAA sample count on the scene target. 0 = unavailable. */
  maxSamples: number;
  /** Whether half-float render targets work as colour attachments. */
  halfFloat: boolean;
  /** Sensible upper bound on device pixel ratio for this device. */
  maxPixelRatio: number;
  isWebGL2: boolean;
  /** iOS / iPadOS / desktop Safari, which want the conservative path. */
  isAppleWebKit: boolean;
}

const renderers = new WeakMap<HTMLCanvasElement, THREE.WebGLRenderer>();
const caps = new WeakMap<THREE.WebGLRenderer, RenderCaps>();

export function isAppleWebKit() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports as a Mac, but a Mac with a touchscreen is an iPad.
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const safari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  return iOS || safari;
}

/** Get (or create) the single renderer for this canvas. */
export function acquireRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const existing = renderers.get(canvas);
  if (existing) return existing;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // the post chain resolves MSAA on its own target
    alpha: false,
    powerPreference: "high-performance",
    stencil: false,
    depth: true,
    // Safari in particular benefits from being told we don't need these.
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false,
  });
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.autoClear = true;

  renderers.set(canvas, renderer);
  return renderer;
}

/**
 * Work out what this GPU/browser will actually accept, by building the target
 * we want and asking whether the framebuffer is complete.
 */
export function probeCaps(renderer: THREE.WebGLRenderer): RenderCaps {
  const cached = caps.get(renderer);
  if (cached) return cached;

  const gl = renderer.getContext();
  const isWebGL2 =
    typeof WebGL2RenderingContext !== "undefined" &&
    gl instanceof WebGL2RenderingContext;
  const apple = isAppleWebKit();

  const canRender = (type: THREE.TextureDataType, samples: number) => {
    let rt: THREE.WebGLRenderTarget | null = null;
    try {
      rt = new THREE.WebGLRenderTarget(64, 64, {
        type,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: true,
        stencilBuffer: false,
        samples,
      });
      // Binding forces three to allocate and attach; an incomplete framebuffer
      // is the failure we are actually hunting for.
      renderer.setRenderTarget(rt);
      renderer.clear();
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      renderer.setRenderTarget(null);
      return status === gl.FRAMEBUFFER_COMPLETE;
    } catch {
      return false;
    } finally {
      try {
        renderer.setRenderTarget(null);
        rt?.dispose();
      } catch {
        /* nothing useful to do */
      }
    }
  };

  const halfFloat = isWebGL2 && canRender(THREE.HalfFloatType, 0);
  const type = halfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType;

  let maxSamples = 0;
  if (isWebGL2) {
    // Ask the driver, then verify — the reported maximum is not always usable
    // with a float colour attachment.
    const reported = (gl as WebGL2RenderingContext).getParameter(
      (gl as WebGL2RenderingContext).MAX_SAMPLES,
    ) as number;
    for (const n of [4, 2].filter((n) => n <= (reported || 0))) {
      if (canRender(type, n)) {
        maxSamples = n;
        break;
      }
    }
  }

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const result: RenderCaps = {
    maxSamples,
    halfFloat,
    // A 3x iPhone at full ratio is 3x the pixels for no visible gain.
    maxPixelRatio: Math.min(dpr, apple ? 2 : 2),
    isWebGL2,
    isAppleWebKit: apple,
  };
  caps.set(renderer, result);
  return result;
}

/** Human-readable reason a device can't run the game at all. */
export function webglBlocker(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const c = document.createElement("canvas");
    const gl =
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl");
    if (!gl) {
      return "This browser isn't giving the page a WebGL context. If you're in a private window or have hardware acceleration switched off, turning that on should fix it.";
    }
    return null;
  } catch (err) {
    return `WebGL failed to start: ${String(err)}`;
  }
}
