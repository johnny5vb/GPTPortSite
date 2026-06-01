"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useMemo, useState } from "react";
import { Check, RotateCcw, Wand2, Zap } from "lucide-react";
import { type CampaignCategory } from "./CampaignArt";
import CategoryImage from "./CategoryImage";

/* ────────────────────────────────────────────────────────────────────── */
/* Demo data                                                              */
/* ────────────────────────────────────────────────────────────────────── */

type Campaign = {
  id: string;
  brand: string;
  category: CampaignCategory;
  /** Short caption shown next to the product imagery — what kind of work this is */
  productLine: string;
  headline: string;
  kicker: string;
  brief: string;
  bg: string;
  surface: string;
  ink: string;
  mute: string;
  accent: string;
  accent2: string;
  /** CTA labels match the campaign's industry */
  primaryCta: string;
  secondaryCta: string;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "northbound",
    brand: "Northbound",
    category: "outdoor",
    productLine: "Pack / Boot / Tent / Bottle",
    headline: "Find your line.",
    kicker: "Spring '26 trail collection",
    brief:
      "Outdoor performance line — quietly confident, trail-tested gear for the long haul. Voice: understated, earned, never loud.",
    bg: "#0c1f1a",
    surface: "#143027",
    ink: "#eef5ef",
    mute: "#86a39a",
    accent: "#7fe0b6",
    accent2: "#3fa67b",
    primaryCta: "Shop the kit",
    secondaryCta: "On trail →",
  },
  {
    id: "verso",
    brand: "Verso",
    category: "editorial",
    productLine: "Magazine / Books / Subscription",
    headline: "Read it again.",
    kicker: "Issue 04 — subscription drop",
    brief:
      "Editorial publication — warm, considered, made to keep. Voice: literary, deliberate, with a hint of humor.",
    bg: "#f6efe2",
    surface: "#ffffff",
    ink: "#1a1410",
    mute: "#806f5b",
    accent: "#c8501c",
    accent2: "#f4a384",
    primaryCta: "Subscribe",
    secondaryCta: "Read excerpt →",
  },
  {
    id: "halcyon",
    brand: "Halcyon",
    category: "b2b",
    productLine: "Dashboard / API / Alerts",
    headline: "Run quieter.",
    kicker: "Halcyon 3.0 launch",
    brief:
      "B2B observability platform — calm, technical, precise. Voice: confident, clear, never breathless about its own tech.",
    bg: "#06121f",
    surface: "#0f2235",
    ink: "#e8efff",
    mute: "#7d93ad",
    accent: "#7ad7ff",
    accent2: "#a3eaff",
    primaryCta: "See live demo",
    secondaryCta: "Read docs →",
  },
];

type Channel = {
  id: string;
  label: string;
  w: number;
  h: number;
  /** Tailwind grid column-span class on the output grid */
  span: string;
};

// 12-col output grid layout. Each channel occupies its own footprint.
const CHANNELS: Channel[] = [
  { id: "web-hero", label: "Web Hero", w: 16, h: 9, span: "col-span-12 md:col-span-8" },
  { id: "ig-portrait", label: "IG Portrait", w: 4, h: 5, span: "col-span-6 md:col-span-4" },
  { id: "ig-story", label: "IG Story", w: 9, h: 16, span: "col-span-6 md:col-span-3" },
  { id: "ig-square", label: "IG Feed", w: 1, h: 1, span: "col-span-6 md:col-span-3" },
  { id: "print", label: "Print", w: 2, h: 3, span: "col-span-6 md:col-span-3" },
  { id: "banner", label: "Banner", w: 5, h: 2, span: "col-span-12 md:col-span-3" },
];

/* ────────────────────────────────────────────────────────────────────── */

export default function CampaignFactory() {
  const reduce = useReducedMotion();
  const [id, setId] = useState(CAMPAIGNS[0].id);
  const [seed, setSeed] = useState(0);
  const [activeChannels, setActiveChannels] = useState<Set<string>>(
    new Set(CHANNELS.map((c) => c.id)),
  );

  const camp = useMemo(
    () => CAMPAIGNS.find((c) => c.id === id) ?? CAMPAIGNS[0],
    [id],
  );

  const toggleChannel = (chId: string) => {
    setActiveChannels((prev) => {
      const next = new Set(prev);
      if (next.has(chId)) next.delete(chId);
      else next.add(chId);
      return next;
    });
  };

  const regen = () => setSeed((s) => s + 1);

  return (
    <section
      id="factory"
      className="relative py-28 md:py-40 container-x rule-top"
    >
      <header className="grid grid-cols-12 gap-6 mb-12 md:mb-16">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // 06 — Campaign Factory
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
            One concept,
            <br />
            <em className="font-display-wonk text-green">a hundred cuts.</em>
          </motion.h2>
          <p className="mt-6 text-mute max-w-[60ch] leading-relaxed">
            One campaign idea fans out to social, print, motion, and web — all
            on tokens, all in voice, all production-ready. Pick a campaign and
            watch a single concept resolve across six channels.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 md:gap-8">
        {/* Brief panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-md border border-line bg-ink-2 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/85 mb-3">
              Campaign
            </div>
            <div className="grid gap-2">
              {CAMPAIGNS.map((c) => {
                const active = c.id === id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setId(c.id);
                      setSeed((s) => s + 1);
                    }}
                    data-cursor="select"
                    className={`text-left p-3 rounded border transition-colors ${
                      active
                        ? "border-green bg-green/[0.06]"
                        : "border-line hover:border-line-2 bg-ink"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/85">
                        {c.brand}
                      </span>
                      {active && <Check className="h-3.5 w-3.5 text-green" />}
                    </div>
                    <div className="mt-2 flex h-4 rounded-sm overflow-hidden">
                      <span style={{ background: c.bg }} className="flex-1" />
                      <span style={{ background: c.surface }} className="flex-1" />
                      <span style={{ background: c.ink }} className="flex-1" />
                      <span style={{ background: c.accent }} className="flex-1" />
                      <span style={{ background: c.accent2 }} className="flex-1" />
                    </div>
                    <p className="mt-2 text-[11px] leading-snug text-bone/90 font-display">
                      {c.headline}
                    </p>
                    <p className="text-[10.5px] text-mute mt-0.5">
                      {c.kicker}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brief */}
          <div className="rounded-md border border-line bg-ink-2 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/85">
                Brief
              </span>
              <button
                onClick={regen}
                data-cursor="regenerate"
                className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-mute hover:text-green transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                regenerate
              </button>
            </div>
            <p className="text-[12.5px] leading-relaxed text-bone/85">
              {camp.brief}
            </p>
          </div>

          {/* Channels */}
          <div className="rounded-md border border-line bg-ink-2 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/85 mb-3">
              Channels
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CHANNELS.map((c) => {
                const active = activeChannels.has(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleChannel(c.id)}
                    data-cursor="toggle"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                      active
                        ? "border-green/60 bg-green/[0.06] text-bone"
                        : "border-line text-mute hover:text-bone"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        active ? "bg-green" : "bg-mute-2"
                      }`}
                    />
                    {c.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 font-mono text-[10px] text-mute">
              {activeChannels.size} of {CHANNELS.length} active / re-arranging the grid live
            </p>
          </div>

          <div className="rounded-md border border-green/40 bg-green/[0.04] p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Wand2 className="h-3.5 w-3.5 text-green" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-green">
                Output
              </span>
            </div>
            <p className="text-[12.5px] leading-snug text-bone/90">
              All variants share one token file. Switch the brand and the
              entire factory re-skins in 500ms.
            </p>
          </div>
        </div>

        {/* Output grid */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-lg border border-line overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-ink-2 border-b border-line">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                factory output / {camp.brand.toLowerCase()} / seed {seed}
              </div>
              <div className="inline-flex items-center gap-1 font-mono text-[10px] text-green">
                <Zap className="h-3 w-3" />
                generating
              </div>
            </div>

            <div
              key={`${camp.id}-${seed}`}
              className="p-4 md:p-5"
              style={{ background: camp.bg }}
            >
              <motion.div
                initial={reduce ? false : "hidden"}
                animate="show"
                variants={{
                  show: {
                    transition: {
                      staggerChildren: 0.07,
                      delayChildren: 0.05,
                    },
                  },
                }}
                className="grid grid-cols-12 gap-3 md:gap-4 auto-rows-min"
              >
                <AnimatePresence mode="popLayout">
                  {CHANNELS.filter((c) => activeChannels.has(c.id)).map(
                    (channel, i) => (
                      <FactoryCard
                        key={channel.id}
                        channel={channel}
                        campaign={camp}
                        index={i}
                      />
                    ),
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
            // brand: <span className="text-green">{camp.brand}</span> / 6
            channels / one tokens file — production-ready exports in Figma,
            After Effects, and code.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Factory cards                                                          */
/* ────────────────────────────────────────────────────────────────────── */

function FactoryCard({
  channel,
  campaign,
  index,
}: {
  channel: Channel;
  campaign: Campaign;
  index: number;
}) {
  const aspect = `${channel.w} / ${channel.h}`;
  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.95 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
      transition={{ layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
      className={channel.span}
    >
      {/* Spec caption — sits ABOVE the mock so it never overlaps the
          composition's own labels (brand name, "NOW", etc.). */}
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span
          className="font-mono text-[8.5px] uppercase tracking-[0.18em]"
          style={{ color: campaign.mute }}
        >
          {channel.label}
        </span>
        <span
          className="font-mono text-[8.5px] uppercase tracking-[0.18em]"
          style={{ color: campaign.accent }}
        >
          {channel.w}:{channel.h}
        </span>
      </div>

      <div
        className="relative overflow-hidden"
        style={{
          background: campaign.surface,
          border: `1px solid ${campaign.ink}1a`,
          borderRadius: 10,
          color: campaign.ink,
          aspectRatio: aspect,
        }}
      >
        <ChannelArt channel={channel} campaign={campaign} index={index} />
      </div>
    </motion.div>
  );
}

function ChannelArt({
  channel,
  campaign,
  index,
}: {
  channel: Channel;
  campaign: Campaign;
  index: number;
}) {
  switch (channel.id) {
    case "web-hero":
      return <WebHero campaign={campaign} />;
    case "ig-portrait":
      return <IGPortrait campaign={campaign} />;
    case "ig-story":
      return <IGStory campaign={campaign} />;
    case "ig-square":
      return <IGSquare campaign={campaign} />;
    case "print":
      return <Print campaign={campaign} />;
    case "banner":
      return <Banner campaign={campaign} />;
    default:
      return null;
  }
}

/* Individual channel compositions ─────────────────────────────────────── */

function WebHero({ campaign }: { campaign: Campaign }) {
  return (
    <div className="absolute inset-0 flex p-5 md:p-7">
      {/* Left: type lockup */}
      <div className="flex-1 flex flex-col justify-end pr-4">
        <span
          className="font-mono text-[9px] uppercase tracking-[0.22em]"
          style={{ color: campaign.accent }}
        >
          // {campaign.kicker}
        </span>
        <p role="presentation"
          className="mt-2 leading-[0.92] tracking-[-0.04em]"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontWeight: 500,
            fontSize: "clamp(1.5rem, 3.5vw, 2.6rem)",
            color: campaign.ink,
          }}
        >
          {campaign.headline}
        </p>
        <p
          className="mt-2 text-[11px] md:text-[12px] leading-snug"
          style={{ color: campaign.mute, maxWidth: "28ch" }}
        >
          {campaign.productLine}. Built to last.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 self-start">
          <span
            className="px-3 py-1.5 rounded-full font-mono text-[9.5px] uppercase tracking-[0.18em]"
            style={{
              background: campaign.accent,
              color: campaign.bg,
            }}
          >
            {campaign.primaryCta}
          </span>
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.18em]"
            style={{ color: campaign.ink }}
          >
            {campaign.secondaryCta}
          </span>
        </div>
      </div>
      {/* Right: product imagery */}
      <div
        className="w-1/3 relative rounded-md overflow-hidden flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${campaign.bg}, ${campaign.surface})`,
          border: `1px solid ${campaign.ink}14`,
        }}
      >
        <CategoryImage
          category={campaign.category}
          slot="hero"
          accent={campaign.accent}
          bg={campaign.bg}
          treatment="tinted"
          className="absolute inset-0 w-full h-full"
          sizes="240px"
        />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <span
            className="font-mono text-[7.5px] uppercase tracking-[0.22em]"
            style={{ color: campaign.ink, opacity: 0.85 }}
          >
            {campaign.brand} / hero
          </span>
          <span
            className="h-1 w-1 rounded-full"
            style={{ background: campaign.accent }}
          />
        </div>
      </div>
    </div>
  );
}

function IGPortrait({ campaign }: { campaign: Campaign }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Product image area */}
      <div
        className="relative flex-[1.5] overflow-hidden flex items-center justify-center"
        style={{
          background: `linear-gradient(160deg, ${campaign.bg}, ${campaign.surface})`,
        }}
      >
        <CategoryImage
          category={campaign.category}
          slot="portrait"
          accent={campaign.accent}
          bg={campaign.bg}
          treatment="tinted"
          className="absolute inset-0 w-full h-full"
          sizes="200px"
        />
        <span
          className="absolute top-2 left-2 font-mono text-[7.5px] uppercase tracking-[0.2em]"
          style={{ color: campaign.ink, opacity: 0.7 }}
        >
          {campaign.brand}
        </span>
      </div>
      {/* Type area */}
      <div className="p-3 flex-1 flex flex-col justify-center"
        style={{ background: campaign.surface, borderTop: `1px solid ${campaign.ink}14` }}
      >
        <p
          className="font-mono text-[8.5px] uppercase tracking-[0.18em]"
          style={{ color: campaign.accent }}
        >
          // {campaign.kicker.split("—")[0].trim()}
        </p>
        <p role="presentation"
          className="mt-1 leading-[1.02] tracking-[-0.025em]"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontWeight: 500,
            fontSize: "0.95rem",
            color: campaign.ink,
          }}
        >
          {campaign.headline}
        </p>
      </div>
    </div>
  );
}

function IGStory({ campaign }: { campaign: Campaign }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Atmospheric backdrop with product silhouette */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: `linear-gradient(180deg, ${campaign.bg}, ${campaign.surface})`,
        }}
      >
        <CategoryImage
          category={campaign.category}
          slot="story"
          accent={campaign.accent}
          bg={campaign.bg}
          treatment="duotone"
          className="absolute inset-0 w-full h-full"
          sizes="160px"
        />
      </div>
      {/* Dim for legibility */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${campaign.bg}cc 0%, transparent 22%, transparent 70%, ${campaign.bg}dd 100%)`,
        }}
      />
      {/* Overlay content */}
      <div className="absolute inset-0 p-3 flex flex-col justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: campaign.accent }}
          />
          <span
            className="font-mono text-[8px] uppercase tracking-[0.18em]"
            style={{ color: campaign.ink }}
          >
            NOW
          </span>
        </div>
        <div className="text-center pb-1">
          <p
            className="font-display-wonk text-[1.05rem] leading-[1.0] tracking-[-0.03em]"
            style={{ color: campaign.accent }}
          >
            {campaign.headline}
          </p>
          <p
            className="mt-1 text-[8.5px] leading-snug"
            style={{ color: campaign.ink }}
          >
            {campaign.productLine}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-[8px] uppercase tracking-[0.18em]"
            style={{ color: campaign.ink, opacity: 0.7 }}
          >
            swipe →
          </span>
          <span
            className="font-mono text-[8px] uppercase tracking-[0.18em]"
            style={{ color: campaign.accent }}
          >
            {campaign.category === "b2b" ? "demo" : "shop"}
          </span>
        </div>
      </div>
    </div>
  );
}

function IGSquare({ campaign }: { campaign: Campaign }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Product centered in frame */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${campaign.surface}, ${campaign.bg})`,
        }}
      >
        <CategoryImage
          category={campaign.category}
          slot="feed"
          accent={campaign.accent}
          bg={campaign.bg}
          treatment="tinted"
          className="absolute inset-0 w-full h-full"
          sizes="200px"
        />
      </div>
      {/* Bottom dim */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 55%, ${campaign.bg}d0 100%)`,
        }}
      />
      <div className="absolute inset-0 p-3 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <span
            className="font-mono text-[8.5px] uppercase tracking-[0.18em]"
            style={{ color: campaign.accent }}
          >
            // New
          </span>
          <span
            className="font-mono text-[8.5px] uppercase tracking-[0.18em]"
            style={{ color: campaign.ink, opacity: 0.7 }}
          >
            01 / 04
          </span>
        </div>
        <p role="presentation"
          className="leading-[1.0] tracking-[-0.025em]"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontWeight: 500,
            fontSize: "1rem",
            color: campaign.ink,
          }}
        >
          {campaign.headline}
        </p>
      </div>
    </div>
  );
}

function Print({ campaign }: { campaign: Campaign }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <p
        className="px-3 pt-3 font-mono text-[7.5px] uppercase tracking-[0.22em]"
        style={{ color: campaign.mute }}
      >
        {campaign.brand} — Vol 04
      </p>
      {/* Product showcase in the middle */}
      <div
        className="mx-3 my-2 flex-1 relative rounded-sm overflow-hidden flex items-center justify-center"
        style={{
          background: `linear-gradient(180deg, ${campaign.bg}, ${campaign.surface})`,
          border: `1px solid ${campaign.ink}14`,
        }}
      >
        <CategoryImage
          category={campaign.category}
          slot="print"
          accent={campaign.accent}
          bg={campaign.bg}
          treatment="duotone"
          className="absolute inset-0 w-full h-full"
          sizes="160px"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{
            background: `linear-gradient(180deg, transparent, ${campaign.bg}e6)`,
          }}
        />
        <p
          className="absolute bottom-2 left-0 right-0 text-center font-display-wonk leading-none tracking-[-0.03em]"
          style={{
            fontSize: "0.85rem",
            color: campaign.ink,
          }}
        >
          {campaign.headline}
        </p>
      </div>
      <div className="px-3 pb-3 space-y-1">
        <div
          className="h-px"
          style={{ background: `${campaign.ink}40` }}
        />
        <p
          className="font-mono text-[7.5px] uppercase tracking-[0.22em]"
          style={{ color: campaign.accent }}
        >
          {campaign.category === "editorial" ? "Read it →" : "See more →"}
        </p>
      </div>
    </div>
  );
}

function Banner({ campaign }: { campaign: Campaign }) {
  return (
    <div className="absolute inset-0 flex">
      {/* Left photo strip */}
      <div
        className="w-1/3 relative overflow-hidden"
        style={{ borderRight: `1px solid ${campaign.ink}14` }}
      >
        <CategoryImage
          category={campaign.category}
          slot="banner"
          accent={campaign.accent}
          bg={campaign.bg}
          treatment="tinted"
          className="absolute inset-0 w-full h-full"
          sizes="100px"
        />
      </div>
      {/* Right content */}
      <div className="flex-1 flex items-center justify-between px-4">
        <p role="presentation"
          className="leading-[1] tracking-[-0.025em]"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontWeight: 500,
            fontSize: "0.95rem",
            color: campaign.ink,
          }}
        >
          {campaign.headline}
        </p>
        <span
          className="font-mono text-[8.5px] uppercase tracking-[0.22em] px-2 py-1 rounded-full whitespace-nowrap"
          style={{
            background: campaign.accent,
            color: campaign.bg,
          }}
        >
          {campaign.category === "b2b" ? "demo" : campaign.category === "editorial" ? "read" : "shop"}
        </span>
      </div>
    </div>
  );
}
