"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import VelocityHeading from "./VelocityHeading";
import { PROFILE } from "@/lib/profile";

/**
 * One way in, not two. This used to split into a hiring path and a project
 * path; the neutral repositioning replaces both with a single open invitation
 * and a plain mailto — no pre-filled intake, because pre-filling the fields
 * implies a transaction is being solicited.
 * TODO: If a real form is wanted, wire Netlify Forms (the site is on Netlify)
 * and swap this mailto for a posted form.
 */

const MAILTO = `mailto:${PROFILE.contact.email}`;

export default function ContactCTA() {
  return (
    <section
      id="contact"
      className="relative py-16 sm:py-24 md:py-40 container-x rule-top overflow-hidden"
    >
      {/* Practice strip. This was an availability strip ("open to senior
          creative leadership roles / remote / select hybrid"); it now names
          the disciplines instead of a posture. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-16 md:mb-24 font-mono text-[10px] uppercase tracking-[0.22em]"
      >
        <span className="text-bone/80">Carman Creative</span>
        <span className="text-mute-2">/</span>
        <span className="text-bone/80">Brand</span>
        <span className="text-mute-2">/</span>
        <span className="text-bone/80">Creative direction</span>
        <span className="text-mute-2">/</span>
        <span className="text-bone/80">Design systems</span>
      </motion.div>

      <div className="relative">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-green mb-8"
        >
          // 04 — Let&apos;s talk
        </motion.p>

        <VelocityHeading className="origin-left" maxSkew={1}>
          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="t-display-lg"
          >
            Let&apos;s make the work,
            <br />
            <em className="font-display-wonk text-green">and the team, better.</em>
          </motion.h2>
        </VelocityHeading>

        {/* One invitation */}
        <div className="mt-10 max-w-[54ch]">
          <p className="t-lede text-bone/85">
            Brand, creative direction, design systems, or just to connect — tell
            me what you have in mind.
          </p>
          <div className="mt-8">
            <a
              href={MAILTO}
              data-cursor="email"
              className="group inline-flex items-center gap-3 rounded-full bg-green text-ink px-6 py-4 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
            >
              Email me
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Contact meta */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-4">
          <ContactBlock label="Based in" value={PROFILE.location.base} />
          <ContactBlock label="Email" value={PROFILE.contact.email} />
          <ContactBlock label="LinkedIn" value="linkedin.com/in/johncarman" />
        </div>
      </div>
    </section>
  );
}

function ContactBlock({ label, value }: { label: string; value: string }) {
  return (
    // min-w-0: grid children default to min-width:auto and refuse to shrink,
    // which is what let long values (an email, a profile URL) push past the card.
    <div className="min-w-0 p-4 rounded-md border border-line bg-ink-2">
      <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-mute mb-2">
        {label}
      </div>
      <div className="whitespace-pre-line break-words [overflow-wrap:anywhere] text-sm leading-snug text-bone">
        {value}
      </div>
    </div>
  );
}
