"use client";

import { Link } from "next-view-transitions";
import { ArrowUpLeft, Printer } from "lucide-react";
import { PROFILE } from "@/lib/profile";
import { EMPLOYERS } from "@/lib/career";

/**
 * On-page résumé. Content is grounded in verified facts and derives from
 * `src/lib/career.ts`, so it cannot drift from the About section, the
 * Leadership page, or the LinkedIn profile kept in sync with it.
 *
 * Two things deliberately do NOT render here any more:
 *
 * 1. Visible "TODO: Confirm …" bullets. Unwritten bullets live as code
 *    comments in career.ts instead. A hiring manager reading a live TODO on a
 *    résumé concludes the document is unfinished, which costs more than the
 *    missing line.
 * 2. A visible "TODO: Attach an official PDF résumé" footnote. Same reason.
 *    The ask is still real — see PROFILE.resumePdf — it just belongs in the
 *    code, not on the page a recruiter is reading.
 *
 * "Download" was also the wrong verb on every button pointing here: this is a
 * page, and the browser print dialog is what produces the file. The buttons
 * say "View Résumé" now, and the print control lives on this page.
 */

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
        {/* Header. The site URL belongs here: this page becomes the PDF a
            hiring manager forwards, and without it the portfolio is one more
            thing they have to go looking for. */}
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
            <a
              href="https://www.carmancreative.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green"
            >
              carmancreative.com
            </a>
          </p>
        </header>

        {/* Summary — leads with the title and the two things a director-level
            screen checks first: people led and scale operated at. */}
        <Section title="Summary">
          <p className="text-bone/85 leading-relaxed">
            Creative Director and creative-operations leader with{" "}
            {PROFILE.yearsExperience} years turning complex goals into clear,
            useful, and distinctive creative work — most of it inside enterprise
            healthcare. Led creative through an enterprise acquisition and
            rebrand, manage a five-person design team, direct outside agencies
            and vendors, and build the systems, templates, and governance that
            let quality scale with volume.
          </p>
        </Section>

        {/* Experience */}
        <Section title="Experience">
          <div className="space-y-8">
            {EMPLOYERS.map((job) => (
              <div key={job.company}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-display text-xl tracking-[-0.02em] text-bone">
                    {job.company}
                  </h3>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
                    {job.range}
                  </span>
                </div>

                {/* Titles held, most recent first, each with its own
                    accomplishments. Two rows here is the whole point: it shows
                    the Creative Director title as a role that was held, with
                    dates and with the rebrand and Marketing Bench attached to
                    it — not as a "formerly" footnote under the current title. */}
                <div className="mt-2 space-y-4">
                  {job.stints.map((stint) => (
                    <div key={`${stint.title}-${stint.range}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-green">
                          {stint.title}
                          {stint.org && (
                            <span className="text-mute"> / {stint.org}</span>
                          )}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute-2">
                          {stint.range}
                        </span>
                      </div>
                      <ul className="mt-2 space-y-1.5">
                        {stint.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex items-start gap-2.5 leading-relaxed"
                          >
                            <span className="text-green mt-1.5 shrink-0 text-[10px]">
                              ▪
                            </span>
                            <span className="text-bone/85 text-sm">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Selected work — a résumé that names case studies should say where
            to read them. */}
        <Section title="Selected work">
          <p className="text-sm text-bone/85 leading-relaxed">
            Case studies for the enterprise and independent work — including the
            Beacon → Carelon rebrand, the Marketing Bench creative-support
            model, and the Stamp Out Stigma campaign — are at{" "}
            <a
              href="https://www.carmancreative.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green hover:text-green-bright"
            >
              carmancreative.com
            </a>
            .
          </p>
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
