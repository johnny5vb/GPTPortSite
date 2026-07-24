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

/**
 * Which shelf a project sits on. "leadership" work is enterprise, strategic,
 * and leads the site; "independent" is selected client work; "secondary" is
 * smaller production work kept in a compact gallery, not on the front line.
 */
export type ProjectTier = "leadership" | "independent" | "secondary";

/**
 * Extended, leadership-oriented case-study content. Present only on flagship
 * projects. Fields may contain "TODO: …" strings where a fact/metric is not
 * yet confirmed — those render as visible placeholders, never as claims.
 */
export type CaseStudy = {
  overview: { label: string; value: string }[];
  challenge: string;
  mandate: string;
  context: string;
  /** What John personally did. */
  role: string[];
  /** Collaborators — so authorship reads honestly. */
  team: string[];
  decisions: { title: string; body: string }[];
  outcomes: string[];
  reflection: string;
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
  /** Cover/hero image relative to /public. Empty on flagship (gradient hero). */
  cover: string;
  gallery: ProjectImage[];
  externalUrl?: string;
  /** Defaults to "independent" when omitted. */
  tier?: ProjectTier;
  /** Enterprise leadership case study — renders the extended template. */
  flagship?: boolean;
  /** One-line "what John led" summary for leadership cards. */
  roleSummary?: string;
  caseStudy?: CaseStudy;
};

export const PROJECTS: Project[] = [
  /* ── Featured leadership work ──────────────────────────────────────────
     Enterprise, strategic, and leadership-forward. These are scaffolded from
     John's own account of the work; specific metrics and named collaborators
     are marked "TODO: Confirm" and must be verified before they read as facts.
     ───────────────────────────────────────────────────────────────────── */
  {
    slug: "beacon-carelon-transformation",
    num: "L01",
    tier: "leadership",
    flagship: true,
    title: "Beacon Health Options → Carelon",
    client: "Beacon Health Options / Carelon (Elevance Health)",
    year: "2023",
    category: "Enterprise Brand Transformation",
    duration: "TODO: Confirm timeline",
    tags: ["Enterprise", "Rebrand", "Governance"],
    blurb:
      "Leading creative through the acquisition and rebrand of a national behavioral-health organization — holding brand quality steady while the company itself changed.",
    oneLiner:
      "Transforming an enterprise brand through organizational change.",
    brief:
      "When Beacon Health Options was acquired and folded into Carelon and Elevance Health, thousands of brand touchpoints had to move to a new identity without disrupting the people who depend on them. I helped lead the creative side of that transition — setting standards, building the systems, and controlling quality as the work scaled.",
    process: [],
    services: [
      "Creative direction",
      "Brand governance",
      "Design systems & templates",
      "Stakeholder alignment",
    ],
    palette: ["#0e2a3f", "#1cb791", "#2b8fb8", "#f2f1ec"],
    display: "CARELON",
    cover: "",
    gallery: [],
    roleSummary:
      "Creative lead through an enterprise acquisition and rebrand.",
    caseStudy: {
      overview: [
        { label: "Organization", value: "Beacon Health Options → Carelon / Elevance Health" },
        { label: "Role", value: "Creative Director / Creative lead" },
        { label: "Focus", value: "Brand transition, governance, quality control" },
        { label: "Scale", value: "TODO: Confirm — ~1,500+ assets; ~70,000+ employees" },
        { label: "Timeline", value: "TODO: Confirm" },
      ],
      challenge:
        "An acquisition meant a national behavioral-health brand had to migrate to a new identity across a very large body of existing work — while the audience (members, providers, and internal teams) kept relying on those materials every day. The risk wasn't just visual inconsistency; it was eroding trust during a period of organizational uncertainty.",
      mandate:
        "I was responsible for leading the creative side of the transition: establishing what the migrated work should look like, how it would be produced at scale, and how quality would be held as volume ramped up.",
      context:
        "Enterprise healthcare adds real constraints — compliance and legal review, accessibility requirements, legacy templates and systems, many stakeholder groups, and tight timelines. Decisions had to survive executive review while staying usable for the teams producing day-to-day work.",
      role: [
        "Set creative direction and standards for the migrated brand",
        "Built templates and reusable systems so teams could produce on-brand work at volume",
        "Ran creative review and quality control across output",
        "Aligned executive and cross-functional stakeholders on the approach",
        "TODO: Confirm additional responsibilities and specific deliverables",
      ],
      team: [
        "Design team (managed a small in-house group)",
        "Marketing, brand, and compliance stakeholders",
        "TODO: Confirm collaborators — writers, developers, PMs, agencies, vendors",
      ],
      decisions: [
        {
          title: "Systematize before scaling",
          body: "TODO: Confirm the specific decision, the options weighed, the recommendation, and the tradeoff. (Framing: templates + governance first so quality was repeatable rather than re-litigated on every asset.)",
        },
        {
          title: "Protect the work through executive review",
          body: "TODO: Confirm a real example of navigating executive/compliance feedback while keeping the creative strategically focused.",
        },
        {
          title: "TODO: Add a third key decision",
          body: "TODO: What option existed, what John recommended, why, and what changed as a result.",
        },
      ],
      outcomes: [
        "TODO: Confirm outcome — assets migrated, adoption, consistency, stakeholder approval, reduced rework",
      ],
      reflection:
        "TODO: Add an honest reflection — what worked, what you'd improve, and how leading this transition shaped how you approach brand governance and creative operations today.",
    },
  },
  {
    slug: "creative-operations-marketing-bench",
    num: "L02",
    tier: "leadership",
    flagship: true,
    title: "Creative Operations & Marketing Bench",
    client: "Elevance Health / Carelon",
    year: "2024",
    category: "Creative Operations",
    duration: "TODO: Confirm timeline",
    tags: ["Creative Ops", "Systems", "Scale"],
    blurb:
      "Building a faster, more scalable creative support system so a high-demand marketing organization could get quality work without the bottlenecks.",
    oneLiner:
      "Building a faster, more scalable creative support system.",
    brief:
      "A large marketing organization was generating more creative demand than the existing process could absorb. I helped design and run a creative support model — the 'Marketing Bench' — that made intake, prioritization, and production more predictable and faster, without lowering the bar.",
    process: [],
    services: [
      "Creative operations",
      "Workflow & governance",
      "Intake & prioritization",
      "Team enablement",
    ],
    palette: ["#0e1a18", "#1cb791", "#1f8a6d", "#f3f1ea"],
    display: "BENCH",
    cover: "",
    gallery: [],
    roleSummary:
      "Designed and ran a scalable creative-operations support model.",
    caseStudy: {
      overview: [
        { label: "Organization", value: "Elevance Health / Carelon" },
        { label: "Role", value: "Creative operations lead" },
        { label: "Focus", value: "Intake, prioritization, production throughput" },
        { label: "Impact", value: "TODO: Confirm — ~60% faster turnaround; ~30% higher engagement" },
        { label: "Timeline", value: "TODO: Confirm" },
      ],
      challenge:
        "Creative demand outpaced capacity. Requests arrived through inconsistent channels, priorities competed, and turnaround suffered — which pushed teams toward off-brand shortcuts.",
      mandate:
        "Design a support system that could absorb high volume, keep quality consistent, and give requesters a predictable path — then operate it.",
      context:
        "The work had to fit an enterprise environment: many internal clients, existing tooling, brand and compliance requirements, and no appetite for adding friction.",
      role: [
        "Defined the intake and prioritization model",
        "Established governance and standards so quality was repeatable",
        "Built templates and reusable components to speed production",
        "Supported adoption across internal teams",
        "TODO: Confirm additional responsibilities",
      ],
      team: [
        "Design and production contributors",
        "Marketing leads and internal requesters",
        "TODO: Confirm collaborators and reporting structure",
      ],
      decisions: [
        {
          title: "Standardize intake",
          body: "TODO: Confirm the intake decision — options, recommendation, tradeoff, and result.",
        },
        {
          title: "Templatize the high-volume work",
          body: "TODO: Confirm which work was systematized and the effect on speed and consistency.",
        },
        {
          title: "TODO: Add a third key decision",
          body: "TODO: Detail the option, recommendation, and outcome.",
        },
      ],
      outcomes: [
        "TODO: Confirm outcome — turnaround improvement, engagement, adoption, reduced rework",
      ],
      reflection:
        "TODO: Add an honest reflection on building creative operations at scale — what held up, what you'd change.",
    },
  },
  {
    slug: "workfront-workflow-transformation",
    num: "L03",
    tier: "leadership",
    flagship: true,
    title: "Workfront Workflow Transformation",
    client: "Elevance Health / Carelon",
    year: "2024",
    category: "Workflow & Production",
    duration: "TODO: Confirm timeline",
    tags: ["Workfront", "Workflow", "Ops"],
    blurb:
      "Improving how creative work moves through a high-volume organization — intake, reviews, approvals, and reporting in Workfront.",
    oneLiner:
      "Improving creative workflow across a high-volume organization.",
    brief:
      "A high-volume creative operation needed a more reliable way to route work: clearer intake, better prioritization, smoother reviews and approvals, and reporting leadership could trust. I helped shape how that ran in Workfront.",
    process: [],
    services: [
      "Workflow design",
      "Workfront ownership",
      "Reviews & approvals",
      "Reporting & templates",
    ],
    palette: ["#0a1729", "#1cb791", "#1f3a5c", "#e8ecf2"],
    display: "WORKFRONT",
    cover: "",
    gallery: [],
    roleSummary:
      "Shaped intake, review, and approval workflow in Workfront at scale.",
    caseStudy: {
      overview: [
        { label: "Organization", value: "Elevance Health / Carelon" },
        { label: "Role", value: "Workflow / production lead" },
        { label: "Platform", value: "Workfront" },
        { label: "Volume", value: "TODO: Confirm — ~75+ projects monthly" },
        { label: "Timeline", value: "TODO: Confirm" },
      ],
      challenge:
        "At high monthly volume, unclear intake and inconsistent review paths created bottlenecks and rework. Work stalled in approvals, and leadership lacked a reliable view of throughput.",
      mandate:
        "Improve how work is requested, prioritized, reviewed, approved, and reported — so the operation runs faster with less friction.",
      context:
        "Enterprise scale, many stakeholders, established tooling, and the need to change process without disrupting active work.",
      role: [
        "Reworked intake and prioritization",
        "Streamlined reviews and approvals",
        "Improved reporting and templates",
        "Supported training and adoption",
        "TODO: Confirm additional responsibilities",
      ],
      team: [
        "Creative and production teams",
        "Project managers and stakeholders",
        "TODO: Confirm collaborators",
      ],
      decisions: [
        {
          title: "Fix intake first",
          body: "TODO: Confirm the intake changes, the options weighed, and the measured effect.",
        },
        {
          title: "Shorten the approval path",
          body: "TODO: Confirm how reviews/approvals were restructured and the result.",
        },
        {
          title: "TODO: Add a third key decision",
          body: "TODO: Detail the option, recommendation, and outcome.",
        },
      ],
      outcomes: [
        "TODO: Confirm outcome — reduced bottlenecks/rework, faster cycle time, reporting adoption",
      ],
      reflection:
        "TODO: Add an honest reflection on operationalizing workflow in Workfront at scale.",
    },
  },
  {
    slug: "colony-coffee",
    num: "01",
    tier: "independent",
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
    caseStudy: {
      overview: [
        { label: "Client", value: "Colony Coffee — Todd Mills" },
        { label: "Role", value: "Brand, packaging & web lead (Carman Creative)" },
        { label: "Year", value: "2025" },
        { label: "Scope", value: "Identity, packaging system, digital foundation" },
        { label: "Deliverables", value: "Logo, packaging, in-store toolkit, website" },
      ],
      challenge:
        "A new craft-coffee brand needed to earn loyalty in a crowded specialty market without leaning on the usual category clichés — and it needed a system flexible enough to grow from a single roaster to a small chain.",
      mandate:
        "Carman Creative was brought in to build the visual and digital foundation end to end: brand, packaging, and a website the team could extend as they added SKUs, locations, and channels.",
      context:
        "An early-stage brand with limited existing assets and an owner-operator making the decisions directly. TODO: Confirm budget, timeline, and any category or supplier constraints.",
      role: [
        "Set the brand direction and built the identity system",
        "Designed the packaging system to hold up across SKUs",
        "Built the website as the brand's digital foundation",
        "TODO: Confirm the split of work with any collaborators",
      ],
      team: [
        "Todd Mills — owner / client",
        "TODO: Confirm any writers, photographers, or production partners",
      ],
      decisions: [
        {
          title: "Earn loyalty without the clichés",
          body: "Positioned the brand on quality, community, and tradition rather than the tropes the category defaults to, so it could stand on its own. TODO: Confirm the specific verbal and visual choices that carried it.",
        },
        {
          title: "Design a system, not one-offs",
          body: "Built packaging and web as a flexible, extendable system so new SKUs and locations stay on-brand as the business grows. TODO: Confirm the scope of the in-store toolkit.",
        },
        {
          title: "TODO: Add a third key decision",
          body: "TODO: What options existed, what you recommended, the tradeoff, and what changed.",
        },
      ],
      outcomes: [
        "TODO: Confirm outcome — launch, adoption, sales, or the client's read on the work",
      ],
      reflection:
        "TODO: Add a short, honest reflection — what worked and what you'd refine next time.",
    },
  },
  {
    slug: "friends-rehab",
    num: "02",
    tier: "independent",
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
    caseStudy: {
      overview: [
        { label: "Client", value: "Friends Rehabilitation Program (FRP)" },
        { label: "Role", value: "Web & content lead (Carman Creative)" },
        { label: "Year", value: "2025" },
        { label: "Scope", value: "Website refresh, content structure, CMS" },
        { label: "Deliverables", value: "Redesigned site staff can maintain" },
      ],
      challenge:
        "A long-running rehabilitation nonprofit needed a digital home that people in crisis — and the families and referral partners around them — could actually use: clear services, findable resources, and obvious next steps, all trustworthy at a glance.",
      mandate:
        "Rebuild the site around clarity and reassurance, and hand the organization something staff could update without a designer in the loop.",
      context:
        "A mission-driven organization with limited technical capacity and an audience that arrives under stress. Content had to be accessible and calm. TODO: Confirm stakeholders, timeline, and any compliance requirements.",
      role: [
        "Led the site refresh and information architecture",
        "Shaped the content so services and next steps read plainly",
        "Built it on a CMS staff can maintain themselves",
        "TODO: Confirm collaborators (dev, content, photography)",
      ],
      team: [
        "FRP staff / stakeholders",
        "TODO: Confirm any developers or content partners",
      ],
      decisions: [
        {
          title: "Design for reassurance, not decoration",
          body: "Chose readable typography and a restrained system so the experience reads calm and credible to someone seeking help. TODO: Confirm the specific accessibility and readability choices.",
        },
        {
          title: "Independence over dependence",
          body: "Built on a CMS so staff can keep content current without a designer — durability the organization needed. TODO: Confirm the platform and handoff/training.",
        },
        {
          title: "TODO: Add a third key decision",
          body: "TODO: Option, recommendation, tradeoff, result.",
        },
      ],
      outcomes: [
        "TODO: Confirm outcome — usage, staff adoption, or the organization's feedback",
      ],
      reflection: "TODO: Add a short, honest reflection.",
    },
  },
  {
    slug: "harrison-bounds",
    num: "03",
    tier: "secondary",
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
    tier: "independent",
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
    caseStudy: {
      overview: [
        { label: "Client", value: "Special Forces Trust" },
        { label: "Role", value: "Brand & web lead (Carman Creative)" },
        { label: "Year", value: "2024" },
        { label: "Scope", value: "Brand refresh, website, donor UX" },
        { label: "Deliverables", value: "Refreshed identity + donor platform" },
      ],
      challenge:
        "A trust supporting Special Forces service members, veterans, and their families needed a digital presence that reflected the mission — strength, reliability, respect — while making it easy for donors and families to find help and give support.",
      mandate:
        "Refresh the brand and rebuild the site so the organization reads as serious and trustworthy, and so donation and program paths are frictionless.",
      context:
        "High-stakes audience, a mission that demands restraint over ceremony, and donor trust to protect. TODO: Confirm stakeholders, timeline, and platform constraints.",
      role: [
        "Led the brand refresh and its application online",
        "Designed the site and donor experience for clarity under high stakes",
        "TODO: Confirm personal contribution vs. collaborators",
      ],
      team: [
        "Special Forces Trust stakeholders",
        "TODO: Confirm developers, writers, or partners",
      ],
      decisions: [
        {
          title: "Restraint as respect",
          body: "Chose strong hierarchy and quiet typography over ceremony, so the work reads reliable rather than performative. TODO: Confirm the specific direction.",
        },
        {
          title: "Make the important actions obvious",
          body: "Prioritized donate and program paths so the audiences who need them reach them fast. TODO: Confirm the flows and any measured effect.",
        },
        {
          title: "TODO: Add a third key decision",
          body: "TODO: Option, recommendation, tradeoff, result.",
        },
      ],
      outcomes: [
        "TODO: Confirm outcome — donations, engagement, or stakeholder feedback",
      ],
      reflection: "TODO: Add a short, honest reflection.",
    },
  },
  {
    slug: "stamp-out-stigma",
    num: "05",
    tier: "independent",
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
    caseStudy: {
      overview: [
        { label: "Client", value: "Stamp Out Stigma" },
        { label: "Role", value: "Campaign & OOH design (Carman Creative)" },
        { label: "Year", value: "2023" },
        { label: "Scope", value: "Awareness campaign, out-of-home creative" },
        { label: "Deliverables", value: "Times Square activation creative" },
      ],
      challenge:
        "A national mental-health awareness effort needed to cut through one of the busiest environments on earth — Times Square — and get people to treat mental health as seriously as physical health, without sensationalizing it.",
      mandate:
        "Create out-of-home creative that lands instantly in a fast-moving, high-noise space while carrying real emotional weight.",
      context:
        "A large-format, high-visibility placement with seconds to communicate, a sensitive subject, and a broad, diverse audience. TODO: Confirm the sponsoring organization, run dates, and any partners.",
      role: [
        "Directed the campaign concept and messaging",
        "Designed the out-of-home creative for legibility at a glance",
        "TODO: Confirm personal contribution vs. collaborators",
      ],
      team: [
        "Campaign stakeholders",
        "TODO: Confirm writers, media partners, or agencies",
      ],
      decisions: [
        {
          title: "Clarity over spectacle",
          body: "Used strong typography, restrained color, and honest imagery so the message reads in seconds without sensationalism. TODO: Confirm the specific creative choices.",
        },
        {
          title: "Put the message where silence usually wins",
          body: "Placing an honest mental-health message in one of the most public spaces challenges the stigma directly. TODO: Confirm the strategy behind the placement.",
        },
        {
          title: "TODO: Add a third key decision",
          body: "TODO: Option, recommendation, tradeoff, result.",
        },
      ],
      outcomes: [
        "TODO: Confirm outcome — reach, response, or the campaign's measured impact",
      ],
      reflection: "TODO: Add a short, honest reflection.",
    },
  },
  {
    slug: "spikes-k9-fund",
    num: "06",
    tier: "independent",
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
    caseStudy: {
      overview: [
        { label: "Client", value: "Spike's K9 Fund" },
        { label: "Role", value: "Web, UX & IA lead (Carman Creative)" },
        { label: "Year", value: "2023" },
        { label: "Scope", value: "Website redesign, donation & application flows" },
        { label: "Deliverables", value: "Redesigned site + scalable components" },
      ],
      challenge:
        "A national nonprofit equipping America's working dogs needed a site that communicated its programs clearly and made donating, applying for assistance, and learning about the mission immediately obvious — for both handlers and donors.",
      mandate:
        "Redesign the site around clear programs and frictionless donation and application flows, and leave the team a system they can grow their campaigns with.",
      context:
        "Two distinct audiences (working-K9 handlers and donors/advocates), a need for clear impact and program information, and an internal team maintaining content. TODO: Confirm stakeholders, timeline, and platform.",
      role: [
        "Led the redesign, information architecture, and UX",
        "Designed the donation and application flows for desktop and mobile",
        "Built scalable components the team can extend",
        "TODO: Confirm collaborators (development, content)",
      ],
      team: [
        "Spike's K9 Fund stakeholders",
        "TODO: Confirm developers or content partners",
      ],
      decisions: [
        {
          title: "Balance emotion with operational clarity",
          body: "Led with the mission's emotional pull while keeping donate/apply/learn paths immediately visible, so feeling converts to action. TODO: Confirm the specific structure.",
        },
        {
          title: "Build for the team, not just the launch",
          body: "Used scalable components and easy content updates so the fund can run new campaigns without a rebuild. TODO: Confirm the CMS and handoff.",
        },
        {
          title: "TODO: Add a third key decision",
          body: "TODO: Option, recommendation, tradeoff, result.",
        },
      ],
      outcomes: [
        "TODO: Confirm outcome — donations, applications, or engagement lift",
      ],
      reflection: "TODO: Add a short, honest reflection.",
    },
  },
  {
    slug: "beacon-van",
    num: "07",
    tier: "secondary",
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

export function tierOf(p: Project): ProjectTier {
  return p.tier ?? "independent";
}

export function projectsByTier(tier: ProjectTier): Project[] {
  return PROJECTS.filter((p) => tierOf(p) === tier);
}

export const LEADERSHIP_PROJECTS = projectsByTier("leadership");
export const INDEPENDENT_PROJECTS = projectsByTier("independent");
export const SECONDARY_PROJECTS = projectsByTier("secondary");

/**
 * Prev/next stay within the project's own tier so a leadership case study
 * doesn't hand off to a coffee brand and vice-versa.
 */
export function getAdjacentProjects(slug: string): {
  prev: Project | null;
  next: Project | null;
} {
  const project = getProject(slug);
  if (!project) return { prev: null, next: null };
  const list = projectsByTier(tierOf(project));
  const i = list.findIndex((p) => p.slug === slug);
  if (i === -1 || list.length < 2) return { prev: null, next: null };
  return {
    prev: list[(i - 1 + list.length) % list.length],
    next: list[(i + 1) % list.length],
  };
}
