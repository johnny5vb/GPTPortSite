/**
 * Testimonials / references. Reusable data structure so quotes can appear on
 * the Leadership and About pages once they exist.
 *
 * HARD RULE: never invent a testimonial. Only entries with `verified: true`
 * are rendered (see Testimonials.tsx). The list below is intentionally empty
 * of published quotes — the TODOs record the sources to collect, but nothing
 * ships to the live site until a real, attributable quote is confirmed.
 *
 * TODO: Add verified testimonial from a former direct report.
 * TODO: Add verified testimonial from an executive / senior stakeholder.
 * TODO: Add verified testimonial from a marketing partner or PM.
 * TODO: Add verified testimonial from a freelance/agency client or vendor.
 */

export type Testimonial = {
  /** The quote. */
  quote: string;
  /** Attribution — name, or role/relationship if the name is withheld. */
  author: string;
  /** Company / context. */
  role?: string;
  /** Only verified quotes render. Placeholders stay false and never publish. */
  verified: boolean;
};

export const TESTIMONIALS: Testimonial[] = [
  // Add verified entries here, e.g.:
  // { quote: "…", author: "…", role: "…", verified: true },
];

export const PUBLISHED_TESTIMONIALS = TESTIMONIALS.filter((t) => t.verified);
