"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Star = {
  x: number;
  y: number;
  r: number;
  /** Base alpha; twinkle modulates around it. */
  a: number;
  /** Radians per frame-ish — each star drifts at its own rate. */
  speed: number;
  phase: number;
};

type Streak = {
  x: number;
  y: number;
  len: number;
  /** Pixels per second along the travel vector. */
  vx: number;
  vy: number;
  life: number;
  ttl: number;
};

/**
 * The band's ambient background: a slow-twinkling star field with the
 * occasional shooting star crossing it.
 *
 * Canvas rather than DOM nodes — a few hundred twinkling elements is a lot of
 * layout work for the compositor, and the streaks need sub-pixel trails.
 * Under `prefers-reduced-motion` it paints one static frame and stops, so the
 * texture survives but nothing moves.
 */
export default function StarField({
  className,
  /** Stars per 100,000 px² of canvas — scales with viewport instead of a flat count. */
  density = 12,
}: {
  className?: string;
  density?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let streaks: Streak[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let nextStreakAt = 1200;
    let elapsed = 0;
    let last = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seed = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(((width * height) / 100_000) * density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.1 + 0.35,
        a: Math.random() * 0.5 + 0.25,
        speed: Math.random() * 0.0016 + 0.0004,
        phase: Math.random() * Math.PI * 2,
      }));
      streaks = [];
    };

    const spawnStreak = () => {
      // Enter from the top edge, travel down and to the right at a shallow,
      // consistent angle — a sky full of randomly-angled comets reads as noise.
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.35;
      const speed = 620 + Math.random() * 420;
      streaks.push({
        x: Math.random() * width * 0.8 - width * 0.1,
        y: Math.random() * height * 0.45 - height * 0.1,
        len: 90 + Math.random() * 150,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        ttl: 900 + Math.random() * 500,
      });
    };

    const paintStars = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        const twinkle = reduce ? 1 : 0.65 + 0.35 * Math.sin(t * s.speed + s.phase);
        ctx.globalAlpha = Math.min(1, s.a * twinkle);
        ctx.fillStyle = "#f6f2e9";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const paintStreaks = () => {
      for (const st of streaks) {
        const p = st.life / st.ttl;
        // Fade in over the first 20%, out over the last 45%.
        const alpha = p < 0.2 ? p / 0.2 : Math.max(0, 1 - (p - 0.55) / 0.45);
        const mag = Math.hypot(st.vx, st.vy) || 1;
        const tailX = st.x - (st.vx / mag) * st.len;
        const tailY = st.y - (st.vy / mag) * st.len;

        const grad = ctx.createLinearGradient(tailX, tailY, st.x, st.y);
        grad.addColorStop(0, "rgba(124, 92, 255, 0)");
        grad.addColorStop(0.55, "rgba(255, 90, 60, 0.35)");
        grad.addColorStop(1, "rgba(255, 201, 74, 1)");

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(st.x, st.y);
        ctx.stroke();

        ctx.fillStyle = "#ffe7a8";
        ctx.beginPath();
        ctx.arc(st.x, st.y, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const frame = (t: number) => {
      const dt = last ? Math.min(t - last, 64) : 16;
      last = t;
      elapsed += dt;

      paintStars(t);

      if (elapsed > nextStreakAt) {
        spawnStreak();
        nextStreakAt = elapsed + 2600 + Math.random() * 5200;
      }

      for (const st of streaks) {
        st.life += dt;
        st.x += (st.vx * dt) / 1000;
        st.y += (st.vy * dt) / 1000;
      }
      streaks = streaks.filter((st) => st.life < st.ttl);
      paintStreaks();

      raf = requestAnimationFrame(frame);
    };

    seed();

    if (reduce) {
      paintStars(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      seed();
      if (reduce) paintStars(0);
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [density, reduce]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className ?? ""}`}
    />
  );
}
