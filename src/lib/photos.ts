/**
 * Curated Unsplash photography for the design system demos. Three categories,
 * six slots each, so every channel/output card lands a real photograph that
 * fits the campaign's world (outdoor / editorial / b2b).
 *
 * All IDs are verified-stable Unsplash photo IDs. To swap any photo, update
 * the ID below — every consumer (CampaignFactory, StyleGuideTalksBack,
 * DesignSystemLab samples) will pick up the change automatically.
 */

export type PhotoCategory = "outdoor" | "editorial" | "b2b";
export type PhotoSlot =
  | "hero"
  | "portrait"
  | "story"
  | "feed"
  | "print"
  | "banner"
  | "extra";

const ID = {
  outdoor: {
    /** Backpack against rock face */
    hero: "1553062407-98eeb64c6a62",
    /** Hiker on path */
    portrait: "1551698618-1dfe5d97d256",
    /** Tent under starry sky */
    story: "1504280390367-361c6d9f38f4",
    /** Water bottle on rocks */
    feed: "1602143407151-7111542de6e8",
    /** Mountain range at dusk */
    print: "1464822759023-fed622ff2c3b",
    /** Mountain road / horizon */
    banner: "1486915309851-b0cc1f8a0084",
    /** Camp scene */
    extra: "1517823382935-51bfcb0ec6bc",
  },
  editorial: {
    /** Open book + coffee on table */
    hero: "1495640388908-05fa85288e61",
    /** Stack of books, side angle */
    portrait: "1543002588-bfa74002ed7e",
    /** Hand turning page, dramatic lighting */
    story: "1544716278-ca5e3f4abd8c",
    /** Coffee cup + journal */
    feed: "1481627834876-b7833e8f5570",
    /** Library shelves */
    print: "1507842217343-583bb7270b66",
    /** Typewriter close-up */
    banner: "1456513080510-7bf3a84b82f8",
    /** Bookshelf wide */
    extra: "1521587760476-6c12a4b040da",
  },
  b2b: {
    /** Dashboard analytics on laptop */
    hero: "1551288049-bebda4e38f71",
    /** Code editor screen */
    portrait: "1517694712202-14dd9538aa97",
    /** Server lights / data viz */
    story: "1518770660439-4636190af475",
    /** Abstract data points */
    feed: "1460925895917-afdab827c52f",
    /** Modern minimal laptop */
    print: "1498050108023-c5249f4df085",
    /** Office at night with screens */
    banner: "1497366216548-37526070297c",
    /** Tech workspace */
    extra: "1581091226825-a6a2a5aee158",
  },
} satisfies Record<PhotoCategory, Record<PhotoSlot, string>>;

/** Build a properly-sized Unsplash URL */
export function photoUrl(
  category: PhotoCategory,
  slot: PhotoSlot,
  width = 900,
): string {
  const id = ID[category][slot];
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=80&auto=format&fit=crop`;
}

/** Alt text for accessibility */
export function photoAlt(category: PhotoCategory, slot: PhotoSlot): string {
  const alts: Record<PhotoCategory, Record<PhotoSlot, string>> = {
    outdoor: {
      hero: "Backpack on rock face",
      portrait: "Hiking boots on trail",
      story: "Tent under starry sky",
      feed: "Water bottle on rocks",
      print: "Mountain range at dusk",
      banner: "Hiker with jacket on trail",
      extra: "Outdoor camp scene",
    },
    editorial: {
      hero: "Open book with coffee",
      portrait: "Stack of books",
      story: "Hand turning page",
      feed: "Coffee cup and journal",
      print: "Library shelves",
      banner: "Vintage typewriter",
      extra: "Bookshelf",
    },
    b2b: {
      hero: "Analytics dashboard on laptop",
      portrait: "Code editor screen",
      story: "Server data visualization",
      feed: "Abstract data points",
      print: "Modern laptop workspace",
      banner: "Office at night with screens",
      extra: "Tech workspace",
    },
  };
  return alts[category][slot];
}
