"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's visual field: topographic contour lines traced through a slowly
 * drifting noise field. Real isolines via marching squares — closed loops,
 * islands and saddles, the way an elevation map behaves — rather than a stack
 * of sine waves, so the pattern never repeats.
 *
 * Decorative, so the canvas is aria-hidden. It costs nothing when it isn't
 * being looked at: the loop is throttled, pauses when the hero scrolls out of
 * view or the tab is hidden, and renders a single static frame under
 * prefers-reduced-motion.
 *
 * Tuning lives in FIELD. These are the settings picked from the live
 * comparison (density 5, speed 4, intensity 5).
 */
const FIELD = {
  /** Contour bands drawn per frame. More = a denser, more map-like field. */
  levels: 13,
  /** How fast the field drifts. Small numbers; this is deliberately slow. */
  drift: 0.0022,
  /** Master opacity multiplier. Bounded by contrast, not by taste: the hero
      carries 10-11px mono text, and a bright line crossing behind it drops the
      ratio below AA. Measured against the composited page, not the canvas. */
  intensity: 0.75,
  /** Frames per second. Half of 60 is plenty for motion this slow. */
  fps: 30,
  /** Target sample count — cell size is derived so cost stays flat. */
  samples: 4200,
  /** Smallest grid cell in CSS px, so phones don't oversample. */
  minCell: 16,
  /** Radius of the swell that follows the pointer, in px. */
  pointerRadius: 165,
};

/* Value noise + fbm. Cheap, dependency-free, and stable across frames. */
function hash(x: number, y: number, s: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return n - Math.floor(n);
}
const smooth = (t: number) => t * t * (3 - 2 * t);
function vnoise(x: number, y: number, s: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const a = hash(xi, yi, s);
  const b = hash(xi + 1, yi, s);
  const c = hash(xi, yi + 1, s);
  const d = hash(xi + 1, yi + 1, s);
  const u = smooth(xf);
  const v = smooth(yf);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}
function fbm(x: number, y: number, s: number) {
  let v = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < 3; i++) {
    v += amp * vnoise(x * f, y * f, s + i * 13.1);
    f *= 2;
    amp *= 0.5;
  }
  return v;
}

export default function HeroIsolines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let w = 0;
    let h = 0;
    let cell = 20;
    let cols = 0;
    let rows = 0;
    let field = new Float32Array(0);

    // Pointer state. Targets are eased so the swell trails the cursor instead
    // of snapping to it.
    let px = -9999;
    let py = -9999;
    let tx = -9999;
    let ty = -9999;
    let inside = false;

    let t = 0;
    let raf = 0;
    let last = 0;
    let visible = true;

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Derive cell size from area so sample count — and therefore cost —
      // stays roughly constant from a phone to a 5K display.
      cell = Math.max(FIELD.minCell, Math.sqrt((w * h) / FIELD.samples));
      cols = Math.ceil(w / cell) + 1;
      rows = Math.ceil(h / cell) + 1;
      field = new Float32Array(cols * rows);
      return true;
    };

    const draw = () => {
      // Sample the scalar field once per frame, then trace every contour level
      // out of that one array.
      for (let j = 0; j < rows; j++) {
        const gy = j * cell;
        for (let i = 0; i < cols; i++) {
          const gx = i * cell;
          let v = fbm(gx * 0.0034, gy * 0.0034 + t, 9.7);
          if (inside) {
            const dx = gx - px;
            const dy = gy - py;
            const r = FIELD.pointerRadius;
            v += Math.exp(-(dx * dx + dy * dy) / (r * r)) * 0.22;
          }
          field[j * cols + i] = v;
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      for (let L = 1; L < FIELD.levels; L++) {
        const level = L / FIELD.levels;
        ctx.beginPath();
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const a = field[j * cols + i];
            const b = field[j * cols + i + 1];
            const c = field[(j + 1) * cols + i + 1];
            const d = field[(j + 1) * cols + i];
            let idx = 0;
            if (a > level) idx |= 8;
            if (b > level) idx |= 4;
            if (c > level) idx |= 2;
            if (d > level) idx |= 1;
            if (idx === 0 || idx === 15) continue;

            const X = i * cell;
            const Y = j * cell;
            const lerp = (v1: number, v2: number) =>
              (level - v1) / (v2 - v1 || 1e-6);
            const top: [number, number] = [X + cell * lerp(a, b), Y];
            const right: [number, number] = [X + cell, Y + cell * lerp(b, c)];
            const bottom: [number, number] = [X + cell * lerp(d, c), Y + cell];
            const left: [number, number] = [X, Y + cell * lerp(a, d)];
            const seg = (p: [number, number], q: [number, number]) => {
              ctx.moveTo(p[0], p[1]);
              ctx.lineTo(q[0], q[1]);
            };
            switch (idx) {
              case 1:
              case 14:
                seg(left, bottom);
                break;
              case 2:
              case 13:
                seg(bottom, right);
                break;
              case 3:
              case 12:
                seg(left, right);
                break;
              case 4:
              case 11:
                seg(top, right);
                break;
              case 6:
              case 9:
                seg(top, bottom);
                break;
              case 7:
              case 8:
                seg(left, top);
                break;
              // Saddles — two separate segments through the same cell.
              case 5:
                seg(left, top);
                seg(bottom, right);
                break;
              case 10:
                seg(top, right);
                seg(left, bottom);
                break;
            }
          }
        }
        // Mid-elevation bands read strongest; the extremes fade out.
        const alpha =
          (0.08 + 0.3 * (1 - Math.abs(level - 0.5) * 2)) * FIELD.intensity;
        ctx.strokeStyle = `rgba(28, 183, 145, ${alpha.toFixed(3)})`;
        ctx.stroke();
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      if (now - last < 1000 / FIELD.fps) return;
      last = now;
      t += FIELD.drift;
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      draw();
    };

    if (!measure()) return;

    if (reduce) {
      // One still frame: the field is a good static texture, and nothing moves.
      draw();
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      tx = e.clientX - rect.left;
      ty = e.clientY - rect.top;
      inside = true;
    };
    const onLeave = () => {
      inside = false;
      tx = -9999;
      ty = -9999;
    };
    if (fine && !reduce) {
      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseleave", onLeave);
    }

    const ro = new ResizeObserver(() => {
      if (measure() && reduce) draw();
    });
    ro.observe(canvas);

    // Stop drawing once the hero has scrolled past, and while the tab is hidden.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) visible = false;
      else visible = true;
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      style={{
        // Fade the field where the small type sits — the nav and meta strip at
        // the top, the positioning strip at the bottom. The middle, where the
        // headline has plenty of contrast to spare, stays at full strength.
        maskImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.85) 14%, #000 30%, #000 76%, rgba(0,0,0,0.5) 92%, rgba(0,0,0,0.2) 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.85) 14%, #000 30%, #000 76%, rgba(0,0,0,0.5) 92%, rgba(0,0,0,0.2) 100%)",
      }}
    />
  );
}
