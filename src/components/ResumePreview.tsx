"use client";

import { motion } from "framer-motion";
import { Link } from "next-view-transitions";
import { ArrowDownToLine } from "lucide-react";
import { PROFILE } from "@/lib/profile";

const SUMMARY = [
  { label: "Now", value: "Creative Manager, Elevance Health / Carelon" },
  { label: "Formerly", value: "Creative Director, Beacon Health Options" },
  { label: "Also", value: "Founder, Carman Creative · CD, Jumping Fish" },
  { label: "Experience", value: `${PROFILE.yearsExperience}+ years, mostly enterprise healthcare` },
  { label: "Leads", value: "Brand, campaigns, creative operations, teams" },
  { label: "Systems", value: "Workfront, brand governance, AI-enabled workflow" },
];

export default function ResumePreview() {
  return (
    <section className="relative container-x py-16 md:py-14 sm:py-24 rule-top">
      <div className="rounded-2xl border border-line bg-ink-2 p-8 md:p-10">
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
          <div className="col-span-12 md:col-span-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
              // Résumé
            </p>
            <h2 className="mt-4 font-display text-[clamp(1.8rem,3.8vw,2.8rem)] leading-[1.08] tracking-[-0.03em] text-bone">
              The short version.
            </h2>
            <p className="mt-4 text-mute text-sm leading-relaxed max-w-[36ch]">
              The career at a glance — no digging through the About page.
            </p>
            <div className="mt-6">
              <Link
                href={PROFILE.resumeHref}
                data-cursor="resume"
                className="group inline-flex items-center gap-2 rounded-full bg-green text-ink px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-green-bright transition-colors"
              >
                Download Résumé
                <ArrowDownToLine className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="col-span-12 md:col-span-8">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 border-t border-line">
              {SUMMARY.map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                  className="grid grid-cols-[7rem_1fr] gap-3 py-3.5 border-b border-line/70 items-baseline"
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                    {row.label}
                  </dt>
                  <dd className="text-sm text-bone/90 leading-snug">
                    {row.value}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
