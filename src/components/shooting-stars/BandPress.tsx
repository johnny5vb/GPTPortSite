"use client";

import { motion, useReducedMotion } from "framer-motion";
import { StarMark } from "./StarLogo";
import { PRESS } from "@/lib/shootingStars";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Word of mouth. Sits between the tour list and the contact block as a
 * palate cleanser — no header, just quotes, so it reads as overheard rather
 * than as a press kit.
 *
 * The first quote runs at feature size; the rest fall into a two-up grid.
 */
export default function BandPress() {
  const reduce = useReducedMotion();
  const [lead, ...rest] = PRESS;

  return (
    <section
      aria-label="What people are saying"
      className="relative overflow-hidden border-t border-ss-line bg-ss-deep py-20 md:py-28"
    >
      <div
        aria-hidden="true"
        className="ss-halftone absolute inset-0 opacity-30"
      />

      <div className="relative mx-auto max-w-[88rem] px-5 md:px-10">
        <motion.figure
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: EASE }}
          // Deliberately not a `ch` width: Anton is condensed enough that
          // `ch` measures far narrower than the text actually sets, which
          // breaks a pull quote into one word per line.
          className="max-w-4xl"
        >
          <StarMark className="h-8 w-8" />
          <blockquote className="ss-display mt-5 text-[clamp(1.9rem,4.6vw,3.6rem)] text-ss-cream">
            “{lead.text}”
          </blockquote>
          <figcaption className="mt-5 font-mono text-[11px] tracking-[0.24em] text-ss-gold uppercase">
            {lead.source}
          </figcaption>
        </motion.figure>

        <ul className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-ss-line bg-ss-line md:grid-cols-2">
          {rest.map((q, i) => (
            <motion.li
              key={q.source}
              initial={{ opacity: 0, y: reduce ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }}
              className="bg-ss-night px-6 py-7"
            >
              <figure>
                <blockquote className="text-lg leading-snug text-ss-cream">
                  “{q.text}”
                </blockquote>
                <figcaption className="mt-4 font-mono text-[10px] tracking-[0.22em] text-ss-smoke uppercase">
                  {q.source}
                </figcaption>
              </figure>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
