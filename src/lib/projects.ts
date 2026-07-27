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
/** One image inside a work moment. An empty `src` renders an elegant labeled
 *  placeholder in the correct frame, so a case study's layout + captions can
 *  be designed before the real assets arrive. */
export type WorkImage = { src: string; alt: string };

/**
 * "The work" is composed of editorial *moments*, not a grid dump — each a
 * deliberate way to show a piece, with a caption on what it demonstrates.
 */
export type WorkMoment =
  | {
      kind: "full";
      image: WorkImage;
      caption?: string;
      tall?: boolean;
      /** Override the frame aspect (e.g. "3 / 2") so a complete, self-contained
       *  composition shows uncropped instead of being forced to 16:9. */
      aspect?: string;
    }
  | { kind: "browser"; image: WorkImage; caption?: string; url?: string }
  | {
      kind: "pair";
      a: WorkImage;
      b: WorkImage;
      labelA?: string;
      labelB?: string;
      caption?: string;
    }
  | { kind: "detail"; image: WorkImage; caption?: string }
  | { kind: "gallery"; images: WorkImage[]; caption?: string };

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
  /** Curated "The work" moments. Omit until assets are chosen. */
  work?: WorkMoment[];
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
  /**
   * Written but deliberately unpublished — kept in the file, kept off the site.
   * Draft projects are filtered out of every listing and no route is built for
   * them, so nothing links to a page that doesn't exist. Use this for work that
   * isn't cleared to show yet (an unsigned engagement, an NDA still in play)
   * rather than deleting the case study. Flip it off to publish.
   */
  draft?: boolean;
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
    duration: "~9 months (2018–2020)",
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
    cover: "/work/beacon-carelon-transformation/cover.jpg",
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
      work: [
        {
          kind: "pair",
          a: {
            src: "/work/beacon-carelon-transformation/before-beacon-guidelines.jpg",
            alt: "Beacon Health Options brand guidelines cover, in the Beacon blue identity",
          },
          b: {
            src: "/work/beacon-carelon-transformation/brand-architecture.jpg",
            alt: "Carelon logo architecture — the primary mark and every line-of-business lockup",
          },
          labelA: "Before — Beacon",
          labelB: "After — Carelon",
          caption:
            "The identity, before and after: Beacon's blue system on the left; on the right the Carelon architecture — the primary mark plus every line-of-business lockup that had to be governed.",
        },
        {
          kind: "full",
          aspect: "3 / 2",
          image: {
            src: "/work/beacon-carelon-transformation/cover.jpg",
            alt: "Carelon poster: Our name has changed. Our commitment has not.",
          },
          caption:
            "The moment itself — “Our name has changed. Our commitment has not.” On March 1, 2023, Beacon Health Options became Carelon Behavioral Health; the job was making that legible to members, providers, and staff.",
        },
        {
          kind: "pair",
          a: {
            src: "/work/beacon-carelon-transformation/before-beacon-flyer.jpg",
            alt: "Beacon Care Services member flyer — “Not feeling like yourself?”",
          },
          b: {
            src: "/work/beacon-carelon-transformation/collateral-salessheet.jpg",
            alt: "Carelon Behavioral Health sales sheet — “Help members reach their full potential”",
          },
          labelA: "Before — Beacon collateral",
          labelB: "After — Carelon collateral",
          caption:
            "The same job, rebuilt in the new system: member- and market-facing collateral carried across without losing the plot — or the plain language people actually rely on.",
        },
        {
          kind: "gallery",
          images: [
            {
              src: "/work/beacon-carelon-transformation/type-system.jpg",
              alt: "Carelon Behavioral Health paragraph style guide",
            },
            {
              src: "/work/beacon-carelon-transformation/collateral-crisis.jpg",
              alt: "Carelon crisis care capability sheet for youth services",
            },
            {
              src: "/work/beacon-carelon-transformation/collateral-folder.jpg",
              alt: "Carelon Behavioral Health pocket folder design",
            },
          ],
          caption:
            "The system in production — paragraph styles, capability sheets, and printed collateral: the repeatable parts that made ~1,500+ deliverables consistent as volume spiked.",
        },
      ],
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
    duration: "2020",
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
    cover: "/work/creative-operations-marketing-bench/platform-homepage-annotated.jpg",
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
      work: [
        {
          kind: "full",
          aspect: "3 / 2",
          image: {
            src: "/work/creative-operations-marketing-bench/platform-homepage-annotated.jpg",
            alt: "The Marketing Hub homepage — Build a Marketing Folder, with quick links to the brand center, stationery store, print support, and promo items",
          },
          caption:
            "The platform, annotated: “Build a Marketing Folder.” One front door to the brand center, stationery, print support, and promo items — so ordering never started with a request to a designer.",
        },
        {
          kind: "full",
          aspect: "3 / 2",
          image: {
            src: "/work/creative-operations-marketing-bench/configurable-templates.jpg",
            alt: "Client inventory and configurable templates — a client-selection dropdown with View Proof and Create PDF controls",
          },
          caption:
            "Where the designer left the critical path: pick the client, and logo, program name, phone number, and URL populate across every template — then View Proof and Create PDF, unattended.",
        },
        {
          kind: "pair",
          a: {
            src: "/work/creative-operations-marketing-bench/resource-center.jpg",
            alt: "The Resource Center and Toolkits catalog — approved templates and branding assets with select-and-download",
          },
          b: {
            src: "/work/creative-operations-marketing-bench/marketing-folder.jpg",
            alt: "The Marketing Folder catalog — collated sales materials selected and added to cart",
          },
          labelA: "Find it",
          labelB: "Build the folder",
          caption:
            "The self-serve loop: search approved assets and toolkits, select what you need, and collate a folder that ships — the chain that used to be edit, approve, hand to the vendor, wait for the upload.",
        },
        {
          kind: "gallery",
          images: [
            {
              src: "/work/creative-operations-marketing-bench/output-pge.jpg",
              alt: "A client-customized EAP brochure produced from the platform templates",
            },
            {
              src: "/work/creative-operations-marketing-bench/output-unitedrentals.jpg",
              alt: "A client-branded manager resources piece produced from the platform templates",
            },
            {
              src: "/work/creative-operations-marketing-bench/output-jnj.jpg",
              alt: "A client-branded wellbeing and EAP piece produced from the platform templates",
            },
          ],
          caption:
            "What came out the other end — the same templates, configured per client, at a volume no designer-in-the-loop process could have carried.",
        },
        {
          kind: "full",
          aspect: "3 / 2",
          image: {
            src: "/work/creative-operations-marketing-bench/eap-templates.jpg",
            alt: "The configurable EAP, MHSUD and MDLIVE template catalog, showing which fields update automatically and which are set by the user",
          },
          caption:
            "The rule set behind it: which fields fill automatically the moment a client is selected, and which stay in the user's hands — the governance that keeps self-serve on-brand.",
        },
      ],
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
    duration: "2025",
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
    cover: "/work/workfront-workflow-transformation/legacy-model-change.jpg",
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
        "The legacy instance — “Single Spine,” the consolidation of five separate Workfront systems into one — drew constant complaints from writers, designers, project managers, and requesters. Phase timing was the core issue: on paper, the timeline for each task ran so long that PMs and requesters balked the moment they saw it, and rushed, haphazard jobs filled the gap. Work sat buried under numeric job codes and nested folders, and the process no longer matched how creative actually worked.",
      mandate:
        "Rather than keep patching Single Spine, stand up a new instance from scratch — “Workfront Restart” — built around every pain point the old one had exposed. Rework how creative moves through it at ~75+ projects a month: phase timelines, batching, delegation, intake, and storage, so the timeline was realistic and the work actually moved faster.",
      context:
        "An enterprise environment with many stakeholders and a platform in daily use — the migration had to land without stopping the work. A large cross-functional effort with many people involved; I led the creative side through both the legacy instance and the rebuild.",
      role: [
        "Led the creative side through both instances — Single Spine and the Workfront Restart rebuild",
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
          title: "Restart rather than keep patching",
          body: "Single Spine had consolidated five Workfront systems into one, but the problems ran deeper than configuration. We captured every pain point across intake, management, and execution, then stood up a new instance from scratch built around them — a restart rather than another round of fixes on a foundation nobody trusted.",
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
        "Shipped as a staged launch — MVP in January 2026, full launch that April",
      ],
      reflection:
        "What it taught me: the best process fixes come from the people doing the work. Our team banded together to name every pain point across intake, management, and execution, then broke the process down and rebuilt it — improving it tremendously. With Workfront redesigned and relaunched, the team is working far more efficiently and communicating more effectively. Make the system honest and the work and the people both move better.",
      work: [
        {
          kind: "full",
          aspect: "4 / 3",
          image: {
            src: "/work/workfront-workflow-transformation/legacy-model-change.jpg",
            alt: "Process model change — from independent planning and development to coordinated planning and development",
          },
          caption:
            "The transformation in one frame: from an “attack and fend for self” model, where every team planned independently, to coordinated planning against shared resources.",
        },
        {
          kind: "pair",
          a: {
            src: "/work/workfront-workflow-transformation/legacy-file-chaos.jpg",
            alt: "Single Spine file management — deeply nested folders under numeric job codes",
          },
          b: {
            src: "/work/workfront-workflow-transformation/restart-phases.jpg",
            alt: "Workfront Restart — a task template with per-phase durations, ready-to-start flags, and staged reviewers",
          },
          labelA: "Single Spine",
          labelB: "Workfront Restart",
          caption:
            "What we were actually fixing: work buried under numeric job codes and nested folders, replaced by phases with real durations, ready-to-start flags, and named reviewers at each stage.",
        },
        {
          kind: "full",
          aspect: "4 / 3",
          image: {
            src: "/work/workfront-workflow-transformation/legacy-process-flow.jpg",
            alt: "The six-phase creative process — portfolio planning through reporting and optimization",
          },
          caption:
            "The spine of it — six phases from portfolio planning to reporting, with creative carrying a role in almost every one. Redrawing where creative actually belonged is what made the timelines honest.",
        },
        {
          kind: "pair",
          a: {
            src: "/work/workfront-workflow-transformation/restart-proof-flow.jpg",
            alt: "Proof workflow with three review stages and assigned reviewers",
          },
          b: {
            src: "/work/workfront-workflow-transformation/restart-roles.jpg",
            alt: "Task detail showing work assigned to designer, writer, or both",
          },
          labelA: "Reviews & approvals",
          labelB: "Batching & delegation",
          caption:
            "Reviews became staged and visible instead of a mystery, and tasks could be pointed at a designer, a writer, or both — which is where the duplicated effort had been hiding.",
        },
        {
          kind: "gallery",
          images: [
            {
              src: "/work/workfront-workflow-transformation/restart-mywork.jpg",
              alt: "My Work dashboard showing tasks ready to start and outstanding proofs",
            },
            {
              src: "/work/workfront-workflow-transformation/restart-statuses.jpg",
              alt: "Shared status definitions — new, in progress, complete, awaiting feedback",
            },
            {
              src: "/work/workfront-workflow-transformation/restart-timeline.jpg",
              alt: "Launch milestone graphic — MVP launched January 2026, full launch April 2026",
            },
          ],
          caption:
            "The everyday surface: one place to see what's ready to start, status language everyone reads the same way, and a launch the team could track — MVP in January, full launch in April.",
        },
        {
          kind: "detail",
          image: {
            src: "/work/workfront-workflow-transformation/restart-poster.jpg",
            alt: "Internal campaign poster — Workfront That Works",
          },
          caption:
            "Adoption is a creative problem too. “Workfront That Works” gave a systems migration something people could rally to.",
        },
      ],
    },
  },
  {
    slug: "colony-coffee",
    num: "01",
    tier: "independent",
    title: "Colony Coffee Co.",
    client: "Colony Coffee — Todd Mills",
    year: "2025",
    category: "Coffee Brand / Packaging",
    duration: "",
    tags: ["Brand", "Packaging", "Label"],
    blurb:
      "Brand and label design for a veteran-founded coffee company built to honor American history — period-authentic label artwork, made with real attention to detail.",
    oneLiner:
      "A coffee brand that honors American history — authentically.",
    brief:
      "Colony Coffee is a veteran-founded brand built to honor America's history and the people who came before us. Founder Todd Mills wanted label artwork with a genuine historical edge — proud and patriotic, but authentic to its period, down to the smallest details.",
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
      "Brand concept",
      "Label & packaging design",
      "Typography",
      "Art direction",
    ],
    palette: ["#1a120a", "#c98a4b", "#e8d6b3", "#f6efe2"],
    display: "COLONY",
    cover: "/work/colony-coffee/gallery-2.png",
    gallery: [
      { src: "/work/colony-coffee/gallery-1.jpg", alt: "Colony Coffee — packaging system" },
      { src: "/work/colony-coffee/gallery-2.png", alt: "Colony Coffee — brand application" },
      { src: "/work/colony-coffee/gallery-3.png", alt: "Colony Coffee — identity detail" },
    ],
    externalUrl: "https://www.carmancreative.com/work/colonycoffee",
    caseStudy: {
      overview: [
        { label: "Client", value: "Colony Coffee — Todd Mills" },
        { label: "Role", value: "Brand concept & label design (Carman Creative)" },
        { label: "Year", value: "2025" },
        { label: "Scope", value: "Brand system, labels & packaging, business card" },
        { label: "Status", value: "First batch of labels in production" },
      ],
      challenge:
        "Todd Mills — a veteran, and genuinely passionate about coffee — wanted a real creative edge in a crowded space. His vision: a brand that honors America's history and the people who came before us, with label artwork that carries a genuine historical edge while staying authentic to its period. He cared deeply about the details.",
      mandate:
        "Todd came to me for a logo. But a brand this specific — built on history and authenticity — needed more than a mark. I shaped the look and feel and designed the labels themselves: the typography, the structure, and the historical direction of the artwork.",
      context:
        "A veteran-founded small business, a founder with a strong, specific vision and a real eye for detail, and a brand built on patriotism and history that had to feel authentic rather than costume.",
      role: [
        "Led ideation and concepting over a few rounds with Todd",
        "Landed the overall look and feel and the branding system",
        "Set the typography and the structure of the label itself",
        "Designed the custom label artwork, packaging, and a business card",
        "Directed the historical, period-authentic artwork approach",
      ],
      team: [
        "Todd Mills — founder, veteran, and the vision behind it",
        "A direct, hands-on collaboration between the two of us",
      ],
      decisions: [
        {
          title: "A logo wasn't enough",
          body: "Colony came asking for a logo. A brand built this specifically on history and authenticity needed more than a mark — so we built the system: custom label artwork and packaging, plus a business card, to actually get the company off the ground.",
        },
        {
          title: "Honor history without the clichés",
          body: "A genuinely period-authentic historical edge — not generic patriotic tropes. Todd's whole point was pride done right, so the artwork had to feel true to its era, not like a costume.",
        },
        {
          title: "Land the direction, then lock the label",
          body: "A few rounds of ideation to find the look and feel, then commit the typography and structure — so the label was resolved and production-ready rather than endlessly tweaked.",
        },
        {
          title: "Sweat the details Todd cared about",
          body: "He was specific about the detail, and that's where this brand earns its authenticity — so the small decisions got the same attention as the big ones.",
        },
      ],
      outcomes: [
        "What began as a logo request became a full brand system that launched the company",
        "Direction locked; Todd moved into production — first batch of labels recently printed",
        "The start of an ongoing relationship — more Colony work to come",
      ],
      reflection:
        "This one's personal — a small business honoring the country and the people who came before us. I'm genuinely excited to try the coffee, and proud to have helped shape something Todd cares this much about. We look forward to working with Colony for years to come.",
      work: [
        {
          kind: "detail",
          image: {
            src: "/work/colony-coffee/cover.png",
            alt: "Colony Coffee — the Founders Blend bag",
          },
          caption:
            "Founders Blend, up close — “Balanced like the Constitution,” down to the detail Todd cared about.",
        },
        {
          kind: "full",
          aspect: "3 / 2",
          image: {
            src: "/work/colony-coffee/gallery-3.png",
            alt: "Colony Coffee — the coffee-bag label design system across three roasts",
          },
          caption:
            "One system, three roasts — heroic illustration meets colonial-era Americana: courage, balance, comfort.",
        },
        {
          kind: "full",
          aspect: "3 / 2",
          image: {
            src: "/work/colony-coffee/gallery-1.jpg",
            alt: "Colony Coffee — brand direction and exploration board",
          },
          caption:
            "Where it came from — a few rounds of direction: palettes, collateral, and the historical art the labels grew out of.",
        },
      ],
    },
  },
  {
    slug: "evermark",
    num: "02",
    tier: "independent",
    // Held back: the proposal hasn't come back signed, so this isn't a client
    // engagement to show yet. Copy is written and ready — flip this off to publish.
    draft: true,
    title: "EverMark",
    client: "EverMark",
    year: "",
    category: "Brand & Digital",
    duration: "",
    tags: ["Brand", "Identity", "Web"],
    blurb: "Identity, website, and marketing collateral for EverMark — a family-owned premium design-and-build company in PA's Lehigh Valley. In progress.",
    oneLiner: "Helping a family builder stand out in a sea of sameness.",
    brief: "EverMark is a family-owned, premium design-and-build company in Pennsylvania's Lehigh Valley, working to stand out in a crowded field of builders and developers. After a lot of exploration, I began building their identity — with a website, Google Business Profile, and a suite of marketing collateral to follow.",
    process: [],
    services: [
      "Identity system",
      "Web design",
      "Marketing collateral",
      "Google Business Profile",
    ],
    palette: ["#141210", "#c9a24a", "#2e2a22", "#f2efe6"],
    display: "EVERMARK",
    cover: "",
    gallery: [],
    roleSummary: "Identity, website, and collateral for a family-owned design-build brand.",
    caseStudy: {
      overview: [
        { label: "Client", value: "EverMark (family-owned)" },
        { label: "Role", value: "Brand & digital lead (Carman Creative)" },
        { label: "Location", value: "Lehigh Valley, PA" },
        { label: "Scope", value: "Identity, website, GBP, collateral" },
        { label: "Status", value: "In progress — identity underway" },
      ],
      challenge:
        "EverMark is a family-owned, premium design-and-build company trying to stand out in a crowded field of builders and developers. The brand has to feel genuinely premium — and unmistakably theirs — in a category where most names blur together.",
      mandate:
        "After a lot of exploration and conversation, I began building EverMark's identity system — and I'll be developing the website, Google Business Profile, and a full suite of marketing collateral to help them reach the potential they deserve.",
      context:
        "A brand-new client and a family-owned business making the decisions directly, in a design-build category where differentiation is genuinely hard and trust is everything.",
      role: [
        "Led the exploration and early conversations to find the positioning",
        "Building the identity system",
        "Developing the website (in progress)",
        "Setting up the Google Business Profile (in progress)",
        "Designing a suite of marketing collateral (in progress)",
      ],
      team: [
        "EverMark's owners — a family-owned business",
        "A direct client relationship",
      ],
      decisions: [
        {
          title: "Stand out in a sea of sameness",
          body: "The core call: differentiate a premium design-build brand in a category where nearly everyone looks and sounds alike. TODO: Confirm the specific direction as the identity locks.",
        },
        {
          title: "TODO: Add decisions as the work ships",
          body: "TODO: The identity, website, and collateral choices — captured here as they're made.",
        },
      ],
      outcomes: [
        "Identity system in development; website, Google Business Profile, and collateral to follow",
        "TODO: Add outcomes as EverMark launches",
      ],
      reflection: "TODO: Add a reflection as the work ships.",
      work: [
        {
          kind: "full",
          tall: true,
          image: { src: "", alt: "EverMark identity system" },
          caption:
            "The identity — built to feel genuinely premium in a category where names blur together.",
        },
        {
          kind: "detail",
          image: { src: "", alt: "The EverMark mark, up close" },
          caption: "The mark and its details.",
        },
        {
          kind: "browser",
          image: { src: "", alt: "EverMark website — in development" },
          caption:
            "The website in development — the digital home, Google Business Profile, and collateral to follow.",
        },
      ],
    },
  },
  {
    slug: "atromitos",
    num: "02",
    tier: "independent",
    title: "Atrómitos",
    client: "Atrómitos",
    year: "",
    category: "Website / Editorial",
    duration: "",
    tags: ["Web", "Editorial", "Knowledge Hub"],
    blurb: "A website refresh and a new consolidated Knowledge Hub for Atrómitos — a woman-owned consulting firm — plus a 65-page editorial report for the Andy Hill CARE Fund.",
    oneLiner: "Their art direction, elevated — and a Knowledge Hub that carries their expertise.",
    brief: "Atrómitos is a woman-owned health and human services consulting firm. They came in through a referral with their own art direction already settled — they weren't looking for a redesign. So the job was to execute their direction faithfully, raise the craft inside it, and add the things that would actually move the business: real interactivity and a consolidated Knowledge Hub for their published work and webinars. The Andy Hill CARE Fund report was a separate commission.",
    process: [],
    services: [
      "Web design",
      "Knowledge Hub",
      "Editorial / booklet design",
    ],
    palette: ["#0e1b2a", "#2b8fb8", "#1f3a5c", "#eef2f6"],
    display: "ATRÓMITOS",
    cover: "/work/atromitos/site-home.jpg",
    gallery: [],
    roleSummary: "Website refresh + Knowledge Hub + the Andy Hill editorial report.",
    caseStudy: {
      overview: [
        { label: "Client", value: "Atrómitos (woman-owned consulting)" },
        { label: "Role", value: "Web design & editorial (Carman Creative)" },
        { label: "How it came in", value: "Referral from another client" },
        { label: "Scope", value: "Website refresh, Knowledge Hub, Andy Hill report" },
        { label: "Status", value: "Live — client very happy" },
      ],
      challenge:
        "Atrómitos arrived with the site already laid out the way they wanted it. The art direction was theirs and it wasn't up for redesign — so the usual lever, rethinking the look, was off the table. The real problem was underneath it: their published work — articles, policy analysis, podcasts, webinars, toolkits — was scattered, and the site didn't do justice to how much expertise the firm actually produces.",
      mandate:
        "Execute their art direction faithfully, sharpen the craft within it, and build what the site was missing: genuine interactivity and one consolidated home for everything they publish. The Andy Hill CARE Fund report came in separately as its own commission.",
      context:
        "A referral from a completely unrelated client — a good sign the reputation travels. An active, engaged consulting firm that publishes constantly, with a settled visual direction of their own and clear opinions about it.",
      role: [
        "Took the client's art direction as the brief and built the site to it",
        "Raised the execution — typography, spacing, and finish — inside their direction",
        "Added interactivity the original layout didn't have",
        "Designed and built the Knowledge Hub — one consolidated home for their articles, policy analysis, podcast, webinars, and toolkits",
        "Designed the Andy Hill CARE Fund report — a 65-page editorial document, commissioned separately",
      ],
      team: [
        "Atromitos — woman-owned consulting client",
        "Referred by another client; a direct client relationship",
      ],
      decisions: [
        {
          title: "Serve their direction — then raise it",
          body: "The client had settled the art direction and didn't want it reopened. I took that as the brief rather than a fight, and spent the effort where it was still mine to spend: sharper typography, better spacing and hierarchy, and a level of finish above what came in.",
        },
        {
          title: "Put the value where the direction wasn't",
          body: "If the look was fixed, the contribution had to come from what the site could do. That meant real interactivity and, above all, the Knowledge Hub — the piece that changed what the site is actually for.",
        },
        {
          title: "Consolidate the expertise into one place",
          body: "A firm that publishes this much was spreading it across formats and corners of the site. The Knowledge Hub pulls the articles, policy analysis, podcast, webinars, and practical toolkits into one home, so the depth reads at a glance instead of having to be hunted for.",
        },
        {
          title: "Treat the report as real editorial",
          body: "The Andy Hill CARE Fund piece got the full treatment — 65 pages of structured findings, numbered takeaways, section openers, and a tiered recommendation framework. A considered document, not a long memo.",
        },
      ],
      outcomes: [
        "A site built to the client's own direction, executed at a higher level of craft than what came in",
        "The Knowledge Hub — one consolidated home for the firm's articles, policy analysis, podcast, webinars, and toolkits",
        "The Andy Hill CARE Fund report delivered and very well received",
        "An ongoing relationship with an active, engaged client — more work expected",
      ],
      reflection:
        "Not every engagement hands you the visual direction, and this one didn't: the layout was theirs and staying. The useful lesson was where to put the effort when the look is settled — into craft inside their system, and into the Knowledge Hub, which is the piece I'd point at. It came in as a referral from an unrelated client, which tells me the work travels, and it's a relationship I expect to keep building on.",
      work: [
        {
          kind: "browser",
          image: {
            src: "/work/atromitos/site-home.jpg",
            alt: "The Atrómitos homepage — “Consulting Done Fearlessly” over a lioness at sunrise",
          },
          caption:
            "The site, built to the client's own art direction — executed with sharper type, spacing, and finish than what came in.",
        },
        {
          kind: "full",
          aspect: "16 / 10",
          image: {
            src: "/work/atromitos/knowledge-hub.jpg",
            alt: "The Atrómitos Knowledge Hub — a What's New feature above cards for the podcast, articles, learning, and policy analysis",
          },
          caption:
            "The Knowledge Hub — the contribution I'd point at. One home for the articles, policy analysis, podcast, webinars, and toolkits a firm this active keeps producing.",
        },
        {
          kind: "detail",
          image: {
            src: "/work/atromitos/andyhill-cover.jpg",
            alt: "Findings and Recommendations for the Andy Hill CARE Fund — report cover",
          },
          caption:
            "A separate commission: “Findings and Recommendations for the Andy Hill CARE Fund” — 65 pages on community-based organizations and diversity in cancer clinical trials.",
        },
        {
          kind: "pair",
          a: {
            src: "/work/atromitos/andyhill-findings.jpg",
            alt: "Key Findings at a Glance — numbered findings with supporting detail",
          },
          b: {
            src: "/work/atromitos/andyhill-divider.jpg",
            alt: "Executive Summary section opener with photography and a colour panel",
          },
          labelA: "Findings at a glance",
          labelB: "Section openers",
          caption:
            "Editorial structure doing the work: numbered findings a reader can scan, and section openers that give a 65-page document a rhythm.",
        },
        {
          kind: "gallery",
          images: [
            {
              src: "/work/atromitos/andyhill-voices.jpg",
              alt: "Community Voices section — themed qualitative findings",
            },
            {
              src: "/work/atromitos/andyhill-framework.jpg",
              alt: "Program design and tiered recommendation framework pages",
            },
            {
              src: "/work/atromitos/andyhill-cover.jpg",
              alt: "The Andy Hill CARE Fund report cover",
            },
          ],
          caption:
            "Inside the report — community voices, a tiered recommendation framework, and the design system holding 65 pages of dense research together.",
        },
      ],
    },
  },
  {
    slug: "important-colorado",
    num: "03",
    tier: "independent",
    title: "Important! Colorado",
    client: "Health First Colorado",
    year: "2025 — 2026",
    category: "Public Health Campaign",
    duration: "",
    tags: ["Campaign", "Healthcare", "Medicaid"],
    blurb: "The 'IMPORTANT!' wordmark and campaign tactics for Health First Colorado — telling Medicaid members to check their benefits before federal changes affect coverage. Rolling out statewide through 2026.",
    oneLiner: "Telling Colorado's Medicaid members: check your benefits.",
    brief: "A wide-reaching campaign for Health First Colorado — Colorado's Medicaid program — warning members that federal changes could affect their coverage, and urging them to check their benefits information. It began in late 2025 and runs through 2026. I created the 'IMPORTANT!' wordmark and am helping build the print and digital tactics that carry it.",
    process: [],
    services: [
      "Wordmark / logo",
      "Campaign design",
      "Print & digital tactics",
    ],
    palette: ["#78256F", "#0067AB", "#245D38", "#f4ecf3"],
    display: "IMPORTANT!",
    cover: "/work/important-colorado/cover.jpg",
    gallery: [],
    roleSummary: "Created the 'IMPORTANT!' wordmark and campaign tactics for Health First Colorado.",
    caseStudy: {
      overview: [
        { label: "Client", value: "Health First Colorado (Colorado Medicaid)" },
        { label: "Agency", value: "Jumping Fish (agency of hire)" },
        { label: "Role", value: "Wordmark + campaign design" },
        { label: "Reach", value: "Colorado Medicaid members, statewide" },
        { label: "Status", value: "In progress — Phase 2 of 3 (through 2026)" },
      ],
      challenge:
        "Health First Colorado needed to reach Medicaid members statewide with an urgent but clear message: federal changes could affect your coverage — check your benefits information. It had to cut through and be understood fast, across a broad and varied audience.",
      mandate:
        "Working through Jumping Fish, help create the campaign that carries this — starting with a wordmark that could anchor everything, then the print and digital tactics that communicate the change.",
      context:
        "A public-health message with real stakes for members' coverage, a wide statewide audience, and a multi-phase rollout (late 2025 through 2026) spanning Jumping Fish and the Health First Colorado team.",
      role: [
        "Created the 'IMPORTANT! Federal Changes to Colorado's Medicaid Program' wordmark — a logo that works as a standalone graphic and as a headline across pieces",
        "Wrote the campaign brand system: mark architecture, colour, typography, imagery, and template anatomy",
        "Designing the print and digital tactics that communicate the change",
        "Working with Jumping Fish (agency of hire) and the Health First Colorado team",
      ],
      team: [
        "Jumping Fish — agency of hire",
        "Health First Colorado — client team",
      ],
      decisions: [
        {
          title: "A wordmark that doubles as a headline",
          body: "Designed 'IMPORTANT!' to work two ways — as a singular graphic mark and as the headline on graphic and print pieces — so the campaign has one recognizable anchor everywhere it shows up.",
        },
        {
          title: "A mark that needs no translation",
          body: "The audience is statewide and multilingual, so the hero mark is an oversized exclamation point — understood identically in English, Spanish, and every other language the campaign reaches. At large scale the vertical bar alone stops the eye; it works as architecture before it works as punctuation.",
        },
        {
          title: "One system, 100+ partner organizations",
          body: "Over a hundred partner organizations produce materials under this campaign. That only holds together with a governed system: three defined mark variants with rules for when each applies, so the campaign stays recognizable whether it's a state mailer or a county flyer.",
        },
        {
          title: "Build accessibility into the palette, not onto it",
          body: "Every colour pairing is specified with its contrast ratio and WCAG level, and the two brightest colours are restricted to graphic elements rather than body text. On a public-health message that people need to read under stress, legibility is the message.",
        },
        {
          title: "Design for translation from the first layout",
          body: "Spanish translation is handled downstream by the state, so templates had to be built translation-ready — copy blocks that tolerate expansion instead of layouts that break the moment the language changes.",
        },
      ],
      outcomes: [
        "A full campaign brand system — mark architecture, palette, typography, imagery direction, and template anatomy — governing 100+ partner organizations",
        "Phase 2 shipped: member-facing social carousels, immigrant-coverage slides, and a partner eligibility flowchart",
        "Rolling out statewide since late 2025; currently Phase 2 of 3, ending with a video",
        "TODO: Confirm reach and response figures once the campaign completes",
      ],
      reflection:
        "TODO: Add a reflection once the campaign wraps — it ends with a video I plan to package here in a portfolio-worthy way.",
      work: [
        {
          kind: "full",
          aspect: "16 / 9",
          image: {
            src: "/work/important-colorado/wordmark-anatomy.jpg",
            alt: "Wordmark anatomy — three lines, three jobs: IMPORTANT!, the federal-changes framing, and the program name",
          },
          caption:
            "Three lines, three jobs — the dominant call, the framing beneath it, and the program name. The wordmark is the campaign's first touch on every partner-produced piece.",
        },
        {
          kind: "pair",
          a: {
            src: "/work/important-colorado/exclamation-mark.jpg",
            alt: "The exclamation point mark — rationale for a mark that needs no translation",
          },
          b: {
            src: "/work/important-colorado/three-marks.jpg",
            alt: "Three mark variants and the rules for when each is used",
          },
          labelA: "The hero mark",
          labelB: "Right mark, right context",
          caption:
            "A mark that reads identically in every language the campaign reaches — then governed into three variants so a hundred-plus partner organizations stay recognizable.",
        },
        {
          kind: "pair",
          a: {
            src: "/work/important-colorado/palette.jpg",
            alt: "The campaign palette — deep plum, sky blue, mountain green, sunshine yellow, Colorado meadow",
          },
          b: {
            src: "/work/important-colorado/accessibility.jpg",
            alt: "Approved colour pairings with contrast ratios and WCAG levels",
          },
          labelA: "Built to be noticed",
          labelB: "And built to be read",
          caption:
            "Every pairing carries its contrast ratio and WCAG level, and the brightest two colours are held back from body text — on a public-health message, legibility is the message.",
        },
        {
          kind: "gallery",
          images: [
            {
              src: "/work/important-colorado/carousel-1.jpg",
              alt: "Social carousel slide one — federal changes may affect your coverage",
            },
            {
              src: "/work/important-colorado/carousel-3.jpg",
              alt: "Social carousel slide — watch your mail, email, and texts",
            },
            {
              src: "/work/important-colorado/carousel-4.jpg",
              alt: "Social carousel closing slide with the campaign wordmark and Health First Colorado lockup",
            },
          ],
          caption:
            "The member-facing end of it — a swipeable carousel that turns a federal policy change into three things you can do this week.",
        },
        {
          kind: "full",
          aspect: "16 / 9",
          image: {
            src: "/work/important-colorado/phase2-eligibility.jpg",
            alt: "Phase 2 slide — an eligibility table showing which immigration statuses may qualify for coverage",
          },
          caption:
            "Phase 2, on immigrant health coverage: the hardest information in the campaign, laid out so a reader can find their own situation in one pass.",
        },
        {
          kind: "full",
          aspect: "3 / 2",
          image: {
            src: "/work/important-colorado/flowchart.jpg",
            alt: "Partner resource — an H.R. 1 eligibility decision flowchart for staff guiding members",
          },
          caption:
            "And the partner-facing counterpart — a decision flowchart for the staff walking members through it, with the screen-reader-accessible version linked alongside.",
        },
      ],
    },
  },
  {
    slug: "friends-rehab",
    num: "04",
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
        "A mission-driven organization with limited technical capacity and an audience that often arrives under stress. The content had to be accessible and calm.",
      role: [
        "Led the site refresh and information architecture",
        "Shaped the content so services and next steps read plainly",
        "Built it on a CMS staff can maintain themselves",
      ],
      team: [
        "FRP staff and stakeholders",
        "A direct client relationship",
      ],
      decisions: [
        {
          title: "Design for reassurance, not decoration",
          body: "Readable typography and a restrained system, so the experience reads calm and credible to someone seeking help rather than busy or clinical.",
        },
        {
          title: "Independence over dependence",
          body: "Built on a CMS so staff can keep content current without a designer in the loop — the durability a small nonprofit actually needs.",
        },
        {
          title: "Now: build toward giving",
          body: "The current work takes it further — reworking the site into a more donation-friendly experience, because for a nonprofit, making it easy to give is the point.",
        },
      ],
      outcomes: [
        "Stood up a refreshed website the staff can maintain themselves",
        "Currently rebuilding it into a more donation-friendly web experience",
      ],
      reflection:
        "The first refresh gave FRP a calm, credible home they can run without a designer. Now I'm taking it further toward donations — because for a nonprofit, the easier it is to give, the more good the work does.",
      work: [
        {
          kind: "pair",
          a: {
            src: "/work/friends-rehab/frp-purpose.png",
            alt: "FRP — Our purpose and Our Programs",
          },
          b: {
            src: "/work/friends-rehab/frp-homeless.png",
            alt: "FRP — Homeless Services Program",
          },
          labelA: "Our purpose",
          labelB: "Homeless Services",
          caption:
            "Programs and services, written to read plainly and be findable at a glance.",
        },
        {
          kind: "full",
          image: {
            src: "/work/friends-rehab/frp-housewarming.png",
            alt: "FRP — The Housewarming Fund page",
          },
          caption:
            "The Housewarming Fund — a focused giving page, and the start of a more donation-friendly experience.",
        },
      ],
    },
  },
  {
    slug: "special-forces-trust",
    num: "05",
    tier: "independent",
    title: "Special Forces Trust",
    client: "Special Forces Trust",
    year: "2024",
    category: "Nonprofit / Brand & Web",
    duration: "",
    tags: ["Brand", "Web", "Merch"],
    blurb:
      "A brand refresh, a better website, branded merchandise, and an events platform for Special Forces Trust — a fund supporting military spouses and veterans.",
    oneLiner:
      "Giving back to the military community and their families.",
    brief:
      "Special Forces Trust is a fund that supports military spouses and veterans through fundraising and events. I refreshed their logo and branding, rebuilt their website with a better approach, created branded merchandise, and built a better platform for veterans to engage with and get involved in the events they host.",
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
      "Brand refresh",
      "Web design",
      "Branded merchandise",
      "Events platform",
    ],
    palette: ["#0a1729", "#1f3a5c", "#8a9bb0", "#e8ecf2"],
    display: "SFT",
    cover: "/work/special-forces-trust/cover.png",
    gallery: [
      { src: "/work/special-forces-trust/gallery-3.png", alt: "SFT — refreshed homepage" },
      { src: "/work/special-forces-trust/gallery-2.png", alt: "SFT — Supporting Our Quiet Professionals" },
      { src: "/work/special-forces-trust/gallery-1.png", alt: "SFT — ways to give back and branded gear" },
    ],
    externalUrl: "https://www.carmancreative.com/work/sft",
    caseStudy: {
      overview: [
        { label: "Client", value: "Special Forces Trust" },
        { label: "Role", value: "Brand refresh, website & merch (Carman Creative)" },
        { label: "Serves", value: "Military spouses & veterans" },
        { label: "Scope", value: "Logo/brand, website, merch, events platform" },
        { label: "Status", value: "Delivered" },
      ],
      challenge:
        "Special Forces Trust supports military spouses and veterans through fundraising and events. They needed a refreshed brand and a better website — and a clearer way for veterans to engage with and get involved in the events the fund hosts.",
      mandate:
        "Refresh the brand and rebuild the experience: a stronger logo and identity, a better website, branded merchandise, and a platform that makes it easy for veterans and supporters to take part.",
      context:
        "A mission-driven fund serving the military community, where the work has to feel respectful and credible — and genuinely easy for people to show up for.",
      role: [
        "Refreshed the logo and branding",
        "Rebuilt the website with a better approach",
        "Created branded merchandise",
        "Built a better platform for veterans to engage and join the events",
      ],
      team: [
        "Special Forces Trust — client",
        "A direct client relationship",
      ],
      decisions: [
        {
          title: "Refresh, don't replace",
          body: "Strengthened the existing identity rather than starting from scratch, keeping continuity with a brand the community already knows and trusts.",
        },
        {
          title: "Make getting involved the easy part",
          body: "Built the platform around helping veterans engage with and get into the events — because participation is the whole point of the fund.",
        },
      ],
      outcomes: [
        "A refreshed brand, a better website, and branded merch",
        "A clearer platform for veterans to engage with and join the events",
      ],
      reflection:
        "I was proud to work on something that gives back to the military community and their families.",
      work: [
        {
          kind: "browser",
          image: {
            src: "/work/special-forces-trust/gallery-3.png",
            alt: "Special Forces Trust website — Supporting Warriors and their Families, with a How We Help section",
          },
          caption:
            "The refreshed site — “Supporting Warriors and their Families, Honoring Veterans,” with clear paths to donate, get involved, and request support.",
        },
        {
          kind: "full",
          aspect: "2 / 1",
          image: {
            src: "/work/special-forces-trust/gallery-2.png",
            alt: "Special Forces Trust — the Supporting Our Quiet Professionals section",
          },
          caption:
            "“Supporting Our Quiet Professionals” — the mission told plainly, carried by the community's own photography.",
        },
        {
          kind: "full",
          aspect: "2 / 1",
          image: {
            src: "/work/special-forces-trust/gallery-1.png",
            alt: "Special Forces Trust — Ways to give back, with branded SFT gear",
          },
          caption:
            "Ways to give back — branded SFT gear, where every purchase helps fund the events and services the Trust provides.",
        },
      ],
    },
  },
  {
    slug: "stamp-out-stigma",
    num: "06",
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
      { src: "/work/stamp-out-stigma/gallery-2.png", alt: "Stamp Out Stigma — the campaign on the Times Square screens" },
      { src: "/work/stamp-out-stigma/gallery-1.jpg", alt: "Stamp Out Stigma — the campaign creative up close" },
      { src: "/work/stamp-out-stigma/gallery-3.png", alt: "Stamp Out Stigma — Times Square at dusk" },
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
        "A large-format, high-visibility placement with only seconds to communicate, a sensitive subject, and a broad, diverse audience moving fast.",
      role: [
        "Directed the campaign concept and messaging",
        "Designed the out-of-home creative for legibility at a glance",
      ],
      team: [
        "Stamp Out Stigma campaign stakeholders",
        "A collaborative campaign effort",
      ],
      decisions: [
        {
          title: "Clarity over spectacle",
          body: "Strong typography, restrained color, and honest imagery so the message reads in seconds — without tipping into sensationalism on a sensitive subject.",
        },
        {
          title: "Put the message where silence usually wins",
          body: "Placing an honest mental-health message in one of the most public spaces on earth challenges the stigma directly, in front of everyone.",
        },
        {
          title: "Lead with human emotion",
          body: "Real stories and grounded imagery over statistics — normalizing the conversation by making it human, not clinical.",
        },
      ],
      outcomes: [
        "Amplified national mental-health awareness from one of the most public stages in the world — Times Square",
        "Reinforced a simple, hard message: mental health matters as much as physical health",
      ],
      reflection:
        "Putting an honest mental-health message in Times Square was a reminder that clarity and empathy can cut through even the loudest room.",
      work: [
        {
          kind: "full",
          aspect: "4 / 3",
          image: {
            src: "/work/stamp-out-stigma/gallery-2.png",
            alt: "Stamp Out Stigma — the campaign on the Times Square screens at dusk",
          },
          caption:
            "The message on the Times Square screens — honest, human, and impossible to miss in one of the loudest rooms on earth.",
        },
        {
          kind: "detail",
          image: {
            src: "/work/stamp-out-stigma/gallery-1.jpg",
            alt: "Stamp Out Stigma — the campaign creative up close: 1 in 5, Talk about it",
          },
          caption:
            "The creative up close — “1 in 5,” and a single, direct ask: talk about it. Your story could change a life.",
        },
      ],
    },
  },
  {
    slug: "spikes-k9-fund",
    num: "07",
    tier: "independent",
    title: "Spike's K9 Fund",
    client: "Spike's K9 Fund",
    year: "2023",
    category: "Nonprofit / Web",
    duration: "",
    tags: ["Web", "Nonprofit", "Collateral"],
    blurb:
      "The website and collateral that got Spike's K9 Fund off the ground — a local Norfolk/VB nonprofit founded by a retired special-ops veteran on a mission to protect and rehome service dogs.",
    oneLiner:
      "A dog saved his life — now he's saving theirs.",
    brief:
      "Spike's K9 Fund is a Norfolk/Virginia Beach nonprofit founded by Jim Hatch — a retired special-ops veteran whose life was saved by a dog. He's on a mission to protect service dogs and help rehome them when they retire, and to build a space where dog lovers can support the work. I created their website and collateral and helped get them off the ground.",
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
      "Collateral",
      "Brand & launch",
    ],
    palette: ["#0c0c0c", "#b5302b", "#9aa3a0", "#f0ece3"],
    display: "SPIKE'S",
    cover: "/work/spikes-k9-fund/cover.png",
    gallery: [
      { src: "/work/spikes-k9-fund/gallery-1.png", alt: "Spike's K9 Fund — About Spike's" },
      { src: "/work/spikes-k9-fund/gallery-2.png", alt: "Spike's K9 Fund — the K9 Spike story" },
      { src: "/work/spikes-k9-fund/gallery-3.png", alt: "Spike's K9 Fund — the online shop" },
    ],
    externalUrl: "https://www.carmancreative.com/work/spikes",
    caseStudy: {
      overview: [
        { label: "Client", value: "Spike's K9 Fund — Jim Hatch" },
        { label: "Role", value: "Website & collateral (Carman Creative)" },
        { label: "Location", value: "Norfolk / Virginia Beach" },
        { label: "Scope", value: "Website, collateral, launch" },
        { label: "Status", value: "Launched — off the ground" },
      ],
      challenge:
        "Jim Hatch — a retired special-ops veteran whose life was saved by a dog — wanted to protect service dogs and help rehome them when they retire, and to give dog lovers a real place to support the mission. Spike's needed a home online and the materials to get off the ground.",
      mandate:
        "Create the website and collateral to launch Spike's — a clear, welcoming platform that carries Jim's mission and makes it easy for supporters to show up.",
      context:
        "A brand-new, founder-driven nonprofit with a deeply personal mission, local to the Norfolk/Virginia Beach area, that needed to look credible and established from day one.",
      role: [
        "Designed and built the Spike's website",
        "Created the collateral to support the launch",
        "Helped get the organization off the ground",
      ],
      team: [
        "Jim Hatch — founder, retired special ops",
        "A direct client relationship",
      ],
      decisions: [
        {
          title: "Lead with the mission and the dogs",
          body: "Jim's story — a dog saved his life — is the heart of it, so the platform puts the mission and the dogs front and center rather than burying them under nonprofit boilerplate.",
        },
        {
          title: "Make it easy for dog lovers to show up",
          body: "A young, founder-driven nonprofit lives on how easily people can rally to it, so the site is built as a clear, welcoming place for supporters to get involved.",
        },
      ],
      outcomes: [
        "Launched Spike's and got the organization off the ground",
        "A platform and space for dog lovers to support the mission",
      ],
      reflection:
        "I don't work with Spike's anymore, but I loved this one — a local mission with real heart, led by someone who lived it. I was stoked to help Jim get it started.",
      work: [
        {
          kind: "browser",
          image: {
            src: "/work/spikes-k9-fund/gallery-1.png",
            alt: "Spike's K9 Fund website — About Spike's, founder Jim Hatch's story and a working dog",
          },
          caption:
            "The site that got Spike's off the ground — Jim Hatch's story and the working dogs at the heart of it, mission front and center.",
        },
        {
          kind: "full",
          aspect: "2 / 1",
          image: {
            src: "/work/spikes-k9-fund/gallery-2.png",
            alt: "Spike's K9 Fund — the K9 Spike story section",
          },
          caption:
            "K9 Spike — the founder's first working dog, the partner who saved his life, and the fund's namesake.",
        },
        {
          kind: "full",
          aspect: "2 / 1",
          image: {
            src: "/work/spikes-k9-fund/gallery-3.png",
            alt: "Spike's K9 Fund — the online shop of branded products",
          },
          caption:
            "The shop — branded collateral and merch that give supporters an easy way to show up for the mission.",
        },
      ],
    },
  },
];

/**
 * Site-facing lookup: drafts are invisible here, so a held-back project can't
 * be reached by typing its URL even though its data still lives in this file.
 */
export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug && !p.draft);
}

export function tierOf(p: Project): ProjectTier {
  return p.tier ?? "independent";
}

/** Everything cleared to appear on the site — drafts stay in the file only. */
export const PUBLISHED_PROJECTS = PROJECTS.filter((p) => !p.draft);

export function projectsByTier(tier: ProjectTier): Project[] {
  return PUBLISHED_PROJECTS.filter((p) => tierOf(p) === tier);
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
