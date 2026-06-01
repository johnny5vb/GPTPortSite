"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { ArrowUpLeft, ArrowDown } from "lucide-react";
import DesignSystemLab from "./DesignSystemLab";
import StyleGuideTalksBack from "./StyleGuideTalksBack";
import CampaignFactory from "./CampaignFactory";
import Atelier from "./Atelier";

const SYSTEMS = [
  {
    id: "systems",
    num: "01",
    name: "Brand-in-a-Day OS",
    tagline: "Token-driven launch kit",
    status: "Live demo",
  },
  {
    id: "talks-back",
    num: "02",
    name: "Style Guide That Talks Back",
    tagline: "Brand bible as a conversation",
    status: "In beta",
  },
  {
    id: "factory",
    num: "03",
    name: "Campaign Factory",
    tagline: "One concept, a hundred cuts",
    status: "Concept",
  },
  {
    id: "atelier",
    num: "04",
    name: "Atelier",
    tagline: "AI creative critique",
    status: "Concept",
  },
];

export default function LabPage() {
  const [active, setActive] = useState<string>(SYSTEMS[0].id);
  const ratiosRef = useRef<Map<string, number>>(new Map());

  // Track active section as the user scrolls between systems
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          ratiosRef.current.set(e.target.id, e.intersectionRatio);
        });
        let best = active;
        let bestRatio = 0;
        ratiosRef.current.forEach((r, id) => {
          if (r > bestRatio) {
            bestRatio = r;
            best = id;
          }
        });
        if (best !== active && bestRatio > 0) setActive(best);
      },
      {
        threshold: [0, 0.2, 0.4, 0.6, 0.8],
        rootMargin: "-30% 0px -30% 0px",
      },
    );
    SYSTEMS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [active]);

  return (
    <>
      {/* Page header */}
      <section className="container-x pt-28 md:pt-32 pb-12">
        <Link
          href="/#talks-back"
          data-cursor="back"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-mute hover:text-green transition-colors"
        >
          <ArrowUpLeft className="h-3.5 w-3.5" />
          back to home
        </Link>

        <div className="mt-10 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-green"
            >
              // The AI Lab
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute"
            >
              Four systems · Carman Creative
            </motion.p>
          </div>
          <div className="col-span-12 md:col-span-8">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2.6rem,7.4vw,7.4rem)] leading-[1.05] tracking-[-0.045em] text-bone"
            >
              Modern tools,
              <br />
              <em className="font-display-wonk text-green">classical taste.</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mt-6 text-bone/85 text-lg leading-relaxed max-w-[56ch]"
            >
              Four AI-native design systems for teams that ship brand
              identity, design systems, and creative production at scale.
              Each one is interactive — try them, see how the tokens flow.
            </motion.p>
          </div>
        </div>

        <motion.a
          href="#systems"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          data-cursor="scroll"
          className="mt-12 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70 hover:text-green"
        >
          Scroll / Start with system 01
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </motion.span>
        </motion.a>
      </section>

      {/* Sticky system navigator */}
      <div className="sticky top-20 z-40 container-x">
        <nav
          aria-label="AI systems"
          className="rounded-full border border-line bg-ink/85 backdrop-blur-md px-2 py-2 inline-flex items-center gap-1 max-w-full overflow-x-auto"
        >
          {SYSTEMS.map((s) => {
            const isActive = active === s.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                data-cursor={s.num}
                className={`relative px-3 py-2 rounded-full font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${
                  isActive
                    ? "text-ink"
                    : "text-bone/70 hover:text-bone"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="lab-nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-green"
                    transition={{
                      type: "spring",
                      stiffness: 320,
                      damping: 28,
                    }}
                  />
                )}
                <span className="relative">
                  <span className={isActive ? "text-ink/70 mr-1.5" : "text-mute mr-1.5"}>
                    {s.num}
                  </span>
                  {s.name}
                </span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* The four systems stacked */}
      <DesignSystemLab />
      <StyleGuideTalksBack />
      <CampaignFactory />
      <Atelier />

      {/* Closing: contact CTA */}
      <section className="container-x py-28 md:py-36 rule-top">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green mb-4">
              // Pilot one
            </p>
            <h2 className="font-display text-[clamp(2.2rem,5.4vw,4.6rem)] leading-[1.08] tracking-[-0.04em] text-bone">
              Want one of these
              <br />
              <em className="font-display-wonk text-green">running for your team?</em>
            </h2>
            <p className="mt-6 text-bone/85 leading-relaxed max-w-[52ch]">
              All four systems are available as pilots. We&apos;ll scope
              one to your brand, tokens, and workflow, and have it in your
              designers&apos; hands within a few weeks.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right">
            <Link
              href="/#contact"
              data-cursor="email"
              className="inline-flex items-center gap-3 rounded-full bg-green text-ink px-7 py-5 font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
