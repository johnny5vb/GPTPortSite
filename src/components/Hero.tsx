"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowDown, ArrowUpRight, ArrowDownToLine } from "lucide-react";
import { Link } from "next-view-transitions";
import HeroMonogram from "./HeroMonogram";
import { PROFILE } from "@/lib/profile";

const ROTATORS = ["organizations.", "operations.", "systems.", "campaigns."];

export default function Hero() {
  const [now, setNow] = useState<string>("");
  const [idx, setIdx] = useState(0);
  const reduce = useReducedMotion();

  // 3D tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [3, -3]), {
    stiffness: 120,
    damping: 18,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), {
    stiffness: 120,
    damping: 18,
  });

  // Scroll-driven parallax + fade
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.1]);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const time = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/New_York",
      }).format(d);
      setNow(time);
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % ROTATORS.length), 2800);
    return () => clearInterval(t);
  }, [reduce]);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      mx.set(x);
      my.set(y);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <section
      id="top"
      className="relative min-h-[100svh] container-x pt-20 pb-8 flex flex-col overflow-hidden"
    >
      {/* Background grid + glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 75%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.2 }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(28,183,145,0.22), transparent)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Hero visual — a calm CC monogram anchoring the headline's right-side
          gap (lg+ only; the mobile hero is pure typography). */}
      <HeroMonogram mx={mx} my={my} />

      {/* Top meta strip */}
      <div className="flex items-end justify-between text-[10px] uppercase tracking-[0.22em] font-mono text-mute pt-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-6"
        >
          <span>
            <span className="text-mute-2">00 /</span> Index
          </span>
          <span className="hidden sm:inline">
            <span className="text-mute-2">EST.</span> 2005
          </span>
          <span className="hidden md:inline">
            <span className="text-mute-2">v</span> 1.0
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-6"
        >
          <span className="hidden sm:inline text-bone/80">Virginia Beach</span>
          <span className="hidden md:inline text-bone/80">Remote / Hybrid</span>
          <span className="text-green">{now} EST</span>
        </motion.div>
      </div>

      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="flex-1 flex flex-col justify-center mt-8 md:mt-4"
      >
        {/* Kicker: slide-in only (no opacity-0 initial state) so static
            accessibility scanners can read the contrast of text-green on
            ink without alpha-blending it to invisible. */}
        <motion.p
          initial={{ x: -16 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-mono text-[11px] uppercase tracking-[0.28em] text-green mb-6"
        >
          // John Carman — Creative Director
        </motion.p>

        <motion.h1
          style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
          className="font-display text-[clamp(2.4rem,7.4vw,7.4rem)] leading-[1.1] tracking-[-0.04em] text-bone"
        >
          <Line delay={0.1}>Creative leadership</Line>
          <Line delay={0.2}>for complex brands,</Line>
          <Line delay={0.3}>teams, and</Line>
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="inline-block"
            >
              <RotatorBox idx={idx} />
            </motion.span>
          </span>
        </motion.h1>

        <div className="mt-12 grid grid-cols-12 gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="col-span-12 md:col-span-6 md:col-start-7 max-w-[54ch] space-y-4"
          >
            <p className="text-bone/90 text-base md:text-lg leading-relaxed">
              I&apos;m John Carman, a{" "}
              <span className="text-green">Creative Director</span> with{" "}
              {PROFILE.yearsExperience} years across enterprise brand
              leadership, campaigns, digital experiences, and creative
              operations.
            </p>
            <p className="text-mute text-sm md:text-base leading-relaxed">
              I help organizations produce clearer, stronger, more effective
              creative work — and build the systems that let teams keep
              improving.
            </p>

            {/* Primary path: employment. Secondary: consulting. */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/leadership"
                data-cursor="leadership"
                className="group inline-flex items-center gap-2 rounded-full bg-green text-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
              >
                View Leadership Work
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/resume"
                data-cursor="resume"
                className="inline-flex items-center gap-2 rounded-full border border-line-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone hover:border-green hover:text-green transition-colors"
              >
                Download Résumé
                <ArrowDownToLine className="h-3.5 w-3.5" />
              </Link>
              <a
                href="#contact"
                data-cursor="ask"
                className="inline-flex items-center font-mono text-[11px] uppercase tracking-[0.2em] text-mute hover:text-bone transition-colors"
              >
                Discuss a project →
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom strip */}
      <div className="relative flex flex-wrap items-end justify-between gap-6 pt-6 border-t border-line">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute"
        >
          <div className="text-mute-2">// what I do</div>
          <div className="mt-2 text-bone/80">
            Creative Director / Brand &amp; Creative Operations Leader /
            AI-Enabled Strategist
          </div>
        </motion.div>

        <motion.a
          href="#manifesto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          data-cursor="scroll"
          className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70 hover:text-green"
        >
          <span>Scroll / How I lead</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex"
          >
            <ArrowDown className="h-4 w-4" />
          </motion.span>
        </motion.a>
      </div>
    </section>
  );
}

function Line({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </span>
  );
}

/**
 * Rotator with baseline-aligned word. The invisible placeholder reserves width
 * (and sets the natural line box). The clip region extends upward to give
 * italic ascenders room, but the animated word is anchored to the placeholder
 * baseline via `bottom: 0`, so its baseline matches the "and" preceding it.
 */
function RotatorBox({ idx }: { idx: number }) {
  return (
    <span className="relative inline-block align-baseline">
      <span className="invisible font-display-wonk">organizations.</span>
      <span
        aria-hidden
        className="absolute left-0 right-0 bottom-0 overflow-hidden"
        style={{ top: "-0.25em" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={ROTATORS[idx]}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-110%", opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 bottom-0 font-display-wonk text-green whitespace-nowrap"
          >
            {ROTATORS[idx]}
          </motion.span>
        </AnimatePresence>
      </span>
      {/* Underline */}
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.95,
        }}
        className="absolute left-0 right-0 -bottom-2 h-[3px] bg-green origin-left"
      />
    </span>
  );
}
