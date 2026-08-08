"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { LogoLockup } from "./StarLogo";
import { BAND } from "@/lib/shootingStars";

const LINKS = [
  { href: "#music", label: "Music" },
  { href: "#about", label: "Band" },
  { href: "#tour", label: "Tour" },
  { href: "#contact", label: "Contact" },
];

/**
 * Band-site header. Transparent over the hero, then solidifies into a blurred
 * bar once the page scrolls — so the hero art is never fighting a chrome bar.
 *
 * Anchors are plain <a> so Lenis (mounted globally in the root layout)
 * intercepts them and animates the scroll.
 */
export default function BandNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet on Escape, and lock the sheet to the viewport.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled || open
          ? "border-b border-ss-line bg-ss-night/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[88rem] items-center justify-between px-5 py-3.5 md:px-10">
        <a
          href="#top"
          className="group relative -m-1 p-1"
          aria-label={`${BAND.name} — back to top`}
        >
          <LogoLockup markClassName="h-8 w-8 md:h-9 md:w-9" />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ss-smoke transition-colors hover:text-ss-cream"
            >
              {l.label}
              <span className="absolute inset-x-3.5 bottom-1 h-px origin-left scale-x-0 bg-ss-gold transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
          <a
            href="#tour"
            className="ml-3 rounded-full bg-ss-gold px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ss-deep transition-transform duration-300 hover:scale-[1.04]"
          >
            Get tickets
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="ss-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-1 rounded-full border border-ss-line-2 p-2.5 text-ss-cream md:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <motion.div
        id="ss-mobile-nav"
        initial={false}
        animate={{ height: open ? "auto" : 0 }}
        transition={{ duration: reduce ? 0 : 0.36, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden md:hidden"
      >
        <nav
          aria-label="Primary mobile"
          // Opaque, not the header's translucent plate — hero copy showing
          // through the open sheet made both unreadable.
          className="flex flex-col gap-1 border-t border-ss-line bg-ss-night px-5 pt-4 pb-6"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="ss-display py-2 text-2xl text-ss-cream"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#tour"
            onClick={() => setOpen(false)}
            className="mt-3 rounded-full bg-ss-gold px-5 py-3 text-center font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ss-deep"
          >
            Get tickets
          </a>
        </nav>
      </motion.div>
    </header>
  );
}
