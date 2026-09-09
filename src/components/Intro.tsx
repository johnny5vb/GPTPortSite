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
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-4">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="t-label text-green md:sticky md:top-28"
          >
            // John Carman
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-12 md:col-span-8"
        >
          <h2 className="t-display-md max-w-[24ch]">
            Creative director. I build brands, lead teams, and create the{" "}
            <em className="font-display-wonk text-green">
              systems that keep the work good
            </em>{" "}
            at scale.
          </h2>
          <p className="mt-6 text-bone/85 leading-relaxed max-w-[56ch]">
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
