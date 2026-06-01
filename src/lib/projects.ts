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
  {
    slug: "stamp-out-stigma",
    num: "05",
    title: "Stamp Out Stigma",
    client: "Stamp Out Stigma",
    year: "2023",
    category: "Advertising / Campaign",
    duration: "6 weeks",
    tags: ["Campaign", "OOH", "Advertising"],
    blurb:
      "A national mental-health awareness campaign staged in Times Square — built to spark honest conversation and cut the stigma around mental illness.",
    oneLiner:
      "Mental health is just as important as physical health.",
    brief:
      "A national mental health awareness initiative staged in Times Square, designed to spark conversation and reduce stigma around mental illness — reinforcing that mental health matters as much as physical health, and that sharing personal stories helps others feel seen and supported.",
    process: [
      {
        label: "Research",
        body: "Research focused on public attitudes toward mental health, stigma barriers, and how large-scale awareness campaigns create emotional resonance in high-visibility environments. Insights emphasized empathy, representation, and clear messaging that could connect instantly with a broad, diverse audience.",
      },
      {
        label: "Concept",
        body: "The concept centered on visibility and honesty — using real stories and human emotion to normalize conversations around mental health. Placing the message in one of the most public spaces in the world challenged silence and encouraged people to speak openly about their experiences.",
      },
      {
        label: "Design",
        body: "Design leveraged strong typography, restrained color, and emotionally grounded imagery to communicate urgency without sensationalism. The messaging was intentionally clear and direct — understood at a glance while still carrying emotional weight in a fast-moving environment.",
      },
      {
        label: "Development",
        body: "Displayed prominently in Times Square, the campaign amplified national awareness around mental health and reinforced the importance of open dialogue — supporting a broader effort to reduce stigma and promote understanding.",
      },
    ],
    services: [
      "Campaign concept",
      "Out-of-home design",
      "Messaging direction",
      "Awareness strategy",
    ],
    palette: ["#0e1a18", "#1f8a6d", "#cfe7da", "#f3f1ea"],
    display: "STIGMA",
    cover: "/work/stamp-out-stigma/cover.jpg",
    gallery: [
      { src: "/work/stamp-out-stigma/gallery-1.jpg", alt: "Stamp Out Stigma — Times Square activation" },
      { src: "/work/stamp-out-stigma/gallery-2.png", alt: "Stamp Out Stigma — campaign creative" },
      { src: "/work/stamp-out-stigma/gallery-3.png", alt: "Stamp Out Stigma — awareness messaging" },
    ],
    externalUrl: "https://www.carmancreative.com/work/sos",
  },
  {
    slug: "spikes-k9-fund",
    num: "06",
    title: "Spike's K9 Fund",
    client: "Spike's K9 Fund",
    year: "2023",
    category: "Nonprofit / Web Design",
    duration: "12 weeks",
    tags: ["Web", "Nonprofit", "UX"],
    blurb:
      "A redesigned home for a nonprofit equipping America's working dogs — clear programs and frictionless donation and application flows.",
    oneLiner:
      "Protecting the working dogs that protect us.",
    brief:
      "Spike's K9 Fund is a national nonprofit supporting America's working dogs with lifesaving equipment, medical care, training, and protective gear. The site was redesigned to communicate programs clearly, enable straightforward donation and application flows, and reflect the organization's commitment to canine safety and readiness.",
    process: [
      {
        label: "Research",
        body: "Research centered on the needs of working K9 units and their handlers, alongside the informational expectations of donors and advocates. This included evaluating how nonprofit audiences seek impact metrics, program descriptions, and ways to contribute.",
      },
      {
        label: "Concept",
        body: "The concept focused on a clear, organized digital experience that balances emotional connection with operational clarity — showcasing the mission and tangible impact while making critical actions like donating, applying for assistance, or learning about programs immediately visible.",
      },
      {
        label: "Design",
        body: "Design emphasized a structured layout, strong hierarchy, and an approachable visual language that reinforces trust and transparency. Program highlights help users quickly understand the five key campaign areas and how they can join the support community.",
      },
      {
        label: "Development",
        body: "The site was built to prioritize accessibility, performance, and easy content updates for the internal team. Donation and application paths were made intuitive on desktop and mobile, with scalable components that let the fund grow its campaigns over time.",
      },
    ],
    services: [
      "Web design",
      "UX & information architecture",
      "Donation & application flows",
      "Nonprofit brand system",
    ],
    palette: ["#0c0c0c", "#b5302b", "#9aa3a0", "#f0ece3"],
    display: "SPIKE'S",
    cover: "/work/spikes-k9-fund/cover.png",
    gallery: [
      { src: "/work/spikes-k9-fund/gallery-1.png", alt: "Spike's K9 Fund — homepage" },
      { src: "/work/spikes-k9-fund/gallery-2.png", alt: "Spike's K9 Fund — program page" },
      { src: "/work/spikes-k9-fund/gallery-3.png", alt: "Spike's K9 Fund — donation flow" },
    ],
    externalUrl: "https://www.carmancreative.com/work/spikes",
  },
  {
    slug: "beacon-van",
    num: "07",
    title: "Beacon Transit Van",
    client: "Beacon Health Options",
    year: "2024",
    category: "Advertising / Vehicle Wrap",
    duration: "6 weeks",
    tags: ["Vehicle Wrap", "Brand", "Advertising"],
    blurb:
      "A full vehicle wrap that turns a transit van into a mobile, welcoming touchpoint for community health outreach.",
    oneLiner:
      "Care that travels — a brand built to move through the community.",
    brief:
      "Beacon Health Options needed a mobile presence that could travel directly into communities, providing access to care, education, and support at local events and outreach. The van wrap became a moving extension of the brand: clear, warm, and instantly recognizable at scale.",
    process: [
      {
        label: "Research",
        body: "Before designing the wrap, I researched vehicle advertising and fleet branding to understand how large-format graphics are read in motion and at a distance. This informed the layout, scale, and color blocking — ensuring the design stayed clear, welcoming, and instantly recognizable in real-world environments.",
      },
      {
        label: "Concept",
        body: "The concept was built around turning the van into a welcoming, mobile touchpoint for Beacon's outreach efforts — a moving presence that felt approachable, trustworthy, and easy to recognize in any neighborhood, functioning as both transportation and a visible symbol of care.",
      },
      {
        label: "Design",
        body: "The wrap was designed as a mobile extension of Beacon's brand — balancing bold visibility with warmth and approachability. Large color fields, high-contrast typography, and simplified graphic shapes kept the messaging legible at a distance while still feeling modern, friendly, and trustworthy.",
      },
      {
        label: "Development",
        body: "The final wrap was carefully prepared for large-format production, with precise layout scaling, bleed planning, and panel alignment across the vehicle's contours — each section built to maintain visual continuity across doors, seams, and curves so the design translated cleanly from screen to street.",
      },
    ],
    services: [
      "Vehicle wrap design",
      "Large-format production",
      "Brand application",
      "Community activation",
    ],
    palette: ["#0e2a3f", "#2b8fb8", "#bcdcea", "#f2f1ec"],
    display: "BEACON",
    cover: "/work/beacon-van/cover.jpg",
    gallery: [
      { src: "/work/beacon-van/gallery-1.png", alt: "Beacon Transit Van — wrap design" },
      { src: "/work/beacon-van/gallery-2.jpg", alt: "Beacon Transit Van — deployed in the community" },
    ],
    externalUrl: "https://www.carmancreative.com/work/beaconvan",
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
