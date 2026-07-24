"use client";

import { motion } from "framer-motion";
import { Link } from "next-view-transitions";
import { ArrowUpLeft, ArrowUpRight, ArrowDownToLine } from "lucide-react";
import { LEADERSHIP_PROJECTS } from "@/lib/projects";
import { PROFILE } from "@/lib/profile";
import Testimonials from "./Testimonials";

const EXPERIENCE = [
  "Creative Manager, Elevance Health / Carelon (current)",
  "Formerly Creative Director, Beacon Health Options",
  "Managed a five-person design team",
  "Executive and cross-functional stakeholder collaboration",
  "Agency and vendor direction",
  "Workfront and production workflow ownership",
  "Enterprise rebrand participation (Beacon → Carelon)",
  "Creative review and quality control",
  "Campaign and brand-system development",
];

const CAN_LEAD = [
  "Brand creative",
  "Integrated campaigns",
  "Creative services",
  "Design teams",
  "Creative operations",
  "Brand systems",
  "Content design",
  "AI-enabled creative workflows",
];

const PRINCIPLES = [
  {
    title: "Give clear direction",
    body: "Translate business goals into focused creative briefs, useful feedback, and decisions teams can act on.",
  },
  {
    title: "Protect the idea",
    body: "Keep creative work strategically focused while navigating executive feedback, compliance, timelines, and competing priorities.",
  },
  {
    title: "Build stronger teams",
    body: "Create an environment where designers understand expectations, receive meaningful critique, and gain confidence and ownership.",
  },
  {
    title: "Improve the system",
    body: "Identify the operational friction that slows teams down and build workflows, templates, governance, and tools that improve quality and speed.",
  },
];

// Verified, qualitative proof leads. Specific figures stay clearly labeled as
// TODO until confirmed — they are not presented as facts.
const PROOF = [
  "Led creative through an enterprise acquisition and rebrand — Beacon Health Options → Carelon / Elevance Health (2018–2020)",
  "Migrated ~1,500+ brand assets across an ~85,000+ employee organization",
  "Built the Marketing Bench creative-support model — ~60% faster turnaround and ~30% higher engagement (2020)",
  "Reworked Workfront intake, review, and approval across ~75+ projects a month (2025)",
  "Owned creative review and quality control across high-volume output",
  "Built templates, systems, and governance so quality scaled with the team",
];

const isTodo = (s: string) => s.trim().toUpperCase().startsWith("TODO");

export default function LeadershipPage() {
  return (
    <>
      <section className="container-x pt-28 md:pt-32 pb-12">
        <Link
          href="/"
          data-cursor="back"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-mute hover:text-green transition-colors"
        >
          <ArrowUpLeft className="h-3.5 w-3.5" />
          back to home
        </Link>

        <div className="mt-10 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-green"
            >
              // Leadership
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute"
            >
              {PROFILE.titleShort} · {PROFILE.yearsExperience} years
            </motion.p>
          </div>
          <div className="col-span-12 md:col-span-8">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2.4rem,6.4vw,6rem)] leading-[1.05] tracking-[-0.045em] text-bone"
            >
              Creative leadership built inside{" "}
              <em className="font-display-wonk text-green">
                complex organizations.
              </em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mt-6 text-bone/85 text-lg leading-relaxed max-w-[58ch]"
            >
              My experience spans brand transformation, integrated campaigns,
              creative operations, digital experiences, team leadership,
              stakeholder alignment, and AI-enabled workflow improvement.
            </motion.p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/resume"
                data-cursor="resume"
                className="group inline-flex items-center gap-2 rounded-full bg-green text-ink px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
              >
                Download Résumé
                <ArrowDownToLine className="h-3.5 w-3.5" />
              </Link>
              <a
                href={`mailto:${PROFILE.contact.email}?subject=Leadership%20opportunity`}
                data-cursor="email"
                className="inline-flex items-center gap-2 rounded-full border border-line-2 px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-bone hover:border-green hover:text-green transition-colors"
              >
                Contact John About a Role
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership experience */}
      <Block eyebrow="Leadership experience">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 max-w-[70ch]">
          {EXPERIENCE.map((e) => (
            <li
              key={e}
              className="flex items-start gap-3 py-2.5 border-b border-line/60 leading-relaxed"
            >
              <span className="text-green mt-1.5 shrink-0">↳</span>
              <span className={isTodo(e) ? "text-mute-2 italic" : "text-bone/85"}>
                {e}
              </span>
            </li>
          ))}
        </ul>
      </Block>

      {/* What John can lead */}
      <Block eyebrow="What John can lead">
        <div className="flex flex-wrap gap-2">
          {CAN_LEAD.map((c) => (
            <span
              key={c}
              className="inline-flex items-center font-mono text-[11px] uppercase tracking-[0.16em] text-bone/85 border border-line rounded-full px-4 py-2"
            >
              {c}
            </span>
          ))}
        </div>
      </Block>

      {/* Featured leadership case studies */}
      <Block eyebrow="Featured leadership work">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {LEADERSHIP_PROJECTS.map((p) => (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              data-cursor="open case"
              className="group rounded-xl border border-line bg-ink-2 p-6 hover:border-line-2 transition-colors flex flex-col"
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})`,
                }}
                className="h-24 rounded-lg border border-line/60 mb-5 flex items-end p-3"
              >
                <span className="font-display text-xl tracking-[-0.03em] text-bone/90 mix-blend-screen">
                  {p.display}
                </span>
              </div>
              <h3 className="font-display text-xl leading-[1.1] tracking-[-0.03em] text-bone group-hover:text-green transition-colors">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-mute leading-relaxed">
                {p.roleSummary}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-green">
                Read case study <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </Block>

      {/* Leadership proof */}
      <Block eyebrow="Leadership proof">
        <ul className="space-y-3 max-w-[64ch]">
          {PROOF.map((p) => (
            <li key={p} className="flex items-start gap-3 leading-relaxed">
              <span className="text-green mt-1.5 shrink-0">↳</span>
              <span className={isTodo(p) ? "text-mute-2 italic" : "text-bone/85"}>
                {p}
              </span>
            </li>
          ))}
        </ul>
      </Block>

      {/* References — renders only when a verified testimonial exists */}
      <Testimonials />

      {/* Leadership philosophy */}
      <Block eyebrow="Leadership philosophy">
        <p className="text-bone/85 text-lg leading-relaxed max-w-[62ch] mb-10">
          Strong creative leadership isn&apos;t only about producing good ideas.
          It&apos;s about setting a clear standard, helping people improve,
          aligning stakeholders, protecting the work from unnecessary
          complexity, and building systems that make quality repeatable.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PRINCIPLES.map((pr) => (
            <div key={pr.title} className="border-t border-line pt-4">
              <h3 className="font-display text-xl tracking-[-0.025em] text-bone">
                {pr.title}
              </h3>
              <p className="mt-2 text-bone/80 leading-relaxed max-w-[46ch]">
                {pr.body}
              </p>
            </div>
          ))}
        </div>
      </Block>

      {/* Closing CTA */}
      <section className="container-x py-24 md:py-32 rule-top">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green mb-4">
              // Next step
            </p>
            <h2 className="font-display text-[clamp(2.2rem,5.4vw,4.6rem)] leading-[1.08] tracking-[-0.04em] text-bone">
              Considering John for a
              <br />
              <em className="font-display-wonk text-green">
                leadership role?
              </em>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right flex flex-wrap md:justify-end gap-3">
            <Link
              href="/resume"
              data-cursor="resume"
              className="inline-flex items-center gap-2 rounded-full bg-green text-ink px-6 py-4 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
            >
              Download Résumé
              <ArrowDownToLine className="h-3.5 w-3.5" />
            </Link>
            <a
              href={`mailto:${PROFILE.contact.email}?subject=Leadership%20opportunity`}
              data-cursor="email"
              className="inline-flex items-center gap-2 rounded-full border border-line-2 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-bone hover:border-green hover:text-green transition-colors"
            >
              Contact John
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function Block({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container-x py-16 md:py-24 rule-top">
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-4">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-green"
          >
            // {eyebrow}
          </motion.p>
        </div>
        <div className="col-span-12 md:col-span-8">{children}</div>
      </div>
    </section>
  );
}
