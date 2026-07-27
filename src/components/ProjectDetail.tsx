"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { ArrowUpLeft, ArrowUpRight, ArrowDown } from "lucide-react";
import type { Project, WorkMoment, WorkImage } from "@/lib/projects";

type Props = {
  project: Project;
  prev: Project | null;
  next: Project | null;
};

const isTodo = (s: string) => s.trim().toUpperCase().startsWith("TODO");

/** Renders a string, styling TODO placeholders so they never read as a claim. */
function Body({ text, className = "" }: { text: string; className?: string }) {
  if (isTodo(text)) {
    return <span className={`text-mute-2 italic ${className}`}>{text}</span>;
  }
  return <span className={className}>{text}</span>;
}

export default function ProjectDetail({ project, prev, next }: Props) {
  const isCaseStudy = !!project.caseStudy;
  const isFlagship = !!project.flagship && isCaseStudy;
  const backHref = isFlagship ? "/leadership" : "/#work";
  const backLabel = isFlagship ? "back to leadership" : "back to work";

  return (
    <article className="relative">
      {/* Hero */}
      <header className="container-x pt-28 pb-12 md:pt-32 md:pb-16">
        <Link
          href={backHref}
          data-cursor="back"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-mute hover:text-green transition-colors"
        >
          <ArrowUpLeft className="h-3.5 w-3.5" />
          {backLabel}
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
            {isCaseStudy ? (
              project.caseStudy!.overview.map((o) => (
                <Meta key={o.label} label={o.label} value={o.value} />
              ))
            ) : (
              <>
                <Meta label="Client" value={project.client} />
                <Meta label="Year" value={project.year} />
                <Meta label="Duration" value={project.duration} />
                <Meta label="Tags" value={project.tags.join(" / ")} />
              </>
            )}
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

      {/* Cover — the piece presented whole on a neutral plate, so the work
          supplies the colour and the site stays out of its way. */}
      <section id="cover" className="container-x">
        {isFlagship ? (
          <div
            style={{ viewTransitionName: `project-${project.slug}` }}
            className="relative aspect-[16/9] overflow-hidden rounded-lg border border-line bg-ink-2 flex items-end p-8 md:p-12"
          >
            {/* A flagship with a cleared cover features the piece itself,
                centered and uncropped; without one, the wordmark carries it. */}
            {project.cover ? (
              <Image
                src={project.cover}
                alt={`${project.title} — cover`}
                fill
                sizes="(max-width: 1400px) 100vw, 1400px"
                className="object-contain p-6 md:p-10"
                priority
              />
            ) : (
              <span
                aria-hidden
                className="font-display text-[clamp(2.5rem,10vw,7rem)] tracking-[-0.04em] text-bone/25"
              >
                {project.display}
              </span>
            )}
          </div>
        ) : project.cover ? (
          // Covers range from tall documents to 2:1 screenshots, so the hero
          // presents the piece whole rather than cropping everything to one ratio.
          <div
            style={{ viewTransitionName: `project-${project.slug}` }}
            className="relative aspect-[16/10] md:aspect-[16/9] overflow-hidden rounded-lg border border-line bg-ink-2"
          >
            <Image
              src={project.cover}
              alt={`${project.title} — cover`}
              fill
              sizes="(max-width: 1400px) 100vw, 1400px"
              className="object-contain p-4 md:p-8"
              priority
            />
          </div>
        ) : (
          <div
            style={{ viewTransitionName: `project-${project.slug}` }}
            className="relative aspect-[16/9] overflow-hidden rounded-lg border border-dashed border-line-2 bg-ink-2 flex flex-col items-center justify-center gap-3 text-center px-6"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
              // Visuals in progress
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute-2">
              Final assets being gathered
            </span>
          </div>
        )}
      </section>

      {isCaseStudy ? (
        <CaseStudyBody project={project} />
      ) : (
        <StandardBody project={project} />
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
              href={backHref}
              data-cursor="all"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-bone hover:text-green transition-colors"
            >
              {isFlagship ? "All leadership work" : "All projects"}
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

/* ── Leadership case-study body ──────────────────────────────────────────── */
function CaseStudyBody({ project }: { project: Project }) {
  const cs = project.caseStudy!;
  return (
    <>
      <Block eyebrow="The brief" wide>
        <p className="font-display text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[1.25] tracking-[-0.02em] text-bone max-w-[44ch]">
          {project.brief}
        </p>
      </Block>

      <Block eyebrow="The challenge">
        <Prose>
          <Body text={cs.challenge} />
        </Prose>
      </Block>

      <Block eyebrow="The mandate">
        <Prose>
          <Body text={cs.mandate} />
        </Prose>
      </Block>

      <Block eyebrow="The context">
        <Prose>
          <Body text={cs.context} />
        </Prose>
      </Block>

      <Block eyebrow="John's role">
        <List items={cs.role} />
      </Block>

      <Block eyebrow="The team">
        <p className="mb-4 text-sm text-mute max-w-[52ch]">
          {project.flagship
            ? "Enterprise creative is collaborative. This work involved:"
            : "The people behind the work:"}
        </p>
        <List items={cs.team} />
      </Block>

      <Block eyebrow="Key decisions">
        <div className="space-y-8">
          {cs.decisions.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="grid grid-cols-12 gap-4"
            >
              <span className="col-span-2 font-mono text-[11px] uppercase tracking-[0.22em] text-mute pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="col-span-10">
                <h3 className="font-display text-xl md:text-2xl tracking-[-0.025em] text-bone">
                  <Body text={d.title} />
                </h3>
                <p className="mt-2 leading-relaxed max-w-[60ch] text-bone/85">
                  <Body text={d.body} />
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Block>

      {cs.work && cs.work.length > 0 ? (
        <section className="container-x py-16 md:py-24 rule-top">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green mb-8 md:mb-12">
            // The work
          </p>
          <WorkMoments moments={cs.work} palette={project.palette} />
        </section>
      ) : !project.flagship ? (
        <Block eyebrow="The work">
          <div className="rounded-lg border border-dashed border-line-2 bg-ink-2 p-10 md:p-14 text-center max-w-[62ch]">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
              Visuals in progress
            </p>
            <p className="mt-3 text-mute-2 italic">
              Final case-study images are being gathered and will land here with
              captions explaining what each artifact demonstrates.
            </p>
          </div>
        </Block>
      ) : null}

      <Block eyebrow="The outcome">
        <List items={cs.outcomes} />
      </Block>

      <Block eyebrow="Reflection">
        <Prose>
          <Body text={cs.reflection} />
        </Prose>
      </Block>
    </>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-lg leading-relaxed text-bone/85 max-w-[62ch]">
      {children}
    </p>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 max-w-[62ch]">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3 leading-relaxed">
          <span className="text-green mt-1.5 shrink-0">↳</span>
          <span className="text-bone/85">
            <Body text={it} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Block({
  eyebrow,
  children,
  wide,
}: {
  eyebrow: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className="container-x py-16 md:py-24 rule-top">
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-green">
            // {eyebrow}
          </p>
        </div>
        <div className={wide ? "col-span-12 md:col-span-8" : "col-span-12 md:col-span-8"}>
          {children}
        </div>
      </div>
    </section>
  );
}

/* ── Standard (client) case-study body — original layout ─────────────────── */
function StandardBody({ project }: { project: Project }) {
  return (
    <>
      {/* Brief */}
      <section className="container-x py-14 sm:py-20 md:py-32 rule-top mt-24">
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
      {project.process.length > 0 && (
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
      )}

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
    </>
  );
}

/* ── "The work" — editorial image moments ────────────────────────────────
   Each moment is a deliberate way to present a piece, with a caption on what
   it demonstrates. An empty image src renders a labeled placeholder in the
   correct frame, so the layout can be designed before assets arrive. */
function WorkMoments({
  moments,
  palette,
}: {
  moments: WorkMoment[];
  palette: string[];
}) {
  return (
    <div className="space-y-12 md:space-y-20">
      {moments.map((m, i) => (
        <WorkMomentView key={i} m={m} palette={palette} />
      ))}
    </div>
  );
}

function Caption({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-mute max-w-[72ch] leading-relaxed">
      {text}
    </figcaption>
  );
}

function Frame({
  image,
  palette,
  aspect = "16 / 9",
  rounded = "rounded-xl",
  sizes = "(max-width: 1200px) 100vw, 1200px",
}: {
  image: WorkImage;
  palette: string[];
  aspect?: string;
  rounded?: string;
  sizes?: string;
}) {
  if (image.src) {
    return (
      <div
        className={`relative overflow-hidden ${rounded} border border-line bg-ink-2`}
        style={{ aspectRatio: aspect }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className="object-contain p-2 sm:p-3"
        />
      </div>
    );
  }
  return (
    <div
      className={`relative overflow-hidden ${rounded} border border-dashed border-line-2 bg-ink-2 flex items-center justify-center p-6 text-center`}
      style={{ aspectRatio: aspect }}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute leading-relaxed">
        {image.alt}
      </span>
    </div>
  );
}

const revealProps = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
};

function WorkMomentView({
  m,
  palette,
}: {
  m: WorkMoment;
  palette: string[];
}) {
  if (m.kind === "full") {
    return (
      <motion.figure {...revealProps}>
        <Frame
          image={m.image}
          palette={palette}
          aspect={m.aspect ?? (m.tall ? "4 / 5" : "16 / 9")}
          sizes="(max-width: 1400px) 100vw, 1400px"
        />
        <Caption text={m.caption} />
      </motion.figure>
    );
  }

  if (m.kind === "browser") {
    return (
      <motion.figure {...revealProps}>
        <div className="rounded-xl border border-line bg-ink-2 overflow-hidden shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-ink">
            <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
            {m.url && (
              <span className="ml-3 font-mono text-[10px] tracking-[0.1em] text-mute truncate">
                {m.url}
              </span>
            )}
          </div>
          <Frame
            image={m.image}
            palette={palette}
            aspect="16 / 10"
            rounded="rounded-none"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>
        <Caption text={m.caption} />
      </motion.figure>
    );
  }

  if (m.kind === "pair") {
    const cols = [
      { img: m.a, label: m.labelA },
      { img: m.b, label: m.labelB },
    ];
    return (
      <motion.figure {...revealProps}>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {cols.map((c, i) => (
            <div key={i}>
              {c.label && (
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                  {c.label}
                </div>
              )}
              <Frame
                image={c.img}
                palette={palette}
                aspect="16 / 10"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
        <Caption text={m.caption} />
      </motion.figure>
    );
  }

  if (m.kind === "detail") {
    return (
      <motion.figure {...revealProps}>
        <div className="rounded-xl border border-line bg-ink-2 p-6 sm:p-12 md:p-20 flex items-center justify-center">
          <div className="w-full max-w-[38rem]">
            <Frame
              image={m.image}
              palette={palette}
              aspect="4 / 3"
              sizes="(max-width: 768px) 100vw, 620px"
            />
          </div>
        </div>
        <Caption text={m.caption} />
      </motion.figure>
    );
  }

  // gallery
  return (
    <motion.figure {...revealProps}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {m.images.map((img, i) => (
          <Frame
            key={i}
            image={img}
            palette={palette}
            aspect="1 / 1"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ))}
      </div>
      <Caption text={m.caption} />
    </motion.figure>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-3 border-t border-line pt-3">
      <span className="text-mute">{label}</span>
      <span className={isTodo(value) ? "text-mute-2 italic normal-case" : "text-bone"}>
        {value}
      </span>
    </div>
  );
}
