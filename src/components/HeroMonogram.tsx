"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

/**
 * Hero visual — a single, calm Carman Creative monogram anchored in the
 * headline's right-side negative space. Replaces the busier film-strip; the
 * mark holds the space quietly so the typography stays the hero.
 *
 * Restraint by design: the mark itself is static after entrance; only a soft
 * green glow breathes slowly behind it. A whisper of cursor parallax keeps it
 * from feeling dead without making it float. Decorative (`aria-hidden`,
 * `pointer-events-none`); the brand is already announced by the nav logo + h1.
 * lg+ only — on smaller screens the hero is pure typography.
 */
export default function HeroMonogram({
  mx,
  my,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"],
  });
  const scrollFade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const px = useSpring(useTransform(mx, [-0.5, 0.5], [6, -6]), {
    stiffness: 60,
    damping: 24,
  });
  const py = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), {
    stiffness: 60,
    damping: 24,
  });

  return (
    <motion.div
      aria-hidden
      style={{ x: reduce ? 0 : px, y: reduce ? 0 : py, opacity: scrollFade }}
      initial={
        reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, filter: "blur(10px)" }
      }
      animate={
        reduce ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" }
      }
      transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none absolute z-[1] hidden lg:flex items-center justify-center
                 right-[clamp(3rem,10vw,10rem)]
                 top-[clamp(9rem,27vh,17rem)]
                 w-[clamp(10rem,15vw,15rem)] aspect-square"
    >
      {/* Soft brand glow — breathes slowly, the only motion at rest */}
      <motion.div
        aria-hidden
        className="absolute inset-[-32%] rounded-full"
        animate={reduce ? undefined : { opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(closest-side, rgba(28,183,145,0.42), transparent 70%)",
          filter: "blur(42px)",
        }}
      />

      {/* The mark */}
      <svg
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1144.24 1144.24"
        className="relative w-full h-full"
      >
        <circle cx="571.5" cy="571.49" r="561.47" fill="#1cb791" />
        <path
          fill="#fff"
          d="m749.35 542.33 101.15-54.99V221.52L568.87 75.09 292.48 222.77v700.57l278.89 144.58 270.88-138.31V720.45l-97.17-54.57-97.58 58.01-.46 101.51-79.46 38.72-.06.56-80.28-42.4V317.59c35.04-17.74 71.76-36 83.1-40.7l83.32 45.6v168.32l95.67 51.53Zm.47-23.65-1.43-.77h2.86l-1.42.77Zm80.07-43.47-71.1 38.81V270.78l71.1-35.08v239.51ZM569.6 98.14l240.33 125-60.84 29.9-241.84-121.57 62.35-33.33Zm2.49 946.83L325.31 917.02l60.78-32.27 251.75 126.64-65.76 33.58ZM745.68 689.4l65.47 36.65-67.32 34.82-64.66-32 66.51-39.48Zm-78.1 56.67 65.45 32.56v81.73l-66.04-34.75.59-79.55Zm-10.47 97.13 62.04 32.55-62.56 35.95-67.07-35.58 67.6-32.93Zm-.58 91.8 97.1-55.83V778.51l68.01-35.34v173.94l-162 82.77-264.11-132.9V284.94c15.46 6 44.83 19.42 71.62 32.73v516.86L656.52 935ZM519.27 278.95c-16.9 8.4-33.75 16.97-41.6 20.97-7.56-3.71-23.37-11.39-39.4-18.81-10.37-4.8-19.24-8.75-26.46-11.78l73.2-39.56 63.62 34.86c-7.65 3.62-17.5 8.43-29.36 14.32Zm-34.6-72.08-103.63 56.5h-.26l-5.85 2.25v601.52l-61.83 33.03V234.98l171.58-91.76 253.5 127.48v242.51l-64.41-34.6V310.39l-189.1-103.52Z"
        />
      </svg>
    </motion.div>
  );
}
