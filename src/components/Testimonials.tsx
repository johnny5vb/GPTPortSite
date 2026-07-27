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
        {/* Two columns once there's more than one quote — at four, a single
            stacked column at display size runs far too long. */}
        <div className="col-span-12 md:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {PUBLISHED_TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="border-t border-line pt-6"
            >
              <p className="font-display text-[clamp(1.15rem,1.9vw,1.5rem)] leading-[1.35] tracking-[-0.015em] text-bone">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                <span className="text-bone/80">{t.author}</span>
                {t.role ? (
                  <>
                    <span className="text-mute-2"> / </span>
                    {t.role}
                  </>
                ) : null}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
