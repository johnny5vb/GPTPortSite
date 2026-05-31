"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import CountUp from "./CountUp";

type Role = {
  company: string;
  title: string;
  range: string;
  current?: boolean;
};

const ROLES: Role[] = [
  {
    company: "Carman Creative",
    title: "Founder",
    range: "2020 — Present",
    current: true,
  },
  {
    company: "Jumping Fish",
    title: "Creative Director",
    range: "2014 — Present",
    current: true,
  },
  {
    company: "Elevance Health",
    title: "Creative Manager",
    range: "2010 — Present",
    current: true,
  },
];

const STACK = [
  "Adobe Creative Cloud",
  "Framer",
  "Claude",
  "GPT-5",
  "Midjourney",
  "VS Code",
  "Next.js",
];

export default function About() {
  return (
    <section id="about" className="relative py-28 md:py-40 container-x rule-top">
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // 06 — About
          </p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 relative overflow-hidden rounded-md border border-line"
          >
            <Image
              src="/brand/portrait.png"
              alt="John Carman, Creative Director and AI Strategist"
              width={1024}
              height={1024}
              priority={false}
              className="w-full h-auto block"
            />
            <motion.div
              aria-hidden
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="absolute left-0 right-0 bottom-0 h-px bg-green origin-left"
            />
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 font-display text-2xl md:text-[1.65rem] leading-[1.15] tracking-[-0.02em] text-bone"
          >
            &ldquo;I&apos;ve spent my career helping brands make sense of
            complexity.&rdquo;
          </motion.blockquote>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
            — John Carman
          </p>
        </div>

        <div className="col-span-12 md:col-span-8 md:pl-10">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2.4rem,6.4vw,5.4rem)] leading-[1.08] tracking-[-0.04em] text-bone"
          >
            Creative direction,
            <br />
            <em className="font-display-wonk text-green">
              accelerated by AI.
            </em>
          </motion.h2>

          {/* Animated stat row */}
          <div className="mt-10 grid grid-cols-3 gap-4 md:gap-8 border-t border-line pt-6">
            <Stat to={20} suffix="+" label="Years of creative direction" />
            <Stat to={175} suffix="+" label="Projects shipped" />
            <Stat display="∞" label="Time spent exploring AI" />
          </div>

          <div className="mt-10 grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-7 space-y-5 text-bone/85 leading-relaxed">
              <p>
                I&apos;m a Creative Director and AI strategist working out of
                Virginia Beach, Philadelphia, and Brooklyn. I lead creative for
                brands that care about clarity, craft, and outcomes — bringing
                two decades of experience across brand identity, web design,
                packaging, and product to every engagement.
              </p>
              <p>
                I blend creative direction with AI-enabled tools to help teams
                move faster and make smarter decisions. Not to replace human
                judgment — to expand it. Modern tools, classical taste.
              </p>
              <p>
                Every project ships with a system underneath it. Tokens,
                components, governance — so the work keeps working long after
                I&apos;ve handed it off. If you have a brand that needs a
                steadier hand or a team that needs better leverage, I&apos;d
                like to hear about it.
              </p>
            </div>

            <div className="col-span-12 md:col-span-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute mb-3">
                // current roles
              </div>
              <ul className="border-t border-line">
                {ROLES.map((role, i) => (
                  <motion.li
                    key={role.company}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="grid grid-cols-[1fr_auto] gap-2 items-baseline py-3 border-b border-line/70"
                  >
                    <div>
                      <div className="font-mono text-xs uppercase tracking-[0.18em] text-bone">
                        {role.company}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                        {role.title}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                        {role.range}
                      </span>
                      {role.current && (
                        <span className="ml-2 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-green">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inset-0 rounded-full bg-green animate-ping opacity-70" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green" />
                          </span>
                          live
                        </span>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>

              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute mt-10 mb-3">
                // tools in rotation
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {STACK.map((s) => (
                  <li
                    key={s}
                    className="inline-flex items-center font-mono text-[10px] uppercase tracking-[0.16em] text-bone/80 border border-line rounded-full px-2.5 py-1 hover:border-green hover:text-green transition-colors"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Stat — either an animated count-up number or a static display string
 * (e.g. "∞"). Provide `to` for numeric counting; provide `display` for a
 * symbol or static value that wouldn't animate meaningfully.
 */
function Stat({
  to,
  suffix,
  label,
  display,
}: {
  to?: number;
  suffix?: string;
  label: string;
  display?: string;
}) {
  return (
    <div>
      <div className="font-display text-[clamp(2rem,5vw,3.6rem)] leading-none tracking-[-0.035em] text-green">
        {display !== undefined ? (
          <span aria-label={display}>{display}</span>
        ) : (
          <CountUp to={to ?? 0} suffix={suffix} />
        )}
      </div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mute leading-snug">
        {label}
      </div>
    </div>
  );
}
