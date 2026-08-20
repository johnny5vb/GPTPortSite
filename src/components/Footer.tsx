"use client";

import { useEffect, useState } from "react";
import CCMark from "./CCMark";

export default function Footer() {
  const [year, setYear] = useState<string>("");

  useEffect(() => setYear(new Date().getFullYear().toString()), []);

  return (
    <footer className="relative rule-top overflow-hidden">
      {/* Functional footer row */}
      <div className="container-x pb-10 pt-10">
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 md:col-span-4 flex items-start gap-3">
            <CCMark className="h-9 w-9 shrink-0" />
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/80 leading-snug">
              Carman <span className="text-green">/</span> Creative
              <div className="text-mute mt-1">
                © {year} / All rights reserved
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 font-mono text-[11px] uppercase tracking-[0.22em]">
            <div className="text-mute mb-2">// connect</div>
            <ul className="space-y-1">
              <li>
                <a
                  href="mailto:johnbcarman@gmail.com"
                  className="text-bone/80 hover:text-green"
                >
                  Email →
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/johncarman/"
                  className="text-bone/80 hover:text-green"
                >
                  LinkedIn →
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/jbcarms"
                  className="text-bone/80 hover:text-green"
                >
                  Instagram →
                </a>
              </li>
              <li>
                <a
                  href="/capabilities"
                  className="text-bone/80 hover:text-green"
                >
                  Capabilities deck →
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-12 md:col-span-4 font-mono text-[10px] uppercase tracking-[0.22em] md:text-right">
            <div className="text-mute mb-2">// studio</div>
            <div className="text-bone/80 leading-relaxed">
              Virginia Beach <span className="text-mute">/</span> Philadelphia{" "}
              <span className="text-mute">/</span> Brooklyn
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
