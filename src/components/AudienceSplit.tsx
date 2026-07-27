"use client";

import { motion } from "framer-motion";
import { Link } from "next-view-transitions";
import { ArrowUpRight } from "lucide-react";

/**
 * Two clear pathways. The leadership/employment path is primary — listed
 * first, larger, green-accented. Consulting is the secondary offer.
 */
export default function AudienceSplit() {
  return (
    <section id="paths" className="relative container-x py-16 md:py-14 sm:py-24 rule-top">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Primary: hiring */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-12 md:col-span-7 rounded-2xl border border-green/40 bg-green/[0.05] p-8 md:p-10 flex flex-col"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // Hiring John
          </p>
          <h2 className="mt-5 font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.05] tracking-[-0.035em] text-bone">
            For companies considering a{" "}
            <em className="font-display-wonk text-green">
              senior creative leader.
            </em>
          </h2>
          <p className="mt-5 text-bone/85 leading-relaxed max-w-[52ch]">
            Leadership experience, enterprise transformation work, creative
            operations, team management, and a résumé. Everything you need to
            evaluate John for a Director-level role.
          </p>
          <div className="mt-8 pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/leadership"
              data-cursor="leadership"
              className="group inline-flex items-center gap-2 rounded-full bg-green text-ink px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
            >
              View Leadership Experience
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/resume"
              data-cursor="resume"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-bone hover:text-green transition-colors"
            >
              Résumé →
            </Link>
          </div>
        </motion.div>

        {/* Secondary: consulting */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-12 md:col-span-5 rounded-2xl border border-line bg-ink-2 p-8 md:p-10 flex flex-col"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
            // Work With Carman Creative
          </p>
          <h2 className="mt-5 font-display text-[clamp(1.7rem,3.6vw,2.6rem)] leading-[1.08] tracking-[-0.03em] text-bone">
            For organizations with a project in mind.
          </h2>
          <p className="mt-5 text-bone/80 leading-relaxed max-w-[46ch]">
            Brand strategy, identity, campaigns, websites, creative systems, and
            selected consulting engagements.
          </p>
          <div className="mt-auto pt-8">
            <a
              href="#work"
              data-cursor="work"
              className="inline-flex items-center gap-2 rounded-full border border-line-2 px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-bone hover:border-green hover:text-green transition-colors"
            >
              Explore Consulting
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
