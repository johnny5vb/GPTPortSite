/**
 * Riders. Each one is a silhouette, a palette and a bias in how they ride:
 * spin speed, pop, balance (how forgiving a landing is) and a trick style that
 * nudges which grabs and rotations the game names when you throw them.
 */

export type UnlockKind = "default" | "score" | "distance" | "tricks" | "air" | "runs";

export interface Unlock {
  kind: UnlockKind;
  value: number;
  label: string;
}

export interface RiderStyle {
  /** Preferred grab when the player just mashes — flavours the trick names. */
  signature: string;
  /** -1 favours backside spins, +1 frontside. */
  spinBias: number;
  /** How much the board tweaks out during grabs. */
  tweak: number;
  /** Idle/carve animation character. */
  stance: "surfy" | "aggressive" | "playful" | "technical" | "loose";
}

export interface Rider {
  id: string;
  name: string;
  handle: string;
  blurb: string;
  colors: {
    jacket: string;
    jacketAlt: string;
    pants: string;
    accent: string;
    skin: string;
    hair: string;
    helmet: string;
    goggles: string;
  };
  /** Multipliers, 1.0 = baseline. */
  stats: {
    spin: number;
    pop: number;
    balance: number;
    speed: number;
  };
  style: RiderStyle;
  accessory: "scarf" | "backpack" | "camera" | "antenna" | "fanny" | "none";
  unlock: Unlock;
}

export const RIDERS: Rider[] = [
  {
    id: "kaz",
    name: "Kaz Delrey",
    handle: "RETRO PRO / '99",
    blurb:
      "Rode the first pipe contests in a jacket two sizes too big. Still lands everything.",
    colors: {
      jacket: "#f24d3d",
      jacketAlt: "#f7f3ec",
      pants: "#1c2a4a",
      accent: "#ffd23f",
      skin: "#c98d61",
      hair: "#2b1d14",
      helmet: "#f7f3ec",
      goggles: "#2ee5b3",
    },
    stats: { spin: 1, pop: 1, balance: 1, speed: 1 },
    style: { signature: "Method", spinBias: 0.2, tweak: 0.9, stance: "surfy" },
    accessory: "none",
    unlock: { kind: "default", value: 0, label: "Starter" },
  },
  {
    id: "vex",
    name: "Vex",
    handle: "STREET PUNK",
    blurb: "Grew up on handrails and stolen lift tickets. Spins fast, lands loud.",
    colors: {
      jacket: "#1a1a1a",
      jacketAlt: "#e5175f",
      pants: "#3c3f46",
      accent: "#e5175f",
      skin: "#8d5a3b",
      hair: "#e5175f",
      helmet: "#1a1a1a",
      goggles: "#ff8a3d",
    },
    stats: { spin: 1.22, pop: 1.05, balance: 0.9, speed: 0.98 },
    style: { signature: "Stalefish", spinBias: -0.5, tweak: 1.15, stance: "aggressive" },
    accessory: "none",
    unlock: { kind: "default", value: 0, label: "Starter" },
  },
  {
    id: "rin",
    name: "Rin Asaka",
    handle: "FREESTYLE / SAPPORO",
    blurb: "Park rat turned powder surfer. Every trick has a little extra hang.",
    colors: {
      jacket: "#f5f1ff",
      jacketAlt: "#8f7bff",
      pants: "#2a2440",
      accent: "#8f7bff",
      skin: "#e0b48f",
      hair: "#151515",
      helmet: "#8f7bff",
      goggles: "#ffe066",
    },
    stats: { spin: 1.12, pop: 1.18, balance: 1.05, speed: 0.96 },
    style: { signature: "Japan", spinBias: 0.6, tweak: 1.3, stance: "playful" },
    accessory: "scarf",
    unlock: { kind: "default", value: 0, label: "Starter" },
  },
  {
    id: "solve",
    name: "Sølve Haugen",
    handle: "BACKCOUNTRY / NORD",
    blurb: "Reads a face like a map. Doesn't hurry, never falls.",
    colors: {
      jacket: "#3f5f4a",
      jacketAlt: "#d8cbb0",
      pants: "#2c3630",
      accent: "#e8a33d",
      skin: "#dcb391",
      hair: "#b9944f",
      helmet: "#d8cbb0",
      goggles: "#e8a33d",
    },
    stats: { spin: 0.9, pop: 0.95, balance: 1.28, speed: 1.06 },
    style: { signature: "Melon", spinBias: 0.1, tweak: 0.7, stance: "technical" },
    accessory: "backpack",
    unlock: { kind: "default", value: 0, label: "Starter" },
  },
  {
    id: "tam",
    name: "Tam Lindqvist",
    handle: "SLOPESTYLE / JR CIRCUIT",
    blurb:
      "Sixteen and completely unbothered. Learns a trick in three tries, then does it switch.",
    colors: {
      jacket: "#b6ff3d",
      jacketAlt: "#141414",
      pants: "#2b2f36",
      accent: "#ff5ea8",
      skin: "#f0c9a0",
      hair: "#f0e2c0",
      helmet: "#b6ff3d",
      goggles: "#ff5ea8",
    },
    stats: { spin: 1.15, pop: 1.14, balance: 0.92, speed: 0.94 },
    style: { signature: "Nose", spinBias: 0.45, tweak: 1.25, stance: "playful" },
    accessory: "fanny",
    unlock: { kind: "runs", value: 2, label: "Finish 2 runs" },
  },
  {
    id: "null9",
    name: "NULL-9",
    handle: "SYNTHETIC RIDER",
    blurb: "Nobody knows who's inside the suit. The board never chatters.",
    colors: {
      jacket: "#0f1418",
      jacketAlt: "#1cb791",
      pants: "#0f1418",
      accent: "#2ee5b3",
      skin: "#7c8794",
      hair: "#2ee5b3",
      helmet: "#0f1418",
      goggles: "#2ee5b3",
    },
    stats: { spin: 1.3, pop: 1.1, balance: 1.12, speed: 1.1 },
    style: { signature: "Cork", spinBias: -0.2, tweak: 1.0, stance: "technical" },
    accessory: "antenna",
    unlock: { kind: "air", value: 3, label: "Hold a 3s air" },
  },
  {
    id: "marisol",
    name: "Marisol Vane",
    handle: "MOUNTAIN PHOTOGRAPHER",
    blurb: "Shoots the line before she rides it. Knows where the light lands.",
    colors: {
      jacket: "#c9d4dd",
      jacketAlt: "#e2705a",
      pants: "#4a4f57",
      accent: "#e2705a",
      skin: "#a9703f",
      hair: "#3b2418",
      helmet: "#4a4f57",
      goggles: "#ffd6a5",
    },
    stats: { spin: 1.0, pop: 1.0, balance: 1.15, speed: 1.0 },
    style: { signature: "Indy", spinBias: 0.3, tweak: 0.85, stance: "surfy" },
    accessory: "camera",
    unlock: { kind: "tricks", value: 25, label: "Land 25 tricks" },
  },
  {
    id: "kestrel",
    name: "Kestrel",
    handle: "SWEEP / LAST CHAIR",
    blurb:
      "Sweeps the mountain after the lifts stop. Knows every rock on it by feel.",
    colors: {
      jacket: "#f26d1f",
      jacketAlt: "#141a20",
      pants: "#141a20",
      accent: "#ffd23f",
      skin: "#6f4a32",
      hair: "#1a1a1a",
      helmet: "#141a20",
      goggles: "#ffd23f",
    },
    stats: { spin: 1.08, pop: 1.06, balance: 1.18, speed: 1.0 },
    style: { signature: "Mute", spinBias: -0.35, tweak: 0.9, stance: "surfy" },
    accessory: "backpack",
    unlock: { kind: "distance", value: 3000, label: "Ride 3 km total" },
  },
  {
    id: "denny",
    name: "Denny Pratt",
    handle: "VINTAGE SKI BUM",
    blurb: "Been living out of the same van since '94. Fastest man on the mountain.",
    colors: {
      jacket: "#e8b23d",
      jacketAlt: "#3f7fb8",
      pants: "#8c4b2a",
      accent: "#3f7fb8",
      skin: "#d3a077",
      hair: "#8a8a8a",
      helmet: "#8c4b2a",
      goggles: "#f5f1e6",
    },
    stats: { spin: 0.92, pop: 0.9, balance: 1.05, speed: 1.2 },
    style: { signature: "Tail", spinBias: 0, tweak: 0.6, stance: "loose" },
    accessory: "scarf",
    unlock: { kind: "score", value: 40000, label: "Score 40,000 in a run" },
  },
  {
    id: "orso",
    name: "Orso Bellini",
    handle: "ALPINE RACER / '92",
    blurb:
      "Trained on gates for a decade. Still tucks through everything and calls it a line.",
    colors: {
      jacket: "#d6d9de",
      jacketAlt: "#c0202f",
      pants: "#1b2440",
      accent: "#c0202f",
      skin: "#c9a17a",
      hair: "#3a2c22",
      helmet: "#c0202f",
      goggles: "#f2f2f2",
    },
    stats: { spin: 0.86, pop: 0.88, balance: 1.22, speed: 1.26 },
    style: { signature: "Indy", spinBias: 0, tweak: 0.5, stance: "technical" },
    accessory: "none",
    unlock: { kind: "runs", value: 10, label: "Finish 10 runs" },
  },
];

export const riderById = (id: string) =>
  RIDERS.find((r) => r.id === id) ?? RIDERS[0];
