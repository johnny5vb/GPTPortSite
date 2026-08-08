"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SectionHead from "./SectionHead";
import { BAND, SOCIALS } from "@/lib/shootingStars";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Section 04 — contact, booking, and the mailing list.
 *
 * The list sign-up composes a mailto: rather than posting to an endpoint —
 * the site is static, and a form that silently swallows an address and says
 * "thanks" would be a lie. The button label and helper text say plainly that
 * it opens an email.
 */
export default function BandContact() {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent("Add me to the list");
    const body = encodeURIComponent(
      `Please add ${email} to the Shooting Stars mailing list.`
    );
    window.location.href = `mailto:${BAND.listEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden border-t border-ss-line py-24 md:py-32"
    >
      <div
        aria-hidden="true"
        className="ss-bloom absolute -top-[30%] left-1/2 -z-10 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,255,0.4) 0%, rgba(255,90,60,0.16) 45%, rgba(8,7,15,0) 72%)",
        }}
      />

      <div className="mx-auto max-w-[88rem] px-5 md:px-10">
        <SectionHead
          index="04"
          label="Contact"
          align="center"
          title={
            <>
              Come to a
              <br />
              show.
            </>
          }
          intro="Booking, press, or you just want to tell us the bass was too loud. It probably was."
        />

        <div className="mx-auto mt-14 max-w-3xl">
          <a
            href={`mailto:${BAND.bookingEmail}`}
            className="group flex flex-col items-center gap-2 text-center"
          >
            <span className="font-mono text-[10px] tracking-[0.26em] text-ss-smoke uppercase">
              Booking &amp; press
            </span>
            <span className="ss-display inline-flex items-center gap-3 text-[clamp(1.4rem,4.2vw,2.75rem)] text-ss-cream transition-colors group-hover:text-ss-gold">
              {BAND.bookingEmail}
              <ArrowUpRight
                className="h-[0.7em] w-[0.7em] shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                aria-hidden="true"
              />
            </span>
          </a>

          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-14 rounded-2xl border border-ss-line bg-ss-panel p-6 md:p-8"
          >
            <label
              htmlFor="ss-list-email"
              className="block font-mono text-[11px] tracking-[0.24em] text-ss-gold uppercase"
            >
              Get the tour emails
            </label>
            <p className="mt-2 text-sm leading-relaxed text-ss-smoke">
              New songs and new dates. Roughly one email a month, and never
              about anything else.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                id="ss-list-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="min-w-0 flex-1 rounded-full border border-ss-line-2 bg-ss-night px-5 py-3.5 text-ss-cream placeholder:text-ss-smoke/70 focus:border-ss-gold focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-ss-gold px-6 py-3.5 font-mono text-[11px] font-medium tracking-[0.2em] text-ss-deep uppercase transition-transform duration-300 hover:scale-[1.03]"
              >
                Join the list
              </button>
            </div>
            <p className="mt-3 font-mono text-[10px] tracking-[0.16em] text-ss-smoke uppercase">
              Opens your email app so you can hit send
            </p>
          </motion.form>

          <ul className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ss-line bg-ss-line sm:grid-cols-4">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  className="group flex h-full flex-col justify-between gap-2 bg-ss-night px-5 py-5 transition-colors hover:bg-ss-panel"
                >
                  <span className="font-mono text-[10px] tracking-[0.22em] text-ss-smoke uppercase">
                    {s.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-ss-cream transition-colors group-hover:text-ss-gold">
                    {s.handle}
                    <ArrowUpRight
                      className="h-3 w-3 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
