"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import VelocityHeading from "./VelocityHeading";
import { PROFILE } from "@/lib/profile";

/**
 * Two inquiry paths, not one generic form. The leadership path is primary
 * (green, listed first); the project path is the secondary consulting offer.
 * Both use structured mailto links so they work with no backend and pre-fill
 * a useful subject + prompt.
 * TODO: If real forms are wanted, wire Netlify Forms (the site is on Netlify)
 * and swap these mailto CTAs for posted forms with the fields noted below.
 */

const LEADERSHIP_MAILTO =
  `mailto:${PROFILE.contact.email}` +
  `?subject=${encodeURIComponent("Leadership opportunity")}` +
  `&body=${encodeURIComponent(
    "Name:\nCompany:\nRole / opportunity:\nJob description or link:\n\nMessage:\n",
  )}`;

const PROJECT_MAILTO =
  `mailto:${PROFILE.contact.email}` +
  `?subject=${encodeURIComponent("Project inquiry")}` +
  `&body=${encodeURIComponent(
    "Name:\nOrganization:\nProject type:\nEstimated timing:\n\nMessage:\n",
  )}`;

export default function ContactCTA() {
  return (
    <section
      id="contact"
      className="relative py-16 sm:py-24 md:py-40 container-x rule-top overflow-hidden"
    >
      {/* Availability strip — leadership-forward, no hustle language */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-16 md:mb-24 font-mono text-[10px] uppercase tracking-[0.22em]"
      >
        <span className="text-bone/80">
          Open to senior creative leadership roles
        </span>
        <span className="text-mute-2">/</span>
        <span className="text-bone/80">Remote / Select hybrid</span>
        <span className="text-mute-2">/</span>
        <span className="text-mute">Select consulting via Carman Creative</span>
      </motion.div>

      <div className="relative">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-green mb-8"
        >
          // 07 — Let&apos;s talk
        </motion.p>

        <VelocityHeading className="origin-left" maxSkew={1}>
          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2.8rem,8.4vw,8.4rem)] leading-[1.08] tracking-[-0.04em] text-bone"
          >
            Let&apos;s make the work,
            <br />
            <em className="font-display-wonk text-green">and the team, better.</em>
          </motion.h2>
        </VelocityHeading>

        {/* Two paths */}
        <div className="mt-14 grid grid-cols-12 gap-4 md:gap-6">
          {/* Primary: employment */}
          <div className="col-span-12 md:col-span-6 rounded-xl border border-green/40 bg-green/[0.05] p-7 md:p-9 flex flex-col">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-green mb-3">
              // for hiring teams
            </p>
            <h3 className="font-display text-2xl md:text-3xl leading-[1.1] tracking-[-0.03em] text-bone">
              Discuss a Leadership Opportunity
            </h3>
            <p className="mt-3 text-bone/80 leading-relaxed max-w-[40ch]">
              Considering John for a senior in-house creative leadership role?
              Share the team, the mandate, and a link to the role.
            </p>
            <div className="mt-6 pt-2">
              <a
                href={LEADERSHIP_MAILTO}
                data-cursor="email"
                className="group inline-flex items-center gap-3 rounded-full bg-green text-ink px-6 py-4 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
              >
                Start the conversation
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* Secondary: project */}
          <div className="col-span-12 md:col-span-6 rounded-xl border border-line bg-ink-2 p-7 md:p-9 flex flex-col">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute mb-3">
              // for organizations
            </p>
            <h3 className="font-display text-2xl md:text-3xl leading-[1.1] tracking-[-0.03em] text-bone">
              Discuss a Creative Project
            </h3>
            <p className="mt-3 text-bone/80 leading-relaxed max-w-[40ch]">
              Brand, identity, campaigns, websites, or a creative-systems
              engagement with Carman Creative. Tell me what you&apos;re building.
            </p>
            <div className="mt-6 pt-2">
              <a
                href={PROJECT_MAILTO}
                data-cursor="email"
                className="group inline-flex items-center gap-3 rounded-full border border-line-2 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-bone hover:border-green hover:text-green transition-colors"
              >
                Send a project note
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact meta */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <ContactBlock label="Email" value={PROFILE.contact.email} />
          <ContactBlock label="Based in" value={PROFILE.location.base} />
          <ContactBlock
            label="Availability"
            value={`Remote\nSelect hybrid`}
          />
          <ContactBlock
            label="Social"
            value={`${PROFILE.contact.instagramHandle}\nlinkedin.com/in/johncarman`}
          />
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
