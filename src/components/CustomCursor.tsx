"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Labels worth saying out loud. Call sites carry 30-odd `data-cursor` values,
 * most of them nouns ("site", "cta", "ghost", "leadership") that name the
 * destination rather than the action — read as a cursor label they explain
 * nothing. Anything not in this map gets the ring only: still responsive, but
 * silent. Keep this list short; a label is for actions a link's own text
 * doesn't already make obvious.
 */
const LABELS: Record<string, string> = {
  "open case": "Open case",
  "open lab": "Open lab",
  prev: "Prev",
  next: "Next",
  email: "Email",
  resume: "Résumé",
  print: "Print",
};

export default function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.35 });
  const ringY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.35 });

  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      const el = t?.closest<HTMLElement>("[data-cursor], a, button");
      if (!el) {
        setHovering(false);
        setLabel(null);
        return;
      }
      setHovering(true);
      const key = el.dataset.cursor?.toLowerCase();
      setLabel(key ? LABELS[key] ?? null : null);
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => {
      x.set(-100);
      y.set(-100);
      setHovering(false);
      setLabel(null);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mouseleave", leave);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200]">
      {/* Ring — grows on anything clickable. It no longer fills solid, so it
          never sits as a colour block on top of what you're pointing at. */}
      <motion.div style={{ x: ringX, y: ringY }} className="absolute top-0 left-0">
        <motion.div
          animate={{
            width: hovering ? 42 : 30,
            height: hovering ? 42 : 30,
            borderColor: hovering
              ? "rgba(28, 183, 145, 1)"
              : "rgba(245, 243, 239, 0.55)",
            backgroundColor: hovering
              ? "rgba(28, 183, 145, 0.12)"
              : "rgba(28, 183, 145, 0)",
            scale: pressed ? 0.82 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ borderWidth: 1 }}
        />
      </motion.div>

      {/* Dot — stays visible at all times so you never lose the exact point
          you're aiming at. Previously it scaled to 0 on every hover. */}
      <motion.div style={{ x, y }} className="absolute top-0 left-0">
        <motion.div
          animate={{ scale: hovering ? 0.6 : 1 }}
          transition={{ duration: 0.18 }}
          className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone"
        />
      </motion.div>

      {/* Label — trails below-right of the pointer rather than under it, so it
          annotates the target instead of covering it. */}
      <motion.div style={{ x: ringX, y: ringY }} className="absolute top-0 left-0">
        <motion.span
          animate={{
            opacity: label ? 1 : 0,
            y: label ? 26 : 18,
          }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-4 whitespace-nowrap rounded-full bg-green px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink"
        >
          {label}
        </motion.span>
      </motion.div>
    </div>
  );
}
