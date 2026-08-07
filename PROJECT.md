# Carman Creative — Project Context

Single source of truth for the carmancreative.com portfolio. Read this first
when picking up the project in a new session. Update it as the site changes.

---

## What this is

The personal portfolio + agency site for **John Carman**, a Creative Director
and AI strategist working out of Virginia Beach, Philadelphia, and Brooklyn.
Site lives at **https://www.carmancreative.com**.

The product is a single-page narrative on `/` with deeper subpages: an AI Lab
(`/lab`), a capabilities deck (`/capabilities`), and four project case studies
(`/work/[slug]`). The home page is built as a long-scroll story with eight
numbered sections, a sticky section rail, and orchestrated framer-motion
choreography throughout.

Voice and tone target: **quiet authority**. Not "swagger." Modern tools,
classical taste. Specific things to avoid: sounding desperate ("Open for new
work" was deliberately removed), drift back to the old `carman • creative`
treatment (dots are out, slashes are in).

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

### SEO / share metadata

`src/lib/seo.ts` holds the sitewide constants (`SITE_URL`, `SITE_TITLE`,
`SITE_DESCRIPTION`) plus `pageMetadata()`, which every route calls to emit a
unique title, description, `<link rel="canonical">`, Open Graph block, and
Twitter `summary_large_image` block from one place. Use it for any new route —
don't hand-roll a `metadata` export.

Share images come from the `opengraph-image` file convention, never a static
`/public/og-image.png`:

- `src/app/opengraph-image.tsx` — the site default (wordmark + headline).
- `src/app/lab/opengraph-image.tsx`, `src/app/capabilities/opengraph-image.tsx`
  — thin re-exports of the default. **Metadata image files do not cascade into
  child segments**, so every new top-level route needs one of these or it ships
  with no `og:image`. `runtime` has to be redeclared literally in each (Next
  parses it at compile time and rejects a re-export).
- `src/app/work/[slug]/opengraph-image.tsx` — per-case-study card: the project
  cover under a dark scrim with the title in Fraunces. Next serves the same
  image for `twitter:image`, so no `twitter-image` file is needed anywhere.

`src/app/robots.ts` allows all crawlers and points at `src/app/sitemap.ts`,
which enumerates `/`, `/lab`, `/capabilities`, and every slug in
`src/lib/projects.ts` (so new case studies list themselves).

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
| `/` | `Hero, Manifesto, Work, Showpiece, StyleGuideTalksBack (featured), Services, About, ContactCTA, Footer` | The main narrative |
| `/lab` | `LabPage` (renders all 4 AI systems with sticky tab nav) | Showcase for AI-native design systems |
| `/work/[slug]` | `ProjectDetail` | Case studies — `colony-coffee`, `friends-rehab`, `harrison-bounds`, `special-forces-trust`, `stamp-out-stigma`, `spikes-k9-fund`, `beacon-van` |
| `/capabilities` | `CapabilitiesDeck` | Snap-scrolling capabilities deck (not currently linked from the home page; the link in Footer's connect list points to it for sharing) |

Routes data is sourced from `src/data/projects.ts`. Section numbers on the
home page come from `SectionRail.tsx` and must stay in sync with the eyebrow
labels inside each section component.

### Home section numbering (eyebrows)
```
00  Intro       (Hero)
01  Principles  (Manifesto)
02  Work        (Work)
03  In Focus    (Showpiece)
04  AI Lab      (StyleGuideTalksBack — `featured` prop adds CTA → /lab)
05  Services    (Services)
06  About       (About)
07  Contact     (ContactCTA)
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

### Contact info (kept consistent across Footer, ContactCTA, CapabilitiesDeck)
- Email: `john@carmancreative.com`
- LinkedIn: `https://www.linkedin.com/in/johncarman/`
- Instagram: `https://www.instagram.com/jbcarms` (display `@jbcarms`)
- Capabilities deck: linked in Footer's connect list as `/capabilities`

### Availability strip
Currently reads `Q3 2026 onward / Retainer / Project / Fractional CD`.
The pulsing green "Open for new work" indicator was removed (didn't want
to sound desperate). Footer status reads "Always grinding" / "Q3 2026 onward".

### About stats
- `20+` years of creative direction
- `175+` projects shipped
- `∞` time spent exploring AI

The `Stat` component in `About.tsx` takes either `to={number}` (animated count
via `CountUp`) or `display="∞"` (static value with `aria-label`). Numeric stats
also pass `from={…}` — a floor so a count-up caught mid-animation (or paused by
a slow load) never displays an implausibly small claim. The About bio prose says
"20+ years" so it matches the counter word for word; keep the two in sync.

### Current roles (About)
- Carman Creative — Founder — 2020 — Present (live)
- Jumping Fish — Creative Director — 2014 — Present (live)
- Elevance Health — Creative Manager — 2010 — Present (live)

### Tools in rotation (About)
`Adobe Creative Cloud · Framer · Claude · GPT-5 · Midjourney · VS Code · Next.js`

### Locations
Virginia Beach / Philadelphia / Brooklyn. **Never** Newport Beach (early
LLM hallucination; user corrected it). Separators are `/`, not `·` or `•`.

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

- **Do not** sound desperate in copy (no "Open for new work", no "I'm
  available!"). Tone is confident understatement.
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

Scratch artifacts from this session (safe to delete): `hero-mockups.html`,
`hero-mockups-2.html` (the visual option mockups), and `.claude/launch.json`
(preview-server config). New dependencies: `lenis`, `next-view-transitions`.

### Later session — finish-line edits

25. Contact email switched from the personal Gmail to the branded
    `john@carmancreative.com` everywhere it's displayed or linked (Footer,
    ContactCTA, CapabilitiesDeck). **Open item:** the mailbox itself has to
    exist — a forward at the registrar plus Gmail "Send mail as," or Google
    Workspace. Until then the site links to an address that bounces.
26. About counters: added a `from` floor so a count-up caught mid-flight never
    shows an implausibly small number, and changed the bio's "two decades" to
    "20+ years" so the prose matches the counter exactly.
27. Full SEO / share-metadata pass — see the SEO section above. Added
    `src/lib/seo.ts`, per-route canonicals + OG + Twitter tags, per-case-study
    OG cards, `robots.ts`, and `sitemap.ts`.

---

## ⚠️ The deployed site is NOT built from this repo

Read this before assuming a change here reaches carmancreative.com. It does not.

**What's live.** Netlify project `carman-creative`, current production deploy
`6a6fa7718e3202e4f35678a9`, published **2026-08-02**. Its provenance fields are
`deploy_source: "drop"`, `manual_deploy: true`, `commit_ref: null`,
`branch: null`, `build_id: null`, `has_source_zip: false` — a hand-dragged
folder of pre-built static HTML with no git link and no recoverable source.

Netlify's own file manifest for that deploy lists **17 generated pages**,
including `leadership.html`, `resume.html`, `work/important-colorado.html`,
`work/friends-rehab.html`, and `work/spikes-k9-fund.html`.

**What's here.** 10 routes: `/`, `/lab`, `/capabilities`, and 7 case studies
(`colony-coffee`, `friends-rehab`, `harrison-bounds`, `special-forces-trust`,
`stamp-out-stigma`, `spikes-k9-fund`, `beacon-van`). No Leadership section, no
`/resume`, no Carelon / Important Colorado / Marketing Bench / Workfront, no
"CASE STUDY IN PROGRESS" pill, and About counters reading `20+ / 175+ / ∞`
rather than the live site's `20+ / 15+ / 5`. This is also not a static export —
there is no `output: "export"`, and `netlify.toml` runs
`@netlify/plugin-nextjs` against `.next`, so it could not have produced that
drop.

Only `friends-rehab` and `spikes-k9-fund` appear in both. The two trees share
ancestry but diverged a long way.

**Where the live source is not.** Searched and ruled out:

- every branch of this repo (`main`, `claude/shred-1999-snowboard-ui0xmm`,
  `claude/new-session-nzt8d1`) and its full history
  (`git log --all -S"carelon"` → empty)
- `johnny5vb/carmancreative` — the legacy WordPress install, not the Next.js app
- `johnny5vb/CQAP` — Creative Quality Assurance Platform, unrelated
- `johnny5vb/Carman-Fitness`, `samplesite`, `jumpingfish` — unrelated
- GitHub code search across all of `johnny5vb` for `Carelon`,
  `important-colorado`, `marketing-bench`, `CASE STUDY IN PROGRESS` → 0 hits

**Conclusion: the live source exists only as an uncommitted local folder on
John's Mac** (the handoff brief points at `~/Developer/GPTPortSite`, but what
was pushed from that path is this tree, so the newer work was never committed).

**To reconcile**, from the local machine: find the tree whose build output
contains `leadership.html` and `resume.html` (`grep -rl "CASE STUDY IN
PROGRESS"` across `~/Developer`, or check the folder last dragged to Netlify),
then commit and push it. Until that lands, edits made here are edits to a tree
nobody is serving.

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
