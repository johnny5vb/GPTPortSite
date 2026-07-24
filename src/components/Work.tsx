"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import {
  LEADERSHIP_PROJECTS,
  INDEPENDENT_PROJECTS,
  SECONDARY_PROJECTS,
  type Project,
} from "@/lib/projects";
import VelocityHeading from "./VelocityHeading";

export default function Work() {
  return (
    <section id="work" className="relative py-28 md:py-40 container-x rule-top">
      <header className="grid grid-cols-12 gap-6 mb-16 md:mb-20">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // 02 — Work
          </p>
        </div>
        <div className="col-span-12 md:col-span-8">
          <VelocityHeading className="origin-left">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2.4rem,6.4vw,5.4rem)] leading-[1.08] tracking-[-0.04em] text-bone"
            >
              Leadership first,
              <br />
              <em className="font-display-wonk text-green">craft throughout.</em>
            </motion.h2>
          </VelocityHeading>
          <p className="mt-6 text-mute max-w-[58ch] leading-relaxed">
            Enterprise brand and creative-operations work leads, followed by
            selected independent projects. Each case study states what I
            personally led and who I led it with.
          </p>
        </div>
      </header>

      {/* Featured leadership work */}
      <div className="mb-8 flex items-baseline justify-between border-t border-line pt-6">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone">
          Featured leadership work
        </h3>
        <Link
          href="/leadership"
          data-cursor="leadership"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute hover:text-green transition-colors inline-flex items-center gap-2"
        >
          Leadership overview <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {LEADERSHIP_PROJECTS.map((p, i) => (
          <LeadershipCard key={p.slug} project={p} index={i} />
        ))}
      </div>

      {/* Selected independent work */}
      <h3 className="mt-20 mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-bone border-t border-line pt-6">
        Selected independent work
      </h3>
      <div className="space-y-2">
        {INDEPENDENT_PROJECTS.map((p, i) => (
          <ProjectRow key={p.slug} project={p} index={i} />
        ))}
      </div>

      {/* Secondary / smaller production work */}
      {SECONDARY_PROJECTS.length > 0 && (
        <>
          <h3 className="mt-20 mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-mute border-t border-line pt-6">
            More work
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {SECONDARY_PROJECTS.map((p) => (
              <SecondaryCard key={p.slug} project={p} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ── Leadership card — no photo dependency; a branded gradient panel that
      morphs into the case-study hero via a shared view-transition name. ── */
function LeadershipCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-xl border border-line bg-ink-2 overflow-hidden"
    >
      <Link
        href={`/work/${project.slug}`}
        data-cursor="open case"
        className="block p-6 md:p-7 h-full"
      >
        <div
          style={{
            viewTransitionName: `project-${project.slug}`,
            background: `linear-gradient(135deg, ${project.palette[0]}, ${project.palette[1]})`,
          }}
          className="relative h-28 rounded-lg border border-line/60 mb-6 overflow-hidden flex items-end p-3"
        >
          <span className="font-display text-2xl tracking-[-0.03em] text-bone/90 mix-blend-screen">
            {project.display}
          </span>
          <span className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70">
            {project.num}
          </span>
        </div>

        <h4 className="font-display text-2xl leading-[1.08] tracking-[-0.03em] text-bone group-hover:text-green transition-colors duration-500">
          {project.title}
        </h4>
        <p className="mt-2 text-sm text-mute leading-relaxed">
          {project.roleSummary ?? project.blurb}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-green">
            Read case study <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-mute-2 border border-line rounded-full px-2 py-0.5">
            Case study in progress
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

function SecondaryCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      data-cursor="open case"
      className="group flex items-center gap-4 rounded-lg border border-line bg-ink-2 p-4 hover:border-line-2 transition-colors"
    >
      <div
        style={{ viewTransitionName: `project-${project.slug}` }}
        className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-line bg-ink"
      >
        <Image
          src={project.cover}
          alt={`${project.title} preview`}
          fill
          sizes="96px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
      </div>
      <div className="min-w-0">
        <div className="font-display text-lg leading-tight tracking-[-0.02em] text-bone group-hover:text-green transition-colors truncate">
          {project.title}
        </div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
          {project.category}
        </div>
      </div>
      <ArrowUpRight className="ml-auto h-4 w-4 text-mute group-hover:text-green transition-colors shrink-0" />
    </Link>
  );
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const previewY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative border-t border-line"
    >
      <Link
        href={`/work/${project.slug}`}
        data-cursor="open case"
        className="grid grid-cols-12 gap-4 md:gap-6 items-center py-8 md:py-10"
      >
        {/* Hover sweep */}
        <motion.span
          aria-hidden
          initial={false}
          animate={{ scaleX: hover ? 1 : 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 -z-10 origin-left"
          style={{
            background:
              "linear-gradient(90deg, rgba(28,183,145,0.06), rgba(28,183,145,0))",
          }}
        />

        <div className="col-span-2 md:col-span-1 font-mono text-xs uppercase tracking-[0.22em] text-mute">
          {project.num}
        </div>

        <div className="col-span-10 md:col-span-4">
          <h4 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-[-0.035em] text-bone group-hover:text-green transition-colors duration-500">
            {project.title}
          </h4>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
            {project.client}
            {project.year ? ` — ${project.year}` : ""}
          </p>
        </div>

        {/* Image thumbnail — morphs into the case-study cover via View Transitions.
            Projects without a cover yet get a branded gradient placeholder. */}
        <div
          style={{ viewTransitionName: `project-${project.slug}` }}
          className="hidden md:block col-span-3 relative h-28 overflow-hidden rounded-md border border-line bg-ink-2"
        >
          {project.cover ? (
            <motion.div style={{ y: previewY }} className="absolute inset-0">
              <Image
                src={project.cover}
                alt={`${project.title} preview`}
                fill
                sizes="280px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
            </motion.div>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${project.palette[0]}, ${project.palette[1]})`,
              }}
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-bone/75">
                visuals coming
              </span>
            </div>
          )}
          <motion.div
            initial={false}
            animate={{ opacity: hover ? 1 : 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent"
          />
          <motion.div
            initial={false}
            animate={{ y: hover ? 0 : 10, opacity: hover ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-2 left-2 right-2 flex items-end justify-between"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone">
              view case →
            </span>
            <span className="flex gap-1">
              {project.palette.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  style={{ background: c }}
                  className="h-3 w-3 rounded-full border border-ink/50"
                />
              ))}
            </span>
          </motion.div>
        </div>

        <div className="col-span-12 md:col-span-3 text-sm text-mute leading-relaxed">
          {project.blurb}
        </div>

        <div className="col-span-12 md:col-span-1 flex md:justify-end gap-1.5 flex-wrap mt-3 md:mt-0">
          {project.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center font-mono text-[9px] uppercase tracking-[0.18em] text-bone/70 border border-line rounded-full px-2 py-1"
            >
              {t}
            </span>
          ))}
        </div>

        <motion.div
          animate={{ x: hover ? 0 : -8, opacity: hover ? 1 : 0.4 }}
          transition={{ duration: 0.4 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex items-center text-green"
        >
          <ArrowUpRight className="h-5 w-5" />
        </motion.div>
      </Link>
    </motion.article>
  );
}
