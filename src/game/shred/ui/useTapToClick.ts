"use client";

/**
 * Make every menu button activate on the first tap.
 *
 * The menus are ordinary `<button onClick>`, which depends on the browser
 * synthesising a click from a touch. That synthesis is the least reliable part
 * of touch on the web: a mobile browser will withhold it when the tap changed
 * something under the finger (our tiles grow and lift on focus), when it is
 * still deciding whether a gesture is a double-tap, or when an ancestor has
 * opted out of default touch handling — which `.shred-root` does, with
 * `touch-action: none`, so the game can own the screen.
 *
 * The touch controls never had this problem because they were always driven
 * from `pointerdown` / `pointerup` directly. This gives the menus the same
 * footing rather than trusting the synthesised event:
 *
 *   - remember the button a touch started on;
 *   - on release, if the finger stayed put, activate that button ourselves;
 *   - swallow the browser's own click if it turns up afterwards, so an
 *     activation can never happen twice.
 *
 * It is delegated from the root, so it covers every button in every screen —
 * including ones added later — without a per-call-site change. Pointer types
 * other than touch are left completely alone: a mouse and a stylus keep the
 * native path.
 */

import { useEffect, type RefObject } from "react";

/** Movement past this is a scroll or a drag, not a tap. */
const SLOP = 12;
/** How long after we activate a button a native click is treated as its echo. */
const ECHO_MS = 700;

export function useTapToClick(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let pointer = -1;
    let startX = 0;
    let startY = 0;
    let target: HTMLElement | null = null;
    /** True only while we dispatch our own click, so we don't swallow it. */
    let dispatching = false;
    let activatedAt = -Infinity;

    const buttonAt = (node: EventTarget | null) => {
      const el = node instanceof Element ? node : null;
      const btn = el?.closest<HTMLElement>("button:not([disabled])");
      if (!btn) return null;
      // The touch controls run their own pointer handling and must keep every
      // event, including the ones that never become a click.
      if (btn.closest(".touch-layer, .touch-photo-pad")) return null;
      return btn;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      pointer = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      target = buttonAt(e.target);
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || e.pointerId !== pointer) return;
      const btn = target;
      target = null;
      pointer = -1;
      if (!btn) return;
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > SLOP) return;
      // Released somewhere else — the same rule a native click follows.
      if (buttonAt(document.elementFromPoint(e.clientX, e.clientY)) !== btn) return;

      activatedAt = e.timeStamp;
      dispatching = true;
      btn.click();
      dispatching = false;
    };

    const onCancel = () => {
      target = null;
      pointer = -1;
    };

    /**
     * Capture-phase, on a node *below* React's root container: stopping here
     * means React never sees the echo, so the handler runs exactly once.
     */
    const onClick = (e: MouseEvent) => {
      if (dispatching) return;
      if (e.timeStamp - activatedAt > ECHO_MS) return;
      if (!buttonAt(e.target)) return;
      e.stopPropagation();
      e.preventDefault();
    };

    root.addEventListener("pointerdown", onDown, true);
    root.addEventListener("pointerup", onUp, true);
    root.addEventListener("pointercancel", onCancel, true);
    root.addEventListener("click", onClick, true);
    return () => {
      root.removeEventListener("pointerdown", onDown, true);
      root.removeEventListener("pointerup", onUp, true);
      root.removeEventListener("pointercancel", onCancel, true);
      root.removeEventListener("click", onClick, true);
    };
  }, [rootRef]);
}
