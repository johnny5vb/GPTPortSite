"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import AlbumArt from "./AlbumArt";
import SectionHead from "./SectionHead";
import { RELEASES, type Release } from "@/lib/shootingStars";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Placeholder destinations — swap for the band's real streaming links. */
const PLATFORMS = ["Spotify", "Apple Music", "Bandcamp", "YouTube"];

/**
 * Section 02 — the catalog.
 *
 * The newest release gets a full-width feature with its tracklist; everything
 * behind it drops into a three-up sleeve grid. Covers are drawn in
 * AlbumArt.tsx rather than photographed.
 */
export default function BandMusic() {
  const [featured, ...back] = RELEASES;

  return (
    <section
      id="music"
      className="relative border-t border-ss-line py-24 md:py-32"
    >
      <div className="mx-auto max-w-[88rem] px-5 md:px-10">
        <SectionHead
          index="02"
          label="Music"
          title={
            <>
              Nine songs,
              <br />
              none of them long.
            </>
          }
          intro="Everything the band has put out, newest first. Recorded in a garage, a bedroom, and one very generous friend's basement."
        />

        {/* Featured release */}
        <motion.article
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mt-14 grid grid-cols-12 gap-8 rounded-2xl border border-ss-line bg-ss-panel p-5 md:gap-10 md:p-8"
        >
          <div className="col-span-12 lg:col-span-5">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-6 -z-10 rounded-full opacity-50 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,90,60,0.35) 0%, rgba(255,90,60,0) 70%)",
                }}
              />
              <AlbumArt
                art={featured.art}
                title={featured.title}
                className="w-full rounded-xl border border-ss-line-2"
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7">
            <p className="font-mono text-[10px] tracking-[0.26em] text-ss-gold uppercase">
              Latest {featured.kind.toLowerCase()} / {featured.year}
            </p>
            <h3 className="mt-3 text-[clamp(2.2rem,5vw,4rem)] text-ss-cream">
              {featured.title}
            </h3>
            <p className="mt-4 max-w-[52ch] leading-relaxed text-ss-smoke">
              {featured.blurb}
            </p>

            <ol className="mt-7 divide-y divide-ss-line border-y border-ss-line">
              {featured.tracks.map((t, i) => (
                <li
                  key={t.title}
                  className="group flex items-center gap-4 py-3.5"
                >
                  <span className="w-6 font-mono text-[11px] text-ss-smoke tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Play
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 fill-current text-ss-line-2 transition-colors group-hover:text-ss-gold"
                  />
                  <span className="flex-1 text-ss-cream">{t.title}</span>
                  <span className="font-mono text-[11px] text-ss-smoke tabular-nums">
                    {t.length}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              {PLATFORMS.map((p) => (
                <a
                  key={p}
                  href="#"
                  className="rounded-full border border-ss-line-2 px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] text-ss-cream uppercase transition-colors hover:border-ss-gold hover:text-ss-gold"
                >
                  {p}
                </a>
              ))}
            </div>
          </div>
        </motion.article>

        {/* Back catalog */}
        <h3 className="mt-16 font-mono text-[11px] tracking-[0.26em] text-ss-smoke uppercase md:mt-20">
          Back catalog
        </h3>
        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {back.map((r, i) => (
            <ReleaseCard key={r.title} release={r} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function ReleaseCard({ release, index }: { release: Release; index: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.li
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease: EASE, delay: index * 0.08 }}
      className="group rounded-xl border border-ss-line bg-ss-panel p-4 transition-colors hover:border-ss-line-2"
    >
      <div className="overflow-hidden rounded-lg">
        <AlbumArt
          art={release.art}
          title={release.title}
          className="w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h4 className="ss-display text-xl text-ss-cream">{release.title}</h4>
        <span className="font-mono text-[10px] tracking-[0.2em] text-ss-smoke uppercase">
          {release.kind} / {release.year}
        </span>
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-ss-smoke">
        {release.blurb}
      </p>
      <p className="mt-3 font-mono text-[10px] tracking-[0.2em] text-ss-smoke uppercase">
        {release.tracks.length} tracks
      </p>
    </motion.li>
  );
}
