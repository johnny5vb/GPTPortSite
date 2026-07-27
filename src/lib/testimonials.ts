/**
 * Testimonials / references.
 *
 * HARD RULE: never invent a testimonial. Only entries with `verified: true`
 * render (see Testimonials.tsx), and quotes are stored exactly as the person
 * gave them — no tightening, no paraphrasing, no invented attributions. Where
 * someone is credited by first name and initial, that is their choice; don't
 * "complete" it.
 */

export type Testimonial = {
  /** The quote, verbatim. */
  quote: string;
  /** Attribution — name, or role/relationship if the name is withheld. */
  author: string;
  /** Company / context. */
  role?: string;
  /** Only verified quotes render. Placeholders stay false and never publish. */
  verified: boolean;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "John didn’t just design our brand—he helped bring our story to life. From our logo to our coffee bag labels, every detail feels intentional, authentic, and distinctly Colony. His ability to blend history, artistry, and modern branding gave us a look that truly stands out and connects with our customers.",
    author: "Todd Mills",
    role: "Owner, Colony Coffee Company",
    verified: true,
  },
  {
    quote:
      "John has an exceptional ability to translate vision into brand. From launching my firm to evolving our marketing over the years, his work has consistently elevated our presence, credibility, and growth. He’s not just a designer—he’s a true creative partner I trust completely.",
    author: "Harry J. Brown, Esq.",
    role: "Founder, Brown Estate Planning",
    verified: true,
  },
  {
    quote:
      "I’ve partnered with John on projects for many years, and he consistently brings smart thinking, strong creative direction, and a deep understanding of how design and development work together. He’s thoughtful in his approach, clear in his communication, and always focused on building solutions that are both beautiful and functional. John is the kind of creative partner you trust on complex projects.",
    author: "Josh H.",
    role: "Web Developer",
    verified: true,
  },
  {
    quote:
      "John’s work is always fresh and engaging. He designs thoughtful brand work and continually refines it—and he’s also a great videographer. If you want to work with a true professional, give him a call.",
    author: "Brenda W.",
    role: "Senior Communications Specialist",
    verified: true,
  },
];

export const PUBLISHED_TESTIMONIALS = TESTIMONIALS.filter((t) => t.verified);
