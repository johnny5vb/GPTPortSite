"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

const markVariants: Variants = {
  enter: (d: number) => ({ opacity: 0, x: d * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: -d * 24 }),
};

const bodyVariants: Variants = {
  enter: (d: number) => ({ opacity: 0, x: d * 32 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: -d * 32 }),
};

const PRINCIPLES = [
  {
    mark: "I.",
    title: "Understand the problem first.",
    em: "Then design and technology can solve it.",
    note: "Strategy before craft. Every project begins with a brief that earns its own scope.",
  },
  {
    mark: "II.",
    title: "Design systems, not screens.",
    em: "Tokens, components, governance — work that scales without me.",
    note: "I leave behind a system the team can run. Not a one-off Figma file.",
  },
  {
    mark: "III.",
    title: "Use AI to expand judgment.",
    em: "Not to replace it. Modern tools, classical taste.",
    note: "AI for the 80%. Humans for the 20% that decides whether it's any good.",
  },
  {
    mark: "IV.",
    title: "Lead with clarity.",
    em: "Thoughtful process, meticulous craft, on time.",
    note: "I write the brief, run the critique, and answer the email. No mystery.",
  },
];

const AUTO_ADVANCE_MS = 5500;

/**
 * Manifesto as a compact interactive slider. One principle visible at a time,
 * auto-advances every ~5.5s, hover-to-pause, click any number to jump. Single
 * section height — no sticky math, no scroll dependence, fluid by construction.
 */
export default function Manifesto() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (paused || reduce) return;
    const t = setInterval(() => {
      setDirection(1);
      setIdx((i) => (i + 1) % PRINCIPLES.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [paused, reduce]);

  const goTo = (i: number) => {
    setDirection(i > idx ? 1 : -1);
    setIdx(i);
  };
  const next = () => {
    setDirection(1);
    setIdx((i) => (i + 1) % PRINCIPLES.length);
  };
  const prev = () => {
    setDirection(-1);
    setIdx((i) => (i - 1 + PRINCIPLES.length) % PRINCIPLES.length);
  };

  const active = PRINCIPLES[idx];

  return (
    <section
      id="manifesto"
      className="relative rule-top container-x py-20 md:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header — single row, title on one line */}
      <header className="grid grid-cols-12 gap-6 mb-10 md:mb-12 items-baseline">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // 01 — How I work
          </p>
        </div>
        <div className="col-span-12 md:col-span-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[1.08] tracking-[-0.035em] text-bone whitespace-nowrap"
          >
            Four <em className="font-display-wonk text-green">principles.</em>
          </motion.h2>
          <p className="mt-4 text-mute text-sm md:text-base leading-relaxed max-w-[44ch]">
            Efficient &amp; intentional. The way I run every engagement, from
            first call to launch.
          </p>
        </div>
      </header>

      {/* Slider card */}
      <div
        className="relative rounded-xl border border-line bg-ink-2 overflow-hidden"
      >
        <div className="grid grid-cols-12 gap-4 md:gap-8 px-6 md:px-12 py-6 md:py-8 items-center">
          {/* Roman numeral */}
          <div className="col-span-2 md:col-span-2">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`mark-${idx}`}
                custom={direction}
                variants={markVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="font-display-wonk text-[clamp(3.5rem,10vw,8rem)] leading-none text-green/90 select-none"
              >
                {active.mark}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Statement */}
          <div className="col-span-10 md:col-span-10 md:pl-2">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`body-${idx}`}
                custom={direction}
                variants={bodyVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3 className="font-display text-[clamp(1.5rem,3.4vw,2.6rem)] leading-[1.1] tracking-[-0.03em] text-bone">
                  {active.title}{" "}
                  <span className="text-mute">{active.em}</span>
                </h3>
                <p className="mt-4 max-w-[60ch] text-sm md:text-base text-bone/85 leading-relaxed">
                  {active.note}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slider controls — bottom strip */}
        <div className="flex items-center justify-between border-t border-line px-4 md:px-6 py-3">
          {/* Dot nav */}
          <div className="flex items-center gap-1">
            {PRINCIPLES.map((p, i) => {
              const active = i === idx;
              return (
                <button
                  key={p.mark}
                  onClick={() => goTo(i)}
                  data-cursor={p.mark.toLowerCase().replace(".", "")}
                  aria-label={`Show principle ${p.mark}`}
                  className="group inline-flex items-center gap-2 px-3 py-2 rounded-md font-mono text-[10px] uppercase tracking-[0.22em] transition-colors"
                  style={{
                    color: active ? "var(--color-bone)" : "var(--color-mute)",
                  }}
                >
                  <span
                    className={`block h-1 rounded-full transition-all duration-500 ${
                      active ? "w-8 bg-green" : "w-3 bg-line-2 group-hover:bg-bone/40"
                    }`}
                  />
                  <span>{p.mark}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPaused((p) => !p)}
              data-cursor={paused ? "play" : "pause"}
              aria-label={paused ? "Resume auto-advance" : "Pause auto-advance"}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-line text-mute hover:text-green hover:border-green/40 transition-colors"
            >
              {paused ? (
                <Play className="h-3 w-3" />
              ) : (
                <Pause className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={prev}
              data-cursor="prev"
              aria-label="Previous principle"
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-line text-mute hover:text-green hover:border-green/40 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={next}
              data-cursor="next"
              aria-label="Next principle"
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-line text-mute hover:text-green hover:border-green/40 transition-colors"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Auto-advance progress bar */}
        {!paused && !reduce && (
          <motion.div
            key={`progress-${idx}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 h-px origin-left bg-green/70"
          />
        )}
      </div>
    </section>
  );
}
