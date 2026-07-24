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
    year: "2018 — 2020",
    category: "Enterprise Brand Transformation",
    duration: "TODO: Confirm timeline",
    tags: ["Enterprise", "Rebrand", "Governance"],
    blurb:
      "Leading creative through the acquisition and rebrand of a national behavioral-health organization — holding brand quality steady while the company itself changed.",
    oneLiner:
      "Transforming an enterprise brand through organizational change.",
    brief:
      "When Beacon Health Options was acquired and folded into Carelon and Elevance Health, roughly 1,500+ brand assets had to move to a new identity across an ~85,000+ employee organization — without disrupting the people who depend on them. I helped lead the creative side of that transition — setting standards, building the systems, and controlling quality as the work scaled.",
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
        { label: "Scale", value: "~1,500+ assets / ~85,000+ employees" },
        { label: "Team", value: "Scaled to ~20 (3 in-house + freelance)" },
        { label: "Timeline", value: "2018 — 2020 (9-month rebrand)" },
      ],
      challenge:
        "An acquisition meant a national behavioral-health brand had to migrate to a new identity across a very large body of existing work — while the audience (members, providers, and internal teams) kept relying on those materials every day. The risk wasn't just visual inconsistency; it was eroding trust during a period of organizational uncertainty.",
      mandate:
        "As Creative Director, I led every part of the rebrand: the new identity and brand guidelines, the design system and templates, vendor and partner direction, merchandise, and a print-on-demand platform that had to be rebuilt from scratch.",
      context:
        "Enterprise healthcare adds real constraints — compliance and legal review, accessibility requirements, legacy templates and systems, many stakeholder groups, and tight timelines. Decisions had to survive executive review while staying usable for the teams producing day-to-day work.",
      role: [
        "Established the new brand identity and guidelines",
        "Built the brand and design system first, then the templates the work would run on",
        "Directed vendors and partners; rebuilt merchandise and the print-on-demand platform end to end",
        "Managed 3 in-house designers, a video production artist, and a team of project managers and writers",
        "Ran a near-daily cadence and a live progress dashboard to keep hundreds of deliverables on track",
      ],
      team: [
        "3 in-house designers",
        "A video production artist",
        "Project managers and writers",
        "Creative Circle freelancers — the team scaled to ~20 people across the year",
      ],
      decisions: [
        {
          title: "Build the system before the assets",
          body: "Rather than migrating piece by piece, I built the brand and design system first, then the templates — and produced against them. Slower to start, but it made ~1,500+ deliverables repeatable and consistent as volume spiked.",
        },
        {
          title: "Batch the work to make it finishable",
          body: "Hundreds of deliverables are overwhelming as one list, so we batched them by type of piece, client, and product and worked through them in waves — steady, measurable progress instead of drift.",
        },
        {
          title: "Scale the team, and keep it in sync",
          body: "We brought in Creative Circle freelancers, scaling to ~20 people, and held it together with near-daily check-ins and a shared progress dashboard so everyone could see exactly where things stood.",
        },
      ],
      outcomes: [
        "~1,500+ brand assets migrated to the new identity across the organization",
        "Merchandise and the print-on-demand platform rebuilt end to end",
        "The full rebrand delivered in ~9 months with a team that scaled to ~20",
      ],
      reflection:
        "What I'd change: stand up a single shared project-management system from day one so everyone stays on the same page and can see progress. What it taught me: hundreds of deliverables look overwhelming on paper, but with the right system and the right people, you chip away at it — and finishing something at that scale is its own reward. This is the project that changed how I lead.",
    },
  },
  {
    slug: "creative-operations-marketing-bench",
    num: "L02",
    tier: "leadership",
    flagship: true,
    title: "Creative Operations & Marketing Bench",
    client: "Elevance Health / Carelon",
    year: "2020",
    category: "Creative Operations",
    duration: "TODO: Confirm timeline",
    tags: ["Print on Demand", "Creative Ops", "UI"],
    blurb:
      "Rebuilding Marketing Bench as a variable print-on-demand platform — self-serve materials that took designers out of routine production entirely.",
    oneLiner:
      "Print-on-demand that runs without a designer in the loop.",
    brief:
      "Marketing Bench let sales and leadership order branded materials and merchandise — but on the old platform every change ran through a designer and the print vendor first. As part of the Carelon rebrand, I rebuilt it as a variable print-on-demand site stakeholders could self-serve, taking designers out of routine production entirely.",
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
      "Rebuilt Marketing Bench as a self-serve print-on-demand platform.",
    caseStudy: {
      overview: [
        { label: "Organization", value: "Elevance Health / Carelon (with WebbMason)" },
        { label: "Role", value: "Creative lead / UI design" },
        { label: "Focus", value: "Variable print-on-demand, self-serve materials" },
        { label: "Impact", value: "~60% faster turnaround / ~30% higher engagement" },
        { label: "Timeline", value: "2020" },
      ],
      challenge:
        "Marketing Bench let sales, leadership, and stakeholders order branded materials and merchandise — but the old platform routed every change through a designer: edit the layout, get it approved, hand it to the print vendor, wait for them to upload it. A designer sat in the critical path of routine production, and speed to market suffered.",
      mandate:
        "The Carelon rebrand was the opening to rebuild Marketing Bench as a proper variable print-on-demand site — materials intentionally designed with placeholder image and content areas that stakeholders could self-serve across clients, products, and purposes, with no designer in the loop.",
      context:
        "An enterprise environment, an external print vendor (WebbMason) whose print-on-demand capability was still light, funding to secure with leadership, and a live audience of sales and leadership already relying on the tool.",
      role: [
        "Rebuilt Marketing Bench as a variable print-on-demand platform",
        "Designed the site's interface (UI)",
        "Led the designers producing the rebranded, templatized materials",
        "Worked daily with the WebbMason print-vendor team and with leadership",
        "Secured funding for the refresh with leadership and kept the work on track",
      ],
      team: [
        "In-house designers — led the rebranding and production work",
        "WebbMason — print-on-demand vendor",
        "Leadership and stakeholders — funding and sponsorship",
      ],
      decisions: [
        {
          title: "Design the designer out of the loop",
          body: "Built materials with intentional placeholder image and content areas so stakeholders could self-serve across clients and products — replacing the edit → approve → hand-off → upload chain that used to need a designer for every change.",
        },
        {
          title: "Free designers for the work that matters",
          body: "The point wasn't more output from the team — it was removing routine production from designers' plates so their bandwidth went to projects that actually moved the business.",
        },
        {
          title: "Own the vendor relationship, don't hold it at arm's length",
          body: "Worked daily with WebbMason and secured funding with leadership rather than treating the vendor as a hand-off. Their print-on-demand capability was light; we designed to what the platform could be, not what it had done before.",
        },
      ],
      outcomes: [
        "Eliminated a designer bottleneck and production-level work, cutting turnaround ~60%",
        "Adopted across the organization — sales, leadership, and stakeholders all used it (~30% higher engagement)",
        "Became WebbMason's flagship print-on-demand case, used to sell their platform to other companies",
      ],
      reflection:
        "What I'd change: use AI to automate and track the site's contents and publishing. There's real organizational overhead in uploading, updating, running maintenance cycles, and sunsetting older materials — exactly the kind of work AI is good at staying on top of.",
    },
  },
  {
    slug: "workfront-workflow-transformation",
    num: "L03",
    tier: "leadership",
    flagship: true,
    title: "Workfront Workflow Transformation",
    client: "Elevance Health / Carelon",
    year: "2025",
    category: "Workflow & Production",
    duration: "TODO: Confirm timeline",
    tags: ["Workfront", "Workflow", "Ops"],
    blurb:
      "Reworking how creative moves through Workfront at ~75+ projects a month — realistic phase timelines, smarter batching, and intake that finally made sense.",
    oneLiner:
      "Realistic timelines, faster work, fewer rush jobs.",
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
      "Redrew Workfront phases, batching, and intake for the creative team.",
    caseStudy: {
      overview: [
        { label: "Organization", value: "Elevance Health / Carelon" },
        { label: "Role", value: "Workflow / production lead" },
        { label: "Platform", value: "Workfront" },
        { label: "Volume", value: "~75+ projects monthly" },
        { label: "Timeline", value: "2025" },
      ],
      challenge:
        "The old Workfront setup drew constant complaints from writers, designers, project managers, and requesters. Phase timing was the core issue: on paper, the timeline for each task ran so long that PMs and requesters balked the moment they saw it — and rushed, haphazard jobs filled the gap.",
      mandate:
        "Rework how creative moves through Workfront at ~75+ projects a month — the phase timelines, batching, delegation, intake, and storage — so the timeline was realistic and the work actually moved faster.",
      context:
        "An enterprise environment with many stakeholders, a platform in daily use, and a workflow touching writers, designers, PMs, requesters, and the variable print-on-demand (Marketing Bench) materials — so changes had to hold across all of it.",
      role: [
        "Served as the point person for the creative team",
        "Sat on the workgroup committee implementing the changes and reporting to leadership",
        "Redrew the phase strategy for every type of tactic and deliverable — and for shared pieces",
        "Reworked how work was batched, delegated to designers and writers, and shared across tasks",
        "Changed intake and what it captured, server file storage, and how VPOD (Marketing Bench) materials were handled",
      ],
      team: [
        "Creative team — writers and designers",
        "Project managers and requesters",
        "Workgroup committee and leadership",
      ],
      decisions: [
        {
          title: "Fix the phase timelines that scared everyone off",
          body: "The task-by-task timeline was so long on paper that PMs and requesters balked immediately. We analyzed the overall timeline for every tactic and deliverable and drew a new phase strategy per piece type — a realistic timeline people could actually trust.",
        },
        {
          title: "Batch, delegate, and share tasks",
          body: "Reworked how work was grouped and handed to designers and writers, creating shared tasks where it made sense, to cut duplicated effort and speed the whole workflow.",
        },
        {
          title: "Change everything the workflow touched",
          body: "Not just the phases — intake and what it captured, how files were stored on the server, and how variable print-on-demand materials were handled, so the efficiency held end to end.",
        },
      ],
      outcomes: [
        "Faster speed to market and time savings the business felt and appreciated",
        "Fewer haphazard 'rush' jobs coming through the queue",
        "A realistic timeline PMs and requesters would actually trust",
      ],
      reflection:
        "TODO: Add a one-line reflection — what worked, and what you'd change next time.",
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
