"use client";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Send, RotateCcw, MessageSquareQuote, Check, ArrowUpRight } from "lucide-react";
import { Link } from "next-view-transitions";
import { GradientMesh } from "./BrandArt";
import CategoryImage from "./CategoryImage";
import type { PhotoCategory } from "@/lib/photos";

/* ────────────────────────────────────────────────────────────────────── */
/* Demo data                                                              */
/* ────────────────────────────────────────────────────────────────────── */

type Brand = {
  id: string;
  name: string;
  /** Drives which real-photo set is used in output cards */
  category: PhotoCategory;
  bg: string;
  surface: string;
  ink: string;
  mute: string;
  accent: string;
  accent2: string;
  voice: string;
  display: string; // tagline word
};

const BRANDS: Brand[] = [
  {
    id: "northbound",
    name: "Northbound",
    category: "outdoor",
    bg: "#0c1f1a",
    surface: "#143027",
    ink: "#eef5ef",
    mute: "#86a39a",
    accent: "#7fe0b6",
    accent2: "#3fa67b",
    voice: "Quietly confident. Outdoor heritage with a modern edge.",
    display: "Find your line.",
  },
  {
    id: "verso",
    name: "Verso",
    category: "editorial",
    bg: "#f6efe2",
    surface: "#ffffff",
    ink: "#1a1410",
    mute: "#806f5b",
    accent: "#c8501c",
    accent2: "#f4a384",
    voice: "Editorial, warm, considered. A publisher's craft.",
    display: "Read it again.",
  },
  {
    id: "halcyon",
    name: "Halcyon",
    category: "b2b",
    bg: "#06121f",
    surface: "#0f2235",
    ink: "#e8efff",
    mute: "#7d93ad",
    accent: "#7ad7ff",
    accent2: "#a3eaff",
    voice: "Calm, technical, precise. A B2B SaaS with feeling.",
    display: "Run quieter.",
  },
];

type PromptKind = "hero" | "social" | "typeset";

type Prompt = {
  id: PromptKind;
  user: string;
  reply: string;
};

const PROMPTS: Prompt[] = [
  {
    id: "hero",
    user: "Show me a homepage hero in this voice.",
    reply:
      "Three composition options — all on tokens, all in voice. Picked typography, layout, and accent placement that match your brand.",
  },
  {
    id: "social",
    user: "Draft three Instagram cards announcing a launch.",
    reply:
      "Same launch message, three composition variants. Locked to your color tokens and display type.",
  },
  {
    id: "typeset",
    user: "Set this headline using our type system.",
    reply:
      "Display + body lockup at three scales. Using your variable axis settings and tracking from the system.",
  },
];

/* ────────────────────────────────────────────────────────────────────── */

type Props = {
  /** When true, render as the home-page feature card with a CTA into /lab */
  featured?: boolean;
};

export default function StyleGuideTalksBack({ featured = false }: Props) {
  const reduce = useReducedMotion();
  const [brand, setBrand] = useState<Brand>(BRANDS[0]);
  const [promptId, setPromptId] = useState<PromptKind>("hero");
  const [phase, setPhase] = useState<"idle" | "typing" | "thinking" | "done">(
    "idle",
  );
  const [typed, setTyped] = useState("");

  const prompt = useMemo(
    () => PROMPTS.find((p) => p.id === promptId) ?? PROMPTS[0],
    [promptId],
  );

  // Run the demo sequence whenever brand or prompt changes
  useEffect(() => {
    if (reduce) {
      setTyped(prompt.user);
      setPhase("done");
      return;
    }

    let active = true;
    setPhase("typing");
    setTyped("");

    const text = prompt.user;
    let i = 0;
    const typeInterval = setInterval(() => {
      if (!active) return;
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(typeInterval);
        if (!active) return;
        setPhase("thinking");
        setTimeout(() => {
          if (!active) return;
          setPhase("done");
        }, 1100);
      }
    }, 22);

    return () => {
      active = false;
      clearInterval(typeInterval);
    };
  }, [brand.id, promptId, prompt.user, reduce]);

  const restart = () => {
    // Force re-run effect
    setPhase("idle");
    setTimeout(() => setPromptId((id) => id), 0);
  };

  return (
    <section
      id="talks-back"
      className="relative pt-4 pb-28 md:pb-40 container-x"
    >
      <header className="grid grid-cols-12 gap-6 mb-10 md:mb-14">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            {featured
              ? "// 04 — The AI Lab"
              : "// 05 — Style Guide That Talks Back"}
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
            {featured
              ? "Featured system — one of four in the lab"
              : "A Carman Creative system / in beta"}
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
            Guidelines that
            <br />
            <em className="font-display-wonk text-green">answer back.</em>
          </motion.h2>
          <p className="mt-6 text-mute max-w-[58ch] leading-relaxed">
            A brand bible designers can talk to. Ask for a hero, a social card,
            or a typeset headline — get on-system outputs in seconds. Every
            answer is constrained to your tokens, your voice, your rules.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 md:gap-8">
        {/* Chat column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col">
          <div className="rounded-lg border border-line bg-ink-2 overflow-hidden flex flex-col h-full min-h-[520px]">
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-ink">
              <div className="flex items-center gap-2.5">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-green animate-ping opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/85">
                  {brand.name} / Brand Assistant
                </span>
              </div>
              <button
                onClick={restart}
                data-cursor="replay"
                className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-mute hover:text-green transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                replay
              </button>
            </div>

            {/* Brand picker */}
            <div className="px-4 pt-4">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-mute mb-2">
                // pick a brand
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {BRANDS.map((b) => {
                  const active = b.id === brand.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBrand(b)}
                      data-cursor="load"
                      className={`relative text-left p-2 rounded border transition-colors ${
                        active
                          ? "border-green bg-green/[0.06]"
                          : "border-line hover:border-line-2"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-bone/85">
                          {b.name}
                        </span>
                        {active && <Check className="h-3 w-3 text-green" />}
                      </div>
                      <div className="mt-1.5 flex h-3 rounded-sm overflow-hidden">
                        <span style={{ background: b.bg }} className="flex-1" />
                        <span style={{ background: b.surface }} className="flex-1" />
                        <span style={{ background: b.ink }} className="flex-1" />
                        <span style={{ background: b.accent }} className="flex-1" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice card */}
            <div className="px-4 pt-4">
              <div className="rounded border border-line bg-ink p-3">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-mute mb-1.5">
                  // voice
                </div>
                <p className="text-[12.5px] leading-snug text-bone/90">
                  {brand.voice}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 px-4 pt-5 pb-3 space-y-3 overflow-hidden">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[88%] rounded-2xl rounded-tr-sm border border-green/40 bg-green/[0.08] px-3.5 py-2.5">
                  <span className="text-[13px] text-bone whitespace-pre-wrap">
                    {typed}
                  </span>
                  {phase === "typing" && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 -mb-0.5 align-middle bg-green blink" />
                  )}
                </div>
              </div>

              {/* Assistant message */}
              <AnimatePresence>
                {(phase === "thinking" || phase === "done") && (
                  <motion.div
                    key="reply"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex"
                  >
                    <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-line bg-ink px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="h-3 w-3 text-green" />
                        <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-mute">
                          assistant
                        </span>
                      </div>
                      {phase === "thinking" ? (
                        <ThinkingDots />
                      ) : (
                        <p className="text-[13px] leading-snug text-bone/90">
                          {prompt.reply}{" "}
                          <span className="text-mute">
                            See three options →
                          </span>
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Prompt picker (composer) */}
            <div className="px-4 pb-4 pt-3 border-t border-line bg-ink/60">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-mute mb-2">
                // try a prompt
              </div>
              <div className="grid gap-1.5">
                {PROMPTS.map((p) => {
                  const active = p.id === promptId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPromptId(p.id)}
                      data-cursor="ask"
                      className={`group relative text-left rounded border px-3 py-2 transition-colors flex items-center justify-between gap-2 ${
                        active
                          ? "border-green/60 bg-green/[0.06]"
                          : "border-line hover:border-line-2 bg-ink-2"
                      }`}
                    >
                      <span className="text-[12.5px] text-bone/90 leading-snug">
                        {p.user}
                      </span>
                      <Send
                        className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                          active ? "text-green" : "text-mute group-hover:text-bone"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Outputs column */}
        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-lg border border-line overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-ink-2 border-b border-line">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                output / on-brand outputs / locked to tokens
              </div>
              <div className="inline-flex items-center gap-1 font-mono text-[10px] text-green">
                <MessageSquareQuote className="h-3 w-3" />
                3 variants
              </div>
            </div>

            <div
              className="p-5 md:p-6"
              style={{ background: brand.bg, color: brand.ink }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${brand.id}-${promptId}-${phase === "done"}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: phase === "done" ? 1 : 0.25, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-1 px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0"
                >
                  {[0, 1, 2].map((i) => (
                    <OutputCard
                      key={i}
                      index={i}
                      kind={promptId}
                      brand={brand}
                      visible={phase === "done"}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Token strip */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: brand.mute }}
                >
                  Tokens applied
                </span>
                {[
                  { label: "bg", value: brand.bg },
                  { label: "accent", value: brand.accent },
                  { label: "ink", value: brand.ink },
                  { label: "surface", value: brand.surface },
                ].map((t) => (
                  <span
                    key={t.label}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.18em]"
                    style={{
                      background: `${brand.ink}10`,
                      color: brand.ink,
                      border: `1px solid ${brand.ink}26`,
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: t.value }}
                    />
                    {t.label} / {t.value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
            // brand: <span className="text-green">{brand.name}</span> / prompt:{" "}
            <span className="text-bone">{prompt.id}</span> — outputs
            re-generate when either changes.
          </p>
        </div>
      </div>

      {featured && <LabCTA />}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Lab CTA — shown on the home page only, links to /lab                   */
/* ────────────────────────────────────────────────────────────────────── */

function LabCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="mt-16 md:mt-20 relative overflow-hidden rounded-xl border border-line bg-ink-2 p-8 md:p-10"
    >
      {/* Glow accent */}
      <div
        aria-hidden
        className="absolute -top-24 -right-24 h-64 w-64 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(28,183,145,0.18), transparent)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green mb-3">
            // 3 more systems in the lab
          </p>
          <h3 className="font-display text-[clamp(1.8rem,4.4vw,3.6rem)] leading-[1.08] tracking-[-0.035em] text-bone">
            Style Guide is one of four.{" "}
            <em className="font-display-wonk text-green">
              See the rest.
            </em>
          </h3>
          <p className="mt-4 text-mute max-w-[52ch] leading-relaxed">
            Brand-in-a-Day OS for new-brand launches. Campaign Factory for
            fanning a concept into a hundred cuts. Atelier for AI design
            critique in your voice. All four live together in the lab.
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 md:text-right">
          <Link
            href="/lab"
            data-cursor="open lab"
            className="group inline-flex items-center gap-3 rounded-full bg-green text-ink px-6 py-4 font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
          >
            Enter the Lab
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
            04 systems · interactive
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Output cards — three compositions per prompt kind                      */
/* ────────────────────────────────────────────────────────────────────── */

function OutputCard({
  index,
  kind,
  brand,
  visible,
}: {
  index: number;
  kind: PromptKind;
  brand: Brand;
  visible: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 20,
        scale: visible ? 1 : 0.96,
      }}
      transition={{
        duration: 0.7,
        delay: visible ? index * 0.12 : 0,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        background: brand.surface,
        color: brand.ink,
        border: `1px solid ${brand.ink}1a`,
        borderRadius: 10,
      }}
      className="shrink-0 min-w-[64%] snap-center sm:min-w-0 aspect-[3/4] p-3 md:p-4 flex flex-col justify-between overflow-hidden relative"
    >
      <div className="flex items-center justify-between">
        <span
          className="font-mono text-[8.5px] uppercase tracking-[0.18em]"
          style={{ color: brand.mute }}
        >
          v0{index + 1}
        </span>
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: brand.accent }}
        />
      </div>

      {kind === "hero" && <HeroComposition index={index} brand={brand} />}
      {kind === "social" && <SocialComposition index={index} brand={brand} />}
      {kind === "typeset" && <TypesetComposition index={index} brand={brand} />}

      <div className="flex items-center justify-between">
        <span
          className="font-mono text-[8.5px] uppercase tracking-[0.18em]"
          style={{ color: brand.mute }}
        >
          on system
        </span>
        <span
          className="font-mono text-[8.5px] uppercase tracking-[0.18em]"
          style={{ color: brand.accent }}
        >
          ●
        </span>
      </div>
    </motion.div>
  );
}

function HeroComposition({ index, brand }: { index: number; brand: Brand }) {
  // Each variant uses a different slot from the brand's photo category
  const slots = ["hero", "portrait", "feed"] as const;
  const subline = [
    "Field-tested gear, for the work.",
    "Designed for the long haul.",
    "Made the way it should be.",
  ][index];

  return (
    <div className="flex-1 flex flex-col gap-2 -mx-1">
      {/* Real photograph */}
      <div
        className="relative rounded-md overflow-hidden flex-[1.2]"
        style={{ border: `1px solid ${brand.ink}14` }}
      >
        <CategoryImage
          category={brand.category}
          slot={slots[index]}
          accent={brand.accent}
          bg={brand.bg}
          treatment="tinted"
          className="absolute inset-0 w-full h-full"
          sizes="200px"
        />
        {/* Top-left chrome */}
        <div className="absolute top-1.5 left-2 right-2 flex items-center justify-between z-10">
          <span
            className="font-mono text-[7.5px] uppercase tracking-[0.22em]"
            style={{ color: brand.ink, opacity: 0.95 }}
          >
            // Hero / v0{index + 1}
          </span>
          <span
            className="h-1 w-1 rounded-full"
            style={{ background: brand.accent }}
          />
        </div>
      </div>

      {/* Type lockup — decorative mock typography, not a document heading */}
      <div className="px-1 pt-1">
        <p
          role="presentation"
          className="leading-[0.95] tracking-[-0.035em]"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontWeight: 500,
            fontSize: index === 1 ? "1.15rem" : "0.98rem",
            fontStyle: index === 2 ? "italic" : "normal",
            fontVariationSettings:
              index === 2 ? '"SOFT" 50, "WONK" 1' : '"opsz" 144',
            color: brand.ink,
            textAlign:
              index === 0 ? "left" : index === 1 ? "center" : "right",
          }}
        >
          {brand.display}
        </p>
        <p
          className="mt-1 text-[9px] leading-snug"
          style={{
            color: brand.mute,
            textAlign: index === 0 ? "left" : index === 1 ? "center" : "right",
          }}
        >
          {subline}
        </p>
      </div>
    </div>
  );
}

function SocialComposition({ index, brand }: { index: number; brand: Brand }) {
  // Each social variant gets a different real-photo slot
  const slots = ["story", "banner", "extra"] as const;

  return (
    <div className="flex-1 relative -mx-1 -my-1 overflow-hidden rounded-md"
      style={{ border: `1px solid ${brand.ink}14` }}
    >
      <CategoryImage
        category={brand.category}
        slot={slots[index]}
        accent={brand.accent}
        bg={brand.bg}
        treatment={index === 1 ? "duotone" : "tinted"}
        className="absolute inset-0 w-full h-full"
        sizes="200px"
      />
      {/* Bottom dim for legibility */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 40%, ${brand.bg}cc 100%)`,
        }}
      />

      {/* Overlay content */}
      <div className="absolute inset-0 p-3 flex flex-col z-10">
        {index === 0 && (
          <>
            <div className="flex items-center justify-between">
              <span
                className="font-mono text-[7.5px] uppercase tracking-[0.22em]"
                style={{ color: brand.accent }}
              >
                NEW / LAUNCH
              </span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: brand.accent }}
              />
            </div>
            <div className="mt-auto">
              <p
                role="presentation"
                className="text-[13px] leading-[1.05] tracking-[-0.025em]"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontWeight: 500,
                  color: brand.ink,
                }}
              >
                We made
                <br />
                something new.
              </p>
            </div>
          </>
        )}
        {index === 1 && (
          <div className="m-auto text-center">
            <p
              role="presentation"
              className="font-display-wonk text-[20px] leading-[0.95]"
              style={{ color: brand.accent }}
            >
              Drop 02.
            </p>
            <p
              className="mt-1.5 text-[10px] leading-snug"
              style={{ color: brand.ink }}
            >
              Now shipping nationwide.
            </p>
          </div>
        )}
        {index === 2 && (
          <>
            <span
              className="font-mono text-[7.5px] uppercase tracking-[0.22em]"
              style={{ color: brand.mute }}
            >
              ANNOUNCING
            </span>
            <p
              role="presentation"
              className="text-[12px] leading-[1.05] tracking-[-0.025em] mt-1"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontWeight: 500,
                color: brand.ink,
              }}
            >
              The next
              <br />
              chapter.
            </p>
            <div className="mt-auto">
              <span
                className="font-mono text-[7.5px] uppercase tracking-[0.22em]"
                style={{ color: brand.accent }}
              >
                ↗ link in bio
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TypesetComposition({
  index,
  brand,
}: {
  index: number;
  brand: Brand;
}) {
  const sizes = [
    { display: "0.95rem", caption: "0.55rem" },
    { display: "1.4rem", caption: "0.55rem" },
    { display: "2rem", caption: "0.55rem" },
  ];
  const s = sizes[index];
  // Typeset variant uses a photo strip behind the type with stronger duotone
  const typesetSlots = ["print", "extra", "feed"] as const;
  return (
    <div className="flex-1 flex flex-col justify-center relative">
      <CategoryImage
        category={brand.category}
        slot={typesetSlots[index]}
        accent={brand.accent}
        bg={brand.bg}
        treatment="duotone"
        className="absolute inset-0 -mx-1 -my-1 opacity-50 rounded-md"
        sizes="200px"
      />
      <div className="relative z-10">
      <p
        className="font-mono text-[8.5px] uppercase tracking-[0.22em]"
        style={{ color: brand.mute }}
      >
        Scale 0{index + 1}
      </p>
      <p
        role="presentation"
        className="leading-[0.95] tracking-[-0.04em] mt-1"
        style={{
          fontFamily: "var(--font-fraunces)",
          fontWeight: 500,
          fontSize: s.display,
          color: brand.ink,
        }}
      >
        {brand.display}
      </p>
      <p
        className="mt-1 leading-snug"
        style={{
          color: brand.mute,
          fontSize: s.caption,
          fontFamily: "var(--font-jetbrains)",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
        }}
      >
        DISPLAY / {Math.round(parseFloat(s.display) * 16)} / LH 95
      </p>
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 rounded-full bg-green/80"
          animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
      <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
        thinking on-brand…
      </span>
    </div>
  );
}
