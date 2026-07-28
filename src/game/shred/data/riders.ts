/**
 * Riders. Each one is a silhouette, an outfit and a bias in how they ride:
 * spin speed, pop, balance (how forgiving a landing is) and a trick style that
 * nudges which grabs and rotations the game names when you throw them.
 *
 * How they *look* lives entirely in `appearance` (see `appearance.ts`) — the
 * same structure the character creator writes, so a stock rider and one you
 * built yourself are the same kind of thing to the rig.
 */

import { type Appearance, look } from "./appearance";

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
  appearance: Appearance;
  /** Multipliers, 1.0 = baseline. */
  stats: {
    spin: number;
    pop: number;
    balance: number;
    speed: number;
  };
  style: RiderStyle;
  unlock: Unlock;
  /** Set on riders built in the character creator. */
  custom?: boolean;
}

export const RIDERS: Rider[] = [
  {
    id: "kaz",
    name: "Kaz Delrey",
    handle: "RETRO PRO / '99",
    blurb:
      "Rode the first pipe contests in a jacket two sizes too big. Still lands everything.",
    appearance: look({
      build: "regular",
      skin: "#c98d61",
      hair: "shag",
      hairColor: "#2b1d14",
      beard: "stubble",
      headwear: "helmet",
      headwearColor: "#f7f3ec",
      face: "none",
      eyewear: "retro",
      lensColor: "#2ee5b3",
      frameColor: "#f24d3d",
      jacket: "puffy",
      jacketColor: "#f24d3d",
      jacketAlt: "#f7f3ec",
      pants: "baggy",
      pantsColor: "#1c2a4a",
      hands: "mitts",
      handsColor: "#ffd23f",
      accent: "#ffd23f",
      accessory: "none",
    }),
    stats: { spin: 1, pop: 1, balance: 1, speed: 1 },
    style: { signature: "Method", spinBias: 0.2, tweak: 0.9, stance: "surfy" },
    unlock: { kind: "default", value: 0, label: "Starter" },
  },
  {
    id: "vex",
    name: "Vex",
    handle: "STREET PUNK",
    blurb: "Grew up on handrails and stolen lift tickets. Spins fast, lands loud.",
    appearance: look({
      build: "slim",
      skin: "#8d5a3b",
      hair: "mohawk",
      hairColor: "#e5175f",
      headwear: "none",
      headwearColor: "#1a1a1a",
      face: "bandana",
      faceColor: "#1a1a1a",
      eyewear: "shades",
      lensColor: "#ff8a3d",
      frameColor: "#1a1a1a",
      jacket: "anorak",
      jacketColor: "#1a1a1a",
      jacketAlt: "#e5175f",
      pants: "cargo",
      pantsColor: "#3c3f46",
      hands: "gloves",
      handsColor: "#e5175f",
      accent: "#e5175f",
      accessory: "none",
    }),
    stats: { spin: 1.22, pop: 1.05, balance: 0.9, speed: 0.98 },
    style: { signature: "Stalefish", spinBias: -0.5, tweak: 1.15, stance: "aggressive" },
    unlock: { kind: "default", value: 0, label: "Starter" },
  },
  {
    id: "rin",
    name: "Rin Asaka",
    handle: "FREESTYLE / SAPPORO",
    blurb: "Park rat turned powder surfer. Every trick has a little extra hang.",
    appearance: look({
      build: "slim",
      skin: "#e0b48f",
      hair: "ponytail",
      hairColor: "#151515",
      headwear: "pom-beanie",
      headwearColor: "#8f7bff",
      face: "gaiter",
      faceColor: "#2a2440",
      eyewear: "oversize",
      lensColor: "#ffe066",
      frameColor: "#f5f1ff",
      jacket: "puffy",
      jacketColor: "#f5f1ff",
      jacketAlt: "#8f7bff",
      pants: "bib",
      pantsColor: "#2a2440",
      hands: "mitts",
      handsColor: "#8f7bff",
      accent: "#8f7bff",
      accessory: "scarf",
    }),
    stats: { spin: 1.12, pop: 1.18, balance: 1.05, speed: 0.96 },
    style: { signature: "Japan", spinBias: 0.6, tweak: 1.3, stance: "playful" },
    unlock: { kind: "default", value: 0, label: "Starter" },
  },
  {
    id: "solve",
    name: "Sølve Haugen",
    handle: "BACKCOUNTRY / NORD",
    blurb: "Reads a face like a map. Doesn't hurry, never falls.",
    appearance: look({
      build: "stocky",
      skin: "#dcb391",
      hair: "short",
      hairColor: "#b9944f",
      headwear: "hood",
      headwearColor: "#3f5f4a",
      face: "balaclava",
      faceColor: "#2c3630",
      eyewear: "sport",
      lensColor: "#e8a33d",
      frameColor: "#2c3630",
      jacket: "shell",
      jacketColor: "#3f5f4a",
      jacketAlt: "#d8cbb0",
      pants: "bib",
      pantsColor: "#2c3630",
      hands: "gauntlets",
      handsColor: "#d8cbb0",
      accent: "#e8a33d",
      accessory: "backpack",
    }),
    stats: { spin: 0.9, pop: 0.95, balance: 1.28, speed: 1.06 },
    style: { signature: "Melon", spinBias: 0.1, tweak: 0.7, stance: "technical" },
    unlock: { kind: "default", value: 0, label: "Starter" },
  },
  {
    id: "tam",
    name: "Tam Lindqvist",
    handle: "SLOPESTYLE / JR CIRCUIT",
    blurb:
      "Sixteen and completely unbothered. Learns a trick in three tries, then does it switch.",
    appearance: look({
      build: "slim",
      skin: "#f0c9a0",
      hair: "bun",
      hairColor: "#f0e2c0",
      headwear: "cap",
      headwearColor: "#141414",
      face: "gaiter",
      faceColor: "#ff5ea8",
      eyewear: "oversize",
      lensColor: "#ff5ea8",
      frameColor: "#b6ff3d",
      jacket: "vest",
      jacketColor: "#b6ff3d",
      jacketAlt: "#141414",
      pants: "baggy",
      pantsColor: "#2b2f36",
      hands: "gloves",
      handsColor: "#ff5ea8",
      accent: "#ff5ea8",
      accessory: "fanny",
    }),
    stats: { spin: 1.15, pop: 1.14, balance: 0.92, speed: 0.94 },
    style: { signature: "Nose", spinBias: 0.45, tweak: 1.25, stance: "playful" },
    unlock: { kind: "runs", value: 2, label: "Finish 2 runs" },
  },
  {
    id: "null9",
    name: "NULL-9",
    handle: "SYNTHETIC RIDER",
    blurb: "Nobody knows who's inside the suit. The board never chatters.",
    appearance: look({
      build: "regular",
      skin: "#7c8794",
      hair: "none",
      hairColor: "#2ee5b3",
      headwear: "visor-helmet",
      headwearColor: "#0f1418",
      face: "balaclava",
      faceColor: "#0f1418",
      eyewear: "none",
      lensColor: "#2ee5b3",
      frameColor: "#2ee5b3",
      jacket: "onesie",
      jacketColor: "#0f1418",
      jacketAlt: "#1cb791",
      pants: "slim",
      pantsColor: "#0f1418",
      hands: "gloves",
      handsColor: "#2ee5b3",
      accent: "#2ee5b3",
      accessory: "antenna",
    }),
    stats: { spin: 1.3, pop: 1.1, balance: 1.12, speed: 1.1 },
    style: { signature: "Cork", spinBias: -0.2, tweak: 1.0, stance: "technical" },
    unlock: { kind: "air", value: 3, label: "Hold a 3s air" },
  },
  {
    id: "marisol",
    name: "Marisol Vane",
    handle: "MOUNTAIN PHOTOGRAPHER",
    blurb: "Shoots the line before she rides it. Knows where the light lands.",
    appearance: look({
      build: "regular",
      skin: "#a9703f",
      hair: "braids",
      hairColor: "#3b2418",
      headwear: "bucket",
      headwearColor: "#c9d4dd",
      face: "none",
      eyewear: "retro",
      lensColor: "#ffd6a5",
      frameColor: "#e2705a",
      jacket: "shell",
      jacketColor: "#c9d4dd",
      jacketAlt: "#e2705a",
      pants: "cargo",
      pantsColor: "#4a4f57",
      hands: "gloves",
      handsColor: "#e2705a",
      accent: "#e2705a",
      accessory: "camera",
    }),
    stats: { spin: 1.0, pop: 1.0, balance: 1.15, speed: 1.0 },
    style: { signature: "Indy", spinBias: 0.3, tweak: 0.85, stance: "surfy" },
    unlock: { kind: "tricks", value: 25, label: "Land 25 tricks" },
  },
  {
    id: "kestrel",
    name: "Kestrel",
    handle: "SWEEP / LAST CHAIR",
    blurb:
      "Sweeps the mountain after the lifts stop. Knows every rock on it by feel.",
    appearance: look({
      build: "regular",
      skin: "#6f4a32",
      hair: "locs",
      hairColor: "#1a1a1a",
      headwear: "helmet",
      headwearColor: "#141a20",
      face: "gaiter",
      faceColor: "#141a20",
      eyewear: "sport",
      lensColor: "#ffd23f",
      frameColor: "#f26d1f",
      jacket: "shell",
      jacketColor: "#f26d1f",
      jacketAlt: "#141a20",
      pants: "bib",
      pantsColor: "#141a20",
      hands: "gauntlets",
      handsColor: "#141a20",
      accent: "#ffd23f",
      accessory: "backpack",
    }),
    stats: { spin: 1.08, pop: 1.06, balance: 1.18, speed: 1.0 },
    style: { signature: "Mute", spinBias: -0.35, tweak: 0.9, stance: "surfy" },
    unlock: { kind: "distance", value: 3000, label: "Ride 3 km total" },
  },
  {
    id: "denny",
    name: "Denny Pratt",
    handle: "SPEED / FIRST CHAIR",
    blurb:
      "First chair every morning, gone before the cord sets. Points it straight and out-runs riders twice his age.",
    appearance: look({
      build: "slim",
      skin: "#d3a077",
      hair: "shag",
      hairColor: "#8a5a2b",
      beard: "none",
      headwear: "beanie",
      headwearColor: "#3f7fb8",
      face: "none",
      eyewear: "none",
      lensColor: "#f5f1e6",
      frameColor: "#3f7fb8",
      jacket: "onesie",
      jacketColor: "#e8b23d",
      jacketAlt: "#3f7fb8",
      pants: "slim",
      pantsColor: "#8c4b2a",
      hands: "mitts",
      handsColor: "#3f7fb8",
      accent: "#3f7fb8",
      accessory: "scarf",
    }),
    stats: { spin: 0.92, pop: 0.9, balance: 1.05, speed: 1.2 },
    style: { signature: "Tail", spinBias: 0, tweak: 0.6, stance: "loose" },
    unlock: { kind: "score", value: 40000, label: "Score 40,000 in a run" },
  },
  {
    id: "orso",
    name: "Orso Bellini",
    handle: "ALPINE RACER / '92",
    blurb:
      "Trained on gates for a decade. Still tucks through everything and calls it a line.",
    appearance: look({
      build: "stocky",
      skin: "#c9a17a",
      hair: "buzz",
      hairColor: "#3a2c22",
      headwear: "visor-helmet",
      headwearColor: "#c0202f",
      face: "none",
      eyewear: "none",
      lensColor: "#f2f2f2",
      frameColor: "#c0202f",
      jacket: "onesie",
      jacketColor: "#d6d9de",
      jacketAlt: "#c0202f",
      pants: "slim",
      pantsColor: "#1b2440",
      hands: "gloves",
      handsColor: "#c0202f",
      accent: "#c0202f",
      accessory: "none",
    }),
    stats: { spin: 0.86, pop: 0.88, balance: 1.22, speed: 1.26 },
    style: { signature: "Indy", spinBias: 0, tweak: 0.5, stance: "technical" },
    unlock: { kind: "runs", value: 10, label: "Finish 10 runs" },
  },
];

/**
 * Riding styles a created rider can be built around.
 *
 * A custom rider picks one of these instead of setting numbers directly. That
 * keeps the creator about *how you look and how you want to ride* rather than
 * a stat sheet to min-max, and it guarantees a home-made rider always sits
 * inside the same balance envelope as the stock roster.
 */
export interface Archetype {
  id: string;
  name: string;
  blurb: string;
  stats: Rider["stats"];
  style: RiderStyle;
}

export const ARCHETYPES: Archetype[] = [
  {
    id: "allround",
    name: "All-rounder",
    blurb: "No weaknesses, no cheats. The baseline everything else is measured against.",
    stats: { spin: 1, pop: 1, balance: 1.02, speed: 1 },
    style: { signature: "Indy", spinBias: 0.2, tweak: 0.9, stance: "surfy" },
  },
  {
    id: "park",
    name: "Park rat",
    blurb: "Spins fast and pops high. Lands like it, too — you'll want the airtime.",
    stats: { spin: 1.2, pop: 1.16, balance: 0.9, speed: 0.95 },
    style: { signature: "Nose", spinBias: 0.5, tweak: 1.25, stance: "playful" },
  },
  {
    id: "powder",
    name: "Powder hound",
    blurb: "Slow to rotate, impossible to knock over. Forgiving on every landing.",
    stats: { spin: 0.9, pop: 0.96, balance: 1.26, speed: 1.05 },
    style: { signature: "Melon", spinBias: 0.1, tweak: 0.7, stance: "technical" },
  },
  {
    id: "speed",
    name: "Speed freak",
    blurb: "Points it and holds on. Fastest line down, least patience for tricks.",
    stats: { spin: 0.88, pop: 0.9, balance: 1.08, speed: 1.24 },
    style: { signature: "Tail", spinBias: 0, tweak: 0.55, stance: "loose" },
  },
];

export const archetypeById = (id: string) =>
  ARCHETYPES.find((a) => a.id === id) ?? ARCHETYPES[0];

/** A rider built in the character creator, as stored in the save file. */
export interface CustomRider {
  id: string;
  name: string;
  archetype: string;
  appearance: Appearance;
}

/** Inflate a saved custom rider into a full `Rider` the game can use. */
export function customToRider(c: CustomRider): Rider {
  const a = archetypeById(c.archetype);
  return {
    id: c.id,
    name: c.name || "Untitled Rider",
    handle: `YOUR BUILD / ${a.name.toUpperCase()}`,
    blurb: a.blurb,
    appearance: c.appearance,
    stats: a.stats,
    style: a.style,
    unlock: { kind: "default", value: 0, label: "Built by you" },
    custom: true,
  };
}

export const riderById = (id: string, extra: Rider[] = []) =>
  extra.find((r) => r.id === id) ?? RIDERS.find((r) => r.id === id) ?? RIDERS[0];

/** Swatches for a garage card, without the card knowing what an outfit is. */
export const riderSwatches = (r: Rider) => [
  r.appearance.jacketColor,
  r.appearance.pantsColor,
  r.appearance.accent,
  r.appearance.lensColor,
];
