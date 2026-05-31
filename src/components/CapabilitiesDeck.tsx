"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Sparkles,
  Wand2,
  MessageSquareQuote,
  Zap,
  Eye,
  Printer,
} from "lucide-react";
import { useEffect, useState } from "react";
import CCMark from "./CCMark";
import { PROJECTS } from "@/lib/projects";

const SLIDES = [
  { id: "cover", num: "01", title: "Cover" },
  { id: "hello", num: "02", title: "Hello" },
  { id: "services", num: "03", title: "Services" },
  { id: "biad", num: "04", title: "Brand-in-a-Day OS" },
  { id: "talks-back", num: "05", title: "Style Guide That Talks Back" },
  { id: "factory", num: "06", title: "Campaign Factory" },
  { id: "atelier", num: "07", title: "Atelier" },
  { id: "work", num: "08", title: "Selected Work" },
  { id: "process", num: "09", title: "Process" },
  { id: "engagement", num: "10", title: "Engagement" },
  { id: "contact", num: "11", title: "Get In Touch" },
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
        <BIAD />
        <TalksBack />
        <Factory />
        <Atelier />
        <Work />
        <Process />
        <Engagement />
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
            background: #080808;
            color: #f5f3ef;
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
            <span className="mx-3 text-mute">·</span>
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
          // {num} — {label}
        </span>
        <span className="text-mute">Carman / Creative — 2026</span>
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
            // Capabilities Deck — 2026
          </motion.div>
          <h1 className="font-display text-[clamp(3.4rem,9vw,9rem)] leading-[1.02] tracking-[-0.045em] text-bone">
            Creative direction,
            <br />
            <em className="font-display-wonk text-green">
              accelerated by AI.
            </em>
          </h1>
          <p className="mt-10 font-mono text-[12px] uppercase tracking-[0.28em] text-mute">
            John Carman / Carman Creative
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.28em] text-bone/85">
            Virginia Beach / Philadelphia / Brooklyn
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
            John Carman / Creative Director &amp; AI Strategist
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
            <Fact n="20+" label="years across brand, web, packaging, product" />
            <Fact n="100+" label="projects shipped — agency, in-house, studio" />
            <Fact n="3" label="cities — VA Beach, Philadelphia, Brooklyn" />
            <Fact n="4" label="AI-native creative systems in production" />
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
      lines: ["UX + UI", "Tokens + Components", "A11y baked in", "Storybook + Docs"],
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

function BIAD() {
  return (
    <Slide id="biad" num="04" label="Brand-in-a-Day OS">
      <div className="grid grid-cols-12 gap-6 md:gap-10 items-center">
        <div className="col-span-12 md:col-span-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green mb-6">
            // AI Lab / Flagship
          </p>
          <h2 className="font-display text-[clamp(2.4rem,6vw,5.4rem)] leading-[1.05] tracking-[-0.04em] text-bone">
            Brand-in-a-Day
            <br />
            <em className="font-display-wonk text-green">OS.</em>
          </h2>
          <p className="mt-6 text-bone/85 text-lg leading-relaxed max-w-[52ch]">
            A token-driven launch kit. Start with a brief, end the same day
            with a tokens file, type system, mark sketches, component
            library, and on-brand social cuts.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-[48ch]">
            {[
              "Color + Type tokens",
              "Component library",
              "Mark + Identity sketches",
              "Social cut templates",
              "Web shell + tokens",
              "Brand bible v0",
            ].map((it) => (
              <div
                key={it}
                className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/85"
              >
                <Check className="h-3.5 w-3.5 text-green shrink-0" />
                {it}
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-12 md:col-span-5">
          <div className="rounded-lg border border-line bg-ink-2 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                tokens / live
              </div>
              <div className="inline-flex items-center gap-1 font-mono text-[10px] text-green">
                <Zap className="h-3 w-3" />
                synced
              </div>
            </div>
            <div className="p-5 grid gap-3">
              {[
                { label: "color/bg", v: "#080808" },
                { label: "color/surface", v: "#141414" },
                { label: "color/accent", v: "#1cb791" },
                { label: "radius/soft", v: "12px" },
                { label: "type/display", v: "Fraunces" },
              ].map((t) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]"
                >
                  <span className="text-bone/80">{t.label}</span>
                  <span className="inline-flex items-center gap-2 text-bone">
                    {t.label.startsWith("color") && (
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-line"
                        style={{ background: t.v }}
                      />
                    )}
                    {t.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

function TalksBack() {
  return (
    <Slide id="talks-back" num="05" label="Style Guide That Talks Back">
      <div className="grid grid-cols-12 gap-6 md:gap-10 items-center">
        <div className="col-span-12 md:col-span-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green mb-6">
            // AI Lab / In Beta
          </p>
          <h2 className="font-display text-[clamp(2.4rem,6vw,5.4rem)] leading-[1.05] tracking-[-0.04em] text-bone">
            Style Guide that
            <br />
            <em className="font-display-wonk text-green">answers back.</em>
          </h2>
          <p className="mt-6 text-bone/85 text-lg leading-relaxed max-w-[52ch]">
            An AI-native brand bible. Designers ask, &ldquo;show me a hero in
            this voice&rdquo; — and get on-system outputs in your tokens,
            every time.
          </p>
        </div>
        <div className="col-span-12 md:col-span-5">
          <div className="rounded-lg border border-line bg-ink-2 p-5 space-y-3">
            <div className="flex justify-end">
              <div className="max-w-[88%] rounded-2xl rounded-tr-sm border border-green/40 bg-green/[0.08] px-3.5 py-2.5">
                <span className="text-[13px] text-bone">
                  Show me a homepage hero.
                </span>
              </div>
            </div>
            <div className="flex">
              <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-line bg-ink px-3.5 py-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MessageSquareQuote className="h-3 w-3 text-green" />
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-mute">
                    Assistant
                  </span>
                </div>
                <p className="text-[13px] leading-snug text-bone/90">
                  Three options — all on tokens, all in voice.
                </p>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] rounded border border-line bg-ink-2 flex items-center justify-center"
                    >
                      <span
                        className="font-display-wonk text-green text-[9px]"
                      >
                        v0{i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

function Factory() {
  return (
    <Slide id="factory" num="06" label="Campaign Factory">
      <div className="grid grid-cols-12 gap-6 md:gap-10 items-center">
        <div className="col-span-12 md:col-span-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green mb-6">
            // AI Lab / Concept
          </p>
          <h2 className="font-display text-[clamp(2.4rem,6vw,5.4rem)] leading-[1.05] tracking-[-0.04em] text-bone">
            Campaign
            <br />
            <em className="font-display-wonk text-green">Factory.</em>
          </h2>
          <p className="mt-6 text-bone/85 text-lg leading-relaxed max-w-[52ch]">
            One campaign idea fans out to social, print, motion, and web —
            all on tokens, all in voice, all production-ready.
          </p>
          <div className="mt-6 flex items-center gap-2 flex-wrap font-mono text-[10px] uppercase tracking-[0.22em]">
            {[
              "16:9 Web Hero",
              "4:5 IG Portrait",
              "9:16 IG Story",
              "1:1 IG Feed",
              "2:3 Print",
              "5:2 Banner",
            ].map((s) => (
              <span
                key={s}
                className="px-2 py-1 rounded-full border border-line text-bone/80"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="col-span-12 md:col-span-6">
          <div className="grid grid-cols-6 grid-rows-3 gap-2 aspect-[5/3]">
            {[
              "col-span-4 row-span-2",
              "col-span-2 row-span-2",
              "col-span-2",
              "col-span-2",
              "col-span-2",
            ].map((cls, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className={`${cls} relative rounded-md border border-line bg-ink-2 overflow-hidden flex items-center justify-center`}
              >
                <div className="absolute inset-0 opacity-30"
                  style={{
                    background:
                      i % 2
                        ? "radial-gradient(circle at 70% 50%, rgba(28,183,145,0.5), transparent 60%)"
                        : "radial-gradient(circle at 30% 50%, rgba(46,229,179,0.45), transparent 60%)",
                  }}
                />
                <span className="font-display-wonk text-green text-sm relative">
                  v0{i + 1}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  );
}

function Atelier() {
  return (
    <Slide id="atelier" num="07" label="Atelier">
      <div className="grid grid-cols-12 gap-6 md:gap-10 items-center">
        <div className="col-span-12 md:col-span-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green mb-6">
            // AI Lab / Concept
          </p>
          <h2 className="font-display text-[clamp(2.4rem,6vw,5.4rem)] leading-[1.05] tracking-[-0.04em] text-bone">
            Atelier — a senior
            <br />
            <em className="font-display-wonk text-green">eye on every draft.</em>
          </h2>
          <p className="mt-6 text-bone/85 text-lg leading-relaxed max-w-[52ch]">
            A custom GPT trained on your design system and house POV. Reviews
            work-in-progress, writes feedback in your CD voice, catches drift
            before it ships.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 max-w-[40ch]">
            {[
              { label: "Off-brand", color: "#f06464" },
              { label: "Craft", color: "#ffd84f" },
              { label: "Clarity", color: "#7ad7ff" },
              { label: "Opportunity", color: "#2ee5b3" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/85"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-12 md:col-span-5">
          <div className="aspect-[4/3] rounded-lg border border-line bg-ink-2 relative overflow-hidden">
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                // hero v3
              </span>
              <p
                className="mt-2 font-display text-2xl leading-[1.05] tracking-[-0.03em] text-bone/85"
              >
                Find your line.
              </p>
              <p className="mt-1 text-xs text-mute">
                New collection, made to be used.
              </p>
            </div>
            {/* Pins */}
            {[
              { x: 22, y: 35, c: "#ffd84f", n: 1 },
              { x: 65, y: 25, c: "#7ad7ff", n: 2 },
              { x: 78, y: 55, c: "#f06464", n: 3 },
              { x: 35, y: 70, c: "#2ee5b3", n: 4 },
            ].map((p) => (
              <span
                key={p.n}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  background: p.c,
                  color: "#0c0c0c",
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-medium border-2 border-white/60"
              >
                {p.n}
              </span>
            ))}
            <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-green">
              <Eye className="h-3 w-3" />
              4 notes
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

function Work() {
  return (
    <Slide id="work" num="08" label="Selected Work">
      <h2 className="font-display text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[1.05] tracking-[-0.04em] text-bone mb-10">
        Selected <em className="font-display-wonk text-green">work.</em>
      </h2>
      <div className="grid grid-cols-2 gap-3 md:gap-5 flex-1">
        {PROJECTS.map((p) => (
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
                {p.year} / {p.duration}
              </p>
            </div>
          </div>
        ))}
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
      body: "Tokens, components, governance — work that scales without me.",
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
    <Slide id="process" num="09" label="Process">
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
            <p className="mt-2 text-bone/75 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </Slide>
  );
}

function Engagement() {
  const tiers = [
    {
      label: "Project",
      tagline: "A defined scope, shipped",
      detail:
        "Best for: launches, identity refreshes, single-channel campaigns. Fixed scope, clear timeline, weekly check-ins.",
      duration: "4 — 12 weeks",
    },
    {
      label: "Retainer",
      tagline: "Steady creative direction",
      detail:
        "Best for: scaling teams, ongoing brand work, multi-channel programs. Monthly engagement, embedded in the team.",
      duration: "3 — 12 months",
    },
    {
      label: "Fractional CD",
      tagline: "Senior eye, part-time",
      detail:
        "Best for: startups without a full-time CD, or teams needing a strategic upgrade. Two days a week.",
      duration: "6 — 18 months",
    },
  ];
  return (
    <Slide id="engagement" num="10" label="Engagement">
      <h2 className="font-display text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[1.05] tracking-[-0.04em] text-bone mb-10">
        How to <em className="font-display-wonk text-green">work with me.</em>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line rounded-lg overflow-hidden">
        {tiers.map((t, i) => (
          <div
            key={t.label}
            className={`bg-ink p-6 md:p-8 flex flex-col gap-4 ${
              i === 1 ? "border-y-2 border-green/40" : ""
            }`}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                / 0{i + 1}
              </span>
              {i === 1 && (
                <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-green">
                  most common
                </span>
              )}
            </div>
            <h3 className="font-display text-2xl md:text-3xl leading-[1.05] tracking-[-0.03em] text-bone">
              {t.label}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-green">
              {t.tagline}
            </p>
            <p className="text-bone/80 leading-relaxed text-sm flex-1">
              {t.detail}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/85 border-t border-line pt-3">
              {t.duration}
            </p>
          </div>
        ))}
      </div>
    </Slide>
  );
}

function Contact() {
  return (
    <Slide id="contact" num="11" label="Get In Touch">
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
            system — start with a short note about what you&apos;re building.
            I reply within a day.
          </p>
          <div className="mt-10 flex items-center flex-wrap gap-4">
            <a
              href="mailto:johnbcarman@gmail.com?subject=Project%20inquiry"
              data-cursor="email"
              className="inline-flex items-center gap-3 rounded-full bg-green text-ink px-7 py-5 font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
            >
              johnbcarman@gmail.com
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
            { l: "Studio", v: "Virginia Beach\nPhiladelphia\nBrooklyn" },
            { l: "Hours", v: "Mon–Fri\n9a–6p EST" },
            { l: "Social", v: "@jbcarms\nlinkedin.com/in/johncarman" },
            {
              l: "Open for",
              v: "Retainer / Project\nFractional CD",
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
