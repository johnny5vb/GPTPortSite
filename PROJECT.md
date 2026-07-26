# Carman Creative — Project Context

Single source of truth for the carmancreative.com portfolio. Read this first
when picking up the project in a new session. Update it as the site changes.

---

## What this is

The personal portfolio + career site for **John Carman**, a **Creative
Director and Brand & Creative Operations Leader** based in Virginia Beach.
Site lives at **https://www.carmancreative.com**.

**Primary purpose (repositioned):** present John first as a senior creative
leader available for **Director-level in-house employment**, and second as
**Carman Creative**, a consulting/freelance offering. The employment path is
more prominent than the consulting path everywhere on the site. The
positioning hierarchy is: (1) Creative Director, (2) Brand & Creative
Operations Leader, (3) AI-Enabled Creative Strategist — AI is a supporting
advantage, never the lead.

The product is a single-page narrative on `/` plus deeper subpages: a
**Leadership** page (`/leadership`), a print-friendly **Résumé** (`/resume`),
an AI & Systems lab (`/lab`), a capabilities deck (`/capabilities`), and case
studies at `/work/[slug]` (three enterprise **leadership** flagships +
independent client work). The home page is a long-scroll story with a sticky
section rail and framer-motion choreography.

Voice and tone target: **quiet authority** — confident, senior, direct. Not
"swagger," not hustle. Modern tools, classical taste. Specific things to
avoid: sounding desperate or hustle-y ("Always grinding" was removed in favor
of "Open to the right leadership opportunity"); the old `carman • creative`
dot treatment (dots are out, slashes are in); leading with "AI Strategist";
fabricated metrics (see the TODO discipline below).

**Single source of truth for identity/contact:** `src/lib/profile.ts`
(`PROFILE`) — name, title stack, email, socials, location, availability,
résumé href. Import from it; don't hard-code contact/positioning again.

**Honesty / TODO discipline:** never publish unverified metrics as facts.
Numbers awaiting confirmation (e.g. ~1,500+ assets, ~70,000+ employees,
~75+ projects/month, ~60% faster, ~30% engagement) live as visible
`TODO: Confirm …` placeholders that render in a muted italic style — never as
claims. The flagship leadership case studies are scaffolded this way.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 16** (App Router, Turbopack) — note: this version has breaking changes from anything in pretraining. Always check `node_modules/next/dist/docs/` before writing new patterns. |
| Language | TypeScript |
| Styling | Tailwind v4 (CSS-first, `@theme` block in `globals.css` — there is no `tailwind.config.js`) |
| Motion | framer-motion |
| Fonts | Fraunces (display, with SOFT + WONK axes), Geist (sans), JetBrains Mono — all via `next/font/google` |
| Hosting | Netlify (`@netlify/plugin-nextjs`) |
| Registrar / DNS | WordPress.com (domain `carmancreative.com`) |

Brand mark + wordmark SVGs are in `/public/brand/`. The favicon, apple-touch
icon, and Open Graph image are all dynamically generated via Next.js App Router
file conventions: `src/app/icon.svg`, `apple-icon.tsx`, `opengraph-image.tsx`.

---

## Brand tokens

Defined in `src/app/globals.css` under `@theme {}`. Don't redefine these — use
the existing custom properties / Tailwind class names everywhere.

```
ink         #080808   (background)
ink-2       #0d0d0d
surface     #111111
surface-2   #181818
line        #1f1f1f
line-2      #2a2a2a
bone        #f5f3ef   (primary text)
mute        #8a8a8a
mute-2      #808080   ← was #555555; raised for WCAG AA contrast on ink
green       #1cb791   (brand accent)
green-bright #2ee5b3
green-dim   #0e6e57
```

Fonts via CSS vars: `--font-display` (Fraunces), `--font-sans` (Geist),
`--font-mono` (JetBrains Mono). The italic "wonk" treatment used for accent
words (`<em className="font-display-wonk text-green">…</em>`) is a Fraunces
variable-font axis trick.

---

## Site map

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `Hero, AudienceSplit, Manifesto, Work, Showpiece, AISystemsTeaser, About, ResumePreview, Services, ContactCTA, Footer` | The main narrative — leadership-first |
| `/leadership` | `LeadershipPage` | Dedicated page for senior in-house readiness: experience, what John can lead, flagship case studies, leadership proof, philosophy, résumé/contact CTAs |
| `/resume` | `ResumePage` | Print-friendly on-page résumé ("Print / Save as PDF"). No PDF committed yet — `PROFILE.resumePdf` is `null` with a TODO |
| `/lab` | `LabPage` (renders all 4 AI systems with sticky tab nav) | AI & Creative Systems — clearly status-labeled demos |
| `/work/[slug]` | `ProjectDetail` (branches: flagship leadership template vs. standard client layout) | Leadership flagships — `beacon-carelon-transformation`, `creative-operations-marketing-bench`, `workfront-workflow-transformation`; independent — `colony-coffee`, `friends-rehab`, `special-forces-trust`, `stamp-out-stigma`, `spikes-k9-fund`; secondary — `harrison-bounds`, `beacon-van` |
| `/capabilities` | `CapabilitiesDeck` | Snap-scrolling capabilities deck (linked from Footer for sharing) |

Project data is sourced from `src/lib/projects.ts` (note: **`src/lib/`**, not
`src/data/`). Each project carries a `tier` (`leadership` / `independent` /
`secondary`); flagships add `flagship: true` + a `caseStudy` object (overview,
challenge, mandate, context, role, team, decisions, outcomes, reflection) and
have `cover: ""` (they render a branded gradient hero, no photo). Helpers:
`LEADERSHIP_PROJECTS`, `INDEPENDENT_PROJECTS`, `SECONDARY_PROJECTS`,
`projectsByTier`, `tierOf`. `getAdjacentProjects` stays within a tier.

Section numbers come from `SectionRail.tsx` and must stay in sync with the
eyebrow labels inside each section component.

### Home section numbering (eyebrows)
`AudienceSplit` (Hiring John / Work With Carman Creative) and `ResumePreview`
are un-numbered CTA bands between the numbered narrative sections.
```
00  Intro        (Hero)
01  How I Lead    (Manifesto — leadership philosophy, 4 principles)
02  Work          (Work — Featured leadership work + Selected independent work + More work)
03  In Focus      (Showpiece)
04  AI & Systems  (AISystemsTeaser — compact, links → /lab; big demo removed from home)
05  Consulting    (Services — reframed as the secondary Carman Creative offer)
06  About         (About)
07  Contact       (ContactCTA — split employment vs. project inquiry paths)
```

---

## Major components

- **`Hero.tsx`** — Section 00. Long animated headline with rotator
  ("ship./lead./stand out./last.") on the last word. Renders `HeroMark`.
- **`HeroMonogram.tsx`** — The hero visual. A single calm CC monogram anchored
  in the headline's right-side negative space (`lg+` only; the mobile hero is
  pure typography). The mark is static after entrance; only a soft brand-green
  glow breathes slowly behind it, plus a whisper of cursor parallax from the
  Hero's shared pointer MotionValues. Decorative (`aria-hidden`). Reduced-motion
  aware. (History: started as the animated `HeroMark`, briefly became a drifting
  work "contact sheet" — `HeroContactSheet` — which read as too busy/floaty, then
  settled here on a quiet monogram.)
- **`Manifesto.tsx`** — Section 01. Compact interactive slider with
  auto-advance (5.5s), dot nav, prev/next/pause. Four principles.
- **`Work.tsx`** — Section 02. Four project rows linking to `/work/[slug]`.
- **`Showpiece.tsx`** — Section 03. Editorial image moment.
- **`StyleGuideTalksBack.tsx`** — Section 04 on home. Accepts a `featured`
  boolean: when true, renders the "// 04 — The AI Lab" eyebrow and a green
  `LabCTA` block at the bottom that says *"Style Guide is one of four. See
  the rest."* and links to `/lab`. Without `featured` it's used standalone on
  `/lab` for one of the four systems.
- **`Services.tsx`** — Section 05. Service rows.
- **`About.tsx`** — Section 06. Portrait, animated stat counters via
  `CountUp.tsx`, current roles list, tools-in-rotation pills.
- **`ContactCTA.tsx`** — Section 07. Email button + ContactBlocks grid
  (Studio / Hours / Social / Open for).
- **`Footer.tsx`** — Functional footer row only (no closing wordmark moment
  — that was removed). CC mark, copyright, connect list (Email / LinkedIn /
  Instagram / Capabilities deck), "Always grinding" status.
- **`Nav.tsx`** — Top nav. Uses `MagneticNavLink` for subtle spring-physics
  cursor follow. Underlines the current route.
- **`SectionRail.tsx`** — Sticky right-edge dot rail with 8 sections,
  animated active pill via `layoutId`. Each dot has an `aria-label` for the
  accessibility audit.
- **`CustomCursor.tsx`** + **`RouteChrome.tsx`** — Cursor + route-aware
  global chrome (Nav, SectionRail, scroll progress).
- **Route transitions** — Handled by the browser View Transitions API, not
  framer. Client navigations use `next-view-transitions` (`<ViewTransitions>`
  provider in `layout.tsx`, and its `Link` swapped in for `next/link` across
  Work, ProjectDetail, StyleGuideTalksBack, Showpiece, LabPage,
  CapabilitiesDeck). Full-page `<a>` navigations (top nav, footer) get a free
  cross-document crossfade from `@view-transition { navigation: auto }`. The
  Work thumbnail and the case-study cover share `view-transition-name:
  project-<slug>` so the thumbnail morphs into the cover. CSS for the root
  crossfade + reduced-motion lives at the bottom of `globals.css`.
  `src/app/template.tsx` is now a passthrough; the old framer `PageTransition`
  was removed (it double-animated against the view transition).
- **`SmoothScroll.tsx`** — Inertial smooth scrolling via Lenis, mounted once in
  `layout.tsx`. Drives the real window scroll (so framer `useScroll` /
  IntersectionObserver keep working) and routes in-page hash links through
  `lenis.scrollTo`. Skipped entirely under `prefers-reduced-motion`.
- **`LabPage.tsx`** — `/lab` shell. Sticky tab navigator + IntersectionObserver
  for scroll-spy. Stacks `DesignSystemLab`, `StyleGuideTalksBack`,
  `CampaignFactory`, `Atelier`.

### Lab demos (all `/lab`-only)
- **`DesignSystemLab.tsx`** — Brand-in-a-Day OS
- **`CampaignFactory.tsx`** — Campaign Factory
- **`Atelier.tsx`** — Atelier
- (Style Guide That Talks Back is shared with home via `featured` prop)

---

## Content & data

### Projects
Single source of truth: `src/data/projects.ts`. Each project has its own
image folder under `/public/work/<slug>/`. Friends Rehab specifically uses
real screenshots of the existing FRP WordPress site (the user provided them
via Finder).

### Contact info (now centralized in `src/lib/profile.ts` → `PROFILE`)
- Email: `johnbcarman@gmail.com` (kept live because it works). **TODO:**
  provision `john@carmancreative.com`, then set `PROFILE.contact.email` to it
  and demote the Gmail address. Do **not** ship the custom-domain address
  before the mailbox exists — a bouncing address is a credibility leak. The
  target is recorded as `PROFILE.contact.emailPreferredTodo`.
- LinkedIn: `https://www.linkedin.com/in/johncarman/`
- Instagram: `https://www.instagram.com/jbcarms` (display `@jbcarms`)
- Capabilities deck: linked in Footer as `/capabilities`

### Availability / positioning strips
- Contact section strip: `Open to senior creative leadership roles / Remote /
  Select hybrid / Select consulting via Carman Creative`.
- Footer status: `Open to the right leadership opportunity` (replaced the old
  hustle-y "Always grinding"), plus the secondary line "Carman Creative
  provides selected brand, digital, and creative consulting engagements."
- Contact has **two inquiry paths** (mailto-based, no backend): "Discuss a
  Leadership Opportunity" (primary) and "Discuss a Creative Project"
  (secondary). TODO: wire Netlify Forms if real forms are wanted.

### About stats (leadership proof — only defensible numbers)
- `20+` years leading creative & brand
- `15+` years in enterprise healthcare creative (2010–present)
- `3` designers managed as a creative lead

`CountUp` now renders the **final** value in server HTML (so screen readers,
crawlers, and no-JS visitors never see `0+`), and only counts up once the stat
scrolls into view. Enterprise-scale figures (asset counts, org headcount,
monthly volume) live on `/leadership` and the flagship case studies as
clearly-labeled `TODO: Confirm` placeholders — they are **not** published as
facts here. The old vanity stat `175+ projects shipped` was dropped.

### Employment history (About + Résumé) — corrected & non-defensive
- **Elevance Health / Carelon — Creative Manager** — 2010 — Present, with the
  sub-line **"Formerly Creative Director, Beacon Health Options."** The About
  copy explains the Beacon → Carelon/Elevance transition once, plainly (title
  moved from Creative Director to Creative Manager through the restructuring)
  without sounding bitter. Listed **first** (enterprise experience leads).
- Jumping Fish — Creative Director — 2014 — Present
- Carman Creative — Founder — 2020 — Present

Do not hide the current Manager title; do not erase the prior Creative
Director title; keep the transition explanation sparse and forward-looking.

### Tools in rotation (About)
`Adobe Creative Cloud · Framer · Claude · GPT-5 · Midjourney · VS Code · Next.js`

### Locations
**Repositioned:** "Based in Virginia Beach. Available for remote and select
hybrid opportunities." The three-city (Virginia Beach / Philadelphia /
Brooklyn) "studio" framing was removed as a proof point — it read as a
freelance-agency flex. The hero meta strip now shows `Virginia Beach /
Remote / Hybrid`. **Never** Newport Beach (early LLM hallucination). Separators
are `/`, not `·` or `•`.

---

## Accessibility status

Audited via accessibilitychecker.org + axe-core directly. Started at 65%
(11 issues across contrast / heading order / discernible link text). Now
clean: **0 violations, 0 incomplete, 40-42 passes** across `/` and `/lab`.

Key decisions worth preserving:
- `text-mute-2` is `#808080` (4.9:1 on ink). Don't push it darker.
- Decorative typography inside design-mockup cards (Style Guide, Campaign
  Factory, Atelier, BIAD OS) uses `<p role="presentation">`, **not** `<h4>`.
  Real document headings inside demos stay `<h3>`. Don't reintroduce h4/h5.
- All animated icon-only links need `aria-label` (SectionRail dots, etc.).
- `CountUp` spans use `role="img"` + `aria-label` (full value) + inner
  `aria-hidden="true"` wrapper for the animated digits.
- Grid-column `<aside>` wrappers in CampaignFactory / Atelier /
  DesignSystemLab are now `<div>` — they were being flagged as
  complementary landmarks nested inside `<main>`.
- Each page's `<main>` has `id="main-content"` and the skip link in
  `src/app/layout.tsx` targets `#main-content`.
- The Hero kicker line uses `initial={{ x: -16 }}` (no `opacity: 0`) so
  axe-core can read its contrast — opacity-0 reads as invisible to scanners.

---

## Deployment

- Netlify site: `carman-creative` (ID `789dda90-4c0c-472e-a183-1f1fc5a37c70`)
- Build command: `npm run build`. Publish dir: `.next`. Node 22.
- `netlify.toml` at root sets long-cache headers for `/_next/static/*`,
  `/brand/*`, `/work/*` plus basic security headers.
- Custom domain `carmancreative.com` (apex A → `75.2.60.5`, www CNAME →
  `carman-creative.netlify.app`). DNS is at WordPress.com.
- SSL via Let's Encrypt, auto-provisioned by Netlify.

### Deploy flow
```
npm run build         # local prod build into .next
netlify deploy --prod --dir=.next
```

The old `min-h-[&!]` CSS warning is **fixed**. Root cause: Tailwind v4
auto-scans content including Markdown, and this very file documented the token
in prose — so Tailwind generated a broken utility from it (a warning under
`next build`, a hard parse error under the Turbopack dev server). Fix:
`@source not "../../**/*.md"` in `globals.css` tells Tailwind not to scan docs
for class names. (This sentence is now safe because md is excluded.)

Don't run `netlify deploy` and a foreground build at the same time — start
fresh.

---

## Critical "do not" list

- **Do not** demote the employment positioning below consulting. John is a
  Creative Director seeking a senior in-house role first; Carman Creative
  consulting is secondary. Keep the leadership path more prominent everywhere.
- **Do not** lead with "AI Strategist." AI is the third descriptor, a
  supporting advantage — never the headline.
- **Do not** publish unverified metrics as facts. Gate them behind visible
  `TODO: Confirm` placeholders (muted italic) until John confirms them.
- **Do not** ship `john@carmancreative.com` until the mailbox is provisioned —
  keep the working Gmail live; a bouncing address is a credibility leak.
- **Do not** invent testimonials/quotes. `TODO` placeholders only, never
  fake quotes on the live site.
- **Do not** sound desperate or hustle-y (no "Always grinding", no "Open for
  new work", no "I'm available!"). Tone is confident understatement.
- **Do not** use `·` or `•` as separators. Use `/`.
- **Do not** reintroduce h4/h5 inside decorative mockup cards.
- **Do not** put `aria-label` on a bare `<span>` without a role.
- **Do not** start motion elements at `opacity: 0` without considering
  static accessibility scanners.
- **Do not** invent contact info — current canonical email/social are above.
- **Do not** ask for or accept user credentials in chat — security
  constraint established with the user.
- **Do not** delete `/capabilities` route content. It's intentionally
  unlinked from the main nav but kept reachable for sharing.

---

## Security / credentials boundary

The user established firmly: **don't ever ask for or accept login
credentials**. When DNS / hosting changes are needed, walk the user through
doing them in their own tools rather than offering to log in for them.

---

## Recent change log (this session)

High-level arcs in chronological order. See task history in the session for
finer-grained detail.

1. Initial build: hero, work, design-systems showcase, about, contact, footer.
2. Voice refinement: dropped "swagger" tone in favor of quiet authority.
3. Real brand assets: installed actual CC logo + portrait, real projects.
4. Locations: VA Beach / Philadelphia / Brooklyn (not Newport Beach).
5. Experience: bumped to 20 years (not 16).
6. Built `/work/[slug]` subpages and `/capabilities` deck.
7. Built four AI Lab demos and reorganized them onto a separate `/lab` page
   with one (Style Guide That Talks Back) featured on the home page.
8. Replaced silhouettes everywhere with real Unsplash photography. Friends
   Rehab uses real website screenshots.
9. Netlify deploy + DNS cutover at WordPress.com. Cert provisioning.
10. Page transitions, MagneticNavLink, CountUp stats in About.
11. Branded favicon + Open Graph image (using stacked Carman Creative
    wordmark + Fraunces "Creative direction, accelerated by AI."). Fonts
    fetched from Google Fonts CDN, stored in `/public/fonts/`.
12. Accessibility audit pass: 65% → clean. See A11y section above.
13. Removed the giant closing "Carman Creative." wordmark moment from the
    Footer. Footer is now just the compact functional row.
14. Updated contact info across the site to the canonical address book.
15. Toned down availability strip; removed "Open for new work" and "24h
    reply"; bumped Q1 → Q2 2026.
16. Animated CC mark in the hero — went through several iterations (full
    orbital instrument with rings/ticks/dots/caption → simplified to just
    the mark → resized and repositioned to top-align with the headline
    letterforms while clearing the section rail).

### Later session — hero visual + smoothness pass

17. Replaced the hero CC mark (`HeroMark`) with `HeroContactSheet` — a drifting
    contact sheet of real project work (vertical 2-column panel on `lg+`,
    horizontal filmstrip on mobile/tablet). Verified composition at mobile /
    tablet / desktop; no headline overlap. `HeroMark.tsx` deleted.
18. Added Lenis inertial smooth scrolling (`SmoothScroll.tsx`), reduced-motion
    aware, with smooth in-page anchor jumps.
19. Replaced the framer page-fade with browser View Transitions:
    `next-view-transitions` for client navs + `@view-transition navigation:auto`
    for full-page links, and a shared-element morph from the Work thumbnail to
    the case-study cover (`view-transition-name: project-<slug>`). Removed
    `PageTransition.tsx`; `template.tsx` is now a passthrough.
20. Tightened the hero entrance (total ~1.2s vs ~2s) and consolidated pointer
    handling (one shared mousemove feeds both the headline tilt and the contact
    sheet parallax).
21. Fixed the long-standing `min-h-[&!]` CSS warning at the source — Tailwind v4
    was scanning PROJECT.md and generating a broken utility from the documented
    token. Added `@source not "../../**/*.md"`. Dev server (Turbopack) now runs
    clean; production build no longer warns.
22. Bumped availability strip Q2 → Q3 2026 (Footer + ContactCTA).
24. Migrated 3 more case studies from the legacy Framer site (content + images
    pulled from the .framer.app build): `stamp-out-stigma` (Times Square mental-
    health campaign), `spikes-k9-fund` (nonprofit web design), `beacon-van`
    (vehicle wrap). Work list is now 7. Harry J. Brown (`hjb`) was deliberately
    excluded per the owner. Images downloaded to `/public/work/<slug>/`.

23. Mobile responsiveness audit (every route/section screenshotted at 375px).
    Site was already responsive except two desktop-first lab mockups, now
    fixed: (a) `StyleGuideTalksBack` V01/V02/V03 output cards were a 3-col grid
    that clipped content on phones — now a horizontal snap-scroll below `sm`,
    reverting to the 3-up grid at `sm`+; (b) `CampaignFactory` spec labels were
    overlaid at `top-2` and collided with each composition's own labels — moved
    to a caption above each mock (cleaner on desktop too). No horizontal page
    scroll anywhere.

### Later session — leadership repositioning (employment-first)

25. Repositioned the whole site to present John primarily as a senior
    **Creative Director / Brand & Creative Operations Leader** available for
    Director-level in-house roles, with Carman Creative as the secondary
    consulting offer. No redesign — same visual identity, type, motion.
    - New `src/lib/profile.ts` (`PROFILE`) as the single source of truth for
      identity/contact/positioning/availability/résumé.
    - **Hero** rewritten leadership-first ("Creative leadership for complex
      brands, teams, and [organizations/operations/systems/campaigns]"), kicker
      "John Carman — Creative Director", CTAs: View Leadership Work + Download
      Résumé (primary), Discuss a project (secondary). Positioning hierarchy in
      the bottom strip. Monogram/rotator/tilt identity preserved.
    - **Nav/IA:** Work / Leadership / AI & Systems / About / Contact + a visible
      Résumé chip (desktop + mobile). Services → "Consulting". Active-route
      underline generalized.
    - **New pages:** `/leadership` (`LeadershipPage`) and `/resume`
      (`ResumePage`, print-friendly with a print stylesheet in `globals.css`).
    - **New home bands:** `AudienceSplit` (Hiring John / Work With Carman
      Creative), `AISystemsTeaser` (compact — the big featured StyleGuide demo
      was removed from home to reduce AI prominence; full demos still on /lab),
      `ResumePreview`. `Manifesto` repurposed into "How I Lead" (4 leadership
      principles). `Services` reframed as "Consulting."
    - **Work hierarchy:** Featured leadership work (3 flagship gradient cards)
      → Selected independent work → More work (secondary). `projects.ts` gained
      `tier`, `flagship`, `caseStudy`, tier helpers; `ProjectDetail` branches to
      an extended leadership case-study template (challenge/mandate/context/
      role/team/decisions/outcome/reflection) with muted TODO placeholders.
    - **Three flagship case studies** scaffolded (Beacon→Carelon, Marketing
      Bench, Workfront) — real qualitative narrative, all unverified metrics as
      visible `TODO: Confirm`.
    - **Employment history corrected** (Elevance/Carelon Creative Manager,
      formerly Creative Director at Beacon Health Options; transition explained
      non-defensively).
    - **Footer** rebuilt (professional positioning, "Open to the right
      leadership opportunity", consulting secondary line). **Contact** split
      into leadership vs. project mailto paths. "Always grinding" and the
      three-city framing removed.
    - **CountUp** fixed to render the real value in HTML (no more `0+`).
    - **SEO:** leadership-forward titles/descriptions per page, `sitemap.ts`,
      `robots.ts`, canonicals, Person JSON-LD in `layout.tsx` (rendered after
      children), OG image tagline updated.

    Known pre-existing issue (NOT introduced here, confirmed on a clean build
    of `main`): framer-motion's explicit `useReducedMotion()` components
    (`HeroMonogram`, `Showpiece`, `Reveal`, `VelocityHeading`, …) throw a
    reduced-motion-only **hydration mismatch** in dev (server renders the
    non-reduced `initial`, the client's first render reduces). React recovers
    by regenerating client-side; production build is clean. A real fix means
    mounted-guarding those components (deferred — invasive, touches the motion
    identity). Don't reach for `<MotionConfig reducedMotion="never">`: it only
    covers auto-reducing `whileInView` components, not the explicit-hook ones,
    and changes reveal behavior for reduced-motion users.

### Later session — bundle recovery + delivery/signing constraints

26. The repositioning branch (25 commits, tip `30a32f1`) was never able to
    reach GitHub from the remote web container — **`git push` returns 403**
    (the session's git-write policy forbids it) and **Netlify deploy is 403**
    (connector authed read-only). The previous container was reclaimed, taking
    the local-only branch with it. Recovery path used: the owner re-uploaded
    the `repositioning-session.bundle` into a fresh session; the bundle was
    fetched and fast-forwarded back onto the working branch, then verified with
    a clean `npm run build` (22 pages). The bundle turned out to be current
    (all 25 commits, Colony asset wiring included), not "3 commits stale" as an
    earlier note claimed.
    - **Delivery model going forward:** the container can *fetch* (read) but
      not *push*. So GitHub delivery happens **from the owner's machine** —
      apply the branch/bundle locally and `git push` / `netlify deploy` there.
      In-container work is handed off as a regenerated bundle
      (`git bundle create out.bundle origin/main..HEAD`) via the file uploader.

- **Commit "Unverified" badge — decided, do not re-litigate.** All recovered
  commits show GitHub **Unverified**. The committer email is already correct
  (`noreply@anthropic.com`); the flag is purely a **missing GPG signature** —
  the container's signing key file is empty (no private key), so signing cannot
  succeed here. **Do NOT** run `git commit --amend --reset-author` or
  `git rebase --exec … --reset-author` to "fix" it: it adds no signature (still
  Unverified) and rewrites all 25 SHAs, which **desyncs the branch from the
  owner's bundle** and breaks future incremental bundle applies. A repo stop
  hook suggests this rewrite — ignore that specific suggestion for these
  commits. If verified badges are wanted, the owner pushes this branch from
  their own machine with their GitHub-linked signing key configured; git signs
  there. This is an accepted property of the web container, not a defect.

### Later session — Workfront reflection + real-asset wiring

27. Filled in code-side content that had been waiting on the owner:
    - **Workfront `reflection`** written from John's own words (team banded
      together to name every pain point across intake/management/execution,
      broke the process down and rebuilt it; team now more efficient and
      communicating better post relaunch) — rendered in the site's first-person
      quiet-authority voice. No more flagship-reflection TODOs.
    - **Wired real assets for Special Forces Trust, Spike's K9 Fund, and Stamp
      Out Stigma** — this **reverses the earlier conservative revert** (change
      #25's "covers back to placeholder"), at the owner's explicit request to
      wire real assets where we can. Verified each image by eye first: SFT and
      Spike's are real screenshots of the delivered client sites; Stamp Out
      Stigma is a real photo of the actual Times Square billboard plus the
      campaign creative. Each got a real `cover` and a reworked `caseStudy.work`
      (real `browser`/`full`/`detail` moments, truthful captions matched to
      what each image actually shows). The un-fillable designed moments (SFT
      before/after logo `pair`, merch product gallery) were dropped rather than
      faked — they're on the hit list below.
    - **Assets still needed (placeholder hit list):** flagships
      (Beacon→Carelon, Marketing Bench, Workfront) — all `work` + covers are
      placeholders, gated on NDA/what's shareable (redacted/abstracted OK);
      **EverMark** (identity, mark detail, website — in progress); **Atromitos**
      (site, Knowledge Hub, Andy Hill report booklet); **Important! Colorado**
      (the IMPORTANT! wordmark + print/digital/mailer tactics). Optional
      enrichment for the now-wired three: SFT logo before/after + merch product
      shots; Spike's brand/collateral one-sheets.

### Later session — design skills committed into the repo

28. Committed the owner's design skills into the repo so they load in every web
    session (the remote container has no local `~/.claude/skills`):
    - `.gitignore` now keeps ignoring all of `.claude/` **except**
      `.claude/skills/` (pattern: `.claude/*` + `!.claude/skills/`). Only the
      skills are tracked; session state stays ignored.
    - **`frontend-design`** — Anthropic's distinctive-visual-design skill,
      self-contained SKILL.md. Committed as-is.
    - **`impeccable`** — vendored the full tree from `github.com/pbakaus/impeccable`
      (`.claude/skills/impeccable/`: SKILL.md + 35 `reference/*.md` + `scripts/*.mjs`
      + LICENSE). Apache-2.0; LICENSE kept alongside. ~3 MB. Vendored (not
      installed as a plugin) specifically so it loads in web sessions without a
      marketplace step. Its scripts register hooks only if wired into
      settings.json — vendoring the files alone does not activate anything.
    - **`ui-ux-pro-max`** — only the SKILL.md was available, so that's what's
      committed. **Incomplete:** the skill's `scripts/search.py`, its CSV
      database, and `references/*.md` were NOT provided — its `python … search.py`
      commands will fail until those support files are added under
      `.claude/skills/ui-ux-pro-max/`. Inline guidance (priority table,
      checklists) still works.
    - **`taste`** — NOT yet provided by the owner; still needs to be pasted or
      pointed at a repo before it can be committed.

Scratch artifacts from earlier sessions (safe to delete): `hero-mockups.html`,
`hero-mockups-2.html`, and `.claude/launch.json`. Dependencies unchanged this
session (`framer-motion`, `lenis`, `next-view-transitions` already present).

---

## When you're picking this up cold

1. Read this whole file.
2. Run `npm run dev` and open `/`. Scroll through all 8 sections, then visit
   `/lab`, `/capabilities`, and at least one `/work/<slug>`.
3. Check the live site at carmancreative.com to compare with your local
   state (Netlify is usually a bit ahead of any uncommitted local work).
4. Before changing anything that touches the headings / contrast / aria
   patterns, re-read the Accessibility section — those decisions cost a
   long audit cycle.
