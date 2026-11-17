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
 * Positioning hierarchy (do not reorder without intent): John is a creative
 * leader first, a brand + creative-operations leader second, and an
 * AI-enabled strategist third.
 */

export const PROFILE = {
  name: "John Carman",

  /** Ordered, most-senior-first. The site leads with roles[0]. */
  titles: [
    "Creative leader",
    "Brand & creative operations",
    "AI-enabled creative strategy",
  ],

  /** THE RULE (Nov 16 2026, supersedes #81): the label is "Creative leader".
   *  It describes the work and is true of every role held, so it needs no
   *  title to defend. "Creative Director" appears only as a title that was
   *  held (Beacon 2018 to 2023) and as Founder & Creative Director of
   *  Carman Creative. Elevance stays Design Manager. LinkedIn headline uses
   *  the same wording. */
  titleShort: "Creative leader",
  /** Two-line positioning used in the footer + résumé header. */
  titleLine: "Creative leader / Brand and creative operations",

  yearsExperience: 20,

  location: {
    base: "Virginia Beach, Virginia",
  },

  /** What the practice does. Descriptive, not an offer. */
  practice: "Brand, creative direction, and design systems",
  practiceLine: "Carman Creative: brand, creative direction, and design systems.",

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
   * Résumé. `resumeHref` stays the on-page version: it is the one that reads
   * well on a phone and carries live links.
   *
   * `resumePdf` is a real file now, printed from /resume itself so the two can
   * never say different things. Regenerate it whenever career.ts changes:
   *   npm run build && npx next start -p 8899
   *   chrome --headless --no-pdf-header-footer \
   *     --print-to-pdf=public/john-carman-resume.pdf http://localhost:8899/resume
   * A recruiter or an applicant-tracking system that asks for a file wants a
   * file, not a URL and an instruction to press Cmd-P.
   */
  resumeHref: "/resume",
  resumePdf: "/john-carman-resume.pdf" as string | null,
} as const;

export type Profile = typeof PROFILE;
