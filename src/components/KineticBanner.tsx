"use client";

import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
} from "framer-motion";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

/**
 * Kinetic masthead banner — three rows of editorial type at varying speeds and
 * directions. Mixed treatments: outlined stroke, solid fill, wonk italic, mono.
 * Hover slows everything down 4× so the visitor can actually read it.
 */
type Treatment = "fill" | "stroke" | "wonk" | "mono";

type Token = {
  text: string;
  treatment: Treatment;
};

const ROW_A: Token[] = [
  { text: "OPEN FOR NEW WORK", treatment: "stroke" },
  { text: "Creative Direction", treatment: "wonk" },
  { text: "BRAND IDENTITY", treatment: "fill" },
  { text: "Web Design", treatment: "wonk" },
  { text: "PACKAGING", treatment: "stroke" },
  { text: "AI-Powered Creative", treatment: "wonk" },
];

const ROW_B: Token[] = [
  { text: "VIRGINIA BEACH", treatment: "stroke" },
  { text: "Philadelphia", treatment: "wonk" },
  { text: "BROOKLYN", treatment: "fill" },
  { text: "Est 2009", treatment: "mono" },
  { text: "East Coast Studio", treatment: "wonk" },
];

const TICKER = [
  "STATUS / OPEN FOR Q1 2026 ENGAGEMENTS",
  "RESPONSE WITHIN 24H",
  "FRACTIONAL CD / RETAINER / PROJECT",
  "JOHN@CARMANCREATIVE.COM",
  "EST. 2009 — SHIPPED 100+ PROJECTS",
];

export default function KineticBanner() {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-cursor="read"
      className="relative w-screen -ml-[max(1.25rem,4vw)] py-2"
    >
      {/* Hairlines */}
      <div className="absolute inset-x-0 top-0 h-px bg-line" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-line" />

      {/* Row 1: huge display, left → right */}
      <MarqueeRow
        speed={hover ? 12 : 60}
        direction="ltr"
        reduce={!!reduce}
        className="py-3 md:py-4"
      >
        <DisplayLoop tokens={ROW_A} />
      </MarqueeRow>

      {/* Mono ticker row */}
      <div className="relative border-y border-line bg-ink-2/50">
        <MarqueeRow
          speed={hover ? 8 : 35}
          direction="rtl"
          reduce={!!reduce}
          className="py-2"
        >
          <TickerLoop items={TICKER} />
        </MarqueeRow>
      </div>

      {/* Row 2: medium wonk italic, left → right slower */}
      <MarqueeRow
        speed={hover ? 8 : 40}
        direction="ltr"
        reduce={!!reduce}
        className="py-3 md:py-4"
      >
        <DisplayLoop tokens={ROW_B} smaller />
      </MarqueeRow>

      {/* Hover hint */}
      <div className="absolute -top-3 right-4 md:right-8 z-10 pointer-events-none">
        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-ink border border-line font-mono text-[9px] uppercase tracking-[0.22em] text-mute">
          <span className="text-green">/</span>
          {hover ? "Holding" : "Hover to slow"}
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function MarqueeRow({
  children,
  speed,
  direction,
  reduce,
  className,
}: {
  children: React.ReactNode;
  speed: number; // seconds per loop (lower = faster)
  direction: "ltr" | "rtl";
  reduce: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const widthRef = useRef(0);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const el = innerRef.current;
    if (!el) return;
    if (!widthRef.current) {
      // measure once both copies are rendered
      widthRef.current = el.scrollWidth / 2;
    }
    const w = widthRef.current;
    if (!w) return;
    const pxPerSec = w / Math.max(speed, 0.001);
    const dir = direction === "ltr" ? -1 : 1;
    const next = x.get() + (dir * pxPerSec * delta) / 1000;
    // wrap
    if (direction === "ltr" && next <= -w) {
      x.set(next + w);
    } else if (direction === "rtl" && next >= 0) {
      x.set(next - w);
    } else {
      x.set(next);
    }
  });

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className ?? ""}`}
    >
      <motion.div
        ref={innerRef}
        style={{ x }}
        className="flex whitespace-nowrap will-change-transform"
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function DisplayLoop({
  tokens,
  smaller,
}: {
  tokens: Token[];
  smaller?: boolean;
}) {
  return (
    <div className="flex items-center gap-8 md:gap-10 px-5">
      {tokens.map((t, i) => (
        <DisplayToken key={i} token={t} smaller={smaller} />
      ))}
      <Sep />
    </div>
  );
}

function DisplayToken({ token, smaller }: { token: Token; smaller?: boolean }) {
  const baseSize = smaller
    ? "text-[clamp(2.2rem,7vw,6rem)]"
    : "text-[clamp(3rem,10vw,9rem)]";

  if (token.treatment === "mono") {
    return (
      <span
        className={`font-mono uppercase tracking-[0.18em] text-bone/80 ${
          smaller ? "text-base md:text-xl" : "text-xl md:text-2xl"
        }`}
      >
        {token.text}
      </span>
    );
  }

  const isStroke = token.treatment === "stroke";
  const isWonk = token.treatment === "wonk";

  return (
    <span
      className={`leading-[0.85] tracking-[-0.04em] ${baseSize} ${
        isWonk ? "font-display-wonk text-green" : "font-display"
      } ${isStroke ? "text-transparent" : isWonk ? "" : "text-bone"} inline-flex items-baseline`}
      style={
        isStroke
          ? ({
              WebkitTextStroke: "1.5px var(--color-bone)",
            } as React.CSSProperties)
          : undefined
      }
    >
      {token.text}
    </span>
  );
}

function Sep() {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center px-2 font-display text-[clamp(3rem,10vw,9rem)] leading-[0.85] text-green/70 select-none"
    >
      /
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function TickerLoop({ items }: { items: string[] }) {
  return (
    <div className="flex items-center gap-8 px-5 text-[11px] md:text-xs font-mono uppercase tracking-[0.22em]">
      {items.map((t, i) => (
        <span key={i} className="inline-flex items-center gap-3">
          <span className="text-green">/</span>
          <span className="text-bone/85">{t}</span>
        </span>
      ))}
      <span className="inline-flex items-center gap-2 text-green">
        <ArrowUpRight className="h-3 w-3" />
        <span className="text-bone/85">SAY HELLO</span>
      </span>
      <span className="inline-flex items-center gap-3 pr-8">
        <span className="text-green">/</span>
      </span>
    </div>
  );
}
