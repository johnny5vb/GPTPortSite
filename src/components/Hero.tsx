"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, ArrowDownToLine } from "lucide-react";
import { Link } from "next-view-transitions";
import HeroIsolines from "./HeroIsolines";
import { PROFILE } from "@/lib/profile";

/**
 * Portrait hero. Two things are deliberately combined here:
 *
 * 1. The two-column portrait layout — John framed as a print, with a proof
 *    row under the headline. It personalises the page in a way the abstract
 *    treatments never did.
 * 2. `HeroIsolines`, the live contour field, kept as the background. The
 *    original portrait layout used an 80px grid at `-z-10`, which never
 *    actually rendered: a negative z-index child paints below its ancestors'
 *    backgrounds, and `body` carries an opaque ink background. The field and
 *    glow sit at `z-0`, and every content layer is `relative z-10`.
 *
 * The copy is neutral. An earlier version of this layout carried a pulsing
 * "Open to leadership roles" pill, a "Remote / Hybrid" meta item and an
 * "Open to Director-level creative leadership" line; the neutral repositioning
 * removed that posture sitewide, so none of it returns with the layout.
 *
 * Greys run lighter here than the system tokens (`text-bone/70` and `/55`
 * rather than `text-mute` / `text-mute-2`) because this is the one section
 * whose background isn't flat ink — small grey text over the bright contour
 * lines measured 2.39:1 before that correction.
 */

const PROOF = [
  { value: "20+", label: "Years leading creative & brand" },
  { value: "15+", label: "Years in enterprise healthcare" },
  { value: "5", label: "Designers led as a creative lead" },
];

export default function Hero() {
  const [now, setNow] = useState<string>("");
  const reduce = useReducedMotion();

  // Subtle pointer tilt for the portrait frame.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), {
    stiffness: 120,
    damping: 20,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), {
    stiffness: 120,
    damping: 20,
  });

  // Scroll-driven parallax + fade.
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.1]);

  useEffect(() => {
    const tick = () => {
      const time = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/New_York",
      }).format(new Date());
      setNow(time);
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <section
      id="top"
      className="relative min-h-[100svh] container-x pt-20 pb-8 flex flex-col overflow-hidden"
    >
      <HeroIsolines />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.2 }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(59,154,126,0.14), transparent)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Top meta strip */}
      <div className="relative z-10 flex items-end justify-between text-[10px] uppercase tracking-[0.22em] font-mono text-bone/70 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-6"
        >
          <span>
            <span className="text-bone/55">00 /</span> Index
          </span>
          <span className="hidden sm:inline">
            <span className="text-bone/55">EST.</span> 2005
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-6"
        >
          <span className="hidden sm:inline text-bone/80">Virginia Beach</span>
          <span className="hidden md:inline text-bone/80">
            Brand / Design Systems
          </span>
          <span className="text-green">{now} EST</span>
        </motion.div>
      </div>

      {/* Main hero grid */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 flex-1 flex flex-col justify-center py-8 md:py-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Identity + headline + subline */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-1 order-1">
            <motion.p
              initial={{ x: -16 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-mono text-[11px] uppercase tracking-[0.28em] text-green mb-5"
            >
              // {PROFILE.name} — {PROFILE.titleShort}
            </motion.p>

            <h1 className="font-display text-[clamp(2.4rem,5.6vw,5rem)] leading-[1.04] tracking-[-0.04em] text-bone">
              <Line delay={0.1}>Creative direction,</Line>
              <Line delay={0.2}>and the systems that</Line>
              <Line delay={0.3}>
                <span className="relative font-display-wonk italic text-green">
                  make it repeatable.
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 1,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.9,
                    }}
                    className="absolute left-0 right-0 -bottom-2 h-[3px] bg-green origin-left"
                  />
                </span>
              </Line>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-7 max-w-[52ch] text-bone/85 text-base md:text-lg leading-relaxed"
            >
              {PROFILE.yearsExperience} years leading brand, campaign, digital,
              and creative-operations work — most of it inside enterprise
              healthcare, where the scale, the stakeholders, and the scrutiny
              are highest.
            </motion.p>
          </div>

          {/* Portrait, framed as a print */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            style={
              reduce
                ? undefined
                : { rotateX: rx, rotateY: ry, transformPerspective: 1200 }
            }
            className="lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:row-span-2 order-2 lg:self-stretch lg:mt-[3.25rem] lg:pr-6 xl:pr-10"
          >
            <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-[21rem] lg:max-w-none lg:h-full">
              <div className="relative overflow-hidden rounded-xl border border-line-2 bg-bone aspect-[4/5] lg:aspect-auto lg:h-full">
                {/* portrait-hero.jpg is the same drawing, rebuilt as a 4:5
                    portrait: the scan is landscape (1376x768), so a tall frame
                    was cropping ~60% of it away and needed an objectPosition
                    nudge to keep his face centred. Rather than crop the
                    artwork, the clear paper above it was extended — so the
                    figure now sits whole in the frame with real headroom.
                    The file is versioned in its name (-v3) on purpose: the
                    optimised image is served immutable for a year, so a
                    recrop under the same filename never reaches a returning
                    browser. Bump the suffix whenever the crop changes. */}
                <Image
                  src="/brand/portrait-hero-v3.jpg"
                  alt="John Carman, Creative Director"
                  fill
                  sizes="(max-width: 1024px) 640px, 900px"
                  priority
                  className="object-cover object-[50%_30%]"
                />
                <span
                  aria-hidden
                  className="absolute left-0 right-0 bottom-0 h-[3px] bg-green"
                />
              </div>
              <div className="absolute -bottom-3 left-4 inline-flex items-center gap-2 rounded-full border border-line-2 bg-ink px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-bone/70">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                Creative Director / Brand &amp; Ops
              </div>
            </div>
          </motion.div>

          {/* Proof + CTAs */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-2 order-3">
            <motion.dl
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="grid grid-cols-3 gap-4 md:gap-6 border-y border-line py-5 max-w-[46rem]"
            >
              {PROOF.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-3xl md:text-4xl leading-none tracking-[-0.03em] text-bone">
                    {s.value}
                  </dt>
                  <dd className="mt-2 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.16em] text-bone/65 leading-relaxed">
                    {s.label}
                  </dd>
                </div>
              ))}
            </motion.dl>

            {/* The work leads. Leadership and the résumé are context, a rung down. */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.68 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <a
                href="#work"
                data-cursor="work"
                className="group inline-flex items-center gap-2 rounded-full bg-green text-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
              >
                View the Work
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <Link
                href="/leadership"
                data-cursor="leadership"
                className="inline-flex items-center gap-2 rounded-full border border-line-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone hover:border-green hover:text-green transition-colors"
              >
                Leadership
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={PROFILE.resumeHref}
                data-cursor="resume"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/70 hover:text-bone transition-colors"
              >
                Résumé
                <ArrowDownToLine className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom strip */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-6 pt-6 border-t border-line">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70"
        >
          <div className="text-bone/55">// what I do</div>
          <div className="mt-2 text-bone/80">
            Creative Director / Brand &amp; Creative Operations Leader /
            AI-Enabled Strategist
          </div>
        </motion.div>

        <motion.a
          href="#work"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          data-cursor="scroll"
          className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70 hover:text-green"
        >
          <span>Scroll / The work</span>
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
