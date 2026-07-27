"use client";

import { motion } from "framer-motion";
import { Link } from "next-view-transitions";
import { ArrowUpRight } from "lucide-react";

/**
 * Compact AI band for the home page. The full interactive demos live on /lab;
 * here AI is framed as a leadership + operations advantage, not the headline.
 */
const CATEGORIES = [
  {
    k: "Creative exploration",
    d: "Concepts, visual prototyping, campaign territories — faster iteration, tighter direction.",
  },
  {
    k: "Creative operations",
    d: "Briefs, intake, content adaptation, and production support that keep teams moving.",
  },
  {
    k: "Brand governance",
    d: "Brand checks, prompt systems, and review criteria that keep output on-system.",
  },
];

export default function AISystemsTeaser() {
  return (
    <section id="talks-back" className="relative container-x py-14 sm:py-20 md:py-32 rule-top">
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // 04 — AI &amp; Creative Systems
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
            A leadership tool, not a substitute for judgment
          </p>
        </div>
        <div className="col-span-12 md:col-span-8">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[1.08] tracking-[-0.04em] text-bone"
          >
            AI that helps teams{" "}
            <em className="font-display-wonk text-green">move faster.</em>
          </motion.h2>
          <p className="mt-6 text-mute max-w-[58ch] leading-relaxed">
            I use AI to help teams explore ideas faster, hold brand consistency,
            cut repetitive production, and build better systems for critique and
            governance. Human judgment still decides what&apos;s good.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CATEGORIES.map((c, i) => (
              <motion.div
                key={c.k}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className="rounded-lg border border-line bg-ink-2 p-5"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-green mb-2">
                  {c.k}
                </div>
                <p className="text-sm text-bone/80 leading-relaxed">{c.d}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/lab"
              data-cursor="open lab"
              className="group inline-flex items-center gap-3 rounded-full border border-line-2 px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-bone hover:border-green hover:text-green transition-colors"
            >
              Explore AI &amp; Systems
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
