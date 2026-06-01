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
 * the old CC mark. Desktop renders three vertical columns drifting in opposite
 * directions, anchored in the headline's right-side negative space; mobile /
 * tablet render a single horizontal filmstrip in the hero flow.
 *
 * Cycles every project (all seven covers plus a few gallery stills). Decorative:
 * `aria-hidden`, `pointer-events-none`. Drift is pure CSS (durations set inline)
 * so it freezes automatically under `prefers-reduced-motion`. Cursor parallax
 * reuses the Hero's shared pointer MotionValues (no extra mousemove listener).
 */

// Three columns, each a mix of covers + stills across different projects so the
// board reads as varied. All seven projects appear at least once.
const COL_A = [
  "/work/colony-coffee/cover.png",
  "/work/harrison-bounds/gallery-1.jpg",
  "/work/special-forces-trust/cover.png",
  "/work/beacon-van/gallery-2.jpg",
  "/work/stamp-out-stigma/cover.jpg",
];
const COL_B = [
  "/work/friends-rehab/frp-hero.png",
  "/work/spikes-k9-fund/cover.png",
  "/work/stamp-out-stigma/gallery-1.jpg",
  "/work/harrison-bounds/cover.jpg",
  "/work/special-forces-trust/gallery-1.png",
];
const COL_C = [
  "/work/beacon-van/cover.jpg",
  "/work/colony-coffee/showpiece.png",
  "/work/spikes-k9-fund/gallery-1.png",
  "/work/friends-rehab/frp-purpose.png",
  "/work/colony-coffee/gallery-2.png",
];

// Interleaved order for the mobile filmstrip.
const STRIP = COL_A.flatMap((_, i) => [COL_A[i], COL_B[i], COL_C[i]]).filter(
  Boolean,
);

const SHEET_MASK =
  "linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent)";
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

function Column({
  imgs,
  drift,
  duration,
}: {
  imgs: string[];
  drift: "up" | "down";
  duration: string;
}) {
  const doubled = [...imgs, ...imgs];
  return (
    <div className="overflow-hidden">
      <div
        className={`flex flex-col gap-3 ${
          drift === "up" ? "drift-up" : "drift-down"
        }`}
        style={{ animationDuration: duration }}
      >
        {doubled.map((src, i) => (
          <Frame key={`${src}-${i}`} src={src} className="aspect-[4/3] w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Desktop panel — anchored in the hero's right-side gap, vertically centered on
 * the headline rather than pinned to the top corner. Reads the Hero's pointer
 * MotionValues (range roughly [-0.5, 0.5]) for a restrained parallax.
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

  // Gentle parallax — small enough that the panel reads as anchored, not floating.
  const px = useSpring(useTransform(mx, [-0.5, 0.5], [7, -7]), {
    stiffness: 70,
    damping: 22,
  });
  const py = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), {
    stiffness: 70,
    damping: 22,
  });

  return (
    <motion.div
      aria-hidden
      style={{ x: px, y: py, opacity: scrollFade }}
      initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none absolute z-[1] hidden lg:block
                 right-[clamp(2.5rem,9vw,9rem)]
                 top-[clamp(9rem,26vh,18rem)]
                 w-[clamp(20rem,32vw,36rem)]
                 h-[clamp(20rem,44vh,34rem)]"
    >
      <div
        className="relative h-full w-full"
        style={{ WebkitMaskImage: SHEET_MASK, maskImage: SHEET_MASK }}
      >
        <div className="grid h-full grid-cols-3 gap-3">
          <Column imgs={COL_A} drift="up" duration="74s" />
          <Column imgs={COL_B} drift="down" duration="92s" />
          <Column imgs={COL_C} drift="up" duration="110s" />
        </div>
      </div>
      {/* Left-edge scrim so any overlap with the headline stays legible */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-10 w-28"
        style={{
          background: "linear-gradient(90deg, var(--color-ink), transparent)",
        }}
      />
    </motion.div>
  );
}

/**
 * Mobile / tablet filmstrip — a single horizontal drift, rendered in the hero
 * flow below the copy. Hidden on lg+ where the panel takes over.
 */
export function HeroContactStrip() {
  const doubled = [...STRIP, ...STRIP];
  return (
    <div aria-hidden className="lg:hidden mt-10 select-none">
      <div
        className="overflow-hidden"
        style={{ WebkitMaskImage: STRIP_MASK, maskImage: STRIP_MASK }}
      >
        <div
          className="drift-x flex w-max gap-3"
          style={{ animationDuration: "80s" }}
        >
          {doubled.map((src, i) => (
            <Frame key={`${src}-${i}`} src={src} className="h-28 w-44 shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}
