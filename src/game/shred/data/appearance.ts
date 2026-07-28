/**
 * What a rider *looks* like, kept completely separate from how they ride.
 *
 * The rig can't do realistic faces and never will — so the design leans the
 * other way and puts real snowboard kit in front of the hard parts. A helmet
 * covers the skull, goggles cover the eyes, a gaiter covers the mouth and jaw,
 * and what's left is silhouette, layering and colour, which procedural geometry
 * is actually good at. Every option below is either a piece of gear or a way of
 * breaking up the silhouette.
 *
 * `Appearance` is data only. `RiderRig` reads it, the character creator writes
 * it, and custom riders are stored as one of these in the save file.
 */

export type Build = "slim" | "regular" | "stocky";
export type HairStyle =
  | "none"
  | "buzz"
  | "short"
  | "shag"
  | "ponytail"
  | "braids"
  | "locs"
  | "bun"
  | "mohawk";
export type Headwear =
  | "none"
  | "helmet"
  | "visor-helmet"
  | "beanie"
  | "pom-beanie"
  | "hood"
  | "cap"
  | "bucket";
export type FaceGear = "none" | "gaiter" | "bandana" | "balaclava";
/** Only ever visible when nothing is covering the jaw. */
export type Beard = "none" | "stubble" | "moustache" | "goatee" | "full";
export type Eyewear = "none" | "sport" | "oversize" | "retro" | "shades";
export type JacketStyle = "puffy" | "shell" | "anorak" | "vest" | "onesie";
export type PantsStyle = "baggy" | "cargo" | "bib" | "slim";
export type HandsStyle = "gloves" | "mitts" | "gauntlets";
export type Accessory =
  | "none"
  | "scarf"
  | "backpack"
  | "camera"
  | "antenna"
  | "fanny";

export interface Appearance {
  build: Build;
  skin: string;

  hair: HairStyle;
  hairColor: string;

  /** Shares `hairColor` — a rider with black hair and a ginger beard reads as
   *  a bug rather than as a choice. */
  beard: Beard;

  headwear: Headwear;
  headwearColor: string;

  /** The single most useful option here — it hides the half of the face
   *  procedural geometry cannot sell. */
  face: FaceGear;
  faceColor: string;

  eyewear: Eyewear;
  lensColor: string;
  frameColor: string;

  jacket: JacketStyle;
  jacketColor: string;
  jacketAlt: string;

  pants: PantsStyle;
  pantsColor: string;

  hands: HandsStyle;
  handsColor: string;

  bootColor: string;
  /** Bindings, straps, trim. */
  accent: string;

  accessory: Accessory;
}

export const DEFAULT_LOOK: Appearance = {
  build: "regular",
  skin: "#c98d61",
  hair: "short",
  hairColor: "#2b1d14",
  beard: "none",
  headwear: "helmet",
  headwearColor: "#f7f3ec",
  face: "none",
  faceColor: "#1f2329",
  eyewear: "sport",
  lensColor: "#2ee5b3",
  frameColor: "#1a1a1a",
  jacket: "puffy",
  jacketColor: "#f24d3d",
  jacketAlt: "#f7f3ec",
  pants: "baggy",
  pantsColor: "#1c2a4a",
  hands: "mitts",
  handsColor: "#ffd23f",
  bootColor: "#191a1e",
  accent: "#ffd23f",
  accessory: "none",
};

export const look = (over: Partial<Appearance>): Appearance => ({
  ...DEFAULT_LOOK,
  ...over,
});

// ────────────────────────────────────────────────────── option catalogue ────

/** Everything the character creator can offer, with the copy it shows. */
export interface Option<T extends string> {
  id: T;
  label: string;
  /** Short note explaining what it does to the look. */
  note?: string;
}

export const BUILDS: Option<Build>[] = [
  { id: "slim", label: "Slim" },
  { id: "regular", label: "Regular" },
  { id: "stocky", label: "Stocky" },
];

export const HAIR: Option<HairStyle>[] = [
  { id: "none", label: "Shaved" },
  { id: "buzz", label: "Buzz" },
  { id: "short", label: "Short" },
  { id: "shag", label: "Shag" },
  { id: "ponytail", label: "Ponytail" },
  { id: "braids", label: "Braids" },
  { id: "locs", label: "Locs" },
  { id: "bun", label: "Top knot" },
  { id: "mohawk", label: "Mohawk" },
];

export const HEADWEAR: Option<Headwear>[] = [
  { id: "helmet", label: "Helmet" },
  { id: "visor-helmet", label: "Visor helmet", note: "Full-face shield" },
  { id: "beanie", label: "Beanie" },
  { id: "pom-beanie", label: "Pom beanie" },
  { id: "hood", label: "Hood up" },
  { id: "cap", label: "Cap" },
  { id: "bucket", label: "Bucket hat" },
  { id: "none", label: "Bare head" },
];

export const BEARDS: Option<Beard>[] = [
  { id: "none", label: "Clean" },
  { id: "stubble", label: "Stubble" },
  { id: "moustache", label: "Moustache" },
  { id: "goatee", label: "Goatee" },
  { id: "full", label: "Full beard" },
];

export const FACE: Option<FaceGear>[] = [
  { id: "none", label: "Nothing" },
  { id: "gaiter", label: "Neck gaiter" },
  { id: "bandana", label: "Bandana" },
  { id: "balaclava", label: "Balaclava" },
];

export const EYEWEAR: Option<Eyewear>[] = [
  { id: "sport", label: "Sport goggles" },
  { id: "oversize", label: "Oversize goggles" },
  { id: "retro", label: "Retro goggles" },
  { id: "shades", label: "Shades" },
  { id: "none", label: "Nothing" },
];

export const JACKETS: Option<JacketStyle>[] = [
  { id: "puffy", label: "Puffy", note: "Baffled down jacket" },
  { id: "shell", label: "Shell", note: "Clean technical cut" },
  { id: "anorak", label: "Anorak", note: "Half-zip pullover" },
  { id: "vest", label: "Vest", note: "Over a hoodie" },
  { id: "onesie", label: "One-piece", note: "Full retro suit" },
];

export const PANTS: Option<PantsStyle>[] = [
  { id: "baggy", label: "Baggy" },
  { id: "cargo", label: "Cargo" },
  { id: "bib", label: "Bibs" },
  { id: "slim", label: "Slim" },
];

export const HANDS: Option<HandsStyle>[] = [
  { id: "mitts", label: "Mitts" },
  { id: "gloves", label: "Gloves" },
  { id: "gauntlets", label: "Gauntlets" },
];

export const ACCESSORIES: Option<Accessory>[] = [
  { id: "none", label: "Nothing" },
  { id: "scarf", label: "Scarf" },
  { id: "backpack", label: "Backpack" },
  { id: "fanny", label: "Hip pack" },
  { id: "camera", label: "Camera" },
  { id: "antenna", label: "Antenna" },
];

// ───────────────────────────────────────────────────────────── palettes ────

export const SKIN_TONES = [
  "#f2d3b6",
  "#e8bd95",
  "#d3a077",
  "#c98d61",
  "#a9703f",
  "#8d5a3b",
  "#6f4a32",
  "#4e3324",
  "#7c8794", // synthetic
];

export const HAIR_COLORS = [
  "#151515",
  "#2b1d14",
  "#4a3020",
  "#8a5a2b",
  "#b9944f",
  "#f0e2c0",
  "#8a8a8a",
  "#f5f1e6",
  "#e5175f",
  "#2ee5b3",
  "#8f7bff",
  "#ff5a1f",
];

/** Gear colours. Deliberately saturated — this is a snowboard game. */
export const GEAR_COLORS = [
  "#f24d3d",
  "#ff5a1f",
  "#ffd23f",
  "#b6ff3d",
  "#39c46e",
  "#1cb791",
  "#2ee5b3",
  "#3ee7ff",
  "#3f7fb8",
  "#1b2440",
  "#8f7bff",
  "#e5175f",
  "#ff5ea8",
  "#f7f3ec",
  "#c9d4dd",
  "#8a8a8a",
  "#3c3f46",
  "#141414",
];

export const LENS_COLORS = [
  "#2ee5b3",
  "#ffd23f",
  "#ff8a3d",
  "#ff5ea8",
  "#8f7bff",
  "#3ee7ff",
  "#f2f2f2",
  "#1a1a1a",
];

// ─────────────────────────────────────────────────────────── randomiser ────

const pick = <T>(arr: readonly T[], r: () => number) =>
  arr[Math.floor(r() * arr.length) % arr.length];

/**
 * A random look that still reads as a deliberate outfit: the palette is drawn
 * from one of a few coordinated schemes rather than from pure noise, because
 * fully random colour combinations look like a bug, not a character.
 */
export function randomAppearance(rand: () => number = Math.random): Appearance {
  const schemes: [string, string, string][] = [
    ["#f24d3d", "#f7f3ec", "#ffd23f"],
    ["#1b2440", "#3ee7ff", "#f7f3ec"],
    ["#141414", "#e5175f", "#ff8a3d"],
    ["#b6ff3d", "#141414", "#ff5ea8"],
    ["#f7f3ec", "#8f7bff", "#ffd23f"],
    ["#3f5f4a", "#d8cbb0", "#e8a33d"],
    ["#ff5a1f", "#141a20", "#ffd23f"],
    ["#c9d4dd", "#e2705a", "#3c3f46"],
    ["#1cb791", "#0f1418", "#2ee5b3"],
  ];
  const [main, alt, accent] = pick(schemes, rand);
  const headwear = pick(HEADWEAR, rand).id;
  // Cover the face more often than not — it flatters the rig.
  const face = rand() < 0.62 ? pick(FACE.slice(1), rand).id : "none";
  return {
    build: pick(BUILDS, rand).id,
    skin: pick(SKIN_TONES, rand),
    hair: pick(HAIR, rand).id,
    hairColor: pick(HAIR_COLORS, rand),
    // Anything over the jaw hides it, so don't spend the roll there.
    beard: face === "none" && rand() < 0.45 ? pick(BEARDS.slice(1), rand).id : "none",
    headwear,
    headwearColor: rand() < 0.5 ? main : alt,
    face,
    faceColor: rand() < 0.5 ? "#1f2329" : accent,
    eyewear: headwear === "visor-helmet" ? "none" : pick(EYEWEAR.slice(0, 4), rand).id,
    lensColor: pick(LENS_COLORS, rand),
    frameColor: rand() < 0.6 ? "#1a1a1a" : accent,
    jacket: pick(JACKETS, rand).id,
    jacketColor: main,
    jacketAlt: alt,
    pants: pick(PANTS, rand).id,
    pantsColor: rand() < 0.6 ? "#2b2f36" : alt,
    hands: pick(HANDS, rand).id,
    handsColor: accent,
    bootColor: "#191a1e",
    accent,
    accessory: rand() < 0.55 ? pick(ACCESSORIES, rand).id : "none",
  };
}
