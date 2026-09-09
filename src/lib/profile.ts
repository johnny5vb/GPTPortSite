/**
 * Profile — single source of truth for identity, positioning, and contact.
 * Every component that renders a name, title, email, social link, or location
 * should import from here so the site stays internally consistent (no more
 * drift between Hero / About / Footer / ContactCTA).
 *
 * Posture is neutral: this is a portfolio for a working creative director and
 * the practice he runs, not a job search. There is deliberately no
 * availability field — the site describes what the work is, and does not
 * solicit. Don't reintroduce "open to", "available for", or "seeking" copy
 * without an explicit decision to reposition again.
 *
 * Positioning hierarchy (do not reorder without intent): John is a Creative
 * Director first, a brand + creative-operations leader second, and an
 * AI-enabled strategist third.
 */

export const PROFILE = {
  name: "John Carman",

  /** Ordered, most-senior-first. The site leads with roles[0]. */
  titles: [
    "Creative Director",
    "Brand & Creative Operations Leader",
    "AI-Enabled Creative Strategist",
  ],

  /** Short label used in tight spaces (nav, footer, meta). */
  titleShort: "Creative Director",
  /** Two-line positioning used in the footer + résumé header. */
  titleLine: "Creative Director · Brand and Creative Operations Leader",

  yearsExperience: 20,

  location: {
    base: "Virginia Beach, Virginia",
  },

  /** What the practice does. Descriptive, not an offer. */
  practice: "Brand, creative direction, and design systems",
  practiceLine: "Carman Creative — brand, creative direction, and design systems.",

  contact: {
    /**
     * Working address. Kept live because it actually receives mail.
     * TODO: Provision john@carmancreative.com and switch `email` to it, then
     * demote the Gmail address. Do not ship the custom-domain address until
     * the mailbox exists — a bouncing address is a credibility leak.
     */
    email: "johnbcarman@gmail.com",
    emailPreferredTodo: "john@carmancreative.com",
    linkedin: "https://www.linkedin.com/in/johncarman/",
    instagram: "https://www.instagram.com/jbcarms",
    instagramHandle: "@jbcarms",
  },

  /**
   * Résumé. No PDF is committed yet, so the site points at the on-page,
   * print-friendly résumé at /resume.
   * TODO: Add public/john-carman-resume.pdf and set `resumePdf`, then point
   * the download buttons at it.
   */
  resumeHref: "/resume",
  resumePdf: null as string | null,
} as const;

export type Profile = typeof PROFILE;
