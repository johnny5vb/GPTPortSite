"use client";

/**
 * Touch controls.
 *
 * Layout (landscape or portrait, either works):
 *   left half   — a floating analog stick. It appears wherever your thumb lands
 *                 rather than at a fixed spot, which is the difference between
 *                 a stick you have to look at and one you don't. Left/right
 *                 steers (and spins in the air), up tucks (front flip), down
 *                 brakes (back flip).
 *   bottom right— JUMP, a four-way grab diamond, and a TWEAK modifier that
 *                 turns each grab into its tweaked variant, exactly like Shift.
 *
 * Every control writes straight into the same `Input` the keyboard uses, so the
 * physics has no idea which one is driving. Nothing here re-renders per frame:
 * the stick knob is moved by writing transforms to refs.
 */

import { useCallback, useEffect, useRef } from "react";
import type { Input } from "../core/input";
import type { Action } from "../core/input";

const STICK_RADIUS = 62;
const STICK_DEADZONE = 0.14;

interface Props {
  getInput: () => Input | null;
  onPause: () => void;
  /** Hide the stick + buttons but keep the pause control (photo mode). */
  minimal?: boolean;
}

interface TouchButtonProps {
  action: Action;
  label: string;
  sub?: string;
  className: string;
  getInput: () => Input | null;
}

function TouchButton({ action, label, sub, className, getInput }: TouchButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const down = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.dataset.on = "true";
      getInput()?.press(action);
    },
    [action, getInput],
  );

  const up = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.dataset.on = "false";
      getInput()?.release(action);
    },
    [action, getInput],
  );

  // A pointer lost to a cancel (call, notification, gesture) must not stick.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cancel = () => {
      el.dataset.on = "false";
      getInput()?.release(action);
    };
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", cancel);
    return () => {
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", cancel);
      getInput()?.release(action);
    };
  }, [action, getInput]);

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      aria-label={label}
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span>{label}</span>
      {sub && <em>{sub}</em>}
    </button>
  );
}

export default function TouchControls({ getInput, onPause, minimal }: Props) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });

  const setStickVisible = (on: boolean) => {
    if (baseRef.current) baseRef.current.style.opacity = on ? "1" : "0";
    if (knobRef.current) knobRef.current.style.opacity = on ? "1" : "0";
    // The resting stick is the "put your thumb here" mark. It has to go the
    // moment a real one appears, or there are two sticks on screen.
    if (homeRef.current) homeRef.current.style.opacity = on ? "0" : "1";
  };

  const onDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== null) return;
    e.preventDefault();
    pointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    origin.current = { x: e.clientX, y: e.clientY };
    if (baseRef.current) {
      baseRef.current.style.left = `${e.clientX}px`;
      baseRef.current.style.top = `${e.clientY}px`;
    }
    if (knobRef.current) {
      knobRef.current.style.left = `${e.clientX}px`;
      knobRef.current.style.top = `${e.clientY}px`;
    }
    setStickVisible(true);
  }, []);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (pointerId.current !== e.pointerId) return;
      e.preventDefault();
      const rawX = (e.clientX - origin.current.x) / STICK_RADIUS;
      const rawY = (e.clientY - origin.current.y) / STICK_RADIUS;
      const len = Math.hypot(rawX, rawY);
      const dirX = len > 1e-4 ? rawX / len : 0;
      const dirY = len > 1e-4 ? rawY / len : 0;
      const throw_ = Math.min(1, len);
      // Deadzone, re-normalised so the live range still spans the full axis.
      const mag =
        throw_ < STICK_DEADZONE
          ? 0
          : (throw_ - STICK_DEADZONE) / (1 - STICK_DEADZONE);

      getInput()?.setAxis(dirX * mag, dirY * mag);

      if (knobRef.current) {
        knobRef.current.style.left = `${origin.current.x + dirX * throw_ * STICK_RADIUS}px`;
        knobRef.current.style.top = `${origin.current.y + dirY * throw_ * STICK_RADIUS}px`;
      }
    },
    [getInput],
  );

  const onUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (pointerId.current !== e.pointerId) return;
      e.preventDefault();
      pointerId.current = null;
      getInput()?.setAxis(0, 0);
      setStickVisible(false);
    },
    [getInput],
  );

  // Never leave the stick deflected if the pointer is taken away from us.
  useEffect(() => {
    const cancel = () => {
      pointerId.current = null;
      getInput()?.setAxis(0, 0);
      setStickVisible(false);
    };
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", cancel);
    return () => {
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", cancel);
      getInput()?.setAxis(0, 0);
    };
  }, [getInput]);

  return (
    <div className="touch-layer" aria-hidden={false}>
      <button
        type="button"
        className="touch-pause"
        aria-label="Pause"
        onPointerDown={(e) => {
          e.preventDefault();
          onPause();
        }}
      >
        <span />
        <span />
      </button>

      {!minimal && (
        <>
          <div
            ref={zoneRef}
            className="touch-stick-zone"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onContextMenu={(e) => e.preventDefault()}
          />
          {/* Where the stick rests. The stick itself still appears wherever the
              thumb lands — this is only the mark that says a thumb goes here,
              which is the thing a first-time player needs and a returning one
              stops seeing. */}
          <div ref={homeRef} className="touch-stick-home">
            <span className="touch-stick-home__ring" />
            <span className="touch-stick-home__knob" />
            <i className="touch-stick-hint touch-stick-hint--up">TUCK</i>
            <i className="touch-stick-hint touch-stick-hint--down">BRAKE</i>
          </div>

          <div ref={baseRef} className="touch-stick-base" style={{ opacity: 0 }}>
            <i className="touch-stick-hint touch-stick-hint--up">TUCK</i>
            <i className="touch-stick-hint touch-stick-hint--down">BRAKE</i>
          </div>
          <div ref={knobRef} className="touch-stick-knob" style={{ opacity: 0 }} />

          <div className="touch-right">
            <div className="touch-diamond">
              <TouchButton
                getInput={getInput}
                action="trickD"
                label="NOSE"
                className="touch-grab touch-grab--n"
              />
              <TouchButton
                getInput={getInput}
                action="trickS"
                label="MELON"
                className="touch-grab touch-grab--e"
              />
              <TouchButton
                getInput={getInput}
                action="trickA"
                label="INDY"
                className="touch-grab touch-grab--s"
              />
              <TouchButton
                getInput={getInput}
                action="trickF"
                label="TAIL"
                className="touch-grab touch-grab--w"
              />
            </div>
            <TouchButton
              getInput={getInput}
              action="grab"
              label="TWEAK"
              className="touch-tweak"
            />
            <TouchButton
              getInput={getInput}
              action="jump"
              label="JUMP"
              className="touch-jump"
            />
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Photo mode: drag to orbit, pinch to zoom. Rendered instead of the ride
 * controls so the two can never fight over a pointer.
 */
export function TouchPhotoPad({
  onOrbit,
  onZoom,
}: {
  onOrbit: (dx: number, dy: number) => void;
  onZoom: (delta: number) => void;
}) {
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinch = useRef(0);

  const down = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      lastPinch.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }, []);

  const move = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      e.preventDefault();
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size >= 2) {
        const [a, b] = [...pointers.current.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (lastPinch.current > 0) onZoom((lastPinch.current - d) * 0.05);
        lastPinch.current = d;
        return;
      }
      onOrbit((e.clientX - prev.x) * 0.006, (e.clientY - prev.y) * 0.005);
    },
    [onOrbit, onZoom],
  );

  const up = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) lastPinch.current = 0;
  }, []);

  return (
    <div
      className="touch-photo-pad"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
