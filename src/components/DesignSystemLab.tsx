"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { Check, Sparkles, Zap } from "lucide-react";
import CategoryImage from "./CategoryImage";
import type { PhotoCategory } from "@/lib/photos";

type Theme = {
  id: string;
  name: string;
  blurb: string;
  /** Real-photo category for sample applications */
  category: PhotoCategory;
  bg: string;
  surface: string;
  ink: string;
  mute: string;
  accent: string;
  accent2: string;
  font: string;
  display: string;
};

const THEMES: Theme[] = [
  {
    id: "carman",
    name: "Carman",
    category: "editorial",
    blurb: "House theme — dark, editorial, signature green.",
    bg: "#080808",
    surface: "#141414",
    ink: "#f5f3ef",
    mute: "#8a8a8a",
    accent: "#1cb791",
    accent2: "#2ee5b3",
    font: "var(--font-geist)",
    display: "var(--font-fraunces)",
  },
  {
    id: "atlas",
    name: "Atlas",
    category: "outdoor",
    blurb: "DTC retail — warm sand, terracotta heat.",
    bg: "#fdf6ee",
    surface: "#ffffff",
    ink: "#1c1410",
    mute: "#7a6c5d",
    accent: "#d24a1f",
    accent2: "#f7b4a3",
    font: "var(--font-geist)",
    display: "var(--font-fraunces)",
  },
  {
    id: "reservoir",
    name: "Reservoir",
    category: "b2b",
    blurb: "Connected product — deep cobalt, aqua signal.",
    bg: "#06121f",
    surface: "#0f2235",
    ink: "#e8efff",
    mute: "#7d93ad",
    accent: "#2ee5b3",
    accent2: "#7ad7ff",
    font: "var(--font-geist)",
    display: "var(--font-fraunces)",
  },
  {
    id: "wonk",
    name: "Wonk",
    category: "editorial",
    blurb: "Editorial maximalism — ink black, citron pop.",
    bg: "#0c0c0a",
    surface: "#161612",
    ink: "#fdfaf3",
    mute: "#a39c8a",
    accent: "#e7ff52",
    accent2: "#a3b62c",
    font: "var(--font-geist)",
    display: "var(--font-fraunces)",
  },
];

const RADII = [
  { id: "sharp", label: "Sharp", value: 2 },
  { id: "soft", label: "Soft", value: 12 },
  { id: "pill", label: "Pill", value: 999 },
];

const DENSITIES = [
  { id: "compact", label: "Compact", scale: 0.85 },
  { id: "default", label: "Default", scale: 1 },
  { id: "airy", label: "Airy", scale: 1.18 },
];

export default function DesignSystemLab() {
  const reduce = useReducedMotion();
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [radiusId, setRadiusId] = useState("soft");
  const [densityId, setDensityId] = useState("default");

  const theme = useMemo(
    () => THEMES.find((t) => t.id === themeId) ?? THEMES[0],
    [themeId],
  );
  const radius = useMemo(
    () => RADII.find((r) => r.id === radiusId) ?? RADII[1],
    [radiusId],
  );
  const density = useMemo(
    () => DENSITIES.find((d) => d.id === densityId) ?? DENSITIES[1],
    [densityId],
  );

  // CSS variables piped into the preview
  const preview = {
    "--p-bg": theme.bg,
    "--p-surface": theme.surface,
    "--p-ink": theme.ink,
    "--p-mute": theme.mute,
    "--p-accent": theme.accent,
    "--p-accent-2": theme.accent2,
    "--p-radius": `${radius.value}px`,
    "--p-radius-sm": `${Math.min(radius.value, 8)}px`,
    "--p-density": density.scale,
    "--p-pad": `calc(1rem * var(--p-density))`,
    "--p-pad-lg": `calc(1.75rem * var(--p-density))`,
    "--p-font": theme.font,
    "--p-display": theme.display,
  } as React.CSSProperties;

  return (
    <section
      id="systems"
      className="relative py-28 md:py-40 container-x rule-top"
    >
      {/* Header */}
      <header className="grid grid-cols-12 gap-6 mb-12 md:mb-16">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // 04 — Brand-in-a-Day OS
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
            A Carman Creative system / live demo
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
            One source of truth.
            <br />
            <em className="font-display-wonk text-green">A hundred screens.</em>
          </motion.h2>
          <p className="mt-6 text-mute max-w-[58ch] leading-relaxed">
            Brand-in-a-Day OS is a token-driven launch kit. Start with a brief,
            end the same day with a tokens file, type system, mark sketches,
            component library, and on-brand social cuts. Drag the controls
            below — every component you see is downstream of one tokens file.
            That&apos;s the leverage.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 md:gap-8">
        {/* Controls */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <ControlGroup label="Theme tokens" hint="Palette + typographic mood">
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  data-cursor="apply"
                  onClick={() => setThemeId(t.id)}
                  className={`group relative text-left p-3 rounded-md border transition-colors ${
                    themeId === t.id
                      ? "border-green bg-green/[0.06]"
                      : "border-line hover:border-line-2 bg-ink-2"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/80">
                      {t.name}
                    </span>
                    {themeId === t.id && (
                      <Check className="h-3.5 w-3.5 text-green" />
                    )}
                  </div>
                  <div className="flex h-6 rounded-sm overflow-hidden">
                    <span style={{ background: t.bg }} className="flex-1" />
                    <span style={{ background: t.surface }} className="flex-1" />
                    <span style={{ background: t.ink }} className="flex-1" />
                    <span style={{ background: t.accent }} className="flex-1" />
                    <span style={{ background: t.accent2 }} className="flex-1" />
                  </div>
                  <p className="mt-2 text-[10.5px] leading-snug text-mute">{t.blurb}</p>
                </button>
              ))}
            </div>
          </ControlGroup>

          <ControlGroup label="Radius" hint="Brand attitude">
            <Segmented
              value={radiusId}
              onChange={setRadiusId}
              options={RADII.map((r) => ({ value: r.id, label: r.label }))}
            />
          </ControlGroup>

          <ControlGroup label="Density" hint="Information per viewport">
            <Segmented
              value={densityId}
              onChange={setDensityId}
              options={DENSITIES.map((d) => ({ value: d.id, label: d.label }))}
            />
          </ControlGroup>

          <div className="rounded-md border border-line bg-ink-2 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-green" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/80">
                Live tokens
              </span>
            </div>
            <pre className="font-mono text-[10.5px] leading-relaxed text-mute overflow-x-auto">
{`--color-bg:      ${theme.bg}
--color-surface: ${theme.surface}
--color-ink:     ${theme.ink}
--color-accent:  ${theme.accent}
--radius:        ${radius.value}px
--density:       ${density.scale}`}
            </pre>
          </div>
        </div>

        {/* Preview canvas */}
        <div className="col-span-12 lg:col-span-8">
          <div className="relative rounded-lg border border-line overflow-hidden">
            {/* Browser-y chrome */}
            <div className="flex items-center justify-between px-4 py-3 bg-ink-2 border-b border-line">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
                <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
                <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                carman.studio / preview / {theme.name.toLowerCase()}
              </div>
              <div className="font-mono text-[10px] text-green inline-flex items-center gap-1">
                <Zap className="h-3 w-3" />
                live
              </div>
            </div>

            <motion.div
              key={`${theme.id}-${radius.id}-${density.id}`}
              initial={reduce ? false : { opacity: 0.6, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                ...preview,
                background: "var(--p-bg)",
                color: "var(--p-ink)",
                fontFamily: "var(--p-font)",
              }}
              className="p-6 md:p-8"
            >
              {/* Top swatch row */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {[
                  { c: theme.bg, l: "bg" },
                  { c: theme.surface, l: "surface" },
                  { c: theme.ink, l: "ink" },
                  { c: theme.accent, l: "accent" },
                  { c: theme.accent2, l: "accent-2" },
                ].map((sw) => (
                  <motion.div
                    key={sw.l}
                    layout
                    className="flex flex-col gap-1"
                  >
                    <div
                      style={{ background: sw.c, borderRadius: "var(--p-radius-sm)" }}
                      className="h-10 border border-black/10"
                    />
                    <span
                      style={{ color: theme.mute }}
                      className="font-mono text-[9px] uppercase tracking-[0.18em]"
                    >
                      {sw.l}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Type scale */}
              <div
                style={{
                  background: theme.surface,
                  borderRadius: "var(--p-radius)",
                  padding: "var(--p-pad-lg)",
                }}
                className="mb-6"
              >
                <div
                  style={{ color: theme.mute }}
                  className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3"
                >
                  type / scale
                </div>
                <h3
                  style={{
                    fontFamily: theme.display,
                    fontWeight: 500,
                    letterSpacing: "-0.045em",
                    fontSize: `clamp(2.2rem, 6.5vw, 3.4rem)`,
                    lineHeight: 0.94,
                  }}
                >
                  Display / 96{" "}
                  <em
                    style={{
                      color: theme.accent,
                      fontStyle: "italic",
                      fontVariationSettings: '"SOFT" 50, "WONK" 1',
                    }}
                  >
                    in motion.
                  </em>
                </h3>
                <p
                  style={{ marginTop: "0.75rem", fontSize: "1.05rem", lineHeight: 1.5 }}
                >
                  Body / 17. Designed for confidence and clarity. Tokens flow
                  from a single source — palette, type, radii, spacing — and
                  every component snaps to them.
                </p>
                <p
                  style={{
                    color: theme.mute,
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    marginTop: "0.75rem",
                  }}
                >
                  caption / 12 / mono
                </p>
              </div>

              {/* Components row */}
              <div className="grid grid-cols-12 gap-4 mb-6">
                {/* Buttons */}
                <div
                  style={{
                    background: theme.surface,
                    borderRadius: "var(--p-radius)",
                    padding: "var(--p-pad)",
                  }}
                  className="col-span-12 md:col-span-7 flex flex-wrap gap-3 items-center"
                >
                  <button
                    style={{
                      background: theme.accent,
                      color: theme.bg,
                      borderRadius: "var(--p-radius)",
                      padding: `calc(0.7rem * var(--p-density)) calc(1.3rem * var(--p-density))`,
                      fontWeight: 500,
                    }}
                    className="text-sm transition-transform hover:-translate-y-0.5"
                    data-cursor="cta"
                  >
                    Primary CTA
                  </button>
                  <button
                    style={{
                      background: "transparent",
                      color: theme.ink,
                      border: `1px solid ${theme.ink}33`,
                      borderRadius: "var(--p-radius)",
                      padding: `calc(0.7rem * var(--p-density)) calc(1.3rem * var(--p-density))`,
                    }}
                    className="text-sm transition-colors hover:bg-black/5"
                    data-cursor="ghost"
                  >
                    Secondary
                  </button>
                  <button
                    style={{
                      background: "transparent",
                      color: theme.accent,
                      borderRadius: "var(--p-radius-sm)",
                      padding: `calc(0.6rem * var(--p-density)) calc(0.9rem * var(--p-density))`,
                      textDecoration: "underline",
                      textUnderlineOffset: 4,
                    }}
                    className="text-sm"
                  >
                    Link →
                  </button>
                </div>

                {/* Chip cluster */}
                <div
                  style={{
                    background: theme.surface,
                    borderRadius: "var(--p-radius)",
                    padding: "var(--p-pad)",
                  }}
                  className="col-span-12 md:col-span-5 flex flex-wrap gap-2 items-center"
                >
                  {["Tokens", "A11y", "Motion", "Docs"].map((c, i) => (
                    <span
                      key={c}
                      style={{
                        background:
                          i === 0 ? `${theme.accent}26` : "transparent",
                        color: i === 0 ? theme.accent : theme.ink,
                        border: `1px solid ${
                          i === 0 ? theme.accent : `${theme.ink}26`
                        }`,
                        borderRadius: "var(--p-radius)",
                        padding: `calc(0.35rem * var(--p-density)) calc(0.7rem * var(--p-density))`,
                        fontFamily: "var(--font-jetbrains)",
                        fontSize: "0.68rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card + sparkline */}
              <div className="grid grid-cols-12 gap-4">
                <div
                  style={{
                    background: theme.surface,
                    borderRadius: "var(--p-radius)",
                    padding: "var(--p-pad-lg)",
                  }}
                  className="col-span-12 md:col-span-7"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      style={{ color: theme.mute }}
                      className="font-mono text-[10px] uppercase tracking-[0.2em]"
                    >
                      Card / Default
                    </span>
                    <span
                      style={{
                        background: `${theme.accent}26`,
                        color: theme.accent,
                        borderRadius: 999,
                      }}
                      className="font-mono text-[9px] uppercase tracking-[0.18em] px-2 py-0.5"
                    >
                      ● live
                    </span>
                  </div>
                  <p role="presentation"
                    style={{
                      fontFamily: theme.display,
                      fontWeight: 500,
                      letterSpacing: "-0.03em",
                      fontSize: "1.6rem",
                      lineHeight: 1.05,
                    }}
                  >
                    Ship the system, not the screen.
                  </p>
                  <p
                    style={{
                      color: theme.mute,
                      marginTop: "0.5rem",
                      fontSize: "0.92rem",
                      lineHeight: 1.55,
                    }}
                  >
                    Tokens here cascade into every component — buttons, type,
                    spacing, even motion. Change one variable, the brand stays
                    intact across 200 screens.
                  </p>
                </div>

                <div
                  style={{
                    background: theme.surface,
                    borderRadius: "var(--p-radius)",
                    padding: "var(--p-pad)",
                  }}
                  className="col-span-12 md:col-span-5"
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <span
                      style={{ color: theme.mute }}
                      className="font-mono text-[10px] uppercase tracking-[0.2em]"
                    >
                      Adoption
                    </span>
                    <span
                      style={{ color: theme.accent, fontFamily: theme.display }}
                      className="text-2xl font-semibold"
                    >
                      94%
                    </span>
                  </div>
                  <Sparkline color={theme.accent} muted={`${theme.ink}26`} />
                  <div
                    style={{ color: theme.mute }}
                    className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em]"
                  >
                    +18% vs. last quarter
                  </div>
                </div>
              </div>

              {/* Sample applications — real product mockups using the active tokens */}
              <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${theme.ink}14` }}>
                <div
                  style={{ color: theme.mute }}
                  className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3 flex items-center justify-between"
                >
                  <span>Sample applications / on tokens</span>
                  <span style={{ color: theme.accent }}>● live</span>
                </div>
                <div className="grid grid-cols-12 gap-3 md:gap-4">
                  <SampleWebHero theme={theme} radius={radius.value} density={density.scale} />
                  <SampleProductCard theme={theme} radius={radius.value} density={density.scale} />
                  <SampleDashboard theme={theme} radius={radius.value} density={density.scale} />
                </div>
              </div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={theme.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-mute"
            >
              // theme: <span className="text-green">{theme.name}</span> / radius:{" "}
              <span className="text-bone">{radius.label}</span> / density:{" "}
              <span className="text-bone">{density.label}</span> — same
              components, different brand.
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function ControlGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-line bg-ink-2 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/85">
          {label}
        </span>
        {hint && (
          <span className="font-mono text-[10px] text-mute">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative grid grid-cols-3 rounded-md border border-line bg-ink p-1">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            data-cursor="pick"
            onClick={() => onChange(o.value)}
            className={`relative z-10 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
              active ? "text-ink" : "text-bone/70 hover:text-bone"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${options[0].value}-${options[1].value}`}
                className="absolute inset-0 -z-10 rounded bg-green"
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Sparkline({ color, muted }: { color: string; muted: string }) {
  const points = [10, 14, 11, 18, 16, 22, 20, 28, 24, 32, 30, 38];
  const max = Math.max(...points);
  const w = 240;
  const h = 56;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14">
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={muted} />
      <motion.path
        d={d}
        stroke={color}
        strokeWidth={2}
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Sample applications — small, realistic UI mockups using brand tokens   */
/* ────────────────────────────────────────────────────────────────────── */

type SampleProps = {
  theme: Theme;
  radius: number;
  density: number;
};

function SampleWebHero({ theme, radius, density }: SampleProps) {
  return (
    <div
      className="col-span-12 md:col-span-5 relative overflow-hidden flex flex-col"
      style={{
        background: theme.surface,
        border: `1px solid ${theme.ink}14`,
        borderRadius: radius,
        minHeight: 180,
      }}
    >
      {/* Faux browser chrome */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5"
        style={{ background: `${theme.ink}08`, borderBottom: `1px solid ${theme.ink}10` }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: `${theme.ink}30` }} />
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: `${theme.ink}30` }} />
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: `${theme.ink}30` }} />
        <div
          className="ml-auto h-3 w-24 rounded-sm flex items-center justify-center"
          style={{ background: `${theme.ink}0a` }}
        >
          <span
            className="font-mono text-[7px] uppercase tracking-[0.18em]"
            style={{ color: theme.mute }}
          >
            example.com
          </span>
        </div>
      </div>

      {/* Hero body */}
      <div className="flex-1 flex p-3 gap-3">
        {/* Type column */}
        <div className="flex-1 flex flex-col justify-end">
          <span
            className="font-mono text-[7.5px] uppercase tracking-[0.2em]"
            style={{ color: theme.accent }}
          >
            // New
          </span>
          <p role="presentation"
            className="mt-1 leading-[1] tracking-[-0.025em]"
            style={{
              fontFamily: theme.display,
              fontWeight: 500,
              fontSize: "0.95rem",
              color: theme.ink,
            }}
          >
            Built to last.
          </p>
          <p
            className="mt-1 text-[8px] leading-snug"
            style={{ color: theme.mute }}
          >
            Made for the way you work.
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className="font-mono text-[7px] uppercase tracking-[0.18em] px-2 py-1"
              style={{
                background: theme.accent,
                color: theme.bg,
                borderRadius: radius,
              }}
            >
              Shop
            </span>
            <span
              className="font-mono text-[7px] uppercase tracking-[0.18em]"
              style={{ color: theme.ink, opacity: 0.7 }}
            >
              Read →
            </span>
          </div>
        </div>
        {/* Real photograph hero image */}
        <div
          className="w-1/2 relative overflow-hidden"
          style={{
            borderRadius: Math.min(radius, 12),
            border: `1px solid ${theme.ink}10`,
          }}
        >
          <CategoryImage
            category={theme.category}
            slot="hero"
            accent={theme.accent}
            bg={theme.bg}
            treatment="tinted"
            className="absolute inset-0 w-full h-full"
            sizes="160px"
          />
        </div>
      </div>

      <div
        className="px-3 py-1.5 flex items-center justify-between"
        style={{ borderTop: `1px solid ${theme.ink}10` }}
      >
        <span
          className="font-mono text-[7.5px] uppercase tracking-[0.2em]"
          style={{ color: theme.mute }}
        >
          / Web hero
        </span>
        <span
          className="font-mono text-[7.5px] uppercase tracking-[0.2em]"
          style={{ color: theme.mute, opacity: 0.7 }}
        >
          d{density.toFixed(2)} · r{radius}
        </span>
      </div>
    </div>
  );
}

function SampleProductCard({ theme, radius, density }: SampleProps) {
  // Product names/labels stay theme-flexible; imagery comes from the category
  const productMeta = {
    outdoor: [
      { name: "Trail Pack", price: "$148", tag: "New", slot: "hero" as const },
      { name: "Field Bottle", price: "$38", tag: "S/26", slot: "feed" as const },
    ],
    editorial: [
      { name: "Issue 04", price: "$24", tag: "New", slot: "hero" as const },
      { name: "Bound Set", price: "$78", tag: "Vol", slot: "portrait" as const },
    ],
    b2b: [
      { name: "Pro Plan", price: "$48/mo", tag: "Live", slot: "hero" as const },
      { name: "Team Seat", price: "$12/mo", tag: "New", slot: "portrait" as const },
    ],
  };
  const products = productMeta[theme.category];
  return (
    <div
      className="col-span-12 md:col-span-4 relative overflow-hidden flex flex-col"
      style={{
        background: theme.surface,
        border: `1px solid ${theme.ink}14`,
        borderRadius: radius,
        minHeight: 180,
      }}
    >
      <div className="grid grid-cols-2 gap-2 p-2">
        {products.map((p) => (
          <div
            key={p.name}
            className="relative overflow-hidden"
            style={{
              borderRadius: Math.max(radius - 4, 4),
              border: `1px solid ${theme.ink}10`,
            }}
          >
            {/* Real product photo */}
            <div className="aspect-square relative overflow-hidden">
              <CategoryImage
                category={theme.category}
                slot={p.slot}
                accent={theme.accent}
                bg={theme.bg}
                treatment="tinted"
                className="absolute inset-0 w-full h-full"
                sizes="100px"
              />
              <span
                className="absolute top-1.5 left-1.5 font-mono text-[7px] uppercase tracking-[0.18em] px-1 py-0.5 z-10"
                style={{
                  background: `${theme.bg}cc`,
                  color: theme.accent,
                  borderRadius: 2,
                }}
              >
                {p.tag}
              </span>
            </div>
            <div className="p-2 flex items-center justify-between">
              <div>
                <div
                  className="text-[9px] leading-tight"
                  style={{
                    fontFamily: theme.display,
                    fontWeight: 500,
                    color: theme.ink,
                  }}
                >
                  {p.name}
                </div>
                <div
                  className="font-mono text-[7.5px] uppercase tracking-[0.2em] mt-0.5"
                  style={{ color: theme.accent }}
                >
                  {p.price}
                </div>
              </div>
              <span
                className="h-4 w-4 inline-flex items-center justify-center font-mono text-[10px]"
                style={{
                  background: theme.accent,
                  color: theme.bg,
                  borderRadius: Math.max(radius - 8, 2),
                }}
              >
                +
              </span>
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-auto px-3 py-1.5 flex items-center justify-between"
        style={{ borderTop: `1px solid ${theme.ink}10` }}
      >
        <span
          className="font-mono text-[7.5px] uppercase tracking-[0.2em]"
          style={{ color: theme.mute }}
        >
          / Product grid
        </span>
        <span
          className="font-mono text-[7.5px] uppercase tracking-[0.2em]"
          style={{ color: theme.mute, opacity: 0.7 }}
        >
          d{density.toFixed(2)} · r{radius}
        </span>
      </div>
    </div>
  );
}

function SampleDashboard({ theme, radius, density }: SampleProps) {
  return (
    <div
      className="col-span-12 md:col-span-3 relative overflow-hidden flex flex-col"
      style={{
        background: theme.surface,
        border: `1px solid ${theme.ink}14`,
        borderRadius: radius,
        minHeight: 180,
      }}
    >
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-[7.5px] uppercase tracking-[0.2em]"
            style={{ color: theme.mute }}
          >
            Revenue / wk
          </span>
          <span
            className="inline-flex items-center gap-1 font-mono text-[7px] uppercase tracking-[0.18em] px-1.5 py-0.5"
            style={{
              background: `${theme.accent}1a`,
              color: theme.accent,
              borderRadius: 999,
            }}
          >
            <span className="h-1 w-1 rounded-full" style={{ background: theme.accent }} />
            +12%
          </span>
        </div>

        <div
          className="font-display leading-none tracking-[-0.03em]"
          style={{
            fontFamily: theme.display,
            fontSize: "1.6rem",
            color: theme.ink,
            fontWeight: 600,
          }}
        >
          $48.2k
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-1 h-12 mt-1">
          {[34, 52, 41, 68, 55, 78, 64].map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[2px]"
              style={{
                height: `${v}%`,
                background:
                  i === 5
                    ? theme.accent
                    : `${theme.ink}26`,
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span
              key={i}
              className="text-center font-mono text-[6.5px] uppercase tracking-[0.18em]"
              style={{ color: i === 5 ? theme.accent : theme.mute }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div
        className="px-3 py-1.5 flex items-center justify-between"
        style={{ borderTop: `1px solid ${theme.ink}10` }}
      >
        <span
          className="font-mono text-[7.5px] uppercase tracking-[0.2em]"
          style={{ color: theme.mute }}
        >
          / Widget
        </span>
        <span
          className="font-mono text-[7.5px] uppercase tracking-[0.2em]"
          style={{ color: theme.mute, opacity: 0.7 }}
        >
          d{density.toFixed(2)} · r{radius}
        </span>
      </div>
    </div>
  );
}
