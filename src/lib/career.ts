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
    // One organisation, three names. ValueOptions merged with Beacon Health
    // Strategies to form Beacon Health Options in 2014 (the ValueOptions brand
    // was phased out through mid-2016); Beacon became Carelon Behavioral
    // Health inside Elevance Health in 2023. Each stint names the entity as it
    // was called at the time, so the tenure reads as one continuous sixteen
    // years through two acquisitions rather than as three separate jobs.
    company: "Carelon Behavioral Health (Elevance Health)",
    range: "2010 — Present",
    stints: [
      {
        title: "Creative Manager",
        org: "Carelon Behavioral Health",
        range: "2023 — Present",
        current: true,
        bullets: [
          "Lead brand, campaign, digital, and creative-operations work across a complex healthcare organization.",
          "Manage a five-person design team and direct outside agencies and vendors.",
          "Reworked Workfront intake, review, and approval across ~75 projects a month (2025) — rebuilt the process around the pain points the team named rather than patching the existing instance.",
          "Own creative review and quality control, and build the templates, systems, and governance that let quality scale with volume.",
        ],
      },
      {
        title: "Creative Director",
        org: "Beacon Health Options",
        // October 2018. The site states years, matching the rest of the
        // résumé; LinkedIn needs the month, which is October 2018.
        range: "2018 — 2023",
        bullets: [
          "Led brand, campaign, digital, and creative-operations work for a national behavioral health organization, and managed a five-person design team.",
          "Creative lead through the Beacon Health Options → Carelon / Elevance Health acquisition and rebrand — migrated ~1,500 brand assets to the new identity across an ~85,000-person organization.",
          "Built the Marketing Bench creative-support model (2020) — a self-serve platform letting field teams produce on-brand collateral without a designer in the critical path. ~60% faster turnaround, ~30% higher engagement.",
          "Led the Stamp Out Stigma national mental-health awareness campaign, including out-of-home placement in Times Square.",
        ],
      },
      {
        // TODO: Split this into two stints once the year John became Manager of
        // Design is confirmed. Stated as one span for now because the exact
        // boundary is not known and inventing it would be worse than combining
        // them — both titles are named, and the span is correct either way.
        title: "Graphic Designer, then Manager of Design",
        org: "ValueOptions → Beacon Health Options",
        range: "2010 — 2018",
        bullets: [
          "Joined as a graphic designer and moved into managing design, covering brand, campaign, and production work across the business.",
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
        bullets: [
          "Independent studio: brand, identity, web, campaign, and creative-systems engagements.",
          "Selected work includes Colony Coffee, Friends Rehabilitation Program, Health First Colorado, Special Forces Trust, and Spike's K9 Fund.",
        ],
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
  "Beacon Health Options became Carelon Behavioral Health inside Elevance Health in 2023. The restructuring moved my title from Creative Director to Creative Manager; the scope stayed where it was.";
