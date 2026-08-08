"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The band site's one section header pattern: numbered eyebrow, poster-scale
 * h2, optional intro. Keeping it in a single component is what makes the four
 * sections read as one designed system rather than four pages.
 */
export default function SectionHead({
  index,
  label,
  title,
  intro,
  align = "left",
  id,
}: {
  /** Two-digit section number, e.g. "02". */
  index: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  id?: string;
}) {
  const reduce = useReducedMotion();
  const centered = align === "center";

  return (
    <header
      className={centered ? "flex flex-col items-center text-center" : ""}
      id={id}
    >
      <motion.p
        initial={{ x: reduce || centered ? 0 : -14, opacity: centered ? 0 : 1 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex items-center gap-3 font-mono text-[11px] tracking-[0.26em] uppercase"
      >
        <span className="text-ss-gold">{index}</span>
        <span aria-hidden="true" className="h-px w-8 bg-ss-line-2" />
        <span className="text-ss-smoke">{label}</span>
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: reduce ? 0 : 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.06 }}
        className="mt-4 text-[clamp(2.6rem,7.5vw,6rem)] text-ss-cream"
      >
        {title}
      </motion.h2>

      {intro && (
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.14 }}
          className={`mt-5 max-w-[54ch] text-base leading-relaxed text-ss-smoke ${
            centered ? "mx-auto" : ""
          }`}
        >
          {intro}
        </motion.p>
      )}
    </header>
  );
}
