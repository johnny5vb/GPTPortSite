"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SectionHead from "./SectionHead";
import {
  BAND,
  SHOWS,
  STATUS_LABEL,
  showDate,
  type Show,
} from "@/lib/shootingStars";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Section 03 — tour dates.
 *
 * Upcoming shows first as full rows with a ticket action; played shows fall
 * below a divider in a quieter treatment, because a band's history of shows
 * is part of the pitch. Sold-out and past dates render as static text rather
 * than links so nothing on the page is a dead-end click.
 */
export default function BandTour() {
  const upcoming = SHOWS.filter((s) => s.status !== "past");
  const played = SHOWS.filter((s) => s.status === "past").reverse();

  return (
    <section
      id="tour"
      className="relative border-t border-ss-line py-24 md:py-32"
    >
      <div className="mx-auto max-w-[88rem] px-5 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHead
            index="03"
            label="Tour"
            title={
              <>
                On the
                <br />
                road.
              </>
            }
          />
          <p className="max-w-[34ch] font-mono text-[11px] leading-relaxed tracking-[0.14em] text-ss-smoke uppercase md:pb-3 md:text-right">
            {upcoming.length} dates on sale
            <br />
            <span className="text-ss-gold">Fall 2026 — East Coast</span>
          </p>
        </div>

        <ul className="mt-12 border-t border-ss-line md:mt-16">
          {upcoming.map((show, i) => (
            <ShowRow key={show.date + show.city} show={show} index={i} />
          ))}
        </ul>

        {played.length > 0 && (
          <>
            <h3 className="mt-14 font-mono text-[11px] tracking-[0.26em] text-ss-smoke uppercase">
              Already played
            </h3>
            <ul className="mt-5 border-t border-ss-line">
              {played.map((show) => (
                <li
                  key={show.date + show.city}
                  className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-ss-line py-3.5 text-sm text-ss-smoke"
                >
                  <span className="font-mono text-[11px] tracking-[0.14em] tabular-nums">
                    {showDate(show.date).month} {showDate(show.date).day}{" "}
                    {showDate(show.date).year}
                  </span>
                  <span className="text-ss-cream/70">
                    {show.city}, {show.region}
                  </span>
                  <span>{show.venue}</span>
                  {/* text-ss-line-2 is a border tone (1.5:1 on ink) — real
                      copy stays on text-ss-smoke, which clears AA. */}
                  {show.note && (
                    <span className="font-mono text-[10px] tracking-[0.18em] text-ss-smoke/90 uppercase">
                      {show.note}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-12 flex flex-col gap-4 rounded-xl border border-ss-line bg-ss-panel px-6 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ss-smoke">
            <span className="text-ss-cream">Want us in your town?</span> Houses,
            halls, backyards, school gyms — we have played all four.
          </p>
          <a
            href={`mailto:${BAND.bookingEmail}?subject=${encodeURIComponent(
              "Show inquiry — The Shooting Stars"
            )}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ss-line-2 px-5 py-3 font-mono text-[11px] tracking-[0.2em] text-ss-cream uppercase transition-colors hover:border-ss-gold hover:text-ss-gold"
          >
            Book the band
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ShowRow({ show, index }: { show: Show; index: number }) {
  const reduce = useReducedMotion();
  const { month, day, year } = showDate(show.date);
  const soldOut = show.status === "sold-out";
  const label = STATUS_LABEL[show.status];

  return (
    <motion.li
      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: EASE, delay: Math.min(index, 6) * 0.05 }}
      className="group relative border-b border-ss-line"
    >
      {/* Gold wipe on hover — the row equivalent of a stage light coming up. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-ss-gold transition-transform duration-500 ease-out group-hover:scale-y-100"
      />

      <div className="flex flex-col gap-3 py-5 transition-[padding] duration-500 group-hover:pl-4 md:flex-row md:items-center md:gap-6 md:py-6">
        <div className="flex w-full shrink-0 items-baseline gap-3 md:w-44">
          <span className="ss-display text-3xl text-ss-cream md:text-4xl">
            {day}
          </span>
          <span className="font-mono text-[11px] tracking-[0.2em] text-ss-gold uppercase">
            {month}
          </span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-ss-smoke tabular-nums">
            {year}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="ss-display text-xl text-ss-cream md:text-2xl">
            {show.city}, {show.region}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ss-smoke">
            <span>{show.venue}</span>
            {show.note && (
              <>
                <span aria-hidden="true" className="text-ss-line-2">
                  /
                </span>
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase">
                  {show.note}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="shrink-0">
          {soldOut ? (
            <span className="inline-block rounded-full border border-ss-line-2 px-5 py-2.5 font-mono text-[10px] tracking-[0.2em] text-ss-smoke uppercase">
              {label}
            </span>
          ) : (
            <a
              href={show.href ?? "#"}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-[10px] tracking-[0.2em] uppercase transition-transform duration-300 hover:scale-[1.04] ${
                show.status === "few-left"
                  ? "border border-ss-ember text-ss-ember"
                  : "bg-ss-gold text-ss-deep"
              }`}
            >
              {label}
              <span className="sr-only">
                {" "}
                for {show.city} on {month} {day}, {year}
              </span>
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </motion.li>
  );
}
