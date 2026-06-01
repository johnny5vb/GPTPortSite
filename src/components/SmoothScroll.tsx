"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";

/**
 * Inertial smooth scrolling via Lenis. Mounted once globally (in layout).
 *
 * Lenis drives the real window scroll position (not a transform), so
 * framer-motion's `useScroll` / IntersectionObserver continue to work — they
 * just receive smoothed, RAF-synced values instead of raw, steppy wheel deltas.
 *
 * - Respects `prefers-reduced-motion`: when reduced, we don't initialize Lenis
 *   at all and the browser's native scroll is used.
 * - In-page hash links (#manifesto, SectionRail dots, etc.) are routed through
 *   `lenis.scrollTo` so anchored jumps glide instead of teleport.
 *
 * Renders nothing.
 */
export default function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Smooth in-page anchor navigation (hash links).
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash.length < 2) return;
      const el = document.querySelector(hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.2 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, [reduce]);

  return null;
}
