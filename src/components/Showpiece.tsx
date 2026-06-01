"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { ArrowUpRight } from "lucide-react";
import { getProject } from "@/lib/projects";

/**
 * Editorial show-stopper. A large image card that respects the standard
 * container margins (matches every other section's gutter). Parallax happens
 * inside the card — the image drifts slightly as you scroll past, but the
 * card itself stays within the section's container-x.
 */
export default function Showpiece({
  slug = "colony-coffee",
}: {
  slug?: string;
}) {
  const reduce = useReducedMotion();
  const project = getProject(slug);
  const imageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1.12, 1.08]);

  if (!project) return null;

  return (
    <section
      id="spotlight"
      className="relative py-28 md:py-40 container-x rule-top"
    >
      {/* Section header — same grid as other sections */}
      <header className="grid grid-cols-12 gap-6 mb-12 md:mb-16">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // 03 — In Focus
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
            {project.year} / {project.duration} / {project.category}
          </p>
        </div>
        <div className="col-span-12 md:col-span-8">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2.4rem,6.4vw,5.4rem)] leading-[1.08] tracking-[-0.04em] text-bone"
          >
            {project.title}
            <span className="text-green">.</span>
            <br />
            <em className="font-display-wonk text-green">
              {project.oneLiner}
            </em>
          </motion.h2>
        </div>
      </header>

      {/* Image card — contained, with parallax inside */}
      <motion.div
        ref={imageRef}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative aspect-[16/9] overflow-hidden rounded-lg border border-line bg-ink-2"
      >
        <motion.div
          style={reduce ? undefined : { y: imgY, scale: imgScale }}
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src={project.cover}
            alt={`${project.title} — featured`}
            fill
            sizes="(max-width: 1400px) 100vw, 1400px"
            className="object-cover"
          />
        </motion.div>

        {/* Bottom dim + label overlay for legibility on the gradient edge */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 60%, rgba(8,8,8,0.85) 100%)",
          }}
        />
        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-green">
              // Featured
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/85">
              {project.title} — {project.year}
            </p>
          </div>
          <Link
            href={`/work/${project.slug}`}
            data-cursor="open case"
            className="group inline-flex items-center gap-2 rounded-full border border-bone/30 bg-ink/40 backdrop-blur-sm px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-bone hover:border-green hover:text-green hover:bg-green/5 transition-colors"
          >
            <span>View case study</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </motion.div>

      {/* Pull-quote below the image */}
      <motion.blockquote
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 md:mt-16 max-w-[44ch] font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.25] tracking-[-0.02em] text-bone/85"
      >
        <span aria-hidden className="text-green pr-2">
          &ldquo;
        </span>
        {project.brief}
      </motion.blockquote>
    </section>
  );
}
