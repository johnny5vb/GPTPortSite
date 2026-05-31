"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { usePathname } from "next/navigation";
import CCMark from "./CCMark";
import CCWordmark from "./CCWordmark";

const links = [
  { href: "/#work", label: "Work", num: "02" },
  { href: "/lab", label: "Lab", num: "03" },
  { href: "/#services", label: "Services", num: "04" },
  { href: "/#about", label: "About", num: "05" },
  { href: "/#contact", label: "Contact", num: "06" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div
        className={`mx-auto flex items-center justify-between container-x transition-all duration-500 ${
          scrolled
            ? "bg-ink/70 backdrop-blur-md border-b border-line"
            : "bg-transparent"
        }`}
      >
        <a
          href="#top"
          className="flex items-center gap-3 group py-3"
          data-cursor="home"
          aria-label="Carman Creative — home"
        >
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="block h-8 w-8 md:hidden"
          >
            <CCMark className="h-full w-full" />
          </motion.span>
          <motion.span
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:block text-bone"
          >
            <CCWordmark
              variant="horiz"
              className="h-5 w-auto"
            />
          </motion.span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <MagneticNavLink key={l.href} {...l} />
          ))}
          <a
            href="/#contact"
            data-cursor="hire"
            className="ml-3 inline-flex items-center gap-2 rounded-full border border-green/60 bg-green/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-green hover:bg-green hover:text-ink transition-colors"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-green animate-ping opacity-80" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green" />
            </span>
            Available
          </a>
        </nav>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-3 -mr-3"
          data-cursor="menu"
        >
          <span className="block h-px w-6 bg-bone mb-1.5" />
          <span className="block h-px w-6 bg-bone" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="md:hidden container-x"
          >
            <div className="mt-2 rounded-xl border border-line bg-ink-2 p-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-3 py-3 font-mono text-xs uppercase tracking-[0.18em] text-bone/80 hover:text-green"
                >
                  <span>
                    <span className="text-mute mr-3">{l.num}</span>
                    {l.label}
                  </span>
                  <span className="text-mute">↗</span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Magnetic nav link — slight cursor-follow for tactility                 */
/* ────────────────────────────────────────────────────────────────────── */

function MagneticNavLink({
  href,
  label,
  num,
}: {
  href: string;
  label: string;
  num: string;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 22, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 22, mass: 0.5 });

  // Detect "current page" for /lab so we mark it active even on home anchor links
  const isActive =
    (href === "/lab" && pathname === "/lab") ||
    (href.startsWith("/#") && pathname === "/");

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * 0.25);
    y.set(dy * 0.25);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      data-cursor={label.toLowerCase()}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      className="group relative px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-bone/70 hover:text-bone transition-colors"
    >
      <span className="text-mute mr-2">{num}</span>
      {label}
      <span
        className={`pointer-events-none absolute left-4 right-4 bottom-2 h-px origin-left bg-green transition-transform duration-500 ${
          isActive && href === "/lab"
            ? "scale-x-100"
            : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </motion.a>
  );
}
