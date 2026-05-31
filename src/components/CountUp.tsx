"use client";

import {
  animate,
  useInView,
  useReducedMotion,
  useMotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  /** Final value (e.g. 20, 100) */
  to: number;
  /** Starting value */
  from?: number;
  /** Duration in seconds */
  duration?: number;
  /** Optional suffix rendered after the number (e.g. "+", "%", "k") */
  suffix?: string;
  /** Optional prefix (e.g. "$") */
  prefix?: string;
  /** Tailwind class string passthrough */
  className?: string;
  /** Format as integer (default) or with N decimals */
  decimals?: number;
};

/**
 * Number that counts up from `from` → `to` when scrolled into view. Single-shot.
 * Respects reduced-motion (jumps straight to final value).
 */
export default function CountUp({
  to,
  from = 0,
  duration = 1.6,
  suffix,
  prefix,
  className,
  decimals = 0,
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const mv = useMotionValue(from);
  const [display, setDisplay] = useState<string>(formatValue(from, decimals));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(formatValue(to, decimals));
      return;
    }
    const controls = animate(mv, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(formatValue(v, decimals)),
    });
    return () => controls.stop();
  }, [inView, to, duration, mv, reduce, decimals]);

  return (
    <span
      ref={ref}
      className={className}
      // role="img" makes aria-label valid on a generic span and lets screen
      // readers announce the final target value once instead of every tick.
      role="img"
      aria-label={`${prefix ?? ""}${formatValue(to, decimals)}${suffix ?? ""}`}
    >
      <span aria-hidden="true">
        {prefix}
        {display}
        {suffix}
      </span>
    </span>
  );
}

function formatValue(v: number, decimals: number): string {
  return decimals === 0
    ? String(Math.round(v))
    : v.toFixed(decimals);
}
