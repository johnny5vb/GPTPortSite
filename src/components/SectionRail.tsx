"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  { id: "top", label: "Intro", num: "00" },
  { id: "manifesto", label: "Principles", num: "01" },
  { id: "work", label: "Work", num: "02" },
  { id: "spotlight", label: "In Focus", num: "03" },
  { id: "talks-back", label: "AI Lab", num: "04" },
  { id: "services", label: "Services", num: "05" },
  { id: "about", label: "About", num: "06" },
  { id: "contact", label: "Contact", num: "07" },
];

export default function SectionRail() {
  const [active, setActive] = useState<string>("top");
  const [hovered, setHovered] = useState<string | null>(null);
  const ratiosRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          ratiosRef.current.set(e.target.id, e.intersectionRatio);
        });
        // pick the section with the highest intersection ratio
        let best = active;
        let bestRatio = 0;
        ratiosRef.current.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        });
        if (best !== active && bestRatio > 0) {
          setActive(best);
        }
      },
      {
        threshold: [0, 0.15, 0.3, 0.5, 0.75, 1],
        rootMargin: "-30% 0px -30% 0px",
      },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [active]);

  return (
    <aside
      aria-label="Section navigation"
      className="fixed top-1/2 right-4 md:right-6 -translate-y-1/2 z-40 pointer-events-none hidden md:block"
    >
      <ul className="flex flex-col gap-3 items-end pointer-events-auto">
        {SECTIONS.map((s) => {
          const isActive = s.id === active;
          const isHover = s.id === hovered;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                data-cursor={s.label.toLowerCase()}
                aria-label={`Jump to ${s.label} section`}
                aria-current={isActive ? "true" : undefined}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                className="group flex items-center gap-3"
              >
                {/* Label slides in on hover or when active */}
                <AnimatePresence>
                  {(isHover || isActive) && (
                    <motion.span
                      key={`l-${s.id}`}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/85 whitespace-nowrap"
                    >
                      <span className="text-mute mr-1.5">{s.num}</span>
                      {s.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Dot */}
                <span className="relative inline-flex h-3 w-3 items-center justify-center">
                  <motion.span
                    animate={{
                      scale: isActive ? 1 : 0.45,
                      backgroundColor: isActive ? "#1cb791" : "#5a5a5a",
                    }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="block h-2.5 w-2.5 rounded-full"
                  />
                  {isActive && (
                    <motion.span
                      layoutId="rail-ring"
                      className="absolute inset-0 rounded-full border border-green/60"
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 28,
                      }}
                    />
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
