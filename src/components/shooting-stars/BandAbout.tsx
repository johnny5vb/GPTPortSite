"use client";

import { motion, useReducedMotion } from "framer-motion";
import StagePoster from "./StagePoster";
import SectionHead from "./SectionHead";
import { MEMBERS, STATS, type Member } from "@/lib/shootingStars";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Duotone plates for the member cards — gold, ember, violet, in rotation. */
const ACCENTS = [
  { from: "#ffc94a", to: "#ff8a3c", ink: "#08070f" },
  { from: "#ff5a3c", to: "#c02a6b", ink: "#f6f2e9" },
  { from: "#7c5cff", to: "#3a2fa8", ink: "#f6f2e9" },
] as const;

/**
 * Section 01 — who the band is.
 *
 * Story column + drawn gig poster, a stat strip, then the lineup. The stats
 * are deliberately unserious ("hours in the garage") because the band is
 * unserious; the layout around them is not.
 */
export default function BandAbout() {
  return (
    <section
      id="about"
      className="relative border-t border-ss-line py-24 md:py-32"
    >
      <div className="mx-auto max-w-[88rem] px-5 md:px-10">
        <SectionHead
          index="01"
          label="The Band"
          title={
            <>
              Four kids,
              <br />
              one garage.
            </>
          }
        />

        <div className="mt-14 grid grid-cols-12 gap-8 md:gap-10">
          <div className="col-span-12 space-y-5 text-base leading-relaxed text-ss-smoke lg:col-span-6 lg:pr-8">
            <p>
              The Shooting Stars started in the spring of 2024, in a two-car
              garage on Holly Road with the door open and one amp between four
              people. The first practice was mostly arguing about a name. The
              second one produced a song.
            </p>
            <p>
              Two years later there are nine songs on the internet, a van that
              starts most of the time, and a standing agreement with the
              neighbors that everything stops at nine on weeknights. Nothing
              about the operation is professional except the part where they
              show up, plug in, and play like the room is bigger than it is.
            </p>
            <p className="text-ss-cream">
              Loud, fast, three minutes or less, and finished before you get
              bored. That is the entire manifesto.
            </p>

            <blockquote className="mt-9 border-l-2 border-ss-gold pl-5">
              <p className="ss-display text-2xl leading-[1.06] text-ss-cream md:text-3xl">
                “We are not trying to reinvent anything. We are trying to be the
                best forty minutes of your week.”
              </p>
              <cite className="mt-3 block font-mono text-[11px] tracking-[0.22em] text-ss-smoke uppercase not-italic">
                — Nico Vance, vocals
              </cite>
            </blockquote>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="col-span-12 lg:col-span-6"
          >
            <StagePoster className="w-full rounded-xl" />
            <p className="mt-3 font-mono text-[10px] tracking-[0.22em] text-ss-smoke uppercase">
              17th Street Stage / Boardwalk Summer Series / June 2026
            </p>
          </motion.div>
        </div>

        {/* Stat strip */}
        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ss-line bg-ss-line md:mt-20 md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }}
              className="bg-ss-panel px-6 py-8"
            >
              <dt className="font-mono text-[10px] tracking-[0.24em] text-ss-smoke uppercase">
                {s.label}
              </dt>
              <dd className="ss-display mt-2 text-4xl text-ss-cream md:text-5xl">
                {s.value}
              </dd>
            </motion.div>
          ))}
        </dl>

        {/* Lineup */}
        <div className="mt-16 md:mt-24">
          <h3 className="font-mono text-[11px] tracking-[0.26em] text-ss-gold uppercase">
            The lineup
          </h3>
          <ul className="mt-6 grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
            {MEMBERS.map((m, i) => (
              <MemberCard key={m.name} member={m} index={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function MemberCard({ member, index }: { member: Member; index: number }) {
  const reduce = useReducedMotion();
  const accent = ACCENTS[member.accent];

  return (
    <motion.li
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: EASE, delay: index * 0.07 }}
      className="group relative overflow-hidden rounded-xl border border-ss-line bg-ss-panel"
    >
      {/* Duotone plate. The initials are decorative — the name is right below
          in real text — so the plate is hidden from assistive tech. */}
      <div
        aria-hidden="true"
        className="relative aspect-4/5 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(150deg, ${accent.from} 0%, ${accent.to} 100%)`,
        }}
      >
        <div className="ss-halftone absolute inset-0 opacity-25 mix-blend-multiply" />
        <span
          className="ss-display absolute inset-0 flex items-center justify-center text-[clamp(3rem,8vw,5rem)] transition-transform duration-700 group-hover:scale-110"
          style={{ color: accent.ink, opacity: 0.92 }}
        >
          {member.initials}
        </span>
        <span
          className="absolute inset-x-0 bottom-0 h-24 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(to top, #08070f 0%, rgba(8,7,15,0) 100%)",
          }}
        />
      </div>

      <div className="p-4 md:p-5">
        <p className="ss-display text-xl text-ss-cream md:text-2xl">
          {member.name}
        </p>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.2em] text-ss-gold uppercase">
          {member.role}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ss-smoke">
          {member.note}
        </p>
      </div>
    </motion.li>
  );
}
