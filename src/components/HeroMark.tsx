"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Hero CC mark — single brand mark, top-aligned with the first two lines of
 * the headline. No rings, no ticks, no orbiting dots — just the mark with a
 * soft brand-green glow that lights up as the cursor approaches, plus a
 * magnetic pull so it gently tracks the pointer.
 *
 * Decorative: `aria-hidden` + `pointer-events-none` so it doesn't trap focus
 * or block clicks behind it.
 *
 * Respects `prefers-reduced-motion`: the entrance still plays as a simple
 * fade-in; the proximity-driven scale/glow are skipped (mouse listener is
 * not attached).
 */
export default function HeroMark() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Magnetic cursor pull
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const proximity = useMotionValue(0); // 0 = far, 1 = right on top

  const offsetX = useSpring(useTransform(mx, [-1, 1], [-22, 22]), {
    stiffness: 80,
    damping: 18,
  });
  const offsetY = useSpring(useTransform(my, [-1, 1], [-22, 22]), {
    stiffness: 80,
    damping: 18,
  });

  // Proximity → scale, brightness boost, glow intensity
  const scale = useSpring(useTransform(proximity, [0, 1], [1, 1.08]), {
    stiffness: 120,
    damping: 16,
  });
  const brightness = useTransform(proximity, [0, 1], [1, 1.15]);
  const filter = useTransform(brightness, (b) => `brightness(${b})`);
  const glowOpacity = useTransform(proximity, [0, 1], [0.45, 1]);
  const glowScale = useSpring(useTransform(proximity, [0, 1], [1, 1.25]), {
    stiffness: 120,
    damping: 18,
  });

  // Subtle scroll fade so the mark eases out as the hero leaves
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"],
  });
  const scrollFade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  useEffect(() => {
    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    if (!fine || reduce) return;

    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const ref = Math.max(r.width, 220);
      const dx = (e.clientX - cx) / ref;
      const dy = (e.clientY - cy) / ref;
      const dist = Math.hypot(dx, dy);
      // Proximity peaks when the cursor is right on the mark, falls off over
      // ~2 mark-widths.
      const p = Math.max(0, 1 - dist / 2);
      proximity.set(p);
      // Damp the magnetic pull as proximity rises so the mark settles into
      // the cursor instead of chasing it through itself.
      const damp = 1 - p * 0.55;
      mx.set(Math.max(-1, Math.min(1, dx)) * damp);
      my.set(Math.max(-1, Math.min(1, dy)) * damp);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, proximity, reduce]);

  return (
    <motion.div
      ref={containerRef}
      aria-hidden
      style={{ x: offsetX, y: offsetY, opacity: scrollFade }}
      initial={{ opacity: 0, scale: 0.6, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.4, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none absolute hidden lg:block z-[1]
                 right-[clamp(7rem,12vw,11rem)]
                 top-[clamp(10.5rem,20vh,13.5rem)]
                 w-[clamp(9rem,14vw,12rem)] aspect-square"
    >
      <motion.div style={{ scale }} className="relative w-full h-full">
        {/* Soft brand-green glow — base layer that's always faintly visible
            and intensifies as the cursor approaches. */}
        <motion.div
          aria-hidden
          style={{ opacity: glowOpacity, scale: glowScale }}
          className="absolute inset-[-22%] rounded-full origin-center"
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(28,183,145,0.45), transparent 70%)",
              filter: "blur(28px)",
            }}
          />
        </motion.div>

        {/* The mark itself. Brightness ramps up subtly on proximity so it
            visibly "lights up" as the cursor closes in. */}
        <motion.div
          style={{ filter }}
          className="absolute inset-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1144.24 1144.24"
            className="w-full h-full"
          >
            <circle cx="571.5" cy="571.49" r="561.47" fill="#1cb791" />
            <path
              fill="#fff"
              d="M749.35,542.33l101.15-54.99V221.52l-281.63-146.43-276.39,147.68v700.57l278.89,144.58,270.88-138.31v-209.16l-97.17-54.57-97.58,58.01-.46,101.51-79.46,38.72-.06.56-80.28-42.4v-504.69c35.04-17.74,71.76-36,83.1-40.7l83.32,45.6v168.32l95.67,51.53ZM749.82,518.68l-1.43-.77h2.86l-1.42.77ZM829.89,475.21l-71.1,38.81v-243.24l71.1-35.08v239.51ZM569.6,98.14l240.33,125-60.84,29.9-241.84-121.57,62.35-33.33ZM572.09,1044.97l-246.78-127.95,60.78-32.27,251.75,126.64-65.76,33.58ZM745.68,689.4l65.47,36.65-67.32,34.82-64.66-32,66.51-39.48ZM667.58,746.07l65.45,32.56v81.73l-66.04-34.75.59-79.55ZM657.11,843.2l62.04,32.55-62.56,35.95-67.07-35.58,67.6-32.93ZM656.53,935l97.1-55.83v-100.66l68.01-35.34v173.94l-162,82.77-264.11-132.9V284.94c15.46,6,44.83,19.42,71.62,32.73v516.86l189.37,100.47ZM519.27,278.95c-16.9,8.4-33.75,16.97-41.6,20.97-7.56-3.71-23.37-11.39-39.4-18.81-10.37-4.8-19.24-8.75-26.46-11.78l73.2-39.56,63.62,34.86c-7.65,3.62-17.5,8.43-29.36,14.32ZM484.67,206.87l-103.63,56.5h-.26l-5.85,2.25v601.52l-61.83,33.03V234.98l171.58-91.76,253.5,127.48v242.51l-64.41-34.6v-168.22l-189.1-103.52Z"
            />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
