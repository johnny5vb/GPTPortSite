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
import { ArrowDown } from "lucide-react";
import HeroContactSheet, { HeroContactStrip } from "./HeroContactSheet";

const ROTATORS = ["last.", "lead.", "ship.", "stand out."];

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

      {/* Hero visual — drifting contact sheet of real work. The lg+ panel sits
          in the headline's right-side gap; the mobile filmstrip renders in the
          flow below the copy. */}
      <HeroContactSheet mx={mx} my={my} />

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
          <span className="hidden sm:inline text-bone/80">VA Beach</span>
          <span className="hidden md:inline text-bone/80">Philadelphia</span>
          <span className="text-bone/80">Brooklyn</span>
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
          // Hi, I&apos;m John Carman — Creative Director &amp; AI Strategist
        </motion.p>

        <motion.h1
          style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
          className="font-display text-[clamp(2.4rem,7.4vw,7.4rem)] leading-[1.1] tracking-[-0.04em] text-bone"
        >
          <Line delay={0.1}>I help brands launch</Line>
          <Line delay={0.2}>with conviction,</Line>
          <Line delay={0.3}>scale with intention,</Line>
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="inline-block"
            >
              and <RotatorBox idx={idx} />
            </motion.span>
          </span>
        </motion.h1>

        <HeroContactStrip />

        <div className="mt-12 grid grid-cols-12 gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="col-span-12 md:col-span-6 md:col-start-7 max-w-[52ch] space-y-4"
          >
            <p className="text-bone/90 text-base md:text-lg leading-relaxed">
              <span className="text-green">Twenty years</span> of creative
              direction across brand identity, web design, packaging, and
              AI-powered creative — bringing modern tools to teams that care
              about craft.
            </p>
            <p className="text-mute text-sm md:text-base leading-relaxed">
              I lead with clarity, ship with care, and build so the work keeps
              working. Studio in Virginia Beach, Philadelphia, and Brooklyn.
            </p>
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
            Brand identity / Web design / Packaging / AI-powered creative
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
          <span>Scroll / How I work</span>
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
      <span className="invisible font-display-wonk">stand out.</span>
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
