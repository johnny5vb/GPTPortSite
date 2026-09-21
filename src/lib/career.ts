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
    // One organisation, three names. ValueOptions merged with Beacon Health
    // Strategies to form Beacon Health Options in 2014 (the ValueOptions brand
    // was phased out through mid-2016). Anthem, Inc. renamed itself Elevance
    // Health in June 2022 and reorganised into three go-to-market brands —
    // Anthem Blue Cross/BCBS, Wellpoint and Carelon — and Beacon became
    // Carelon Behavioral Health inside Carelon in 2023. Elevance Health is the
    // parent; Anthem is a brand within it, not the umbrella.
    //
    // Four titles across sixteen years, all dates confirmed:
    //   Graphic Designer      2010          — May 2016
    //   Manager of Design     June 2016     — Sept 2018
    //   Creative Director     October 2018  — March 2023
    //   Creative Manager      March 2023    — present  (the merger re-level)
    // Each is its own stint so the progression is legible; collapsing them hid
    // three promotions. The site renders years; the months above are what
    // LinkedIn needs, and every boundary meets with no gap or overlap.
    company: "Carelon Behavioral Health (Elevance Health)",
    range: "2010 — Present",
    stints: [
      {
        title: "Creative Manager",
        org: "Carelon Behavioral Health",
        range: "2023 — Present",
        current: true,
        // March 2023 — the title changed the same month Beacon became Carelon
        // Behavioral Health, which is what makes the re-level self-evident:
        // the two dates are the same date. The site states years; LinkedIn
        // wants the month, and it is March 2023.
        //
        // The scope grew when the title compressed. Stated plainly, without
        // editorialising about the title — the reader can see the two stints.
        summary:
          "Creative lead for Carelon Behavioral Health, with work spanning multiple Elevance Health lines of business inside an ~85,000-person enterprise.",
        bullets: [
          "Direct brand, campaign, and digital work for behavioral health alongside projects for other Elevance lines of business.",
          "Manage a five-person design team and direct outside agencies and production vendors.",
          "Rebuilt Workfront intake, review, and approval around ~75 projects a month (2025) — took the process apart around the pain points the team named rather than patching the existing instance.",
          "Own creative review and quality control, and build the templates, governance, and systems that hold quality steady as volume grows.",
        ],
      },
      {
        title: "Creative Director",
        org: "Beacon Health Options",
        // October 2018 — March 2023, both confirmed. The site states years,
        // matching the rest of the résumé; LinkedIn wants months, and these
        // two meet exactly at the rebrand with no gap between them.
        range: "2018 — 2023",
        summary:
          "Ran the creative function for a national behavioral health company — the team, the systems, and the brand — then carried all three through its acquisition by Elevance Health.",
        bullets: [
          "Led a five-person design team and set the creative standard across brand, campaign, and digital work.",
          "Creative lead through the Beacon → Carelon rebrand — ~1,500 assets rebuilt on the new identity across an ~85,000-person organization.",
          "Built Marketing Bench (2020), a self-serve platform letting field teams produce on-brand collateral without a designer in the critical path — ~60% faster turnaround, ~30% higher engagement.",
          "Led Stamp Out Stigma, a national mental-health awareness campaign, including out-of-home placement in Times Square.",
        ],
      },
      {
        title: "Manager of Design",
        org: "Beacon Health Options",
        // June 2016 — October 2018 (the Creative Director promotion). The
        // month lands on the ValueOptions → Beacon brand transition, which was
        // phased through mid-2016, so the promotion and the rename coincided.
        // That is why the Designer stint is attributed to ValueOptions and
        // this one to Beacon: it is not a guess, the dates line up.
        range: "2016 — 2018",
        summary:
          "Moved from making the work to running it — took over the design team, creative review, and the intake that fed both.",
        bullets: [
          "Ran day-to-day creative for the design team: assignments, review, and quality across a high-volume request queue.",
          "Started the process work that became a through-line — intake, templates, and the first governance around brand consistency.",
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
  "Beacon Health Options became Carelon Behavioral Health inside Elevance Health in 2023. The restructuring moved my title from Creative Director to Creative Manager; the work did not shrink with it — it now spans multiple Elevance lines of business rather than one company.";
