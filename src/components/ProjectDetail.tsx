"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight, ArrowDown } from "lucide-react";
import type { Project } from "@/lib/projects";

type Props = {
  project: Project;
  prev: Project | null;
  next: Project | null;
};

export default function ProjectDetail({ project, prev, next }: Props) {
  return (
    <article className="relative">
      {/* Hero */}
      <header className="container-x pt-28 pb-12 md:pt-32 md:pb-16">
        <Link
          href="/#work"
          data-cursor="back"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-mute hover:text-green transition-colors"
        >
          <ArrowUpLeft className="h-3.5 w-3.5" />
          back to work
        </Link>

        <div className="mt-10 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-green"
            >
              // {project.num} — {project.category}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 font-display text-[clamp(2.5rem,7vw,7rem)] leading-[1.05] tracking-[-0.04em] text-bone"
            >
              {project.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="mt-4 font-display text-2xl md:text-3xl leading-[1.2] tracking-[-0.02em] text-mute max-w-[40ch]"
            >
              <em className="font-display-wonk text-green">
                {project.oneLiner}
              </em>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="col-span-12 md:col-span-4 mt-6 md:mt-0 md:pt-3 font-mono text-[11px] uppercase tracking-[0.22em] space-y-3"
          >
            <Meta label="Client" value={project.client} />
            <Meta label="Year" value={project.year} />
            <Meta label="Duration" value={project.duration} />
            <Meta label="Tags" value={project.tags.join(" / ")} />
          </motion.div>
        </div>

        <motion.a
          href="#cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          data-cursor="scroll"
          className="mt-16 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70 hover:text-green"
        >
          Scroll / Case study
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </motion.span>
        </motion.a>
      </header>

      {/* Cover image */}
      <section id="cover" className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[16/9] overflow-hidden rounded-lg border border-line bg-ink-2"
        >
          <Image
            src={project.cover}
            alt={`${project.title} — cover`}
            fill
            sizes="(max-width: 1400px) 100vw, 1400px"
            className="object-cover object-top"
            priority
          />
        </motion.div>
      </section>

      {/* Brief */}
      <section className="container-x py-24 md:py-32 rule-top mt-24">
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
              // The brief
            </p>
          </div>
          <div className="col-span-12 md:col-span-8">
            <p className="font-display text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[1.25] tracking-[-0.02em] text-bone max-w-[44ch]">
              {project.brief}
            </p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container-x pb-24 md:pb-32 rule-top pt-24 md:pt-32">
        <div className="grid grid-cols-12 gap-6 md:gap-10 mb-12 md:mb-16">
          <div className="col-span-12 md:col-span-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
              // Process
            </p>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2 className="font-display text-[clamp(2rem,5vw,4rem)] leading-[1.08] tracking-[-0.035em] text-bone">
              How the work
              <br />
              <em className="font-display-wonk text-green">came together.</em>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-4">
            <ul className="font-mono text-[11px] uppercase tracking-[0.22em] space-y-1 border-t border-line">
              {project.services.map((s) => (
                <li
                  key={s}
                  className="flex items-center justify-between py-3 border-b border-line/70 text-bone"
                >
                  <span className="text-mute">↳</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-12 md:col-span-8 space-y-10">
            {project.process.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-12 gap-4 items-start"
              >
                <span className="col-span-2 font-mono text-[11px] uppercase tracking-[0.22em] text-mute pt-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="col-span-10">
                  <h3 className="font-display text-2xl md:text-3xl leading-[1.05] tracking-[-0.025em] text-bone">
                    {step.label}
                  </h3>
                  <p className="mt-3 text-bone/85 leading-relaxed max-w-[60ch]">
                    {step.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {project.gallery.length > 0 && (
        <section className="container-x pb-24 md:pb-32 rule-top pt-24 md:pt-32">
          <div className="grid grid-cols-12 gap-6 md:gap-10 mb-12 md:mb-16">
            <div className="col-span-12 md:col-span-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
                // Selected stills
              </p>
            </div>
            <div className="col-span-12 md:col-span-8">
              <h2 className="font-display text-[clamp(2rem,5vw,4rem)] leading-[1.08] tracking-[-0.035em] text-bone">
                A few <em className="font-display-wonk text-green">favorites.</em>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {project.gallery.map((img, i) => {
              const wide = i % 3 === 0;
              // Default aspects per slot; image can override via `aspect`.
              const aspect = img.aspect ?? (wide ? "3 / 2" : "4 / 3");
              return (
                <motion.figure
                  key={img.src}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.9,
                    delay: (i % 2) * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`relative overflow-hidden rounded-lg border border-line bg-ink-2 ${
                    wide ? "col-span-12" : "col-span-12 md:col-span-6"
                  }`}
                  style={{ aspectRatio: aspect }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes={
                      wide
                        ? "(max-width: 1400px) 100vw, 1400px"
                        : "(max-width: 768px) 100vw, 50vw"
                    }
                    className="object-cover object-top"
                  />
                </motion.figure>
              );
            })}
          </div>
        </section>
      )}

      {/* Footer nav */}
      <section className="container-x pt-12 pb-24 rule-top">
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 md:col-span-3">
            {prev && (
              <Link
                href={`/work/${prev.slug}`}
                data-cursor="prev"
                className="group inline-flex items-center gap-3"
              >
                <ArrowUpLeft className="h-5 w-5 text-mute group-hover:text-green transition-colors" />
                <span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                    previous
                  </span>
                  <span className="block font-display text-xl tracking-[-0.025em] text-bone group-hover:text-green transition-colors">
                    {prev.title}
                  </span>
                </span>
              </Link>
            )}
          </div>

          <div className="col-span-12 md:col-span-6 text-center">
            <Link
              href="/#work"
              data-cursor="all"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-bone hover:text-green transition-colors"
            >
              All projects
            </Link>
          </div>

          <div className="col-span-12 md:col-span-3 md:text-right">
            {next && (
              <Link
                href={`/work/${next.slug}`}
                data-cursor="next"
                className="group inline-flex items-center gap-3 md:justify-end"
              >
                <span className="md:text-right">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                    next
                  </span>
                  <span className="block font-display text-xl tracking-[-0.025em] text-bone group-hover:text-green transition-colors">
                    {next.title}
                  </span>
                </span>
                <ArrowUpRight className="h-5 w-5 text-mute group-hover:text-green transition-colors" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-3 border-t border-line pt-3">
      <span className="text-mute">{label}</span>
      <span className="text-bone">{value}</span>
    </div>
  );
}
