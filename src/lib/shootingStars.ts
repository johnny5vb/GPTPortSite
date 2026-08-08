/**
 * The Shooting Stars — content source of truth for the band microsite at
 * /shooting-stars.
 *
 * Everything the site says about the band lives here so copy, lineup, tour
 * dates and releases can be edited without touching a component. Names,
 * dates and venues are placeholders written to look like a real touring
 * band's — swap them for the real thing.
 */

export const BAND = {
  name: "The Shooting Stars",
  /** Used in the logo lockup and the circular badge. */
  shortName: "Shooting Stars",
  formed: 2024,
  hometown: "Virginia Beach, VA",
  tagline: "Four kids, one garage, and a very patient set of neighbors.",
  /** One-sentence hero sub. Keep it under ~140 characters. */
  intro:
    "A four-piece rock band out of Virginia Beach playing loud, fast, hook-first songs about the summer not ending.",
  genre: "Garage rock / power pop",
  bookingEmail: "booking@theshootingstars.band",
  listEmail: "list@theshootingstars.band",
} as const;

export type Social = {
  label: string;
  handle: string;
  href: string;
};

export const SOCIALS: Social[] = [
  { label: "Instagram", handle: "@theshootingstars", href: "#" },
  { label: "YouTube", handle: "/theshootingstars", href: "#" },
  { label: "Spotify", handle: "The Shooting Stars", href: "#" },
  { label: "Bandcamp", handle: "theshootingstars", href: "#" },
];

export type Member = {
  name: string;
  role: string;
  /** Initials drive the duotone portrait plate. Keep to 1–2 characters. */
  initials: string;
  /** Shown on hover / focus. Keep it short and human. */
  note: string;
  /** Index into the accent rotation: 0 gold, 1 ember, 2 violet. */
  accent: 0 | 1 | 2;
};

export const MEMBERS: Member[] = [
  {
    name: "Nico Vance",
    role: "Vocals / Rhythm Guitar",
    initials: "NV",
    note: "Writes most of the words. Loses most of the picks.",
    accent: 0,
  },
  {
    name: "Ruby Okafor",
    role: "Lead Guitar",
    initials: "RO",
    note: "Learned the solo from ‘Supernova’ in one afternoon. Allegedly.",
    accent: 1,
  },
  {
    name: "Theo Marsh",
    role: "Bass",
    initials: "TM",
    note: "The reason the songs stay under three minutes.",
    accent: 2,
  },
  {
    name: "Junie Park",
    role: "Drums",
    initials: "JP",
    note: "Counts everything in too fast. Nobody has asked her to stop.",
    accent: 0,
  },
];

export type Release = {
  title: string;
  kind: "Album" | "EP" | "Single";
  year: number;
  /** Which procedural cover to render — see AlbumArt.tsx. */
  art: "comet" | "eclipse" | "orbit" | "signal";
  blurb: string;
  tracks: { title: string; length: string }[];
};

/** Newest first. The first entry is featured at the top of the Music section. */
export const RELEASES: Release[] = [
  {
    title: "Supernova",
    kind: "Single",
    year: 2026,
    art: "comet",
    blurb:
      "Recorded in one Sunday afternoon with the garage door open. The mic picked up a lawnmower two houses down and we kept it.",
    tracks: [
      { title: "Supernova", length: "3:12" },
      { title: "Supernova (Garage Take)", length: "3:41" },
    ],
  },
  {
    title: "Nightswimming Hours",
    kind: "EP",
    year: 2025,
    art: "eclipse",
    blurb:
      "Five songs about the two weeks between the last day of school and the first day everything felt different.",
    tracks: [
      { title: "Nightswimming Hours", length: "2:58" },
      { title: "Boardwalk Teeth", length: "3:24" },
      { title: "Static on 264", length: "2:41" },
      { title: "Cheap Reverb", length: "4:02" },
      { title: "Come Back Loud", length: "3:15" },
    ],
  },
  {
    title: "Small Town Satellite",
    kind: "Single",
    year: 2025,
    art: "orbit",
    blurb:
      "The first thing we ever put on the internet. It has 41,000 plays and we still do not know who most of you are.",
    tracks: [
      { title: "Small Town Satellite", length: "3:33" },
      { title: "Antenna", length: "2:19" },
    ],
  },
  {
    title: "Demos From The Driveway",
    kind: "EP",
    year: 2024,
    art: "signal",
    blurb:
      "Four songs, one phone, zero budget. Left up on purpose so you can hear where this started.",
    tracks: [
      { title: "Driveway", length: "2:47" },
      { title: "Bad Weather Friend", length: "3:06" },
      { title: "Halfpipe", length: "2:12" },
      { title: "Everything Is Fine And I Am Normal", length: "3:58" },
    ],
  },
];

export type ShowStatus = "tickets" | "few-left" | "sold-out" | "past";

export type Show = {
  /** ISO date — drives both the display and the sort order. */
  date: string;
  city: string;
  region: string;
  venue: string;
  status: ShowStatus;
  /** Support slot, festival name, etc. Optional. */
  note?: string;
  href?: string;
};

/** Chronological. Past shows render greyed out under a "played" divider. */
export const SHOWS: Show[] = [
  {
    date: "2026-03-14",
    city: "Norfolk",
    region: "VA",
    venue: "The Nowhere Room",
    status: "past",
    note: "First headline show",
  },
  {
    date: "2026-05-02",
    city: "Richmond",
    region: "VA",
    venue: "Cousins Social Club",
    status: "past",
  },
  {
    date: "2026-06-21",
    city: "Virginia Beach",
    region: "VA",
    venue: "17th Street Stage",
    status: "past",
    note: "Boardwalk Summer Series",
  },
  {
    date: "2026-08-29",
    city: "Virginia Beach",
    region: "VA",
    venue: "The Oceanfront Pavilion",
    status: "few-left",
    note: "Record release show",
  },
  {
    date: "2026-09-12",
    city: "Chesapeake",
    region: "VA",
    venue: "Greenbrier Hall",
    status: "tickets",
  },
  {
    date: "2026-09-27",
    city: "Richmond",
    region: "VA",
    venue: "The Broadberry",
    status: "sold-out",
    note: "w/ The Long Weekends",
  },
  {
    date: "2026-10-10",
    city: "Washington",
    region: "DC",
    venue: "Comet Ping Pong",
    status: "tickets",
  },
  {
    date: "2026-10-24",
    city: "Philadelphia",
    region: "PA",
    venue: "Johnny Brenda’s",
    status: "tickets",
  },
  {
    date: "2026-11-08",
    city: "Brooklyn",
    region: "NY",
    venue: "Baby’s All Right",
    status: "few-left",
    note: "Late show, 18+",
  },
  {
    date: "2026-11-22",
    city: "Asbury Park",
    region: "NJ",
    venue: "The Saint",
    status: "tickets",
  },
];

export type Quote = {
  text: string;
  source: string;
};

export const PRESS: Quote[] = [
  {
    text: "Louder than a four-piece this age has any right to be.",
    source: "Tidewater Sound Weekly",
  },
  {
    text: "Every song ends about ten seconds before you want it to. That is the whole trick.",
    source: "Coastal College Radio",
  },
  {
    text: "The best band currently playing in a garage on Holly Road.",
    source: "Their next-door neighbor",
  },
  {
    text: "Hooks like a power-pop record your parents would lie about owning.",
    source: "Basement Tapes Blog",
  },
  {
    text: "They played for forty minutes and nobody sat down.",
    source: "The Broadberry, Richmond",
  },
];

export type Stat = {
  value: string;
  label: string;
};

export const STATS: Stat[] = [
  { value: "38", label: "Shows played" },
  { value: "412", label: "Hours in the garage" },
  { value: "9", label: "Songs released" },
  { value: "3", label: "Amps retired" },
];

/** Scrolling ticker copy for the hero and the footer. */
export const TICKER = [
  "New single ‘Supernova’ out now",
  "Fall tour on sale",
  "Record release show — Aug 29 — Virginia Beach",
  "Est. 2024",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Formats an ISO date without `new Date()` so the server and client always
 * agree — parsing a bare `YYYY-MM-DD` is UTC while rendering is local, which
 * is exactly the kind of off-by-one-day that causes hydration mismatches.
 */
export function showDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return {
    month: MONTHS[month - 1] ?? "",
    day: String(day).padStart(2, "0"),
    year: String(year),
  };
}

export const STATUS_LABEL: Record<ShowStatus, string> = {
  tickets: "Tickets",
  "few-left": "Few left",
  "sold-out": "Sold out",
  past: "Played",
};
