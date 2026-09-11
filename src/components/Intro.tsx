"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/**
 * Identity band. This was `AudienceSplit` — two cards routing hiring managers
 * one way and project clients the other. The neutral repositioning collapses
 * it into a single statement of who John is and what the work is, with the
 * two quiet ways further in: the work itself, and the About section.
 */
export default function Intro() {
  return (
    <section id="intro" className="relative container-x py-16 md:py-24 rule-top">
      {/* Left-anchored editorial stack. This was a 4/8 label-plus-content
          split, which started every heading a third of the way across and
          then capped it with a max-width — the result read as a narrow column
          floating in the middle of the page. The eyebrow now sits above the
          heading and everything runs from the left edge. */}
      <div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="t-label text-green mb-5"
        >
          // John Carman
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="t-display-md max-w-[34ch]">
            Creative director working across brand,{" "}
            <em className="font-display-wonk text-green">
              creative operations, and design.
            </em>
          </h2>
          <p className="mt-6 text-bone/85 leading-relaxed max-w-[68ch]">
            I run Carman Creative and have spent about twenty years in brand and
            creative operations, most of it inside large, complex organizations.
            This is a selection of that work.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              data-cursor="work"
              className="group inline-flex items-center gap-2 rounded-full bg-green text-ink px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
            >
              View the work
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="#about"
              data-cursor="about"
              className="inline-flex items-center gap-2 rounded-full border border-line-2 px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-bone hover:border-green hover:text-green transition-colors"
            >
              About
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
