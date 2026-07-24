"use client";

import { useEffect, useState } from "react";
import CCMark from "./CCMark";
import { PROFILE } from "@/lib/profile";

const NAV = [
  { href: "/#work", label: "Work" },
  { href: "/leadership", label: "Leadership" },
  { href: "/lab", label: "AI & Systems" },
  { href: "/#about", label: "About" },
  { href: "/resume", label: "Résumé" },
  { href: PROFILE.contact.linkedin, label: "LinkedIn", external: true },
  { href: "/#contact", label: "Contact" },
];

export default function Footer() {
  const [year, setYear] = useState<string>("");

  useEffect(() => setYear(new Date().getFullYear().toString()), []);

  return (
    <footer className="relative rule-top overflow-hidden">
      <div className="container-x pb-10 pt-10">
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Identity + positioning */}
          <div className="col-span-12 md:col-span-5 flex items-start gap-3">
            <CCMark className="h-9 w-9 shrink-0" />
            <div className="text-[11px] leading-snug">
              <div className="font-mono uppercase tracking-[0.22em] text-bone">
                {PROFILE.name}
              </div>
              <div className="mt-1 font-mono uppercase tracking-[0.18em] text-mute">
                Creative Director{" "}
                <span className="text-green">/</span> Brand &amp; Creative
                Operations Leader
              </div>
              <div className="mt-2 text-mute-2 font-sans normal-case tracking-normal">
                {PROFILE.location.base}
                <br />
                {PROFILE.location.availability}.
              </div>
              <div className="mt-3 text-mute font-mono uppercase tracking-[0.18em] text-[10px]">
                © {year} / All rights reserved
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="col-span-12 md:col-span-4 font-mono text-[11px] uppercase tracking-[0.22em]">
            <div className="text-mute mb-2">// explore</div>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
              {NAV.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...(l.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="text-bone/80 hover:text-green"
                  >
                    {l.label} →
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Status */}
          <div className="col-span-12 md:col-span-3 font-mono text-[10px] uppercase tracking-[0.22em] md:text-right">
            <div className="text-mute mb-2">// status</div>
            <div className="text-green leading-relaxed">
              Open to the right leadership opportunity
            </div>
            <div className="text-bone/70 mt-3 normal-case tracking-normal font-sans text-[11px] leading-snug">
              Carman Creative provides selected brand, digital, and creative
              consulting engagements.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
