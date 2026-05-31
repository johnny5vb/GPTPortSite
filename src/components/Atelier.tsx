"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Check, Eye, RotateCcw, Scan, Sparkles } from "lucide-react";
import CategoryImage from "./CategoryImage";
import type { PhotoCategory } from "@/lib/photos";

/* ────────────────────────────────────────────────────────────────────── */
/* Demo data                                                              */
/* ────────────────────────────────────────────────────────────────────── */

type Severity = "off-brand" | "craft" | "clarity" | "opportunity";

const SEVERITY_LABEL: Record<Severity, string> = {
  "off-brand": "OFF-BRAND",
  craft: "CRAFT",
  clarity: "CLARITY",
  opportunity: "OPPORTUNITY",
};

const SEVERITY_COLOR: Record<Severity, string> = {
  "off-brand": "#f06464",
  craft: "#ffd84f",
  clarity: "#7ad7ff",
  opportunity: "#2ee5b3",
};

type Pin = {
  /** Percentage coords on the draft canvas */
  x: number;
  y: number;
  severity: Severity;
  category: string;
  /** Three tones: house / encouraging / tough */
  notes: {
    house: string;
    encouraging: string;
    tough: string;
  };
};

type Draft = {
  id: string;
  title: string;
  meta: string;
  brand: string;
  /** Visual style of the mock */
  variant: "hero" | "editorial" | "product";
  /** Drives which real photo set is used */
  category: PhotoCategory;
  bg: string;
  ink: string;
  accent: string;
  accent2?: string;
  surface: string;
  mute: string;
  display: string;
  pins: Pin[];
};

const DRAFTS: Draft[] = [
  {
    id: "northbound-hero",
    title: "Northbound — Web hero v3",
    meta: "Submitted by Sam, 4:21pm",
    brand: "Northbound",
    variant: "hero",
    category: "outdoor",
    bg: "#0c1f1a",
    surface: "#143027",
    ink: "#eef5ef",
    mute: "#86a39a",
    accent: "#7fe0b6",
    accent2: "#3fa67b",
    display: "Find your line.",
    pins: [
      {
        x: 22,
        y: 48,
        severity: "craft",
        category: "Display weight",
        notes: {
          house:
            "Display feels 50 weight too heavy at this size. Tokens have a Light cut — try it.",
          encouraging:
            "Headline lands. One small note: try the Light variant of the display token here — it'll breathe more at this scale.",
          tough: "Too heavy. Use the Light cut. The token exists for this exact size.",
        },
      },
      {
        x: 28,
        y: 68,
        severity: "clarity",
        category: "CTA hierarchy",
        notes: {
          house:
            "Two CTAs of equal weight read as a tie. Demote 'Read more' to a link with an arrow.",
          encouraging:
            "Love the dual CTA intent — but they currently compete. Try secondary as a text link with arrow.",
          tough: "Pick one CTA. The other should be a link.",
        },
      },
      {
        x: 78,
        y: 52,
        severity: "off-brand",
        category: "Tone in voice",
        notes: {
          house:
            "'Made to be used' is fine. 'Out now' is breathless. Try 'Available' instead — quieter, in voice.",
          encouraging:
            "Almost there. 'Out now' reads louder than Northbound's tone. 'Available' is on-voice.",
          tough: "'Out now' is wrong voice. Use 'Available.'",
        },
      },
      {
        x: 86,
        y: 30,
        severity: "opportunity",
        category: "Negative space",
        notes: {
          house:
            "Right column has unused real estate. Consider a slim product callout or product tag here.",
          encouraging:
            "There's a nice opportunity in that right column — a small product tag could anchor it.",
          tough: "Empty right column is wasted. Add a product tag.",
        },
      },
    ],
  },
  {
    id: "verso-social",
    title: "Verso — Issue 04 launch card",
    meta: "Submitted by Jess, 11:08am",
    brand: "Verso",
    variant: "editorial",
    category: "editorial",
    bg: "#f6efe2",
    surface: "#ffffff",
    ink: "#1a1410",
    mute: "#806f5b",
    accent: "#c8501c",
    accent2: "#f4a384",
    display: "Read it again.",
    pins: [
      {
        x: 50,
        y: 36,
        severity: "craft",
        category: "Tracking",
        notes: {
          house:
            "Wonk italic is tracked too tight at this size — open to -0.015em for the headline.",
          encouraging:
            "Headline reads great. One tweak: open the tracking a touch on the italic.",
          tough: "Tracking is too tight. Open it.",
        },
      },
      {
        x: 50,
        y: 70,
        severity: "clarity",
        category: "Subhead length",
        notes: {
          house:
            "Subhead is 14 words and reads like a paragraph at this size. Cut to 7 words max.",
          encouraging:
            "Solid subhead — could be even sharper at half the length.",
          tough: "Too long. Cut by half.",
        },
      },
      {
        x: 22,
        y: 18,
        severity: "opportunity",
        category: "Date stamp",
        notes: {
          house:
            "Drop date is missing. Add a small Out 03.14 in mono in the corner — Verso uses it on every launch.",
          encouraging:
            "Lovely composition. A small mono date stamp would tie it to the family.",
          tough: "Missing date stamp. Add it.",
        },
      },
    ],
  },
  {
    id: "halcyon-pkg",
    title: "Halcyon — SDK packaging",
    meta: "Submitted by Riv, yesterday",
    brand: "Halcyon",
    variant: "product",
    category: "b2b",
    bg: "#06121f",
    surface: "#0f2235",
    ink: "#e8efff",
    mute: "#7d93ad",
    accent: "#7ad7ff",
    accent2: "#a3eaff",
    display: "Run quieter.",
    pins: [
      {
        x: 50,
        y: 30,
        severity: "off-brand",
        category: "Mark proportion",
        notes: {
          house:
            "Mark is set at 1.2x — system spec is 1x at this surface area. Re-snap to token.",
          encouraging:
            "Strong layout. The mark is just slightly oversized — snap to 1x token.",
          tough: "Mark scale is wrong. Use 1x.",
        },
      },
      {
        x: 28,
        y: 70,
        severity: "craft",
        category: "Accent line",
        notes: {
          house:
            "Accent line color reads grey on this surface. Use accent-2 (#a3eaff) for visibility.",
          encouraging:
            "Nice details. The accent line gets lost — swap to accent-2 for contrast.",
          tough: "Accent line is invisible. Swap color.",
        },
      },
      {
        x: 72,
        y: 78,
        severity: "opportunity",
        category: "Version badge",
        notes: {
          house:
            "Halcyon's SDK packaging includes a small v-badge — missing here. Add 'v3.0' in mono.",
          encouraging:
            "Tiny opportunity: add the v-badge to anchor this as 3.0.",
          tough: "Missing version. Add v3.0 badge.",
        },
      },
      {
        x: 18,
        y: 22,
        severity: "clarity",
        category: "Tagline placement",
        notes: {
          house:
            "Tagline is bottom-aligned but eye lands top-left. Move tagline up to anchor scan path.",
          encouraging:
            "Composition mostly works — moving the tagline up would lead the eye better.",
          tough: "Tagline is buried. Move it up.",
        },
      },
    ],
  },
];

type Tone = "house" | "encouraging" | "tough";

const TONE_LABEL: Record<Tone, string> = {
  house: "House",
  encouraging: "Encouraging",
  tough: "Tough Love",
};

/* ────────────────────────────────────────────────────────────────────── */

export default function Atelier() {
  const reduce = useReducedMotion();
  const [draftId, setDraftId] = useState(DRAFTS[0].id);
  const [tone, setTone] = useState<Tone>("house");
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const [revealed, setRevealed] = useState(0);

  const draft = useMemo(
    () => DRAFTS.find((d) => d.id === draftId) ?? DRAFTS[0],
    [draftId],
  );

  // Re-run scan when draft or tone changes
  useEffect(() => {
    if (reduce) {
      setRevealed(draft.pins.length);
      setPhase("done");
      return;
    }
    let active = true;
    setPhase("scanning");
    setRevealed(0);
    const startTimer = setTimeout(() => {
      if (!active) return;
      setPhase("done");
      // stagger reveal pins
      draft.pins.forEach((_, i) => {
        setTimeout(() => {
          if (active) setRevealed((r) => Math.max(r, i + 1));
        }, i * 350);
      });
    }, 1100);

    return () => {
      active = false;
      clearTimeout(startTimer);
    };
  }, [draft, tone, reduce]);

  const replay = () => {
    setPhase("idle");
    setRevealed(0);
    setTimeout(() => setDraftId((id) => id), 0);
  };

  const breakdown = useMemo(() => {
    const out: Record<Severity, number> = {
      "off-brand": 0,
      craft: 0,
      clarity: 0,
      opportunity: 0,
    };
    draft.pins.forEach((p) => out[p.severity]++);
    return out;
  }, [draft]);

  return (
    <section
      id="atelier"
      className="relative py-28 md:py-40 container-x rule-top"
    >
      <header className="grid grid-cols-12 gap-6 mb-12 md:mb-16">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // 07 — Atelier
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
            A Carman Creative system / concept
          </p>
        </div>
        <div className="col-span-12 md:col-span-8">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2.4rem,6.4vw,5.4rem)] leading-[1.08] tracking-[-0.04em] text-bone"
          >
            A senior eye on
            <br />
            <em className="font-display-wonk text-green">every draft.</em>
          </motion.h2>
          <p className="mt-6 text-mute max-w-[60ch] leading-relaxed">
            A custom GPT trained on your design system and house point-of-view.
            Reviews work in progress, writes feedback in your CD voice, and
            catches drift before it ships. Pick a draft below to see what a
            review looks like.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 md:gap-8">
        {/* Controls */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Draft picker */}
          <div className="rounded-md border border-line bg-ink-2 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/85 mb-3">
              Draft in review
            </div>
            <div className="grid gap-2">
              {DRAFTS.map((d) => {
                const active = d.id === draftId;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDraftId(d.id)}
                    data-cursor="open"
                    className={`text-left p-3 rounded border transition-colors ${
                      active
                        ? "border-green bg-green/[0.06]"
                        : "border-line hover:border-line-2 bg-ink"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12.5px] text-bone/90">
                        {d.title}
                      </span>
                      {active && <Check className="h-3.5 w-3.5 text-green shrink-0 ml-2" />}
                    </div>
                    <p className="text-[10.5px] text-mute mt-1">{d.meta}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone picker */}
          <div className="rounded-md border border-line bg-ink-2 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/85">
                Critique tone
              </span>
              <button
                onClick={replay}
                data-cursor="rerun"
                className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-mute hover:text-green transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                rerun
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(TONE_LABEL) as Tone[]).map((t) => {
                const active = t === tone;
                return (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    data-cursor="set"
                    className={`relative py-2 rounded font-mono text-[9.5px] uppercase tracking-[0.18em] transition-colors ${
                      active
                        ? "text-ink"
                        : "text-bone/80 hover:text-bone bg-ink"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="atelier-tone"
                        className="absolute inset-0 rounded bg-green"
                        transition={{
                          type: "spring",
                          stiffness: 340,
                          damping: 28,
                        }}
                      />
                    )}
                    <span className="relative z-10">{TONE_LABEL[t]}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-mute leading-snug">
              House is measured and direct. Encouraging softens the delivery.
              Tough Love is blunt and surgical.
            </p>
          </div>

          {/* Breakdown */}
          <div className="rounded-md border border-line bg-ink-2 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/85 mb-3">
              Findings
            </div>
            <ul className="grid gap-1.5">
              {(Object.keys(breakdown) as Severity[]).map((sev) => (
                <li
                  key={sev}
                  className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em]"
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: SEVERITY_COLOR[sev] }}
                    />
                    <span className="text-bone/85">{SEVERITY_LABEL[sev]}</span>
                  </span>
                  <span className="text-bone">{breakdown[sev]}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-line flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em]">
              <span className="text-mute">Total</span>
              <span className="text-bone">{draft.pins.length} notes</span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-lg border border-line overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-ink-2 border-b border-line">
              <div className="inline-flex items-center gap-2.5">
                <Eye className="h-3.5 w-3.5 text-green" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/85">
                  {draft.title}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em]">
                {phase === "scanning" ? (
                  <span className="inline-flex items-center gap-1.5 text-green">
                    <Scan className="h-3 w-3" />
                    scanning…
                  </span>
                ) : phase === "done" ? (
                  <span className="inline-flex items-center gap-1.5 text-green">
                    <Sparkles className="h-3 w-3" />
                    review ready
                  </span>
                ) : (
                  <span className="text-mute">idle</span>
                )}
              </div>
            </div>

            {/* Draft canvas with pins */}
            <div
              className="relative aspect-[16/10]"
              style={{ background: draft.bg }}
            >
              {/* Scanning sweep */}
              {phase === "scanning" && !reduce && (
                <motion.div
                  initial={{ y: "-100%" }}
                  animate={{ y: "200%" }}
                  transition={{
                    duration: 1.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent, rgba(28,183,145,0.18), transparent)",
                  }}
                />
              )}

              {/* Draft mock */}
              <DraftMock draft={draft} />

              {/* Pins */}
              <AnimatePresence>
                {draft.pins.map((pin, i) =>
                  i < revealed ? (
                    <PinMarker
                      key={`${draft.id}-${i}`}
                      pin={pin}
                      index={i}
                    />
                  ) : null,
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Critique stream */}
          <div className="mt-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute mb-3">
              // critique stream / {tone}
            </div>
            <ul className="grid gap-2">
              {draft.pins.map((pin, i) => {
                const visible = i < revealed;
                return (
                  <motion.li
                    key={`${draft.id}-${tone}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: visible ? 1 : 0.25,
                      x: visible ? 0 : -10,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: visible ? i * 0.04 : 0,
                    }}
                    className="grid grid-cols-[auto_1fr_auto] gap-3 items-start p-3 rounded-md border border-line bg-ink-2"
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-medium"
                      style={{
                        background: SEVERITY_COLOR[pin.severity],
                        color: "#0c0c0c",
                      }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.2em]"
                          style={{ color: SEVERITY_COLOR[pin.severity] }}
                        >
                          {SEVERITY_LABEL[pin.severity]}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                          {pin.category}
                        </span>
                      </div>
                      <p className="text-[13px] leading-snug text-bone/90">
                        {pin.notes[tone]}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute self-center">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </div>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
            // {draft.pins.length} notes /{" "}
            <span className="text-green">{tone}</span> tone — re-runs when
            either changes.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Pin marker                                                             */
/* ────────────────────────────────────────────────────────────────────── */

function PinMarker({ pin, index }: { pin: Pin; index: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        left: `${pin.x}%`,
        top: `${pin.y}%`,
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    >
      {/* Ping */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: SEVERITY_COLOR[pin.severity],
          opacity: 0.35,
          animation: "atelierPing 1.6s ease-out infinite",
        }}
      />
      {/* Pin */}
      <span
        className="relative flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-medium border-2"
        style={{
          background: SEVERITY_COLOR[pin.severity],
          color: "#0c0c0c",
          borderColor: "rgba(255,255,255,0.6)",
        }}
      >
        {index + 1}
      </span>
      <style>
        {`@keyframes atelierPing {
          0% { transform: scale(1); opacity: 0.45; }
          80% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }`}
      </style>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Draft mocks                                                            */
/* ────────────────────────────────────────────────────────────────────── */

function DraftMock({ draft }: { draft: Draft }) {
  if (draft.variant === "hero") return <HeroMock draft={draft} />;
  if (draft.variant === "editorial") return <EditorialMock draft={draft} />;
  return <ProductMock draft={draft} />;
}

/* ────────────────────────────────────────────────────────────────────── */
/* 1. HeroMock — Northbound outdoor brand website hero                    */
/*    Browser chrome + 2-column layout (type | photo)                     */
/* ────────────────────────────────────────────────────────────────────── */

function HeroMock({ draft }: { draft: Draft }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Faux browser chrome */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: `${draft.ink}1a`, background: `${draft.surface}` }}
      >
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: `${draft.ink}30` }}
            />
          ))}
        </div>
        <div
          className="flex-1 max-w-[16rem] mx-auto h-4 rounded-sm flex items-center justify-center"
          style={{ background: `${draft.ink}0d` }}
        >
          <span
            className="font-mono text-[8px] uppercase tracking-[0.22em]"
            style={{ color: draft.mute }}
          >
            northbound.studio / spring-26
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.22em]"
          style={{ color: draft.mute }}
        >
          <span>shop</span>
          <span>journal</span>
          <span>about</span>
        </div>
      </div>

      {/* Hero content */}
      <div className="flex-1 flex p-6 md:p-8">
        {/* Left type */}
        <div className="flex-1 flex flex-col justify-end pr-6">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: draft.accent }}
          >
            // Spring &apos;26 collection
          </span>
          <p role="presentation"
            className="mt-3 leading-[0.95] tracking-[-0.04em]"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 700,
              fontSize: "clamp(1.6rem, 4vw, 3rem)",
              color: draft.ink,
            }}
          >
            {draft.display}
          </p>
          <p
            className="mt-3 text-sm leading-snug"
            style={{ color: draft.mute, maxWidth: "30ch" }}
          >
            New collection, made to be used. Out now.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <span
              className="px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{
                background: draft.accent,
                color: draft.bg,
              }}
            >
              Shop the drop
            </span>
            <span
              className="px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{
                background: "transparent",
                border: `1px solid ${draft.ink}40`,
                color: draft.ink,
              }}
            >
              Read more
            </span>
          </div>
        </div>
        {/* Right photograph */}
        <div
          className="w-2/5 relative rounded-md overflow-hidden"
          style={{ border: `1px solid ${draft.ink}14` }}
        >
          <CategoryImage
            category={draft.category}
            slot="hero"
            accent={draft.accent}
            bg={draft.bg}
            treatment="tinted"
            className="absolute inset-0 w-full h-full"
            sizes="320px"
          />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
            <span
              className="font-mono text-[7.5px] uppercase tracking-[0.22em]"
              style={{ color: draft.ink, opacity: 0.95 }}
            >
              S/26 / 01
            </span>
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: draft.accent }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* 2. EditorialMock — Verso magazine cover                                */
/*    Full-bleed photo with masthead, hero headline, byline, barcode      */
/* ────────────────────────────────────────────────────────────────────── */

function EditorialMock({ draft }: { draft: Draft }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      {/* Magazine cover — 3:4 portrait aspect */}
      <div
        className="relative h-full overflow-hidden rounded-sm"
        style={{
          aspectRatio: "3 / 4",
          border: `1px solid ${draft.ink}20`,
          boxShadow: `0 30px 60px -20px ${draft.bg}aa`,
        }}
      >
        {/* Full-bleed photo */}
        <CategoryImage
          category={draft.category}
          slot="hero"
          accent={draft.accent}
          bg={draft.bg}
          treatment="duotone"
          className="absolute inset-0 w-full h-full"
          sizes="500px"
        />

        {/* Masthead */}
        <div className="absolute top-4 left-4 right-4 flex items-baseline justify-between z-10">
          <span
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 700,
              fontSize: "1.7rem",
              color: draft.surface,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            VERSO
          </span>
          <span
            className="font-mono text-[9px] uppercase tracking-[0.22em]"
            style={{ color: draft.surface, opacity: 0.85 }}
          >
            Issue 04 / Vol 04
          </span>
        </div>

        {/* Cover line */}
        <div className="absolute left-4 right-4 top-1/3 z-10">
          <p
            className="font-mono text-[9px] uppercase tracking-[0.22em]"
            style={{ color: draft.accent2 ?? draft.surface }}
          >
            The Permanence Issue
          </p>
          <p role="presentation"
            className="mt-3 leading-[0.95]"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontStyle: "italic",
              fontVariationSettings: '"SOFT" 50, "WONK" 1',
              fontWeight: 700,
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
              color: draft.surface,
              letterSpacing: "-0.025em",
              textShadow: `0 2px 18px ${draft.bg}99`,
            }}
          >
            {draft.display}
          </p>
          <p
            className="mt-3 text-[12px] leading-snug max-w-[26ch]"
            style={{
              color: draft.surface,
              opacity: 0.95,
              textShadow: `0 1px 6px ${draft.bg}cc`,
            }}
          >
            A new issue exploring how we make things that last in an era built
            for the disposable.
          </p>
        </div>

        {/* Bottom strip — feature list + barcode */}
        <div className="absolute left-4 right-4 bottom-4 z-10">
          <div
            className="h-px mb-3"
            style={{ background: `${draft.surface}60` }}
          />
          <div className="flex items-end justify-between">
            <ul className="space-y-1 font-mono text-[8.5px] uppercase tracking-[0.22em]"
              style={{ color: draft.surface }}
            >
              <li>P. 04 / Field notes</li>
              <li>P. 22 / On objects that age well</li>
              <li>P. 48 / Letter from the editor</li>
            </ul>
            {/* Barcode */}
            <div className="flex items-end gap-[1px]" aria-hidden>
              {[2, 6, 3, 5, 2, 7, 3, 4, 6, 2, 5, 3, 7, 2, 4].map((h, i) => (
                <span
                  key={i}
                  className="w-[1.5px] block"
                  style={{
                    height: h * 3,
                    background: draft.surface,
                    opacity: 0.9,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* 3. ProductMock — Halcyon SaaS marketing page                           */
/*    Photo banner top + product card bottom with status, feature stack   */
/* ────────────────────────────────────────────────────────────────────── */

function ProductMock({ draft }: { draft: Draft }) {
  return (
    <div className="absolute inset-0 p-6 flex flex-col gap-4">
      {/* Top — wide marketing banner with real product photo + headline */}
      <div
        className="relative rounded-md overflow-hidden flex-[1.4]"
        style={{ border: `1px solid ${draft.ink}1a` }}
      >
        <CategoryImage
          category={draft.category}
          slot="hero"
          accent={draft.accent}
          bg={draft.bg}
          treatment="tinted"
          className="absolute inset-0 w-full h-full"
          sizes="600px"
        />
        {/* Reinforce dim on lower-left for type */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, ${draft.bg}d0 0%, ${draft.bg}80 35%, transparent 60%)`,
          }}
        />
        <div className="absolute inset-y-0 left-0 w-3/5 flex flex-col justify-center p-6 z-10">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.24em]"
            style={{ color: draft.accent }}
          >
            // Halcyon 3.0 — now in GA
          </span>
          <p role="presentation"
            className="mt-3 leading-[0.95] tracking-[-0.03em]"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 500,
              fontSize: "clamp(1.6rem, 4.2vw, 2.8rem)",
              color: draft.ink,
            }}
          >
            {draft.display}
          </p>
          <p
            className="mt-2 text-[12px] leading-snug max-w-[32ch]"
            style={{ color: draft.ink, opacity: 0.85 }}
          >
            Observability that doesn&apos;t shout. Logs, metrics, and traces in
            one calm pane.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span
              className="px-3.5 py-1.5 rounded-full font-mono text-[9.5px] uppercase tracking-[0.2em]"
              style={{
                background: draft.accent,
                color: draft.bg,
              }}
            >
              See live demo
            </span>
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.2em]"
              style={{ color: draft.ink }}
            >
              Read docs →
            </span>
          </div>
        </div>

        {/* Top right: version badge */}
        <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5">
          <span
            className="font-mono text-[8.5px] uppercase tracking-[0.22em] px-2 py-0.5 rounded-full"
            style={{
              background: `${draft.accent}26`,
              color: draft.accent,
              border: `1px solid ${draft.accent}40`,
            }}
          >
            v3.0
          </span>
        </div>
      </div>

      {/* Bottom — feature row with three cards */}
      <div className="grid grid-cols-3 gap-3 flex-1">
        {[
          { label: "Dashboard", value: "Live", note: "Realtime panels", slot: "hero" as const },
          { label: "Alerts", value: "12", note: "Action-routed", slot: "story" as const },
          { label: "Telemetry", value: "p99 84ms", note: "Edge-aggregated", slot: "feed" as const },
        ].map((card, i) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-md"
            style={{
              background: draft.surface,
              border: `1px solid ${draft.ink}1a`,
            }}
          >
            {/* Background photo at low opacity */}
            <div className="absolute inset-0 opacity-25">
              <CategoryImage
                category={draft.category}
                slot={card.slot}
                accent={draft.accent}
                bg={draft.bg}
                treatment="duotone"
                className="absolute inset-0 w-full h-full"
                sizes="200px"
              />
            </div>
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${draft.surface}99, ${draft.surface}f5)`,
              }}
            />
            <div className="relative p-4 h-full flex flex-col justify-between z-10">
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.22em]"
                  style={{ color: draft.mute }}
                >
                  {card.label}
                </span>
                {i === 0 && (
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-60"
                      style={{ background: draft.accent }}
                    />
                    <span
                      className="relative inline-flex h-1.5 w-1.5 rounded-full"
                      style={{ background: draft.accent }}
                    />
                  </span>
                )}
              </div>
              <div>
                <div
                  className="leading-none tracking-[-0.025em]"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    color: draft.ink,
                  }}
                >
                  {card.value}
                </div>
                <div
                  className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.22em]"
                  style={{ color: draft.accent }}
                >
                  {card.note}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
