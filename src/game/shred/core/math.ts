/**
 * SHRED 1999 — math helpers.
 *
 * Everything here is frame-rate independent. `damp` is the workhorse: it is an
 * exponential smoothing that behaves identically at 30fps and 240fps, which is
 * what keeps the camera and the rider feeling the same on every machine.
 */

export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;

export const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const inverseLerp = (a: number, b: number, v: number) =>
  a === b ? 0 : (v - a) / (b - a);

export const remap = (
  v: number,
  inA: number,
  inB: number,
  outA: number,
  outB: number,
) => lerp(outA, outB, clamp01(inverseLerp(inA, inB, v)));

export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01(inverseLerp(a, b, v));
  return t * t * (3 - 2 * t);
};

export const smootherstep = (a: number, b: number, v: number) => {
  const t = clamp01(inverseLerp(a, b, v));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/**
 * Frame-rate independent exponential approach.
 * `smoothing` is the fraction of the remaining distance left after 1 second.
 * Smaller = snappier. 0.001 is very snappy, 0.5 is lazy.
 */
export const damp = (
  current: number,
  target: number,
  smoothing: number,
  dt: number,
) => lerp(current, target, 1 - Math.pow(smoothing, dt));

/** Shortest signed angular difference, in radians, wrapped to [-PI, PI]. */
export const angleDelta = (from: number, to: number) => {
  let d = (to - from) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
};

/** Frame-rate independent angle damping that always takes the short way round. */
export const dampAngle = (
  current: number,
  target: number,
  smoothing: number,
  dt: number,
) => current + angleDelta(current, target) * (1 - Math.pow(smoothing, dt));

export const wrapAngle = (a: number) => {
  let r = a % TAU;
  if (r > Math.PI) r -= TAU;
  if (r < -Math.PI) r += TAU;
  return r;
};

/** Move `current` toward `target` at most `maxDelta`. */
export const moveTowards = (
  current: number,
  target: number,
  maxDelta: number,
) => {
  const d = target - current;
  if (Math.abs(d) <= maxDelta) return target;
  return current + Math.sign(d) * maxDelta;
};

/**
 * Critically-damped spring. Returns the new value and writes the new velocity
 * back into `state`. Used for the camera boom and the HUD needles.
 */
export interface SpringState {
  v: number;
}
export const spring = (
  current: number,
  target: number,
  state: SpringState,
  stiffness: number,
  damping: number,
  dt: number,
) => {
  // Sub-step for stability at low frame rates.
  const steps = Math.min(4, Math.max(1, Math.ceil(dt / (1 / 90))));
  const h = dt / steps;
  let x = current;
  for (let i = 0; i < steps; i++) {
    const accel = (target - x) * stiffness - state.v * damping;
    state.v += accel * h;
    x += state.v * h;
  }
  return x;
};

/** Signed value with a dead zone, remapped so the live range still spans 0..1. */
export const deadzone = (v: number, dz: number) => {
  const a = Math.abs(v);
  if (a < dz) return 0;
  return Math.sign(v) * ((a - dz) / (1 - dz));
};

/** Classic ease curves used by the score popups and camera kicks. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
export const easeInCubic = (t: number) => t * t * t;
export const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const easeOutElastic = (t: number) => {
  if (t === 0 || t === 1) return t;
  const c4 = TAU / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

/** Pulse that rises fast and decays slow — screen shake, camera kicks. */
export const impulseCurve = (t: number, sharpness = 6) => {
  if (t <= 0 || t >= 1) return 0;
  return Math.pow(1 - t, sharpness) * Math.sin(t * Math.PI * 0.5 + 0.0) * 1.0;
};

export const approxZero = (v: number, eps = 1e-6) => Math.abs(v) < eps;

/** Round to the nearest multiple. Used for spin quantisation (180s). */
export const snapTo = (v: number, step: number) => Math.round(v / step) * step;

/** Format a number with thousands separators without pulling in Intl. */
export const formatScore = (n: number) => {
  const s = Math.max(0, Math.round(n)).toString();
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += ",";
    out += s[i];
  }
  return out;
};

/**
 * Units.
 *
 * The simulation is metric throughout — metres, m/s, radians — because the
 * physics is easier to reason about that way. Everything the *player* reads is
 * imperial, and it converts here rather than at each call site, so a speedo in
 * mph can't drift out of step with a distance in metres.
 */
export const MPH = 2.2369363; // m/s → mph
export const FEET = 3.2808399; // m → ft
export const MILES = 0.000621371; // m → mi

export const formatTime = (seconds: number) => {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const rem = s - m * 60;
  const whole = Math.floor(rem);
  const cs = Math.floor((rem - whole) * 100);
  return `${m}:${whole.toString().padStart(2, "0")}.${cs
    .toString()
    .padStart(2, "0")}`;
};
