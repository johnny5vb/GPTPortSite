/**
 * Project data — single source of truth for both the Work list and the
 * individual /work/[slug] pages.
 *
 * Content quotes are verbatim from carmancreative.com (Apr 2026 capture).
 * Images live in /public/work/{slug}/.
 */

export type ProjectImage = {
  src: string;
  alt: string;
  /** Tailwind aspect class — defaults to aspect-[4/3] when omitted */
  aspect?: string;
};

export type Project = {
  slug: string;
  num: string;
  title: string;
  client: string;
  year: string;
  category: string;
  duration: string;
  tags: string[];
  blurb: string;
  /** Short tag-line shown on the project hero */
  oneLiner: string;
  brief: string;
  process: {
    label: string;
    body: string;
  }[];
  services: string[];
  palette: string[];
  display: string;
  /** Cover/hero image relative to /public */
  cover: string;
  gallery: ProjectImage[];
  externalUrl?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "colony-coffee",
    num: "01",
    title: "Colony Coffee Co.",
    client: "Colony Coffee — Todd Mills",
    year: "2025",
    category: "Product / Brand Design",
    duration: "8 weeks",
    tags: ["Brand", "Packaging", "Product"],
    blurb:
      "Brand identity and product design for a craft coffee company. Mark, packaging system, and an in-store toolkit built to scale from one roaster to a small chain.",
    oneLiner:
      "A craft coffee brand rooted in quality, community, and tradition.",
    brief:
      "Colony Coffee Co. is a craft coffee brand rooted in quality, community, and tradition. We were asked to build a flexible visual and digital foundation that could support branding, packaging, and future growth while maintaining a refined, approachable tone.",
    process: [
      {
        label: "Research",
        body: "Research explored the specialty coffee landscape, regional competitors, and brand positioning — identifying where Colony could earn loyalty without leaning on category clichés.",
      },
      {
        label: "Design",
        body: "Design emphasized clarity, hierarchy, and restraint — creating an experience that feels credible, approachable, and easy to navigate.",
      },
      {
        label: "Development",
        body: "Digital execution emphasized simplicity, performance, and flexibility — a system the team can extend as they add SKUs, locations, and channels.",
      },
    ],
    services: [
      "Brand identity",
      "Web design",
      "Packaging",
      "AI-powered creative systems",
    ],
    palette: ["#1a120a", "#c98a4b", "#e8d6b3", "#f6efe2"],
    display: "COLONY",
    cover: "/work/colony-coffee/cover.png",
    gallery: [
      { src: "/work/colony-coffee/gallery-1.jpg", alt: "Colony Coffee — packaging system" },
      { src: "/work/colony-coffee/gallery-2.png", alt: "Colony Coffee — brand application" },
      { src: "/work/colony-coffee/gallery-3.png", alt: "Colony Coffee — identity detail" },
    ],
    externalUrl: "https://www.carmancreative.com/work/colonycoffee",
  },
  {
    slug: "friends-rehab",
    num: "02",
    title: "Friends Rehabilitation Program",
    client: "Friends Rehabilitation Program (FRP)",
    year: "2025",
    category: "Health & Human Services / Web Design",
    duration: "6 weeks",
    tags: ["Web", "Brand", "CMS"],
    blurb:
      "A digital home for a long-running rehabilitation nonprofit. Calm, clear, donor-ready — built so staff can update content without a designer in the loop.",
    oneLiner:
      "A calm, supportive digital experience that prioritizes clarity and reassurance.",
    brief:
      "The website refresh centered on clarity, accessibility, and trust — making it easier to understand services, find resources, and take next steps.",
    process: [
      {
        label: "Research",
        body: "Research focused on understanding the needs of individuals seeking treatment, their families, and referral partners.",
      },
      {
        label: "Concept",
        body: "The concept centered on creating a calm, supportive digital experience that prioritizes clarity and reassurance.",
      },
      {
        label: "Design",
        body: "Design emphasized readability, approachable typography, and a restrained visual system to support emotional ease.",
      },
      {
        label: "Development",
        body: "The site was developed with accessibility, performance, and maintainability in mind — ensuring reliable performance across devices.",
      },
    ],
    services: [
      "Brand identity",
      "Web design",
      "Content strategy",
      "AI-powered creative systems",
    ],
    palette: ["#0e2b3a", "#3a6b7a", "#cbd9d5", "#f4f1ea"],
    display: "FRP",
    cover: "/work/friends-rehab/frp-hero.png",
    gallery: [
      {
        src: "/work/friends-rehab/frp-purpose.png",
        alt: "FRP website — Our purpose is the people we serve, with Our Programs section",
      },
      {
        src: "/work/friends-rehab/frp-housewarming.png",
        alt: "FRP website — The Housewarming Fund page",
      },
      {
        src: "/work/friends-rehab/frp-homeless.png",
        alt: "FRP website — Homeless Services Program page",
      },
    ],
    externalUrl: "https://www.carmancreative.com/work/frp",
  },
  {
    slug: "harrison-bounds",
    num: "03",
    title: "Harrison Bounds",
    client: "Harrison Bounds",
    year: "2024",
    category: "Music / Graphic Design",
    duration: "6 weeks",
    tags: ["Identity", "Poster", "Signage"],
    blurb:
      "Gig banner system for a solo live performer — visual identity tuned for high-energy, low-light performance spaces.",
    oneLiner:
      "Active extensions of Harrison's stage presence — built for working musicians.",
    brief:
      "Harrison Bounds is a solo live performer who relies on high-visibility signage to attract attention, drive traffic, and increase tips. This project wasn't about decorative posters — it was about creating working tools for a working musician.",
    process: [
      {
        label: "Approach",
        body: "Rather than treating the banners as background décor, they were designed as active extensions of Harrison's stage presence.",
      },
      {
        label: "Direction",
        body: "The final banner designs use a bold, modern poster style built for high-energy, low-light performance spaces.",
      },
      {
        label: "Visual Strategy",
        body: "Black-and-white performance photography paired with vibrant color fields creates a striking silhouette, guiding attention to his name.",
      },
    ],
    services: [
      "Brand identity design",
      "Gig banner design system",
      "Typography and layout direction",
      "Performance-space optimization",
    ],
    palette: ["#0a0a0a", "#c9302c", "#e0b27a", "#f3ede2"],
    display: "BOUNDS",
    cover: "/work/harrison-bounds/cover.jpg",
    gallery: [
      { src: "/work/harrison-bounds/gallery-1.jpg", alt: "Harrison Bounds — poster" },
      { src: "/work/harrison-bounds/gallery-2.jpg", alt: "Harrison Bounds — performance" },
      { src: "/work/harrison-bounds/gallery-3.png", alt: "Harrison Bounds — type lockup" },
    ],
    externalUrl: "https://www.carmancreative.com/work/hbmusic",
  },
  {
    slug: "special-forces-trust",
    num: "04",
    title: "Special Forces Trust",
    client: "Special Forces Trust",
    year: "2024",
    category: "Military Support / Web Design",
    duration: "12 weeks",
    tags: ["Platform", "Brand", "UX"],
    blurb:
      "A digital platform for a veterans' trust — donor portal, program directory, and brand refresh. Built for clarity under high stakes.",
    oneLiner:
      "A calm, modern digital presence that reflects strength, reliability, and respect.",
    brief:
      "Special Forces Trust supports Special Forces service members, veterans, and their families through direct assistance and long-term care initiatives. The refresh aimed to reflect that mission: strength, reliability, and respect — without ceremony.",
    process: [
      {
        label: "Research",
        body: "Research focused on understanding the expectations of military families, donors, and partners, as well as best practices across veteran-focused nonprofits.",
      },
      {
        label: "Concept",
        body: "The concept centered on creating a calm, modern digital presence that reflects strength, reliability, and respect.",
      },
      {
        label: "Design",
        body: "Design emphasized restraint, strong hierarchy, and clear typography to support readability and trust.",
      },
      {
        label: "Development",
        body: "The site was built with performance, accessibility, and long-term maintainability in mind.",
      },
    ],
    services: [
      "Brand identity",
      "Web design",
      "Donor platform UX",
      "AI-powered creative systems",
    ],
    palette: ["#0a1729", "#1f3a5c", "#8a9bb0", "#e8ecf2"],
    display: "SFT",
    cover: "/work/special-forces-trust/cover.png",
    gallery: [
      { src: "/work/special-forces-trust/gallery-1.png", alt: "SFT — donor portal" },
      { src: "/work/special-forces-trust/gallery-2.png", alt: "SFT — program page" },
      { src: "/work/special-forces-trust/gallery-3.png", alt: "SFT — brand application" },
    ],
    externalUrl: "https://www.carmancreative.com/work/sft",
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string): {
  prev: Project | null;
  next: Project | null;
} {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length],
    next: PROJECTS[(i + 1) % PROJECTS.length],
  };
}
