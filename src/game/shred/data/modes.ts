/**
 * Game modes. Each one is a small set of rules layered on the same ride —
 * the physics never changes, only what the run is measuring.
 */

export type ModeId =
  | "freeride"
  | "timetrial"
  | "trickattack"
  | "bigair"
  | "slalom"
  | "endless"
  | "zen"
  | "daily";

export interface ModeDef {
  id: ModeId;
  name: string;
  tagline: string;
  blurb: string;
  /** Seconds. 0 = untimed. */
  duration: number;
  /** Metres to the finish. 0 = no finish line. */
  distance: number;
  /** Run ends after this many crashes. 0 = never. */
  crashLimit: number;
  /** Only the best N airs count (Big Air). */
  bestAirs: number;
  gates: boolean;
  showScore: boolean;
  showTimer: boolean;
  hud: "full" | "minimal" | "none";
  /** Scoreboard label for the primary result. */
  metric: "score" | "time" | "distance";
  cameraIntensity: number;
}

export const MODES: ModeDef[] = [
  {
    id: "freeride",
    name: "Free Ride",
    tagline: "No clock. No rules.",
    blurb:
      "The whole mountain, open. Ride until you feel like stopping. Everything you land still counts toward unlocks.",
    duration: 0,
    distance: 0,
    crashLimit: 0,
    bestAirs: 0,
    gates: false,
    showScore: true,
    showTimer: false,
    hud: "full",
    metric: "distance",
    cameraIntensity: 1,
  },
  {
    id: "timetrial",
    name: "Time Trial",
    tagline: "2 km. Straight down.",
    blurb:
      "Two kilometres to the finish. Tuck the straights, carve the transitions, and never scrub a turn you could have held.",
    duration: 0,
    distance: 2000,
    crashLimit: 0,
    bestAirs: 0,
    gates: false,
    showScore: false,
    showTimer: true,
    hud: "full",
    metric: "time",
    cameraIntensity: 1,
  },
  {
    id: "trickattack",
    name: "Trick Attack",
    tagline: "90 seconds. Go big.",
    blurb:
      "Ninety seconds to put up a number. Chain landings to keep the multiplier alive — the combo is worth more than any single trick.",
    duration: 90,
    distance: 0,
    crashLimit: 0,
    bestAirs: 0,
    gates: false,
    showScore: true,
    showTimer: true,
    hud: "full",
    metric: "score",
    cameraIntensity: 1.1,
  },
  {
    id: "bigair",
    name: "Big Air",
    tagline: "Three jumps. Best one counts.",
    blurb:
      "Three attempts off the biggest features you can find. Only your best air scores, so there's no reason not to throw it.",
    duration: 0,
    distance: 0,
    crashLimit: 0,
    bestAirs: 3,
    gates: false,
    showScore: true,
    showTimer: false,
    hud: "full",
    metric: "score",
    cameraIntensity: 1.25,
  },
  {
    id: "slalom",
    name: "Slalom",
    tagline: "Every gate, or else.",
    blurb:
      "Gates down the fall line. Miss one and it's two seconds. Clean runs get a flow bonus that stacks fast.",
    duration: 0,
    distance: 1800,
    crashLimit: 0,
    bestAirs: 0,
    gates: true,
    showScore: true,
    showTimer: true,
    hud: "full",
    metric: "time",
    cameraIntensity: 0.95,
  },
  {
    id: "endless",
    name: "Endless",
    tagline: "Until it ends you.",
    blurb:
      "The mountain keeps going and quietly gets meaner. Three crashes and the run is over. How far can you hold it together?",
    duration: 0,
    distance: 0,
    crashLimit: 3,
    bestAirs: 0,
    gates: false,
    showScore: true,
    showTimer: false,
    hud: "full",
    metric: "distance",
    cameraIntensity: 1,
  },
  {
    id: "zen",
    name: "Zen",
    tagline: "Just the mountain.",
    blurb:
      "No score, no timer, no HUD. Softer camera, quieter mix, longer light. Ride for the sake of riding.",
    duration: 0,
    distance: 0,
    crashLimit: 0,
    bestAirs: 0,
    gates: false,
    showScore: false,
    showTimer: false,
    hud: "none",
    metric: "distance",
    cameraIntensity: 0.55,
  },
  {
    id: "daily",
    name: "Daily Challenge",
    tagline: "One mountain. Everybody.",
    blurb:
      "The same seed for everyone, every day. Fixed mountain, fixed light, 1.5 km. One attempt is never enough.",
    duration: 0,
    distance: 1500,
    crashLimit: 0,
    bestAirs: 0,
    gates: false,
    showScore: true,
    showTimer: true,
    hud: "full",
    metric: "score",
    cameraIntensity: 1,
  },
];

export const modeById = (id: ModeId) =>
  MODES.find((m) => m.id === id) ?? MODES[0];
