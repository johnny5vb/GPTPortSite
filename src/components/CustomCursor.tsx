"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 220, damping: 24, mass: 0.4 });
  const ringY = useSpring(y, { stiffness: 220, damping: 24, mass: 0.4 });

  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      const el = t?.closest<HTMLElement>("[data-cursor]");
      if (el) {
        setHovering(el.dataset.cursor || "hover");
      } else {
        setHovering(null);
      }
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => {
      x.set(-100);
      y.set(-100);
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

  const isLabel = hovering && hovering !== "hover" && hovering !== "true";
  const isHover = !!hovering;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200]">
      {/* Outer ring */}
      <motion.div
        style={{ x: ringX, y: ringY }}
        className="absolute top-0 left-0"
      >
        <motion.div
          animate={{
            width: isLabel ? 110 : isHover ? 64 : 36,
            height: isLabel ? 44 : isHover ? 64 : 36,
            borderRadius: isLabel ? 999 : 999,
            backgroundColor: isHover
              ? "rgba(28, 183, 145, 0.95)"
              : "rgba(28, 183, 145, 0)",
            borderColor: isHover ? "rgba(28, 183, 145, 1)" : "rgba(245, 243, 239, 0.6)",
            scale: pressed ? 0.85 : 1,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="flex items-center justify-center -translate-x-1/2 -translate-y-1/2 border mix-blend-difference"
          style={{ borderWidth: 1 }}
        >
          {isLabel && (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink">
              {hovering}
            </span>
          )}
        </motion.div>
      </motion.div>

      {/* Inner dot */}
      <motion.div
        style={{ x, y }}
        className="absolute top-0 left-0"
      >
        <motion.div
          animate={{ scale: isHover ? 0 : 1 }}
          transition={{ duration: 0.15 }}
          className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone"
        />
      </motion.div>
    </div>
  );
}
