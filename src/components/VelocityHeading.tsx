"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Max degrees of skew at peak scroll velocity */
  maxSkew?: number;
};

/**
 * Display headline that skews very slightly with scroll velocity. The skew is
 * small enough to read as physicality rather than effect — fast scroll gives
 * the text a tiny lean, slow scroll keeps it neutral.
 *
 * Composes with normal entry animations (we use a wrapper, not motion.h2
 * directly, so callers can keep their existing whileInView animations).
 */
export default function VelocityHeading({
  children,
  className,
  maxSkew = 1.5,
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, {
    stiffness: 100,
    damping: 30,
    mass: 0.6,
  });
  const skew = useTransform(smooth, [-2500, 0, 2500], [maxSkew, 0, -maxSkew]);

  // Spring back to 0 when no motion
  const skewIdle = useMotionValue(0);
  const finalSkew = reduce ? skewIdle : skew;

  return (
    <motion.div
      ref={ref}
      style={{ skewY: finalSkew }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
