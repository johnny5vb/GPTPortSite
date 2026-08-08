"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Play, Ticket } from "lucide-react";
import StarField from "./StarField";
import AlbumArt from "./AlbumArt";
import { BandBadge } from "./StarLogo";
import { BAND, RELEASES, SHOWS, showDate } from "@/lib/shootingStars";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Section 00. A gig poster that happens to be a web page: star field, one
 * enormous stacked wordmark, and two "what's happening right now" capsules
 * pinned to the bottom rail (latest release / next show).
 *
 * Headline colors are solid rather than gradient-filled on purpose — the
 * transparent-text trick reads as invisible to contrast scanners, and this is
 * the page's h1.
 */
export default function BandHero() {
  const reduce = useReducedMotion();
  const latest = RELEASES[0];
  const nextShow = SHOWS.find((s) => s.status !== "past");

  const line = (delay: number) => ({
    initial: { y: reduce ? 0 : "110%" },
    animate: { y: 0 },
    transition: { duration: 1.05, ease: EASE, delay },
  });

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden pt-24 pb-0"
    >
      <StarField className="absolute inset-0 -z-10 h-full w-full" />

      {/* Aurora blooms — the only color in the background plate. */}
      <div
        aria-hidden="true"
        className="ss-bloom absolute -top-[22%] -right-[12%] -z-10 h-[46rem] w-[46rem] rounded-full opacity-60 blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,255,0.5) 0%, rgba(124,92,255,0) 68%)",
        }}
      />
      <div
        aria-hidden="true"
        className="ss-bloom absolute -bottom-[28%] -left-[16%] -z-10 h-[40rem] w-[40rem] rounded-full opacity-50 blur-[120px]"
        style={{
          animationDelay: "-6s",
          background:
            "radial-gradient(circle, rgba(255,90,60,0.42) 0%, rgba(255,90,60,0) 68%)",
        }}
      />
      {/* Grounds the type against the star field so the bottom rail stays legible. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-ss-night via-ss-night/70 to-transparent"
      />

      <div className="mx-auto grid w-full max-w-[88rem] flex-1 grid-cols-12 items-center gap-6 px-5 md:px-10">
        <div className="col-span-12 lg:col-span-9">
          <motion.p
            initial={{ x: reduce ? 0 : -16 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.32em] text-ss-smoke uppercase md:text-[11px]"
          >
            <span className="text-ss-gold">{BAND.hometown}</span>
            <span aria-hidden="true" className="text-ss-line-2">
              /
            </span>
            <span>{BAND.genre}</span>
            <span aria-hidden="true" className="text-ss-line-2">
              /
            </span>
            <span>Est. {BAND.formed}</span>
          </motion.p>

          <h1 className="mt-5 md:mt-7">
            <span className="sr-only">{BAND.name}</span>
            <span aria-hidden="true" className="block">
              <span className="block overflow-hidden">
                <motion.span
                  {...line(0.05)}
                  className="ss-display block text-[clamp(1.1rem,2.6vw,2rem)] tracking-[0.5em] text-ss-smoke"
                >
                  The
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  {...line(0.14)}
                  className="ss-display block text-[clamp(3.4rem,14.5vw,12.5rem)] text-ss-cream"
                >
                  Shooting
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  {...line(0.24)}
                  className="ss-display block text-[clamp(3.4rem,14.5vw,12.5rem)] text-ss-gold"
                >
                  Stars
                </motion.span>
              </span>
            </span>
          </h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.45 }}
            aria-hidden="true"
            className="mt-6 h-px w-full max-w-[46rem] origin-left"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #7c5cff 0%, #ff5a3c 46%, #ffc94a 100%)",
            }}
          />

          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
            className="mt-6 max-w-[46ch] text-base leading-relaxed text-ss-smoke md:text-lg"
          >
            {BAND.intro}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.66 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a
              href="#music"
              className="group inline-flex items-center gap-2.5 rounded-full bg-ss-cream px-6 py-3.5 font-mono text-[11px] font-medium tracking-[0.2em] text-ss-deep uppercase transition-transform duration-300 hover:scale-[1.04]"
            >
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Hear the new single
            </a>
            <a
              href="#tour"
              className="group inline-flex items-center gap-2.5 rounded-full border border-ss-line-2 px-6 py-3.5 font-mono text-[11px] tracking-[0.2em] text-ss-cream uppercase transition-colors duration-300 hover:border-ss-gold hover:text-ss-gold"
            >
              <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
              Tour dates
            </a>
          </motion.div>
        </div>

        {/* Rotating seal — decorative, desktop only, sits in the negative space
            to the right of the headline stack. */}
        <motion.div
          initial={{ opacity: 0, scale: reduce ? 1 : 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.5 }}
          aria-hidden="true"
          className="col-span-3 hidden justify-end lg:flex"
        >
          <BandBadge className="ss-spin h-52 w-52 opacity-90 xl:h-64 xl:w-64" />
        </motion.div>
      </div>

      {/* Bottom rail — the two things a visitor actually came for. */}
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.8 }}
        className="mx-auto w-full max-w-[88rem] px-5 pb-8 md:px-10 md:pb-10"
      >
        <div className="flex flex-col gap-4 border-t border-ss-line pt-6 sm:flex-row sm:items-stretch sm:justify-between">
          <a
            href="#music"
            className="group flex items-center gap-4 rounded-xl border border-ss-line bg-ss-panel/60 p-3 backdrop-blur-sm transition-colors hover:border-ss-line-2"
          >
            <AlbumArt
              art={latest.art}
              title={latest.title}
              compact
              className="h-14 w-14 shrink-0 rounded-md"
            />
            <span className="min-w-0">
              <span className="block font-mono text-[10px] tracking-[0.26em] text-ss-gold uppercase">
                New {latest.kind.toLowerCase()} — out now
              </span>
              <span className="ss-display mt-1 block truncate text-xl text-ss-cream">
                {latest.title}
              </span>
            </span>
            <Play
              className="ml-2 h-4 w-4 shrink-0 text-ss-smoke transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-ss-cream"
              aria-hidden="true"
            />
          </a>

          {nextShow && (
            <a
              href="#tour"
              className="group flex items-center gap-4 rounded-xl border border-ss-line bg-ss-panel/60 p-3 backdrop-blur-sm transition-colors hover:border-ss-line-2"
            >
              <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md border border-ss-line-2">
                <span className="ss-display text-lg leading-none text-ss-cream">
                  {showDate(nextShow.date).day}
                </span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-ss-smoke uppercase">
                  {showDate(nextShow.date).month}
                </span>
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[10px] tracking-[0.26em] text-ss-gold uppercase">
                  Next show
                </span>
                <span className="ss-display mt-1 block truncate text-xl text-ss-cream">
                  {nextShow.city}, {nextShow.region}
                </span>
              </span>
              <Ticket
                className="ml-2 h-4 w-4 shrink-0 text-ss-smoke transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-ss-cream"
                aria-hidden="true"
              />
            </a>
          )}

          <span
            aria-hidden="true"
            className="hidden items-center gap-2 self-center font-mono text-[10px] tracking-[0.24em] text-ss-smoke uppercase lg:flex"
          >
            Scroll
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          </span>
        </div>
      </motion.div>
    </section>
  );
}
