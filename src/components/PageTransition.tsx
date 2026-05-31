"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Wraps page content in a fade + slight-rise entrance. Used via Next.js
 * `template.tsx` which re-mounts the wrapper on every route change, so the
 * animation re-fires when the user navigates home → /lab → /work/[slug].
 *
 * Pathname is included in the key so React treats each route as a fresh mount.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
