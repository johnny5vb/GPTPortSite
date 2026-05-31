"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin scroll progress indicator pinned to the top of the page.
 * Springs slightly so it feels alive rather than mechanical.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-px origin-left bg-green pointer-events-none"
    >
      <span className="absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-green-bright/80" />
    </motion.div>
  );
}
