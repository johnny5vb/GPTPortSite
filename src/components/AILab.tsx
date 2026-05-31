"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, MessageSquareQuote, Wand2 } from "lucide-react";

type Lab = {
  num: string;
  status: "Shipping" | "In beta" | "Concept";
  title: string;
  tagline: string;
  pitch: string;
  bullets: string[];
  icon: "wand" | "quote" | "sparkles";
  accent: string;
};

const LABS: Lab[] = [
  {
    num: "L/03",
    status: "Concept",
    title: "Atelier — AI Creative Critique",
    tagline: "A senior eye on every draft",
    pitch:
      "A custom GPT trained on the system and your house point-of-view. Reviews work-in-progress, writes feedback in your CD voice, catches drift before it ships.",
    bullets: [
      "Reviews against your design system",
      "Writes critique in your house tone",
      "Flags off-brand drift early",
      "Pairs with your design tools",
    ],
    icon: "sparkles",
    accent: "#2ee5b3",
  },
  {
    num: "L/04",
    status: "Concept",
    title: "Campaign Factory",
    tagline: "One concept, a hundred cuts",
    pitch:
      "Single campaign idea fans out to social, print, motion, and web — all on tokens, all production-ready. Built for teams that need to ship at scale without losing the system.",
    bullets: [
      "Generative variant explorer",
      "On-brand by construction",
      "Cuts for every channel from one source",
      "Export-ready to Figma, AE, and code",
    ],
    icon: "wand",
    accent: "#1cb791",
  },
];

const ICONS = {
  wand: Wand2,
  quote: MessageSquareQuote,
  sparkles: Sparkles,
};

export default function AILab() {
  return (
    <section id="ai-lab" className="relative pt-4 pb-28 md:pb-40 container-x">
      <div className="grid grid-cols-12 gap-6 mb-10 md:mb-14">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // also in the lab
          </p>
        </div>
        <div className="col-span-12 md:col-span-8">
          <h3 className="font-display text-[clamp(1.8rem,4.4vw,3.6rem)] leading-[0.95] tracking-[-0.04em] text-bone">
            More systems
            <span className="text-mute"> in development.</span>
          </h3>
          <p className="mt-4 text-mute max-w-[52ch] leading-relaxed">
            Extensions of the OS into ongoing creative work. Available as
            pilots for the right team — get in touch and we&apos;ll scope one.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line rounded-lg overflow-hidden">
        {LABS.map((lab, i) => (
          <LabCard key={lab.num} lab={lab} index={i} />
        ))}
      </div>
    </section>
  );
}

function LabCard({ lab, index }: { lab: Lab; index: number }) {
  const [hover, setHover] = useState(false);
  const Icon = ICONS[lab.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-cursor="explore"
      className="relative bg-ink p-8 md:p-10 min-h-[340px] flex flex-col overflow-hidden group"
    >
      <motion.span
        aria-hidden
        animate={{ scale: hover ? 1 : 0, opacity: hover ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-green/15 blur-3xl"
      />

      <div className="flex items-baseline justify-between mb-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
          {lab.num}
        </span>
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.22em] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
            lab.status === "Shipping"
              ? "border-green/60 text-green bg-green/10"
              : lab.status === "In beta"
                ? "border-bone/20 text-bone/80"
                : "border-line text-mute"
          }`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background:
                lab.status === "Shipping"
                  ? "#1cb791"
                  : lab.status === "In beta"
                    ? "#f5f3ef"
                    : "#8a8a8a",
            }}
          />
          {lab.status}
        </span>
      </div>

      <div className="flex items-start gap-4">
        <motion.div
          animate={{ rotate: hover ? -8 : 0, scale: hover ? 1.05 : 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0 h-12 w-12 rounded-lg border border-line bg-ink-2 flex items-center justify-center text-green"
        >
          <Icon className="h-5 w-5" />
        </motion.div>
        <div className="flex-1">
          <h4 className="font-display text-2xl md:text-3xl leading-[0.95] tracking-[-0.03em] text-bone group-hover:text-green transition-colors duration-500">
            {lab.title}
          </h4>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
            {lab.tagline}
          </p>
        </div>
      </div>

      <p className="mt-5 text-bone/80 leading-relaxed max-w-[44ch]">
        {lab.pitch}
      </p>

      <ul className="mt-auto pt-6 space-y-1.5">
        {lab.bullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-bone/75"
          >
            <span className="text-green mt-1">↳</span>
            {b}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
