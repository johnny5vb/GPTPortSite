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
import { formatScore, formatTime } from "../core/math";

export interface Popup {
  id: number;
  name: string;
  total: number;
  chain: number;
  quality: TrickResult["quality"];
  stomped: boolean;
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
        speedRef.current.firstChild!.textContent = String(Math.round(s.speedKmh));
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
        comboRef.current.style.transform = live
          ? "translateY(0) scale(1)"
          : "translateY(6px) scale(0.94)";
        if (live) {
          if (comboNumRef.current) comboNumRef.current.textContent = `${s.chain}×`;
          if (comboBarRef.current)
            comboBarRef.current.style.width = `${s.chainFraction * 100}%`;
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
            s.airHeight,
          )}m`;
      }

      if (labelRef.current) {
        const label = s.modeName ? `${s.modeName} / ${s.mountainName}` : "";
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
            ? `${Math.round(s.distanceLeft)} M TO GO`
            : `${(s.distance / 1000).toFixed(2)} KM`;
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
          {Math.round(s0.speedKmh)}
          <small>KM/H</small>
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
        <div
          className="shred-mono"
          ref={timerRef}
          style={{
            fontSize: "clamp(1.1rem,2.4vw,1.7rem)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          0:00.00
        </div>
        <div
          className="sh-eyebrow"
          ref={distRef}
          style={{ marginTop: 4 }}
        >
          0.00 KM
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
          {popups.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 22, scale: 0.82 }}
              animate={{ opacity: 1, y: -i * 34, scale: 1 }}
              exit={{ opacity: 0, y: -i * 34 - 26, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="pop-item"
              data-q={p.quality}
              style={{ fontSize: `clamp(1.1rem, ${1.4 + Math.min(1.6, p.total / 9000)}vw, 2.4rem)` }}
            >
              <span style={{ opacity: 0.85, fontSize: "0.7em", letterSpacing: "0.1em" }}>
                {p.name.toUpperCase()}
              </span>
              <br />
              +{formatScore(p.total)}
              {p.chain > 1 && (
                <span style={{ opacity: 0.7, fontSize: "0.6em" }}> ×{p.chain}</span>
              )}
              {p.stomped && (
                <span style={{ color: "var(--sh-green)", fontSize: "0.55em" }}> STOMPED</span>
              )}
            </motion.div>
          ))}
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
              className="sh-title"
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
          <span className="hud-key">
            <b>← →</b> steer
          </span>
          <span className="hud-key">
            <b>↑</b> tuck
          </span>
          <span className="hud-key">
            <b>↓</b> brake
          </span>
          <span className="hud-key">
            <b>Space</b> jump / stomp
          </span>
          <span className="hud-key">
            <b>A S D F</b> grab
          </span>
          <span className="hud-key">
            <b>Shift</b> tweak
          </span>
          <span className="hud-key">
            <b>Esc</b> pause
          </span>
        </div>
      )}
    </div>
  );
}
