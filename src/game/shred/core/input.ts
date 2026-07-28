/**
 * Input.
 *
 * Keyboard and touch feed the same action set, so nothing downstream knows or
 * cares which one is driving. Touch additionally supplies an analog stick: the
 * axes are folded into `steer()` / `pitch()` and also satisfy `held()` for the
 * digital actions, which means an analog lean gives finer control than the
 * keyboard rather than merely emulating it.
 *
 * Two things matter for feel here:
 *  1. `pressed()` is edge-triggered and *consumed by the frame*, so a tap that
 *     lands between two frames is never dropped.
 *  2. `bufferedJump` remembers a jump press for a short window, which is what
 *     lets a player mash Space just before the lip and still get the pop.
 */

export type Action =
  | "left"
  | "right"
  | "tuck"
  | "brake"
  | "jump"
  | "grab"
  | "trickA"
  | "trickS"
  | "trickD"
  | "trickF"
  | "pause"
  | "reset"
  | "photo"
  | "swap";

const KEY_MAP: Record<string, Action> = {
  ArrowLeft: "left",
  KeyA_alt: "left",
  ArrowRight: "right",
  ArrowUp: "tuck",
  ArrowDown: "brake",
  Space: "jump",
  ShiftLeft: "grab",
  ShiftRight: "grab",
  KeyA: "trickA",
  KeyS: "trickS",
  KeyD: "trickD",
  KeyF: "trickF",
  Escape: "pause",
  KeyR: "reset",
  KeyP: "photo",
  KeyC: "swap",
};

const ALL_ACTIONS: Action[] = [
  "left",
  "right",
  "tuck",
  "brake",
  "jump",
  "grab",
  "trickA",
  "trickS",
  "trickD",
  "trickF",
  "pause",
  "reset",
  "photo",
  "swap",
];

/** Keys we swallow so the page never scrolls out from under the canvas. */
const SWALLOW = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
  "KeyR",
  "KeyP",
  "KeyC",
  "Tab",
]);

export const JUMP_BUFFER = 0.16;

const clampAxis = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);

export class Input {
  private down = new Set<Action>();
  private pressedThisFrame = new Set<Action>();
  private releasedThisFrame = new Set<Action>();
  private holdTime: Record<string, number> = {};

  /** Analog stick, -1..1. Left/right steers, up/down tucks and brakes. */
  private axisX = 0;
  private axisY = 0;

  /** Seconds remaining on a buffered jump press. */
  jumpBuffer = 0;
  /** True while the player is holding a direction — used by the HUD hints. */
  enabled = true;

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.enabled) return;
    if (e.repeat) {
      if (SWALLOW.has(e.code)) e.preventDefault();
      return;
    }
    const action = KEY_MAP[e.code];
    if (SWALLOW.has(e.code)) e.preventDefault();
    if (!action) return;
    if (!this.down.has(action)) {
      this.down.add(action);
      this.pressedThisFrame.add(action);
      this.holdTime[action] = 0;
      if (action === "jump") this.jumpBuffer = JUMP_BUFFER;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const action = KEY_MAP[e.code];
    if (!action) return;
    if (this.down.has(action)) {
      this.down.delete(action);
      this.releasedThisFrame.add(action);
    }
  };

  private onBlur = () => {
    // Never leave a key stuck down when the tab loses focus mid-carve.
    for (const a of this.down) this.releasedThisFrame.add(a);
    this.down.clear();
  };

  attach(target: Window | HTMLElement = window) {
    target.addEventListener("keydown", this.onKeyDown as EventListener);
    target.addEventListener("keyup", this.onKeyUp as EventListener);
    window.addEventListener("blur", this.onBlur);
  }

  detach(target: Window | HTMLElement = window) {
    target.removeEventListener("keydown", this.onKeyDown as EventListener);
    target.removeEventListener("keyup", this.onKeyUp as EventListener);
    window.removeEventListener("blur", this.onBlur);
  }

  /** Press an action from a source other than the keyboard (touch controls). */
  press(a: Action) {
    if (this.down.has(a)) return;
    this.down.add(a);
    this.pressedThisFrame.add(a);
    this.holdTime[a] = 0;
    if (a === "jump") this.jumpBuffer = JUMP_BUFFER;
  }

  release(a: Action) {
    if (!this.down.has(a)) return;
    this.down.delete(a);
    this.releasedThisFrame.add(a);
  }

  /** Analog stick from the touch layer. Zero it on release. */
  setAxis(x: number, y: number) {
    this.axisX = clampAxis(x);
    this.axisY = clampAxis(y);
  }

  get axis() {
    return { x: this.axisX, y: this.axisY };
  }

  held(a: Action) {
    if (this.down.has(a)) return true;
    // The stick satisfies the digital actions too, so systems that only ask
    // "is the player tucking?" work identically on both input methods.
    switch (a) {
      case "left":
        return this.axisX < -0.35;
      case "right":
        return this.axisX > 0.35;
      case "tuck":
        return this.axisY < -0.4;
      case "brake":
        return this.axisY > 0.4;
      default:
        return false;
    }
  }

  pressed(a: Action) {
    return this.pressedThisFrame.has(a);
  }

  released(a: Action) {
    return this.releasedThisFrame.has(a);
  }

  heldFor(a: Action) {
    return this.down.has(a) ? this.holdTime[a] ?? 0 : 0;
  }

  anyTrickPressed(): "A" | "S" | "D" | "F" | null {
    if (this.pressedThisFrame.has("trickA")) return "A";
    if (this.pressedThisFrame.has("trickS")) return "S";
    if (this.pressedThisFrame.has("trickD")) return "D";
    if (this.pressedThisFrame.has("trickF")) return "F";
    return null;
  }

  anyTrickHeld(): "A" | "S" | "D" | "F" | null {
    if (this.down.has("trickA")) return "A";
    if (this.down.has("trickS")) return "S";
    if (this.down.has("trickD")) return "D";
    if (this.down.has("trickF")) return "F";
    return null;
  }

  /** -1 .. 1 steering axis. */
  steer() {
    const keys =
      (this.down.has("right") ? 1 : 0) - (this.down.has("left") ? 1 : 0);
    return clampAxis(keys + this.axisX);
  }

  /** -1 .. 1 pitch axis (up = tuck / frontflip, down = brake / backflip). */
  pitch() {
    const keys =
      (this.down.has("brake") ? 1 : 0) - (this.down.has("tuck") ? 1 : 0);
    return clampAxis(keys + this.axisY);
  }

  consumeJump() {
    const has = this.jumpBuffer > 0;
    this.jumpBuffer = 0;
    return has;
  }

  /** Call once per frame *after* all systems have read the edge state. */
  endFrame(dt: number) {
    this.pressedThisFrame.clear();
    this.releasedThisFrame.clear();
    if (this.jumpBuffer > 0) this.jumpBuffer -= dt;
    for (const a of this.down) this.holdTime[a] = (this.holdTime[a] ?? 0) + dt;
  }

  releaseAll() {
    this.down.clear();
    this.pressedThisFrame.clear();
    this.releasedThisFrame.clear();
    this.jumpBuffer = 0;
    this.axisX = 0;
    this.axisY = 0;
  }

  static actions() {
    return ALL_ACTIONS;
  }
}
