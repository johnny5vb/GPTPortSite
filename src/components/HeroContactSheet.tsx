"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";

/**
 * Hero visual — a slow-drifting "contact sheet" of real project work, replacing
 * the old CC mark. Desktop renders two vertical columns drifting in opposite
 * directions in the headline's right-side negative space; mobile/tablet render
 * a single horizontal filmstrip in the hero flow.
 *
 * Decorative: `aria-hidden`, `pointer-events-none`. Drift is pure CSS so it is
 * frozen automatically under `prefers-reduced-motion`. Cursor parallax reuses
 * the Hero's shared pointer MotionValues (no extra mousemove listener).
 */

const COL_A = [
  "/work/colony-coffee/cover.png",
  "/work/harrison-bounds/cover.jpg",
  "/work/special-forces-trust/cover.png",
  "/work/colony-coffee/gallery-2.png",
];
const COL_B = [
  "/work/friends-rehab/frp-hero.png",
  "/work/special-forces-trust/gallery-1.png",
  "/work/harrison-bounds/gallery-1.jpg",
  "/work/colony-coffee/showpiece.png",
];

const SHEET_MASK =
  "linear-gradient(180deg, transparent, #000 13%, #000 87%, transparent)";
const STRIP_MASK =
  "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)";

function Frame({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded border border-line bg-ink-2 ${className}`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="280px"
        className="object-cover object-top grayscale-[0.4] contrast-[1.05]"
      />
    </div>
  );
}

function Column({ imgs, drift }: { imgs: string[]; drift: "up" | "down" }) {
  const doubled = [...imgs, ...imgs];
  return (
    <div className="overflow-hidden">
      <div
        className={`flex flex-col gap-3 ${
          drift === "up" ? "drift-up" : "drift-down"
        }`}
      >
        {doubled.map((src, i) => (
          <Frame key={`${src}-${i}`} src={src} className="aspect-[4/3] w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Desktop panel — absolutely positioned in the hero's right-side gap. Reads the
 * Hero's pointer MotionValues (range roughly [-0.5, 0.5]) for a light parallax.
 */
export default function HeroContactSheet({
  mx,
  my,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"],
  });
  const scrollFade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const px = useSpring(useTransform(mx, [-0.5, 0.5], [16, -16]), {
    stiffness: 80,
    damping: 20,
  });
  const py = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), {
    stiffness: 80,
    damping: 20,
  });

  return (
    <motion.div
      aria-hidden
      style={{ x: px, y: py, opacity: scrollFade }}
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none absolute z-[1] hidden lg:block
                 right-[clamp(1.5rem,4vw,4rem)]
                 top-[clamp(7.5rem,16vh,11.5rem)]
                 w-[clamp(15rem,23vw,22rem)]
                 h-[clamp(18rem,40vh,30rem)]"
    >
      <div
        className="relative h-full w-full"
        style={{ WebkitMaskImage: SHEET_MASK, maskImage: SHEET_MASK }}
      >
        <div className="grid h-full grid-cols-2 gap-3">
          <Column imgs={COL_A} drift="up" />
          <Column imgs={COL_B} drift="down" />
        </div>
      </div>
      {/* Left-edge scrim so any overlap with the headline stays legible */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-8 w-24"
        style={{
          background:
            "linear-gradient(90deg, var(--color-ink), transparent)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-md border border-green/25" />
    </motion.div>
  );
}

/**
 * Mobile / tablet filmstrip — a single horizontal drift, rendered in the hero
 * flow below the copy. Hidden on lg+ where the panel takes over.
 */
export function HeroContactStrip() {
  const all = [...COL_A, ...COL_B];
  const doubled = [...all, ...all];
  return (
    <div aria-hidden className="lg:hidden mt-10 select-none">
      <div
        className="overflow-hidden"
        style={{ WebkitMaskImage: STRIP_MASK, maskImage: STRIP_MASK }}
      >
        <div className="drift-x flex w-max gap-3">
          {doubled.map((src, i) => (
            <Frame
              key={`${src}-${i}`}
              src={src}
              className="h-28 w-44 shrink-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
