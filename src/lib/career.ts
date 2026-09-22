/**
 * Career — single source of truth for employment history and scale proof.
 *
 * Why this file exists: the same facts (titles, dates, team size, the
 * Beacon → Carelon transition, the enterprise numbers) were hand-typed in
 * About.tsx, ResumePage.tsx, ResumePreview.tsx and LeadershipPage.tsx. A
 * hiring manager reads the résumé, then LinkedIn, then this site — any drift
 * between them reads as carelessness. Everything career-related now derives
 * from here, and the LinkedIn profile should be kept in sync with it by hand.
 *
 * TITLE DISCIPLINE — read before editing.
 * John held the Creative Director title at Beacon Health Options. The Carelon
 * acquisition re-leveled the title to Creative Manager; the scope did not
 * change. Both facts are published, and the Director title is shown as a role
 * that was *held* (its own stint, with dates) rather than as a "formerly"
 * footnote under the current title. Do not hide the Manager title, and do not
 * demote the Director title back to a parenthetical — an earlier version did
 * the latter and it read, to anyone screening for Director-level work, as a
 * demotion with no explanation.
 *
 * HONESTY — the enterprise figures below (~1,500 assets, ~85,000 employees,
 * ~60% / ~30%, ~75 projects a month) are published as approximations with a
 * leading "~". They are not to be sharpened into precise claims, and any
 * figure that has NOT been confirmed belongs in a visible `TODO: Confirm`
 * placeholder instead of here.
 */

export type TitleStint = {
  title: string;
  /** The entity as it was named while he held the title. */
  org?: string;
  range: string;
  current?: boolean;
  /**
   * One line saying what this era *was*, above the bullets. Each stint had
   * been opening on the same "brand, campaign, digital and creative
   * operations" list, so three genuinely different jobs — came up through the
   * craft, ran a function and carried it through an acquisition, now operate
   * across an enterprise — read as one job with different dates.
   */
  summary?: string;
  /**
   * Accomplishments belong to the title that produced them, not to the
   * employer. The rebrand and Marketing Bench both happened while John held
   * the Creative Director title; listing them under the company would let a
   * reader assume they were done at the Manager level.
   */
  bullets: string[];
};

export type Employer = {
  /** Organization as it is named today. */
  company: string;
  /** Total tenure with the organization. */
  range: string;
  /** Titles held, most recent first. Two entries = a real progression. */
  stints: TitleStint[];
};

/**
 * Employment, enterprise first.
 */
export const EMPLOYERS: Employer[] = [
  {
    // Elevance Health employs John from the March 2023 acquisition onward.
    // Beacon Health Options is its own employer below: Elevance did not employ
    // him from 2010 — it acquired the company that did. LinkedIn is structured
    // this way and it is the literally accurate version; the dates butt up, so
    // a reader still sees an unbroken run from 2010.
    company: "Elevance Health",
    range: "2023 — Present",
    stints: [
      {
        title: "Creative Manager",
        range: "2023 — Present",
        current: true,
        summary:
          "On the Elevance Health creative team, working across all lines of business inside an ~85,000-person enterprise. Came in as creative lead for Carelon Behavioral Health when Beacon was acquired; the remit widened from there.",
        bullets: [
          "Direct brand, campaign, and digital work across Elevance lines of business — behavioral health outward.",
          "Manage a five-person design team and direct outside agencies and production vendors.",
          "Rebuilt Workfront intake, review, and approval around ~75 projects a month (2025) — took the process apart around the pain points the team named rather than patching the existing instance.",
          "Own creative review and quality control, and build the templates, governance, and systems that hold quality steady as volume grows.",
        ],
      },
    ],
  },
  {
    // Thirteen years and three titles at one company through one merger.
    // ValueOptions merged with Beacon Health Strategies to form Beacon Health
    // Options in 2014; the ValueOptions brand was phased out through mid-2016,
    // which is when John moved from designing to running creative services.
    company: "Beacon Health Options",
    range: "2010 — 2023",
    stints: [
      {
        title: "Creative Director",
        // October 2018 — March 2023, the month Beacon became Carelon
        // Behavioral Health. The title change and the rebrand are the same
        // date, which is what makes the re-level self-evident.
        range: "2018 — 2023",
        summary:
          "Ran the creative function for a national behavioral health company — the team, the systems, and the brand — then carried all three through its acquisition by Elevance Health.",
        bullets: [
          "Led a five-person design team and set the creative standard across brand, campaign, and digital work.",
          "Led the creative transition through the Beacon → Carelon rebrand — ~1,500 assets rebuilt on the new identity across an ~85,000-person organization.",
          "Built Marketing Bench (2020), a self-serve platform letting field teams produce on-brand collateral without a designer in the critical path — ~60% faster turnaround, ~30% higher engagement.",
          "Led Stamp Out Stigma, a national mental-health awareness campaign, including out-of-home placement in Times Square.",
        ],
      },
      {
        // June 2016 — October 2018. TITLE: confirmed. The function was named
        // Creative Services at Beacon (and in the early Carelon years), so the
        // title is "Manager of Creative Services" — not "Manager of Design",
        // which is how it was recalled in conversation before being checked.
        title: "Manager of Creative Services",
        range: "2016 — 2018",
        summary:
          "Took over the creative services function — the in-house team, the budget, the vendor relationships, and the standards behind the brand.",
        bullets: [
          "Managed the in-house creative team: hiring, training, design direction, and presentation support.",
          "Owned the creative budget and the relationships with outside agencies and production vendors.",
          "Wrote and maintained the company style guide and the brand-compliance standards behind it.",
          // TODO: Confirm the timing on this one. John's LinkedIn attributes
          // the merger rollout to this role, but the merger that created
          // Beacon closed in 2014 — before this title began in 2016. The
          // ValueOptions brand was phased out through mid-2016, so a rollout
          // running into this period is plausible; the sentence below is
          // worded to claim the rollout, not the merger.
          "Rolled the merged Beacon brand out across 54 offices, 5,000 employees, and 270 customers.",
        ],
      },
      {
        title: "Graphic Designer",
        org: "ValueOptions → Beacon Health Options",
        range: "2010 — 2016",
        summary:
          "Joined ValueOptions producing brand, campaign, print, and member-facing work, and stayed through the 2014 merger that created Beacon Health Options.",
        bullets: [
          "Design and production across brand, campaign, and member communications for a national behavioral health organization.",
        ],
      },
    ],
  },
  {
    company: "Carman Creative",
    range: "2020 — Present",
    stints: [
      {
        title: "Founder",
        range: "2020 — Present",
        current: true,
        summary:
          "Independent practice: brand, identity, web, campaign, and creative-systems work for small organizations and nonprofits.",
        bullets: [
          "Selected work includes Colony Coffee, Friends Rehabilitation Program, Special Forces Trust, and Spike's K9 Fund.",
        ],
      },
    ],
  },
  {
    // Kept short on purpose. It is seventeen years old and its job is to close
    // the record, not to compete for attention.
    company: "ASAP Printing & Graphics",
    range: "2009 — 2010",
    stints: [
      {
        title: "Graphic Designer",
        range: "2009 — 2010",
        summary:
          "Design and production for a commercial print shop — the grounding in how a file actually becomes a printed thing.",
        bullets: [],
      },
    ],
  },
];

/**
 * Education. A blank education field is a hard filter on a lot of
 * large-company screens, and the résumé carried none at all until now.
 */
export const EDUCATION = {
  school: "Virginia Commonwealth University",
  degree: "BFA, Graphic Design",
  honors: "cum laude",
  year: "2008",
} as const;

/**
 * The scale numbers that qualify the work as enterprise. These belong wherever
 * the screen actually happens — the home hero, the résumé summary — not only
 * on a secondary page someone may never reach.
 */
export const SCALE = {
  assets: "~1,500",
  assetsLabel: "Brand assets migrated in an enterprise rebrand",
  orgSize: "~85,000",
  orgLabel: "Person organization",
  team: 5,
  teamLabel: "Designers led as a creative lead",
  /** Counts from the first paid design work, during the VCU degree. */
  years: 20,
  yearsLabel: "Years leading creative & brand",
  enterpriseYears: 15,
  enterpriseYearsLabel: "Years in enterprise healthcare",
  throughput: "~75",
  throughputLabel: "Projects a month through the workflow he rebuilt",
} as const;

/**
 * The transition, stated once. Every surface that explains the title change
 * should use this wording or a close variant — the fact is verifiable, so the
 * phrasing should be consistent everywhere a reader might check it.
 */
export const TRANSITION_NOTE =
  "Beacon Health Options became Carelon Behavioral Health inside Elevance Health in 2023, and I led the creative transition. The restructuring moved my title from Creative Director to Creative Manager; the work did not shrink with it — I am on the Elevance Health creative team now, across all lines of business rather than one company.";
