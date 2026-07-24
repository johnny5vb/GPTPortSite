"use client";

import { motion } from "framer-motion";
import { PUBLISHED_TESTIMONIALS } from "@/lib/testimonials";

/**
 * References section. Renders only when there is at least one *verified*
 * testimonial — so the live site never shows a placeholder quote. Wired into
 * the Leadership page; it simply returns null until real quotes are added to
 * src/lib/testimonials.ts.
 */
export default function Testimonials() {
  if (PUBLISHED_TESTIMONIALS.length === 0) return null;

  return (
    <section className="container-x py-16 md:py-24 rule-top">
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // References
          </p>
        </div>
        <div className="col-span-12 md:col-span-8 space-y-10">
          {PUBLISHED_TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            >
              <p className="font-display text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.25] tracking-[-0.02em] text-bone max-w-[46ch]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                {t.author}
                {t.role ? ` · ${t.role}` : ""}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
