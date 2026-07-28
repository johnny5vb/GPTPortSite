/**
 * Progression + settings, persisted to localStorage.
 *
 * Everything unlocks by playing. There is no currency and nothing to buy —
 * lifetime totals are the only gate, so any run always makes progress even if
 * the run itself went badly.
 */

import { RIDERS, type Unlock } from "../data/riders";
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
  unlocked: [
    "rider:kaz",
    "board:timber",
    "mountain:hollow-ridge",
    "sky:golden",
    "sky:bluebird",
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
  },
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
    "ember-pass": { kind: "runs", value: 3, label: "Finish 3 runs" },
    "glass-basin": { kind: "distance", value: 4000, label: "Ride 4 km total" },
    "north-cirque": { kind: "score", value: 100000, label: "Score 100,000 in a run" },
    "wolf-couloir": { kind: "tricks", value: 100, label: "Land 100 tricks" },
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
    { id: "dusk", name: "Alpenglow", req: { kind: "runs", value: 2, label: "Finish 2 runs" } },
    { id: "dawn", name: "First Chair", req: { kind: "distance", value: 2500, label: "Ride 2.5 km total" } },
    { id: "storm", name: "Whiteout", req: { kind: "crashes" as never, value: 10, label: "Crash 10 times" } as Unlock },
    { id: "night", name: "Northern Lights", req: { kind: "air", value: 3, label: "Hold a 3s air" } },
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
    kodachrome: { kind: "runs", value: 4, label: "Finish 4 runs" },
    sunset: { kind: "tricks", value: 40, label: "Land 40 tricks" },
    vhs: { kind: "runs", value: 10, label: "Finish 10 runs" },
    bleach: { kind: "distance", value: 9000, label: "Ride 9 km total" },
    noir: { kind: "score", value: 120000, label: "Score 120,000 in a run" },
    infra: { kind: "air", value: 5, label: "Hold a 5s air" },
    ps1: { kind: "tricks", value: 150, label: "Land 150 tricks" },
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
    { id: "endless", name: "Endless", req: { kind: "distance", value: 5000, label: "Ride 5 km total" } },
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
    requirement: { kind: "tricks", value: 80, label: "Land 80 tricks" },
  });
  out.push({
    key: "feature:retro",
    kind: "feature",
    name: "1999 Mode",
    requirement: { kind: "runs", value: 12, label: "Finish 12 runs" },
  });
  out.push({
    key: "feature:crt",
    kind: "feature",
    name: "CRT Filter",
    requirement: { kind: "score", value: 200000, label: "Score 200,000 in a run" },
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
    if (!raw) return structuredClone(DEFAULT);
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
