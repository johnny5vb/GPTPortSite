"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * Subtle scroll-driven background gradient. As the user scrolls down the
 * page, the page-wide tint shifts from a cooler near-black at the top to a
 * slightly warmer/greener tone near the bottom. The shift is barely
 * perceptible per pixel but reads as a sense of journey over the full scroll.
 *
 * Reduced-motion skips the gradient entirely.
 */
export default function ScrollBackdrop() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const tintOpacity = useTransform(scrollYProgress, [0, 0.35, 1], [0, 0.5, 0.8]);

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      style={{ opacity: tintOpacity }}
      className="fixed inset-0 -z-10 pointer-events-none"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 80% 100%, rgba(28,183,145,0.05), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 20% 0%, rgba(28,183,145,0.025), transparent 55%)",
        }}
      />
    </motion.div>
  );
}
