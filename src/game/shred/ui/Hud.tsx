"use client";

/**
 * In-run HUD.
 *
 * The fast-moving readouts (speed, score, meters, trick name) are written
 * straight to the DOM from a rAF loop rather than through React state — at
 * 60fps a `setState` per frame would cost more than the entire particle system.
 * React only handles the low-frequency things: score popups, banners, hints.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { HudSnapshot } from "../core/Game";
import type { TrickResult } from "../player/TrickSystem";
import { formatScore, formatTime, FEET, MILES } from "../core/math";

/** The control legend, as key caps and the verb each one performs. */
const HINTS: [string[], string][] = [
  [["←", "→"], "steer"],
  [["↑"], "tuck"],
  [["↓"], "brake"],
  [["space"], "jump"],
  [["A", "S", "D", "F"], "grab"],
  [["shift"], "tweak"],
  [["esc"], "pause"],
];

export type PopupIcon = "perfect" | "stomp" | "air" | "spin" | "grind";

export interface Popup {
  id: number;
  name: string;
  total: number;
  chain: number;
  quality: TrickResult["quality"];
  stomped: boolean;
  icons: PopupIcon[];
}

/**
 * How loud a landing is allowed to be.
 *
 * Four tiers, and they are deliberately far apart: if every trick arrives at
 * full volume then nothing does. A tap off a roller and a corked 900 have to
 * look like different events, and the only way the top tier means anything is
 * if most landings aren't it.
 */
/** Roughly how tall each tier renders, for stacking. */
const POP_HEIGHT = [40, 52, 68, 86];

function tierOf(total: number) {
  return total >= 12000 ? 3 : total >= 4500 ? 2 : total >= 1600 ? 1 : 0;
}

/**
 * Marks, not emoji. Each one says something the number can't: which part of
 * that was hard. They're drawn rather than written so they hold up at the size
 * a score popup actually appears at.
 */
function Icon({ kind }: { kind: PopupIcon }) {
  const paths: Record<PopupIcon, React.ReactNode> = {
    perfect: <path d="M8 1.4l1.9 4.2 4.6.5-3.4 3.1.9 4.5L8 11.5 4 13.7l.9-4.5L1.5 6.1l4.6-.5z" />,
    stomp: (
      <>
        <path d="M3 6.4L8 11l5-4.6" fill="none" strokeWidth="2" stroke="currentColor" />
        <path d="M3 1.9L8 6.5l5-4.6" fill="none" strokeWidth="2" stroke="currentColor" opacity=".5" />
        <rect x="2.5" y="13" width="11" height="1.8" rx="0.9" />
      </>
    ),
    air: (
      <>
        <path d="M8 1.6l4.6 5.2h-2.7v4.1H6.1V6.8H3.4z" />
        <rect x="3.4" y="13" width="9.2" height="1.7" rx="0.85" opacity=".5" />
      </>
    ),
    spin: (
      <path
        d="M13 8a5 5 0 1 1-1.9-3.9"
        fill="none"
        strokeWidth="1.9"
        stroke="currentColor"
        strokeLinecap="round"
      />
    ),
    grind: (
      <>
        <rect x="1.4" y="6.6" width="13.2" height="1.9" rx="0.95" />
        <rect x="3" y="8.5" width="1.5" height="5" rx="0.7" opacity=".55" />
        <rect x="11.5" y="8.5" width="1.5" height="5" rx="0.7" opacity=".55" />
      </>
    ),
  };
  return (
    <svg className="pop-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      {paths[kind]}
    </svg>
  );
}

interface Props {
  getSnapshot: () => HudSnapshot;
  popups: Popup[];
  banner: string | null;
  showHints: boolean;
}

export default function Hud({ getSnapshot, popups, banner, showHints }: Props) {
  const speedRef = useRef<HTMLDivElement>(null);
  const speedBarRef = useRef<HTMLElement>(null);
  const speedMeterRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const comboRef = useRef<HTMLDivElement>(null);
  const comboNumRef = useRef<HTMLElement>(null);
  const comboBarRef = useRef<HTMLElement>(null);
  const trickRef = useRef<HTMLDivElement>(null);
  const airRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  const distRef = useRef<HTMLDivElement>(null);
  const chargeRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<HudSnapshot["hud"]>("full");

  useEffect(() => {
    let raf = 0;
    let lastHud: HudSnapshot["hud"] | null = null;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const s = getSnapshot();
      if (s.hud !== lastHud) {
        lastHud = s.hud;
        setMode(s.hud);
      }
      if (s.hud === "none") return;

      if (speedRef.current)
        speedRef.current.firstChild!.textContent = String(Math.round(s.speedMph));
      if (speedBarRef.current)
        speedBarRef.current.style.width = `${Math.min(100, s.speed01 * 100)}%`;
      if (speedMeterRef.current)
        speedMeterRef.current.dataset.boost = s.boost > 0.05 ? "true" : "false";
      if (chargeRef.current)
        chargeRef.current.style.transform = `scaleX(${s.charge})`;

      if (scoreRef.current) {
        const shown = s.score + (s.pendingScore > 0 ? s.pendingScore : 0);
        scoreRef.current.textContent = formatScore(shown);
      }

      if (comboRef.current) {
        const live = s.chain > 1;
        comboRef.current.style.opacity = live ? "1" : "0";
        if (!live) comboRef.current.style.transform = "translateY(6px) scale(0.94)";
        if (live) {
          if (comboNumRef.current) comboNumRef.current.textContent = `${s.chain}×`;
          if (comboBarRef.current)
            comboBarRef.current.style.width = `${s.chainFraction * 100}%`;
          // Heat ramps to full over the first eight links, which is about where
          // a chain stops being luck.
          comboRef.current.style.setProperty(
            "--heat",
            String(Math.min(1, (s.chain - 1) / 7)),
          );
          comboRef.current.style.transform = `translateY(0) scale(${
            1 + Math.min(0.22, (s.chain - 1) * 0.03)
          })`;
        }
      }

      if (trickRef.current) {
        const el = trickRef.current;
        const name = s.trickName;
        const span = el.firstElementChild as HTMLElement;
        if (span.textContent !== name) span.textContent = name;
        el.style.opacity = name ? "1" : "0";
        const scale = 1 + Math.min(0.16, s.airTime * 0.07);
        el.style.transform = `translateX(-50%) scale(${scale})`;
      }

      if (airRef.current) {
        const show = !s.grounded && s.airTime > 0.45;
        airRef.current.style.opacity = show ? "1" : "0";
        if (show)
          airRef.current.textContent = `${s.airTime.toFixed(1)}s  /  ${Math.round(
            s.airHeight * FEET,
          )} FT`;
      }

      if (labelRef.current) {
        // The section name is the cheapest way to make the terrain variety
        // legible — otherwise a steep pitch and a mellow one are just "snow".
        const label = s.modeName
          ? `${s.modeName} / ${s.mountainName}${s.section ? ` / ${s.section}` : ""}`
          : "";
        if (labelRef.current.textContent !== label)
          labelRef.current.textContent = label;
      }
      if (statusRef.current) {
        const bits: string[] = [];
        if (s.airsLeft > 0) bits.push(`${s.airsLeft} AIRS LEFT`);
        if (s.gatesPassed + s.gatesMissed > 0)
          bits.push(`${s.gatesPassed} GATES, ${s.gatesMissed} MISSED`);
        if (s.crashes > 0) bits.push(`${s.crashes} CRASH${s.crashes > 1 ? "ES" : ""}`);
        const text = bits.join("  /  ");
        if (statusRef.current.textContent !== text)
          statusRef.current.textContent = text;
      }
      if (timerRef.current) {
        timerRef.current.textContent =
          s.timeLeft > 0 ? formatTime(s.timeLeft) : formatTime(s.time);
      }
      if (distRef.current) {
        distRef.current.textContent =
          s.distanceLeft > 0
            ? `${formatScore(s.distanceLeft * FEET)} FT TO GO`
            : `${(s.distance * MILES).toFixed(2)} MI`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [getSnapshot]);

  if (mode === "none") {
    return (
      <div className="shred-layer">
        <div className="sh-vignette" />
      </div>
    );
  }

  const s0 = getSnapshot();

  return (
    <div className="shred-layer">
      <div className="sh-vignette" />

      {/* speed */}
      <div className="hud-corner hud-bl">
        <div className="hud-speed" ref={speedRef}>
          {Math.round(s0.speedMph)}
          <small>MPH</small>
        </div>
        <div className="hud-meter" ref={speedMeterRef}>
          <i ref={speedBarRef} style={{ width: "0%" }} />
        </div>
        <div
          style={{
            width: "min(30vw,260px)",
            height: 2,
            marginTop: 4,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <i
            ref={chargeRef}
            style={{
              display: "block",
              height: "100%",
              background: "var(--sh-amber)",
              transformOrigin: "left",
              transform: "scaleX(0)",
            }}
          />
        </div>
      </div>

      {/* score + combo */}
      <div className="hud-corner hud-tr">
        <div className="sh-eyebrow" ref={labelRef} style={{ marginBottom: 6 }} />
        <div className="hud-score" ref={scoreRef}>
          0
        </div>
        <div
          className="hud-combo"
          ref={comboRef}
          style={{ opacity: 0, transition: "opacity .18s ease, transform .18s ease" }}
        >
          <b ref={comboNumRef}>2×</b>
          <span className="hud-combo-bar">
            <i ref={comboBarRef} style={{ width: "100%" }} />
          </span>
          <span style={{ opacity: 0.7 }}>COMBO</span>
        </div>
      </div>

      {/* timer / distance */}
      <div className="hud-corner hud-tl">
        <div className="hud-clock" ref={timerRef}>
          0:00.00
        </div>
        <div className="sh-eyebrow" ref={distRef} style={{ marginTop: 5 }}>
          0.00 MI
        </div>
        <div className="sh-eyebrow" ref={statusRef} style={{ marginTop: 6 }} />
      </div>

      {/* trick name in the air */}
      <div
        className="hud-trick"
        ref={trickRef}
        style={{ opacity: 0, transition: "opacity .12s ease" }}
      >
        <span />
      </div>
      <div
        className="hud-air shred-mono"
        ref={airRef}
        style={{ opacity: 0, transition: "opacity .16s ease" }}
      />

      {/* landed trick popups */}
      <div className="hud-pop">
        <AnimatePresence>
          {popups.map((p, i) => {
            // Stack upward from the newest, spaced by how tall each one
            // actually is. A fixed gap was fine when every popup was the same
            // size; now that a big landing is three times the height of a small
            // one, they have to be measured or they overlap.
            let lift = 0;
            for (let k = i + 1; k < popups.length; k++) {
              lift += POP_HEIGHT[tierOf(popups[k].total)];
            }
            return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 26, scale: 0.7 }}
              animate={{ opacity: 1, y: -lift, scale: 1 }}
              exit={{ opacity: 0, y: -lift - 30, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 460, damping: 24 }}
              className="pop-item"
              data-q={p.quality}
              data-tier={tierOf(p.total)}
            >
              <div className="pop-head">
                {p.icons.map((k) => (
                  <Icon key={k} kind={k} />
                ))}
                <span className="pop-name">{p.name}</span>
              </div>
              <div className="pop-score">
                +{formatScore(p.total)}
                {p.chain > 1 && <b className="pop-chain">×{p.chain}</b>}
              </div>
              {p.stomped && <div className="pop-stomp">Stomped</div>}
            </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* big centred banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            key={banner}
            initial={{ opacity: 0, scale: 1.18, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div
              className="sh-shout"
              style={{
                fontSize: "clamp(2.4rem,7vw,5.5rem)",
                textShadow: "0 6px 60px rgba(0,0,0,.8)",
              }}
            >
              {banner}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showHints && (
        <div className="hud-hints">
          {HINTS.map(([keys, label]) => (
            <span className="hud-key" key={label}>
              <b>
                {keys.map((k) => (
                  <kbd key={k}>{k}</kbd>
                ))}
              </b>
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
