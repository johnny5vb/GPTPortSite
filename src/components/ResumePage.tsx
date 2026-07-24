"use client";

import { Link } from "next-view-transitions";
import { ArrowUpLeft, Printer } from "lucide-react";
import { PROFILE } from "@/lib/profile";

type Job = {
  company: string;
  title: string;
  formerly?: string;
  range: string;
  bullets: string[];
};

/**
 * On-page résumé. Content is grounded in verified facts; specific enterprise
 * metrics are clearly labeled TODO until confirmed and never read as claims.
 * "Download" = browser print / save-as-PDF until an official PDF is committed
 * (see PROFILE.resumePdf).
 */
const JOBS: Job[] = [
  {
    company: "Elevance Health / Carelon",
    title: "Creative Manager",
    formerly: "Formerly Creative Director, Beacon Health Options",
    range: "2010 — Present",
    bullets: [
      "Lead brand, campaign, digital, and creative-operations work across a complex healthcare organization.",
      "Served as a creative lead through the Beacon Health Options → Carelon / Elevance Health transition (2018–2020); title moved from Creative Director to Creative Manager through the restructuring.",
      "Migrated ~1,500+ brand assets to the new identity across an ~85,000+ employee organization.",
      "Managed a five-person design team and directed outside agencies and vendors.",
      "Built the Marketing Bench creative-support model (2020) — ~60% faster turnaround and ~30% higher engagement.",
      "Reworked Workfront intake, review, and approval across ~75+ projects a month (2025).",
      "Own creative review and quality control; build templates, systems, and governance so quality scales.",
    ],
  },
  {
    company: "Jumping Fish",
    title: "Creative Director",
    range: "2014 — Present",
    bullets: [
      "Creative direction for brand, campaign, and digital work.",
      "TODO: Confirm scope, notable clients, and outcomes.",
    ],
  },
  {
    company: "Carman Creative",
    title: "Founder",
    range: "2020 — Present",
    bullets: [
      "Independent studio: selected brand, identity, web, campaign, and creative-systems engagements.",
      "Recent work includes Colony Coffee, Friends Rehabilitation Program, Stamp Out Stigma, Special Forces Trust, and Spike's K9 Fund.",
    ],
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
  "AI-enabled workflow modernization",
];

const TOOLS = [
  "Adobe Creative Cloud",
  "Figma",
  "Workfront",
  "Claude",
  "GPT-5",
  "Midjourney",
  "Next.js",
];

const isTodo = (s: string) => s.trim().toUpperCase().startsWith("TODO");

export default function ResumePage() {
  return (
    <div className="container-x pt-28 md:pt-32 pb-24">
      {/* Controls — hidden in print */}
      <div className="no-print flex items-center justify-between mb-10">
        <Link
          href="/"
          data-cursor="back"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-mute hover:text-green transition-colors"
        >
          <ArrowUpLeft className="h-3.5 w-3.5" />
          back to home
        </Link>
        <button
          onClick={() => window.print()}
          data-cursor="print"
          className="inline-flex items-center gap-2 rounded-full bg-green text-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
        >
          Print / Save as PDF
          <Printer className="h-3.5 w-3.5" />
        </button>
      </div>

      <article className="resume-doc mx-auto max-w-[52rem]">
        {/* Header */}
        <header className="border-b border-line pb-6">
          <h1 className="font-display text-[clamp(2.2rem,6vw,3.4rem)] tracking-[-0.04em] text-bone leading-none">
            {PROFILE.name}
          </h1>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            {PROFILE.titleLine}
          </p>
          <p className="mt-3 text-sm text-mute flex flex-wrap gap-x-4 gap-y-1">
            <span>{PROFILE.location.base}</span>
            <a href={`mailto:${PROFILE.contact.email}`} className="hover:text-green">
              {PROFILE.contact.email}
            </a>
            <a
              href={PROFILE.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green"
            >
              linkedin.com/in/johncarman
            </a>
          </p>
          <p className="mt-2 text-sm text-mute">
            {PROFILE.location.availability}.
          </p>
        </header>

        {/* Summary */}
        <Section title="Summary">
          <p className="text-bone/85 leading-relaxed">
            Creative Director and creative-operations leader with{" "}
            {PROFILE.yearsExperience} years turning complex goals into clear,
            useful, and distinctive creative work — most of it inside enterprise
            healthcare. Experienced leading brand, campaigns, digital, and
            creative operations; managing designers, agencies, and stakeholders;
            and modernizing how teams work with AI. Seeking a senior in-house
            creative leadership role.
          </p>
        </Section>

        {/* Experience */}
        <Section title="Experience">
          <div className="space-y-6">
            {JOBS.map((job) => (
              <div key={job.company}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-display text-xl tracking-[-0.02em] text-bone">
                    {job.company}
                  </h3>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
                    {job.range}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.18em] text-green">
                  {job.title}
                </p>
                {job.formerly && (
                  <p className="mt-0.5 text-xs text-mute-2 italic">
                    {job.formerly}
                  </p>
                )}
                <ul className="mt-3 space-y-1.5">
                  {job.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="text-green mt-1.5 shrink-0 text-[10px]">
                        ▪
                      </span>
                      <span
                        className={
                          isTodo(b)
                            ? "text-mute-2 italic text-sm"
                            : "text-bone/85 text-sm"
                        }
                      >
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Strengths */}
        <Section title="Strengths">
          <ul className="flex flex-wrap gap-2">
            {STRENGTHS.map((s) => (
              <li
                key={s}
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone/85 border border-line rounded-full px-3 py-1"
              >
                {s}
              </li>
            ))}
          </ul>
        </Section>

        {/* Tools */}
        <Section title="Tools">
          <p className="text-sm text-bone/85">{TOOLS.join(" · ")}</p>
        </Section>

        <p className="mt-10 text-xs text-mute-2 italic">
          TODO: Attach an official PDF résumé (public/john-carman-resume.pdf);
          the Print / Save as PDF button covers it until then.
        </p>
      </article>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}
