"use client";

import { motion } from "framer-motion";
import MagneticButton from "./MagneticButton";
import { ArrowUpRight } from "lucide-react";
import VelocityHeading from "./VelocityHeading";

export default function ContactCTA() {
  return (
    <section id="contact" className="relative py-28 md:py-40 container-x rule-top overflow-hidden">
      <div className="relative">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-green mb-8"
        >
          // 07 — Let's build
        </motion.p>

        <VelocityHeading className="origin-left" maxSkew={1}>
          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2.8rem,8.4vw,8.4rem)] leading-[1.08] tracking-[-0.04em] text-bone"
          >
            Let&apos;s design something
            <br />
            <em className="font-display-wonk text-green">
              that actually works.
            </em>
          </motion.h2>
        </VelocityHeading>

        <div className="mt-14 grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 md:col-span-6">
            <p className="text-bone/85 text-lg leading-relaxed max-w-[46ch]">
              Brand identity, web design, packaging, or an AI-powered creative
              system — start with a short note about what you&apos;re building.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <MagneticButton
                href="mailto:johnbcarman@gmail.com?subject=Project%20inquiry"
                className="group inline-flex items-center gap-3 rounded-full bg-green text-ink px-7 py-5 font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
                ariaLabel="Email John"
              >
                johnbcarman@gmail.com
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </MagneticButton>

            </div>
          </div>

          <div className="col-span-12 md:col-span-5 md:col-start-8 grid grid-cols-2 gap-4">
            <ContactBlock
              label="Studio"
              value={`Virginia Beach\nPhiladelphia\nBrooklyn`}
            />
            <ContactBlock label="Hours" value={`Mon–Fri\n9a–6p EST`} />
            <ContactBlock
              label="Social"
              value={`@jbcarms\nlinkedin.com/in/johncarman`}
            />
            <ContactBlock label="Engagements" value={`Project\nRetainer`} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-md border border-line bg-ink-2">
      <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-mute mb-2">
        {label}
      </div>
      <div className="whitespace-pre-line text-sm leading-snug text-bone">
        {value}
      </div>
    </div>
  );
}

