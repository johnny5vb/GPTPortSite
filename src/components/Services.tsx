"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Service = {
  num: string;
  title: string;
  pitch: string;
  bullets: string[];
};

const SERVICES: Service[] = [
  {
    num: "S/01",
    title: "Design Systems",
    pitch:
      "Defined, documented, governed. The system that lets a team ship for years without losing the plot.",
    bullets: [
      "Color, type, space, and motion — defined and documented",
      "Component libraries built to be adopted",
      "Accessibility in the system, not added after",
    ],
  },
  {
    num: "S/02",
    title: "Brand Identity",
    pitch:
      "Strategy, mark, voice, application. The whole identity built to scale across product, marketing, and partnerships.",
    bullets: [
      "Strategy and positioning",
      "Marks, type, and color systems",
      "Voice, naming, and the launch toolkit",
    ],
  },
  {
    num: "S/03",
    title: "Creative Direction",
    pitch:
      "Setting the standard, keeping the work honest, and helping teams do their best work.",
    bullets: [
      "Campaign and launch direction",
      "Stakeholder translation",
      "Critique that makes teams better",
    ],
  },
  {
    num: "S/04",
    title: "AI-Enabled Workflow",
    pitch:
      "Modern tools, classical taste. AI for the repetitive work — human judgment for the part that decides whether it's any good.",
    bullets: [
      "Prompt systems and custom tools a team can share",
      "Review and governance that keep output on-system",
      "Workflow design, then enablement",
    ],
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-16 sm:py-24 md:py-40 container-x rule-top">
      <header className="grid grid-cols-12 gap-6 mb-12 md:mb-16">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // 03 — Practice
          </p>
        </div>
        <div className="col-span-12 md:col-span-8">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="t-display-lg"
          >
            The work of{" "}
            <em className="font-display-wonk text-green">Carman Creative.</em>
          </motion.h2>
          <p className="mt-6 text-mute max-w-[54ch] leading-relaxed">
            Brand, digital, and creative-systems work. Four shapes it usually
            takes — most projects pull from two or three at once.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line rounded-lg overflow-hidden">
        {SERVICES.map((s, i) => (
          <ServiceCard key={s.num} service={s} index={i} />
        ))}
      </div>
    </section>
  );
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-cursor="open"
      className="relative bg-ink p-8 md:p-10 min-h-[320px] flex flex-col overflow-hidden group"
    >
      <motion.span
        aria-hidden
        animate={{ scale: hover ? 1 : 0, opacity: hover ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-green/20 blur-3xl"
      />
      <div className="flex items-baseline justify-between mb-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
          {service.num}
        </span>
        <motion.span
          animate={{ rotate: hover ? 45 : 0 }}
          transition={{ duration: 0.4 }}
          className="text-bone/40 group-hover:text-green text-2xl leading-none"
        >
          +
        </motion.span>
      </div>

      <h3 className="font-display text-3xl md:text-5xl leading-[0.95] tracking-[-0.04em] text-bone group-hover:text-green transition-colors duration-500">
        {service.title}
      </h3>

      <p className="mt-4 text-bone/80 leading-relaxed max-w-[42ch]">
        {service.pitch}
      </p>

      <motion.ul
        initial={false}
        animate={{ height: hover ? "auto" : 0, opacity: hover ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden mt-6 space-y-1.5"
      >
        {service.bullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-bone/80"
          >
            <span className="text-green mt-1">↳</span>
            {b}
          </li>
        ))}
      </motion.ul>

      <div className="mt-auto pt-8" />
    </motion.div>
  );
}
