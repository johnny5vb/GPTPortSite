"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { ArrowUpRight, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import CCMark from "./CCMark";
import { PUBLISHED_PROJECTS } from "@/lib/projects";
import { SCALE } from "@/lib/career";
import { PROFILE } from "@/lib/profile";

const SLIDES = [
  { id: "cover", num: "01", title: "Cover" },
  { id: "hello", num: "02", title: "Hello" },
  { id: "services", num: "03", title: "Services" },
  { id: "work", num: "04", title: "Selected Work" },
  { id: "cqap", num: "05", title: "CQAP" },
  { id: "process", num: "06", title: "Process" },
  { id: "contact", num: "07", title: "Get In Touch" },
];

export default function CapabilitiesDeck() {
  const [active, setActive] = useState("cover");

  // Track active slide via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let best = active;
        let bestRatio = 0;
        entries.forEach((e) => {
          if (e.intersectionRatio > bestRatio) {
            bestRatio = e.intersectionRatio;
            best = e.target.id;
          }
        });
        if (best !== active && bestRatio > 0) setActive(best);
      },
      { threshold: [0.4, 0.6, 0.8] },
    );
    SLIDES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [active]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const i = SLIDES.findIndex((s) => s.id === active);
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        if (i < SLIDES.length - 1) {
          e.preventDefault();
          document
            .getElementById(SLIDES[i + 1].id)
            ?.scrollIntoView({ behavior: "smooth" });
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (i > 0) {
          e.preventDefault();
          document
            .getElementById(SLIDES[i - 1].id)
            ?.scrollIntoView({ behavior: "smooth" });
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active]);

  const print = () => {
    window.print();
  };

  return (
    <div className="capabilities-deck">
      <DeckChrome
        active={active}
        total={SLIDES.length}
        onPrint={print}
      />

      <div className="snap-y snap-mandatory overflow-y-auto h-screen">
        <Cover />
        <Hello />
        <Services />
        <Work />
        <Cqap />
        <Process />
        <Contact />
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: letter landscape;
            margin: 0;
          }
          html,
          body {
            background: #0c0b09;
            color: #f6f2ea;
          }
          .deck-chrome,
          .deck-rail {
            display: none !important;
          }
          .deck-slide {
            page-break-after: always;
            break-after: page;
            height: 100vh !important;
            min-height: 100vh !important;
          }
          .deck-slide:last-child {
            page-break-after: auto;
          }
          .snap-y {
            overflow: visible !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Chrome (slide indicator + back/print)                                  */
/* ────────────────────────────────────────────────────────────────────── */

function DeckChrome({
  active,
  total,
  onPrint,
}: {
  active: string;
  total: number;
  onPrint: () => void;
}) {
  const i = SLIDES.findIndex((s) => s.id === active);
  return (
    <>
      {/* Top bar */}
      <header className="deck-chrome fixed top-0 inset-x-0 z-50">
        <div className="container-x py-4 flex items-center justify-between">
          <Link
            href="/"
            data-cursor="back"
            className="inline-flex items-center gap-3"
          >
            <CCMark className="h-7 w-7" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/85">
              Carman <span className="text-green">/</span> Creative
            </span>
          </Link>

          <div className="hidden md:block font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
            Capabilities Deck / 2026
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onPrint}
              data-cursor="print"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-line bg-ink-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/85 hover:text-green hover:border-green/60 transition-colors"
            >
              <Printer className="h-3 w-3" />
              Save as PDF
            </button>
            <Link
              href="/"
              data-cursor="exit"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green text-ink font-mono text-[10px] uppercase tracking-[0.22em] hover:bg-green-bright transition-colors"
            >
              Exit deck
            </Link>
          </div>
        </div>
      </header>

      {/* Right rail */}
      <aside className="deck-rail fixed top-1/2 right-4 md:right-6 -translate-y-1/2 z-40 hidden md:block pointer-events-none">
        <ul className="flex flex-col gap-2 items-end pointer-events-auto">
          {SLIDES.map((s) => {
            const isActive = s.id === active;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="group flex items-center gap-3"
                  data-cursor={s.num}
                >
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${
                      isActive
                        ? "text-bone/85"
                        : "text-mute group-hover:text-bone/70"
                    }`}
                  >
                    {isActive ? s.title : s.num}
                  </span>
                  <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center">
                    <span
                      className={`block h-2.5 w-2.5 rounded-full transition-all ${
                        isActive ? "bg-green" : "bg-mute-2 group-hover:bg-bone/40"
                      }`}
                      style={{ transform: isActive ? "scale(1)" : "scale(0.5)" }}
                    />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Bottom progress */}
      <div className="deck-chrome fixed bottom-0 inset-x-0 z-50 pointer-events-none">
        <div className="container-x pb-4 flex items-end justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute pointer-events-auto">
            <span className="text-bone">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-mute mx-1.5">/</span>
            <span>{String(total).padStart(2, "0")}</span>
            <span className="mx-3 text-mute">/</span>
            <span>{SLIDES[i]?.title}</span>
          </div>
          <div className="hidden md:flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute pointer-events-auto">
            <span>↑ ↓</span>
            <span className="text-mute-2">navigate</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Slide shell                                                            */
/* ────────────────────────────────────────────────────────────────────── */

function Slide({
  id,
  num,
  label,
  children,
  bg,
}: {
  id: string;
  num: string;
  label: string;
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <section
      id={id}
      className="deck-slide snap-start relative h-screen min-h-screen w-full flex flex-col container-x pt-20 pb-14"
      style={bg ? { background: bg } : undefined}
    >
      {/* Slide marker */}
      <div className="absolute top-20 left-[max(1.25rem,4vw)] right-[max(1.25rem,4vw)] flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
        <span className="text-green">
          // {num} – {label}
        </span>
        <span className="text-mute">Carman / Creative, 2026</span>
      </div>

      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Slides                                                                 */
/* ────────────────────────────────────────────────────────────────────── */

function Cover() {
  return (
    <Slide id="cover" num="01" label="Cover">
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 md:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-mono text-[11px] uppercase tracking-[0.28em] text-green mb-8"
          >
            // Capabilities Deck – 2026
          </motion.div>
          <h1 className="font-display text-[clamp(3.4rem,9vw,9rem)] leading-[1.02] tracking-[-0.045em] text-bone">
            Creative leadership,
            <br />
            <em className="font-display-wonk text-green">
              built for complexity.
            </em>
          </h1>
          <p className="mt-10 font-mono text-[12px] uppercase tracking-[0.28em] text-mute">
            {PROFILE.name} / {PROFILE.titleShort}
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.28em] text-bone/85">
            Virginia Beach / Brand / Design systems
          </p>
        </div>
        <div className="hidden md:block col-span-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -30 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="ml-auto"
            style={{ width: "70%" }}
          >
            <CCMark className="w-full h-auto" />
          </motion.div>
        </div>
      </div>
    </Slide>
  );
}

function Hello() {
  return (
    <Slide id="hello" num="02" label="Hello">
      <div className="grid grid-cols-12 gap-6 md:gap-10 items-center">
        <div className="col-span-12 md:col-span-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-md border border-line"
          >
            <Image
              src="/brand/portrait.png"
              alt="John Carman"
              width={1024}
              height={1024}
              className="w-full h-auto block"
            />
          </motion.div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
            {PROFILE.name} / {PROFILE.titleShort}
          </p>
        </div>
        <div className="col-span-12 md:col-span-8 space-y-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // Hi, I&apos;m John
          </p>
          <h2 className="font-display text-[clamp(2.2rem,5.4vw,4.6rem)] leading-[1.05] tracking-[-0.04em] text-bone">
            I&apos;ve spent my career helping brands
            <br />
            <em className="font-display-wonk text-green">
              make sense of complexity.
            </em>
          </h2>
          <div className="grid grid-cols-2 gap-6 mt-8 max-w-[60ch]">
            {/* All four read from `SCALE` in career.ts, so the deck cannot
                drift from the hero, About and the résumé. The fourth used to
                count the /lab demos; those slides came out in #83. */}
            <Fact n={`${SCALE.years}`} label={SCALE.yearsLabel.toLowerCase()} />
            <Fact
              n={`${SCALE.enterpriseYears}+`}
              label={SCALE.enterpriseYearsLabel.toLowerCase()}
            />
            <Fact
              n={String(SCALE.studioTeam)}
              label={SCALE.studioTeamLabel.toLowerCase()}
            />
            <Fact
              n={SCALE.assets}
              label={SCALE.assetsLabel.toLowerCase()}
            />
          </div>
        </div>
      </div>
    </Slide>
  );
}

function Services() {
  const items = [
    {
      label: "Brand Identity",
      lines: ["Strategy", "Mark + System", "Editorial Voice", "Launch Toolkit"],
    },
    {
      label: "Web Design",
      lines: ["UX + UI", "Brand rules + Components", "A11y baked in", "Storybook + Docs"],
    },
    {
      label: "Packaging",
      lines: ["Structure + Surface", "Print Specs", "Production Ready", "Sustainability"],
    },
    {
      label: "AI-Powered Creative",
      lines: ["Custom GPTs", "Variant Production", "Critique Loops", "Team Enablement"],
    },
  ];
  return (
    <Slide id="services" num="03" label="Services">
      <h2 className="font-display text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[1.05] tracking-[-0.04em] text-bone mb-12">
        What we make. <em className="font-display-wonk text-green">Together.</em>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-line border border-line rounded-lg overflow-hidden">
        {items.map((it) => (
          <div
            key={it.label}
            className="bg-ink p-6 md:p-7 flex flex-col gap-4 min-h-[16rem]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-green">
                {it.label}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                / 0{items.indexOf(it) + 1}
              </span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl leading-[1.05] tracking-[-0.025em] text-bone">
              {it.label}
            </h3>
            <ul className="mt-auto space-y-1.5">
              {it.lines.map((l) => (
                <li
                  key={l}
                  className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-bone/80"
                >
                  <span className="text-green">↳</span>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Slide>
  );
}

function Work() {
  return (
    <Slide id="work" num="04" label="Selected Work">
      <h2 className="font-display text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[1.05] tracking-[-0.04em] text-bone mb-10">
        Selected <em className="font-display-wonk text-green">work.</em>
      </h2>
      <div className="grid grid-cols-2 gap-3 md:gap-5 flex-1">
        {PUBLISHED_PROJECTS.map((p) => (
          <div
            key={p.slug}
            className="relative overflow-hidden rounded-md border border-line bg-ink-2"
          >
            <Image
              src={p.cover}
              alt={p.title}
              fill
              sizes="(max-width: 768px) 50vw, 480px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-green">
                {p.num} / {p.category}
              </span>
              <h3 className="mt-1 font-display text-xl md:text-2xl leading-[1.05] tracking-[-0.025em] text-bone">
                {p.title}
              </h3>
              <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-mute">
                {p.year}{p.duration ? ` / ${p.duration}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Slide>
  );
}

function Cqap() {
  // Every claim here is lifted from the case study in projects.ts rather than
  // written for the deck, so the two cannot drift. The alpha line stays: the
  // tool has no pilot data and the deck must not imply otherwise.
  const held = [
    ["Humans decide.", "A reviewer accepts, edits or dismisses every finding."],
    ["Evidence, always.", "Each finding returns with the rule it cites."],
    ["Memory is the product.", "A decision is saved for the next review."],
  ];
  return (
    <Slide id="cqap" num="05" label="CQAP">
      <div className="grid grid-cols-12 gap-6 md:gap-10 items-center flex-1">
        <div className="col-span-12 md:col-span-7">
          <div className="relative aspect-[16/10] overflow-hidden rounded-md border border-line bg-ink-2">
            <Image
              src="/work/cqap/04-review-findings-demo.jpg"
              alt="CQAP, the review workspace: findings placed on the proof and written up on the right"
              fill
              quality={90}
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover object-left-top"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // Built, not pitched
          </p>
          <h2 className="mt-4 font-display text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.04] tracking-[-0.04em] text-bone">
            Review once.{" "}
            <em className="font-display-wonk text-green">
              Reuse the decision.
            </em>
          </h2>
          <p className="mt-5 text-bone/85 leading-relaxed">
            CQAP checks a piece against a library of brand and production
            standards and returns each finding with the rule it cites.
          </p>
          <ul className="mt-6 space-y-3">
            {held.map(([t, b]) => (
              <li key={t} className="flex items-start gap-3">
                <span className="text-green mt-1.5 shrink-0">↳</span>
                <span className="leading-relaxed">
                  <span className="text-bone">{t}</span>{" "}
                  <span className="text-mute">{b}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-mute-2 leading-relaxed">
            Alpha. Built with ChatGPT and Claude, running on Vercel. Used in my
            own review work, not yet piloted with a wider team.
          </p>
          <Link
            href="/work/cqap"
            data-cursor="open case"
            className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/80 hover:text-green border border-line rounded-full px-5 py-3 transition-colors"
          >
            Read the case study
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Slide>
  );
}

function Process() {
  const principles = [
    {
      num: "I.",
      title: "Understand the problem first.",
      body: "Then design and technology can solve it.",
    },
    {
      num: "II.",
      title: "Design systems, not screens.",
      body: "Brand rules, components, governance, work that scales without me.",
    },
    {
      num: "III.",
      title: "Use AI to expand judgment.",
      body: "Not to replace it. Modern tools, classical taste.",
    },
    {
      num: "IV.",
      title: "Lead with clarity.",
      body: "Thoughtful process, meticulous craft, on time.",
    },
  ];
  return (
    <Slide id="process" num="06" label="Process">
      <h2 className="font-display text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[1.05] tracking-[-0.04em] text-bone mb-10">
        Four <em className="font-display-wonk text-green">principles.</em>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line rounded-lg overflow-hidden">
        {principles.map((p) => (
          <div key={p.num} className="bg-ink p-6 md:p-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
              {p.num}
            </span>
            <h3 className="mt-3 font-display text-2xl md:text-3xl leading-[1.05] tracking-[-0.03em] text-bone">
              {p.title}
            </h3>
            <p className="mt-2 text-bone/80 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </Slide>
  );
}

function Contact() {
  return (
    <Slide id="contact" num="07" label="Get In Touch">
      <div className="grid grid-cols-12 gap-6 md:gap-10 items-center">
        <div className="col-span-12 md:col-span-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green mb-6">
            // Get in touch
          </p>
          <h2 className="font-display text-[clamp(2.8rem,7.4vw,7rem)] leading-[1.02] tracking-[-0.045em] text-bone">
            Let&apos;s design something
            <br />
            <em className="font-display-wonk text-green">
              that actually works.
            </em>
          </h2>
          <p className="mt-8 text-bone/85 text-lg leading-relaxed max-w-[48ch]">
            Brand identity, web design, packaging, or an AI-powered creative
            system, start with a short note about what you&apos;re building.
          </p>
          <div className="mt-10 flex items-center flex-wrap gap-4">
            <a
              href={`mailto:${PROFILE.contact.email}`}
              data-cursor="email"
              className="inline-flex items-center gap-3 rounded-full bg-green text-ink px-7 py-5 font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
            >
              {PROFILE.contact.email}
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link
              href="/"
              data-cursor="site"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/80 hover:text-green border border-line rounded-full px-5 py-4 transition-colors"
            >
              View full portfolio
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-4">
          {[
            { l: "Based in", v: PROFILE.location.base },
            { l: "Portfolio", v: "carmancreative.com" },
            {
              l: "Social",
              v: `${PROFILE.contact.instagramHandle}\nlinkedin.com/in/johncarman`,
            },
            {
              // Was "Open for / Retainer, Project, Fractional CD", highlighted.
              // That is the solicitation posture the rest of the site dropped
              // in #41; the deck was never swept because it imported nothing.
              l: "Practice",
              v: PROFILE.practice,
              hl: true,
            },
          ].map((b) => (
            <div
              key={b.l}
              className={`p-4 rounded-md border ${
                b.hl
                  ? "border-green/40 bg-green/5"
                  : "border-line bg-ink-2"
              }`}
            >
              <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-mute mb-2">
                {b.l}
              </div>
              <div
                className={`whitespace-pre-line text-sm leading-snug ${
                  b.hl ? "text-green" : "text-bone"
                }`}
              >
                {b.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function Fact({ n, label }: { n: string; label: string }) {
  return (
    <div className="border-t border-line pt-3">
      <div className="font-display text-3xl md:text-4xl leading-[1] tracking-[-0.03em] text-green">
        {n}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-mute leading-snug">
        {label}
      </div>
    </div>
  );
}
