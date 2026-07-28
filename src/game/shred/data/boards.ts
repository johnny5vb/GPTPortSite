/**
 * Boards. The stat spread is deliberately small — a board should change the
 * *texture* of a run, never make one strictly better than another.
 *
 * `topArt` is drawn procedurally onto a canvas at load time so the deck has a
 * real graphic without shipping any textures.
 */

import type { Unlock } from "./riders";

export type BoardArt =
  | "wood"
  | "nineties"
  | "matte"
  | "neon"
  | "painted"
  | "carbon"
  | "stickers";

export interface Board {
  id: string;
  name: string;
  maker: string;
  art: BoardArt;
  blurb: string;
  colors: { base: string; accent: string; accent2: string; edge: string };
  /** Multipliers, 1.0 = baseline. */
  stats: {
    speed: number;
    turn: number;
    pop: number;
    stability: number;
  };
  unlock: Unlock;
}

export const BOARDS: Board[] = [
  {
    id: "timber",
    name: "Timber 158",
    maker: "CARMAN WORKS",
    art: "wood",
    blurb: "Ash veneer, hand-waxed. Predictable in every condition.",
    colors: { base: "#c9985c", accent: "#6b4426", accent2: "#f0dcc0", edge: "#d8d8d8" },
    stats: { speed: 1, turn: 1, pop: 1, stability: 1 },
    unlock: { kind: "default", value: 0, label: "Starter" },
  },
  {
    id: "radical",
    name: "Radical AF 155",
    maker: "SHRED CO.",
    art: "nineties",
    blurb: "Teal, magenta and confetti. Exactly as fast as it looks.",
    colors: { base: "#12c2c6", accent: "#ff2e88", accent2: "#ffe74c", edge: "#ffffff" },
    stats: { speed: 1.02, turn: 1.08, pop: 1.06, stability: 0.92 },
    unlock: { kind: "tricks", value: 25, label: "Land 25 tricks" },
  },
  {
    id: "blackout",
    name: "Blackout 161",
    maker: "NULL INDUSTRIES",
    art: "matte",
    blurb: "No graphic. No logo. Just a very fast piece of black.",
    colors: { base: "#141414", accent: "#2a2a2a", accent2: "#4a4a4a", edge: "#8a8a8a" },
    stats: { speed: 1.12, turn: 0.9, pop: 0.95, stability: 1.12 },
    unlock: { kind: "distance", value: 6000, label: "Ride 6 km total" },
  },
  {
    id: "neon",
    name: "Neon Dream 154",
    maker: "VHS SPORT",
    art: "neon",
    blurb: "Grid lines and a sunset. Pops like a spring board.",
    colors: { base: "#160b2e", accent: "#ff3d81", accent2: "#3ee7ff", edge: "#ff3d81" },
    stats: { speed: 0.98, turn: 1.1, pop: 1.18, stability: 0.94 },
    unlock: { kind: "score", value: 75000, label: "Score 75,000 in a run" },
  },
  {
    id: "painted",
    name: "Hand Painted 156",
    maker: "ONE-OFF",
    art: "painted",
    blurb: "Somebody's art school project. Turns on a thought.",
    colors: { base: "#f2ece0", accent: "#e0563f", accent2: "#3f6ea8", edge: "#c8c8c8" },
    stats: { speed: 0.96, turn: 1.18, pop: 1.04, stability: 0.98 },
    unlock: { kind: "runs", value: 8, label: "Finish 8 runs" },
  },
  {
    id: "carbon",
    name: "Carbon 162W",
    maker: "APEX LAB",
    art: "carbon",
    blurb: "Stiff, unforgiving, absurdly quick on hardpack.",
    colors: { base: "#22262b", accent: "#3a4149", accent2: "#9fb0c0", edge: "#d0dae4" },
    stats: { speed: 1.16, turn: 0.94, pop: 1.02, stability: 1.16 },
    unlock: { kind: "air", value: 3.5, label: "Hold a 3.5s air" },
  },
  {
    id: "stickers",
    name: "Sticker Bomb 152",
    maker: "FOUND IN A VAN",
    art: "stickers",
    blurb: "Twelve seasons of stickers holding a topsheet together.",
    colors: { base: "#2b2b2b", accent: "#ffd23f", accent2: "#39c46e", edge: "#e0e0e0" },
    stats: { speed: 0.94, turn: 1.14, pop: 1.12, stability: 0.9 },
    unlock: { kind: "score", value: 150000, label: "Score 150,000 in a run" },
  },
];

export const boardById = (id: string) =>
  BOARDS.find((b) => b.id === id) ?? BOARDS[0];
