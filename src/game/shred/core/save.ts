/**
 * Progression + settings, persisted to localStorage.
 *
 * Everything unlocks by playing. There is no currency and nothing to buy —
 * lifetime totals are the only gate, so any run always makes progress even if
 * the run itself went badly.
 */

import { RIDERS, type CustomRider, type Unlock } from "../data/riders";
import { BOARDS } from "../data/boards";
import { MOUNTAINS } from "../world/TerrainGen";
import { TRACKS } from "../audio/Audio";
import { FILTERS } from "../fx/PostFX";
import type { ModeId } from "../data/modes";

const KEY = "shred1999.save.v1";

export interface Totals {
  runs: number;
  distance: number;
  tricks: number;
  perfects: number;
  crashes: number;
  bestScore: number;
  bestAir: number;
  bestTrick: number;
  topSpeed: number;
  lifetimeScore: number;
}

export interface Settings {
  music: number;
  sfx: number;
  shake: number;
  quality: "low" | "medium" | "high" | "ultra";
  retro: boolean;
  crt: boolean;
  invertSteer: boolean;
  showHints: boolean;
  /** On-screen controls: follow the device, or force them on/off. */
  touch: "auto" | "on" | "off";
}

/**
 * First-run quality guess. Phones and tablets start at medium (or low on
 * anything that looks weak) so the first thirty seconds are smooth; the
 * adaptive resolution and the settings screen take it from there.
 */
export function defaultQuality(): Settings["quality"] {
  if (typeof window === "undefined") return "high";
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? (coarse ? 4 : 8);
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 500;

  if (coarse || smallScreen) {
    return cores <= 4 || memory <= 3 ? "low" : "medium";
  }
  return cores <= 4 || memory <= 4 ? "medium" : "high";
}

export interface SaveData {
  version: number;
  totals: Totals;
  unlocked: string[];
  selected: {
    rider: string;
    board: string;
    mountain: string;
    sky: string;
    track: string;
    filter: string;
  };
  settings: Settings;
  /** Riders built in the character creator. Always available — you made them. */
  customRiders: CustomRider[];
  best: Record<string, number>;
  bestTime: Record<string, number>;
  dailySeed: string;
  dailyBest: number;
}

const DEFAULT: SaveData = {
  version: 1,
  totals: {
    runs: 0,
    distance: 0,
    tricks: 0,
    perfects: 0,
    crashes: 0,
    bestScore: 0,
    bestAir: 0,
    bestTrick: 0,
    topSpeed: 0,
    lifetimeScore: 0,
  },
  /**
   * The starter set. Deliberately generous: a game whose whole pitch is a
   * quiver reads as a game with one board if you have to earn the second one,
   * so day one opens with four riders, five decks and three mountains that
   * genuinely ride differently. The remaining two thirds are the progression.
   */
  unlocked: [
    "rider:kaz",
    "rider:vex",
    "rider:rin",
    "rider:solve",
    "board:timber",
    "board:radical",
    "board:checker",
    "board:blackout",
    "board:painted",
    // Five starters, not three. The mountain is the thing a player gets sick
    // of first, and the unlock ladder was gating variety behind exactly the
    // repetition it causes. If you add a mountain, decide explicitly whether
    // it is a starter or a reward — the default should not be to lock it.
    "mountain:hollow-ridge",
    "mountain:long-meadow",
    "mountain:ember-pass",
    "mountain:glass-basin",
    "mountain:sawtooth",
    "sky:golden",
    "sky:bluebird",
    "sky:dusk",
    "track:neon-descent",
    "track:powder-days",
    "filter:none",
    "mode:freeride",
    "mode:timetrial",
    "mode:trickattack",
    "mode:zen",
  ],
  selected: {
    rider: "kaz",
    board: "timber",
    mountain: "hollow-ridge",
    sky: "golden",
    track: "neon-descent",
    filter: "none",
  },
  settings: {
    music: 0.55,
    sfx: 0.85,
    shake: 1,
    quality: "high",
    retro: false,
    crt: false,
    invertSteer: false,
    showHints: true,
    touch: "auto",
  },
  customRiders: [],
  best: {},
  bestTime: {},
  dailySeed: "",
  dailyBest: 0,
};

export interface UnlockDef {
  key: string;
  kind: "rider" | "board" | "mountain" | "sky" | "track" | "filter" | "mode" | "feature";
  name: string;
  requirement: Unlock;
}

/** The whole unlock table, derived from the content data where possible. */
export function unlockTable(): UnlockDef[] {
  const out: UnlockDef[] = [];
  for (const r of RIDERS)
    out.push({
      key: `rider:${r.id}`,
      kind: "rider",
      name: r.name,
      requirement: r.unlock,
    });
  for (const b of BOARDS)
    out.push({
      key: `board:${b.id}`,
      kind: "board",
      name: b.name,
      requirement: b.unlock,
    });

  const mountainReq: Record<string, Unlock> = {
    "hollow-ridge": { kind: "default", value: 0, label: "Starter" },
    "long-meadow": { kind: "default", value: 0, label: "Starter" },
    "ember-pass": { kind: "default", value: 0, label: "Starter" },
    "glass-basin": { kind: "default", value: 0, label: "Starter" },
    sawtooth: { kind: "default", value: 0, label: "Starter" },
    "north-cirque": { kind: "runs", value: 3, label: "Finish 3 runs" },
    "midnight-mile": { kind: "tricks", value: 30, label: "Land 30 tricks" },
    "wolf-couloir": { kind: "score", value: 40000, label: "Score 40,000 in a run" },
  };
  for (const m of MOUNTAINS)
    out.push({
      key: `mountain:${m.id}`,
      kind: "mountain",
      name: m.name,
      requirement: mountainReq[m.id] ?? { kind: "runs", value: 5, label: "Finish 5 runs" },
    });

  const skyReq: { id: string; name: string; req: Unlock }[] = [
    { id: "golden", name: "Golden Hour", req: { kind: "default", value: 0, label: "Starter" } },
    { id: "bluebird", name: "Bluebird", req: { kind: "default", value: 0, label: "Starter" } },
    { id: "dusk", name: "Alpenglow", req: { kind: "default", value: 0, label: "Starter" } },
    { id: "dawn", name: "First Chair", req: { kind: "runs", value: 2, label: "Finish 2 runs" } },
    { id: "storm", name: "Whiteout", req: { kind: "crashes" as never, value: 6, label: "Crash 6 times" } as Unlock },
    { id: "night", name: "Northern Lights", req: { kind: "air", value: 2.5, label: "Hold a 2.5s air" } },
  ];
  for (const s of skyReq)
    out.push({ key: `sky:${s.id}`, kind: "sky", name: s.name, requirement: s.req });

  for (const t of TRACKS)
    out.push({
      key: `track:${t.id}`,
      kind: "track",
      name: t.name,
      requirement:
        t.unlockScore === 0
          ? { kind: "default", value: 0, label: "Starter" }
          : { kind: "score", value: t.unlockScore, label: `Score ${t.unlockScore.toLocaleString()} in a run` },
    });

  const filterReq: Record<string, Unlock> = {
    none: { kind: "default", value: 0, label: "Starter" },
    kodachrome: { kind: "runs", value: 3, label: "Finish 3 runs" },
    sunset: { kind: "tricks", value: 20, label: "Land 20 tricks" },
    vhs: { kind: "runs", value: 7, label: "Finish 7 runs" },
    bleach: { kind: "distance", value: 6000, label: "Ride 6 km total" },
    noir: { kind: "score", value: 70000, label: "Score 70,000 in a run" },
    infra: { kind: "air", value: 4, label: "Hold a 4s air" },
    ps1: { kind: "tricks", value: 100, label: "Land 100 tricks" },
  };
  for (const f of FILTERS)
    out.push({
      key: `filter:${f.id}`,
      kind: "filter",
      name: f.name,
      requirement: filterReq[f.id] ?? { kind: "runs", value: 5, label: "Finish 5 runs" },
    });

  const modeReq: { id: ModeId; name: string; req: Unlock }[] = [
    { id: "freeride", name: "Free Ride", req: { kind: "default", value: 0, label: "Starter" } },
    { id: "timetrial", name: "Time Trial", req: { kind: "default", value: 0, label: "Starter" } },
    { id: "trickattack", name: "Trick Attack", req: { kind: "default", value: 0, label: "Starter" } },
    { id: "zen", name: "Zen", req: { kind: "default", value: 0, label: "Starter" } },
    { id: "bigair", name: "Big Air", req: { kind: "runs", value: 2, label: "Finish 2 runs" } },
    { id: "slalom", name: "Slalom", req: { kind: "runs", value: 5, label: "Finish 5 runs" } },
    { id: "endless", name: "Endless", req: { kind: "distance", value: 4000, label: "Ride 4 km total" } },
    { id: "daily", name: "Daily Challenge", req: { kind: "runs", value: 3, label: "Finish 3 runs" } },
  ];
  for (const m of modeReq)
    out.push({ key: `mode:${m.id}`, kind: "mode", name: m.name, requirement: m.req });

  out.push({
    key: "feature:photo",
    kind: "feature",
    name: "Photo Mode",
    requirement: { kind: "runs", value: 2, label: "Finish 2 runs" },
  });
  out.push({
    key: "feature:specials",
    kind: "feature",
    name: "Signature Tricks",
    requirement: { kind: "tricks", value: 40, label: "Land 40 tricks" },
  });
  out.push({
    key: "feature:retro",
    kind: "feature",
    name: "1999 Mode",
    requirement: { kind: "runs", value: 8, label: "Finish 8 runs" },
  });
  out.push({
    key: "feature:crt",
    kind: "feature",
    name: "CRT Filter",
    requirement: { kind: "score", value: 110000, label: "Score 110,000 in a run" },
  });

  return out;
}

function meets(req: Unlock, t: Totals) {
  switch (req.kind) {
    case "default":
      return true;
    case "score":
      return t.bestScore >= req.value;
    case "distance":
      return t.distance >= req.value;
    case "tricks":
      return t.tricks >= req.value;
    case "air":
      return t.bestAir >= req.value;
    case "runs":
      return t.runs >= req.value;
    default:
      // "crashes" is smuggled in for the Whiteout preset.
      return (t as unknown as Record<string, number>)[req.kind] >= req.value;
  }
}

export function load(): SaveData {
  if (typeof window === "undefined") return structuredClone(DEFAULT);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const fresh = structuredClone(DEFAULT);
      fresh.settings.quality = defaultQuality();
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...structuredClone(DEFAULT),
      ...parsed,
      totals: { ...DEFAULT.totals, ...(parsed.totals ?? {}) },
      settings: { ...DEFAULT.settings, ...(parsed.settings ?? {}) },
      selected: { ...DEFAULT.selected, ...(parsed.selected ?? {}) },
      unlocked: Array.from(
        new Set([...DEFAULT.unlocked, ...(parsed.unlocked ?? [])]),
      ),
      customRiders: parsed.customRiders ?? [],
      best: { ...(parsed.best ?? {}) },
      bestTime: { ...(parsed.bestTime ?? {}) },
    };
  } catch {
    return structuredClone(DEFAULT);
  }
}

export function save(data: SaveData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full or blocked — the run still works, it just won't persist */
  }
}

/** Re-evaluates the whole unlock table; returns the keys newly earned. */
export function evaluateUnlocks(data: SaveData): UnlockDef[] {
  const table = unlockTable();
  const owned = new Set(data.unlocked);
  const fresh: UnlockDef[] = [];
  for (const u of table) {
    if (owned.has(u.key)) continue;
    if (meets(u.requirement, data.totals)) {
      owned.add(u.key);
      fresh.push(u);
    }
  }
  data.unlocked = [...owned];
  return fresh;
}

export function isUnlocked(data: SaveData, key: string) {
  return data.unlocked.includes(key);
}

export function todaySeedString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function resetSave(): SaveData {
  const d = structuredClone(DEFAULT);
  save(d);
  return d;
}
