"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { ArrowDownToLine, ArrowUpRight } from "lucide-react";
import CountUp from "./CountUp";
import { PROFILE } from "@/lib/profile";

type Role = {
  company: string;
  title: string;
  /** Prior title at the same org, shown when a reorg changed the title. */
  formerly?: string;
  range: string;
  current?: boolean;
};

/**
 * Employment history, most-senior / enterprise role first. The Elevance
 * entry deliberately surfaces both the current Manager title and the prior
 * Creative Director title so the career progression reads honestly.
 */
const ROLES: Role[] = [
  {
    company: "Elevance Health / Carelon",
    title: "Creative Manager",
    formerly: "Formerly Creative Director, Beacon Health Options",
    range: "2010 — Present",
    current: true,
  },
  {
    company: "Jumping Fish",
    title: "Creative Director",
    range: "2014 — Present",
    current: true,
  },
  {
    company: "Carman Creative",
    title: "Founder",
    range: "2020 — Present",
    current: true,
  },
];

const STRENGTHS = [
  "Creative direction",
  "Brand strategy & systems",
  "Team leadership & critique",
  "Stakeholder communication",
  "Creative operations",
  "Digital experience",
  "Campaign development",
  "AI-enabled workflow",
];

const STACK = [
  "Adobe Creative Cloud",
  "Figma",
  "Workfront",
  "Claude",
  "GPT-5",
  "Midjourney",
  "Next.js",
];

export default function About() {
  return (
    <section id="about" className="relative py-16 sm:py-24 md:py-40 container-x rule-top">
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // 05 — About
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
              alt="John Carman, Creative Director"
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
            &ldquo;Give me a difficult brand, a complicated organization, and a
            creative team — I&apos;ll make all three better.&rdquo;
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
              built for complexity.
            </em>
          </motion.h2>

          {/* Proof row — only numbers that are defensible from the record.
              Enterprise-scale figures (asset counts, org headcount, monthly
              volume) live on the Leadership page as clearly-labeled TODOs
              until confirmed; they are not published as facts here. */}
          <div className="mt-10 grid grid-cols-3 gap-4 md:gap-8 border-t border-line pt-6">
            <Stat to={20} suffix="+" label="Years leading creative & brand" />
            <Stat to={15} suffix="+" label="Years in enterprise healthcare creative" />
            <Stat to={5} label="Designers managed as a creative lead" />
          </div>

          <div className="mt-10 grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-7 space-y-5 text-bone/85 leading-relaxed">
              <p>
                I&apos;m a Creative Director and creative-operations leader with{" "}
                {PROFILE.yearsExperience} years helping organizations turn
                complex goals into clear, useful, and distinctive creative work.
                Most of that career has been inside enterprise healthcare —
                where the brand is large, the stakeholders are many, and the
                work has to hold up under compliance, scale, and scrutiny.
              </p>
              <p>
                I grew into creative direction leading brand, campaign, digital,
                and creative-operations work, managing a five-person design
                team, and serving as a creative lead through the transition of
                Beacon Health Options into Carelon and Elevance Health. Following that
                restructuring my title moved from Creative Director to Creative
                Manager, while the work continued to span enterprise creative,
                brand, workflow, and stakeholder leadership.
              </p>
              <p>
                Alongside that, I run Carman Creative — selected brand, digital,
                and consulting engagements — and spend real time modernizing how
                creative teams work with AI. I&apos;m now looking to bring that
                experience to a more challenging leadership environment: to shape
                the work, strengthen the team, and improve how creative moves
                through an organization.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/resume"
                  data-cursor="resume"
                  className="group inline-flex items-center gap-2 rounded-full bg-green text-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
                >
                  Download Résumé
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                </Link>
                <a
                  href={`mailto:${PROFILE.contact.email}?subject=Leadership%20opportunity`}
                  data-cursor="email"
                  className="inline-flex items-center gap-2 rounded-full border border-line-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone hover:border-green hover:text-green transition-colors"
                >
                  Contact John
                </a>
                <a
                  href={PROFILE.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="linkedin"
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-mute hover:text-bone transition-colors"
                >
                  LinkedIn
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="pt-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute mb-3">
                  // strengths
                </div>
                <ul className="flex flex-wrap gap-1.5">
                  {STRENGTHS.map((s) => (
                    <li
                      key={s}
                      className="inline-flex items-center font-mono text-[10px] uppercase tracking-[0.16em] text-bone/80 border border-line rounded-full px-2.5 py-1"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-span-12 md:col-span-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute mb-3">
                // experience
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
                      {role.formerly && (
                        <div className="mt-1 text-[11px] leading-snug text-mute-2 normal-case tracking-normal font-sans">
                          {role.formerly}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                        {role.range}
                      </span>
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
