# Carman Creative — Project Context

Single source of truth for the carmancreative.com portfolio. Read this first
when picking up the project in a new session. Update it as the site changes.

---

## What this is

The personal portfolio + career site for **John Carman**, a **Creative
Director and Brand & Creative Operations Leader** based in Virginia Beach.
Site lives at **https://www.carmancreative.com**.

**Primary purpose (neutral, as of the copy-deck pass):** present John as a
working creative director and the practice he runs — **brand, creative
direction, and design systems** — and let the work carry the argument. The
site **does not solicit**: no availability posture, no "open to roles," no
"hire the practice." An earlier pass had positioned it employment-first
(Director-level in-house, with consulting secondary); that framing was
replaced. `/leadership` and `/resume` remain, linked and neutral in tone, as
career context for anyone who goes looking. The positioning hierarchy is
still: (1) Creative Director, (2) Brand & Creative Operations Leader,
(3) AI-Enabled Creative Strategist — AI is a supporting advantage, never the
lead.

The product is a single-page narrative on `/` plus deeper subpages: a
**Leadership** page (`/leadership`), a print-friendly **Résumé** (`/resume`),
an AI & Systems lab (`/lab`), a capabilities deck (`/capabilities`), and case
studies at `/work/[slug]` (three **leadership** flagships + independent
client work + a **systems** shelf of self-initiated tools). The home page is a long-scroll story with a sticky
section rail and framer-motion choreography.

Voice and tone target: **quiet authority** — confident, senior, direct. Not
"swagger," not hustle. Modern tools, classical taste. Specific things to
avoid: any solicitation or availability language at all (the neutral pass
removed the last of it — see the sweep list in the change log); the old
`carman • creative`
dot treatment (dots are out, slashes are in); leading with "AI Strategist";
fabricated metrics (see the TODO discipline below).

**Single source of truth for identity/contact:** `src/lib/profile.ts`
(`PROFILE`) — name, title stack, email, socials, location, practice line,
résumé href. Import from it; don't hard-code contact/positioning again. There
is deliberately **no availability field**; don't add one back.

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
| Fonts | **Newsreader** for display *and* body (one family; its `opsz` axis does the work — 60 for display rungs, 14 for text), JetBrains Mono for labels — via `next/font/google`. Fraunces + Instrument Sans were retired in change #44. |
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
ink         #0c0b09   (background — warm; was cold #080808)
ink-2       #131110
surface     #191614
surface-2   #201d19
line        #2a2622
line-2      #38322c
bone        #f6f2ea   (primary text)
mute        #968e83   (6.08:1 on ink)
mute-2      #8b8378   (5.26:1 on ink — don't push darker)
green       #3b9a7e   (brand accent — muted from #1cb791 in change #47; 5.72:1 on ink)
green-bright #4fb593
green-dim   #276b56   (print stylesheet only — green on white)
```

Every neutral carries a little red and yellow so the ground reads as very
dark brown-black rather than a switched-off screen; only lightness moves
across the ramp. Fonts via CSS vars: `--font-display` and `--font-sans` both
point at `--font-newsreader`; `--font-mono` is JetBrains Mono. The accent
treatment `<em className="font-display-wonk text-green">…</em>` kept its
class name but is now a **true italic** (Newsreader has one), not a variable
axis trick. The green is hardcoded in ~18 files three ways — the token, SVG
`fill`s in `CCMark`/`CCWordmark`/`public/brand/*.svg`, and an `rgba()` in
the `HeroIsolines` canvas — so a colour change is a sweep, not a token edit.
Demo palettes (Atlas/Reservoir presets, Atelier severities, deck chart data)
and `projects.ts` palettes are **data**, not chrome, and stay put.

---

## Site map

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `Hero, Intro, Manifesto, Work, Showpiece, AISystemsTeaser, About, ResumePreview, Services, ContactCTA, Footer` | The main narrative |
| `/leadership` | `LeadershipPage` | Career context: experience, what John can lead, flagship case studies, leadership proof, testimonials, philosophy, résumé/contact CTAs. Neutral in tone since the copy-deck pass — it's background, not a pitch |
| `/resume` | `ResumePage` | Print-friendly on-page résumé ("Print / Save as PDF"). No PDF committed yet — `PROFILE.resumePdf` is `null` with a TODO |
| `/lab` | `LabPage` (renders all 4 AI systems with sticky tab nav) | AI & Creative Systems — clearly status-labeled demos |
| `/work/[slug]` | `ProjectDetail` (branches: flagship leadership template vs. standard client layout) | Leadership flagships — `beacon-carelon-transformation` (L01), `creative-operations-marketing-bench` (L02), `stamp-out-stigma` (L03, display label `SOS`); `workfront-workflow-transformation` (L04) is drafted out. Independent 01–06 in the owner's order — `colony-coffee`, `friends-rehab`, `special-forces-trust`, `important-colorado`, `spikes-k9-fund`, `atromitos`; `evermark` is drafted out. **Systems S01–S03** (self-initiated, own shelf) — `premier-friends-club`, `cqap`, `carman-os`. **No `secondary` project exists any more** — the tier and its helper stay in the code, but `harrison-bounds` and `beacon-van` are gone |
| `/capabilities` | `CapabilitiesDeck` | Snap-scrolling capabilities deck (linked from Footer for sharing) |

Project data is sourced from `src/lib/projects.ts` (note: **`src/lib/`**, not
`src/data/`). Each project carries a `tier` (`leadership` / `independent` / `systems` /
`secondary`); flagships add `flagship: true` + a `caseStudy` object (overview,
challenge, mandate, context, role, team, decisions, outcomes, reflection). All
flagship carries a real `cover`; a flagship without one falls back to the
`display` wordmark. **Thumbnails fill their 4:3 plate edge to edge (`object-cover`) since
change #55** — the owner rejected letterbox bars; the case-study hero and the
frames inside "The work" still present the piece whole (`object-contain`),
so size those crops to the frame's aspect. Plates are neutral — never a colour
wash. A project may carry a `coverVideo` (muted loop in the hero) and a work
moment may be `kind: "video"` (full film with controls, `preload="none"`). A `draft: true` project is written but unpublished: filtered from every
listing, no route, unreachable via `getProject`, out of the sitemap. Helpers:
`PUBLISHED_PROJECTS`, `LEADERSHIP_PROJECTS`, `INDEPENDENT_PROJECTS`,
`SYSTEMS_PROJECTS`, `SECONDARY_PROJECTS`, `projectsByTier`, `tierOf`. `getAdjacentProjects` stays
within a tier.

Section numbers come from `SectionRail.tsx` and must stay in sync with the
eyebrow labels inside each section component.

### Home section numbering (eyebrows)
`Intro` (the `// John Carman` identity band — formerly `AudienceSplit`, a
two-card Hiring John / Work With Carman Creative split) and `ResumePreview`
are un-numbered bands between the numbered narrative sections.
```
00  Intro        (Hero)
01  How I Lead    (Manifesto — leadership philosophy, 4 principles)
02  Work          (Work — Featured leadership work + Selected independent work + More work)
03  In Focus      (Showpiece)
04  AI & Systems  (AISystemsTeaser — compact, links → /lab; big demo removed from home)
05  About         (About)
06  Practice      (Services — the four disciplines, described not offered)
07  Contact       (ContactCTA — one invitation, one plain mailto)
```

---

## Major components

- **`Hero.tsx`** — Section 00. Two-column portrait hero: headline
  ("Creative direction, and the systems that *make it repeatable.*"), a
  proof row (20+ / 15+ / 5), work-first CTAs, and the engraved portrait
  (`/brand/portrait-hero-v3.jpg` — versioned, see #50) framed as a print, stretched to meet the
  headline cap and the CTA baseline. `HeroIsolines` (the live contour field)
  is the background. Neutral copy — no availability posture.
- **`HeroMonogram.tsx`** — On disk, unimported. Superseded twice: first by
  the contour field (change #39), then the portrait layout (change #44).
- **`Manifesto.tsx`** — Section 01. Compact interactive slider with
  auto-advance (5.5s), dot nav, prev/next/pause. Four principles.
- **`Work.tsx`** — Section 02. Three bands: Featured leadership work (cards,
  count-agnostic grid), Selected independent work (rows 01–06) and Systems &
  side projects (rows S01–S03), all linking to `/work/[slug]`. Thumbnails
  are `object-cover` on a 4:3 plate (#55).
- **`Showpiece.tsx`** — Section 03. Editorial image moment.
- **`StyleGuideTalksBack.tsx`** — Section 04 on home. Accepts a `featured`
  boolean: when true, renders the "// 04 — The AI Lab" eyebrow and a green
  `LabCTA` block at the bottom that says *"Style Guide is one of four. See
  the rest."* and links to `/lab`. Without `featured` it's used standalone on
  `/lab` for one of the four systems.
- **`Services.tsx`** — Section 06, "Practice". The four disciplines,
  described, not offered (#41).
- **`About.tsx`** — Section 05. The studio scene (`/brand/studio.jpg` —
  generated, not photographic; the owner's call), animated stat counters via
  `CountUp.tsx`, current roles list, tools-in-rotation pills. It used to
  repeat the hero portrait; that duplicate is gone.
- **`ContactCTA.tsx`** — Section 07. One "Email me" button on a bare
  `mailto:` and three detail cards: Based in / Email / LinkedIn (#41).
- **`Footer.tsx`** — Functional footer row only (no closing wordmark moment
  — that was removed). CC mark, copyright, connect list (Email / LinkedIn /
  Instagram / Capabilities deck), and a `// practice` block naming the
  disciplines (this replaced a `// status` availability block).
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
Single source of truth: `src/lib/projects.ts`. Each project has its own
image folder under `/public/work/<slug>/`, and **every replaced image gets a
new filename** (#50). Friends Rehab shows the **rebuilt** site (the v4 static
build at `~/frp-website-preview/v4`, in final client review — not the old
WordPress site). Screenshots of animated sites are captured under reduced
motion with every reveal, counter and lazy image settled first (#58).

### Contact info (now centralized in `src/lib/profile.ts` → `PROFILE`)
- Email: `johnbcarman@gmail.com` (kept live because it works). **TODO:**
  provision `john@carmancreative.com`, then set `PROFILE.contact.email` to it
  and demote the Gmail address. Do **not** ship the custom-domain address
  before the mailbox exists — a bouncing address is a credibility leak. The
  target is recorded as `PROFILE.contact.emailPreferredTodo`.
- LinkedIn: `https://www.linkedin.com/in/johncarman/`
- Instagram: `https://www.instagram.com/jbcarms` (display `@jbcarms`)
- Capabilities deck: linked in Footer as `/capabilities`

### Positioning strips (no availability anywhere)
- Contact section strip: `Carman Creative / Brand / Creative direction /
  Design systems`.
- Footer `// practice`: `Carman Creative — brand, creative direction, and
  design systems.` (`PROFILE.practiceLine`).
- Hero meta strip: `Virginia Beach / Brand / Design Systems`.
- Contact has **one** path — a plain `mailto:` behind "Email me", with no
  pre-filled subject or body (pre-filling an intake form implies a
  transaction is being solicited). TODO: wire Netlify Forms if a real form is
  wanted.

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
"Based in Virginia Beach." — and nothing about availability (the earlier
"Available for remote and select hybrid opportunities" line went with the
neutral pass, #41). The three-city (Virginia Beach / Philadelphia / Brooklyn)
"studio" framing was removed as a proof point — it read as a freelance-agency
flex. The hero meta strip is `Virginia Beach / Brand / Design Systems`.
**Never** Newport Beach (early LLM hallucination). Separators are `/`, not
`·` or `•`.

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
git push origin main
```
That's it. Since change #53 the Netlify site is linked to
`github.com/johnny5vb/GPTPortSite` (branch `main`): every push builds on
Netlify (~40 s) and publishes itself. Nothing on the Mac deploys any more —
`npx netlify deploy --build --prod` still works for a one-off, but it isn't
the flow and it isn't needed. Pull requests get deploy previews automatically.
Git pushes as `johnny5vb` via `gh auth login` + `gh auth setup-git` (keyring);
the repo is public, so fetches never needed auth — only pushes did.

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

- **Do not** reintroduce availability or solicitation language. No "open
  to", "available for", "seeking", "for hiring teams", "hire me". The site
  describes the work; it does not ask for any. (This reverses the earlier
  employment-first rule — see change #41.)
- **Do not** lead with "AI Strategist." AI is the third descriptor, a
  supporting advantage — never the headline.
- **Do not** publish unverified metrics as facts. Gate them behind visible
  `TODO: Confirm` placeholders (muted italic) until John confirms them.
- **Do not** ship `john@carmancreative.com` until the mailbox is provisioned —
  keep the working Gmail live; a bouncing address is a credibility leak.
- **Do not** invent testimonials/quotes. `TODO` placeholders only, never
  fake quotes on the live site.
- **Do not** sound desperate or hustle-y. Tone is confident understatement.
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
    - **`ui-ux-pro-max`** — started as SKILL.md-only; **now complete.** The
      engine (`scripts/` — search.py/core.py/design_system.py/validate_data.py +
      tests, `data/` — 35 CSVs incl. ui-reasoning + 22 per-stack files,
      `references/` — quick-reference + pro-rules) was vendored from
      `github.com/nextlevelbuilder/ui-ux-pro-max-skill` (MIT, LICENSE kept). The
      upstream SKILL.md was byte-identical to the owner's upload (same version:
      84 styles / 192 palettes / 74 fonts / 22 stacks), so no reconciliation
      needed. Verified in-container: `validate_data.py` OK, 16/16 unit tests
      pass, `search.py --design-system` and `--domain` return real data.
      Requires Python 3 (3.11 present here), no external deps.
    - **`taste`** — added from `github.com/Leonxlnx/taste-skill` (MIT), a
      13-skill collection. Owner chose a **curated subset**, not the whole
      plugin: vendored `design-taste-frontend` (the namesake taste skill),
      `redesign-existing-projects` (audit-first upgrade), `high-end-visual-design`
      (soft — "make it feel expensive"), and `brandkit` (brand-board imagegen).
      Skipped the niche/overlapping ones (v1, brutalist, minimalist, stitch,
      imagegen web/mobile, image-to-code, gpt-taste, output-enforcement). Each
      vendored dir carries the MIT LICENSE. All are self-contained single
      SKILL.md files (no scripts/DB), so unlike ui-ux-pro-max they're complete.

### Later session — two flagships wired with real enterprise assets

29. The owner supplied source files (PDF/PPTX) for the two NDA-gated flagships;
    assets were rendered to web images with PyMuPDF and wired truthfully.
    - **Beacon → Carelon.** Cover is the **name-change poster** ("Our name has
      changed. Our commitment has not.") — the only piece that carries the whole
      transition in one frame. `work` is now a real before/after: Beacon 2019
      brand guidelines ↔ Carelon logo architecture; the transition poster; Beacon
      Care Services member flyer ↔ Carelon sales sheet; then a production gallery
      (paragraph styles, crisis capability sheet, pocket folder). NOTE: the first
      upload was all Carelon (after); the true before/after only became possible
      when the **Beacon** brand guidelines + collateral were uploaded separately.
    - **Marketing Bench / Marketing Hub.** Source was a Beacon-era platform
      (2019–20, pre-Carelon rebrand; sometimes called "SalesHub") — captions say
      so rather than implying Carelon-era UI. The deck's raw platform screenshots
      were too low-res (481×331), so screens came from the **user guide PDF** at
      1700×2200. Cover/hero: the annotated "Build a Marketing Folder" homepage.
      The key moment: **"Client inventory and configurable templates"** — select a
      client and logo/program/phone/URL populate across templates, then View Proof
      → Create PDF (the literal proof of "designer out of the critical path").
      Plus a Resource Center ↔ Marketing Folder pair, real client-configured
      output (PG&E, United Rentals, J&J), and the field-governance rules.
    - **`ProjectDetail` change:** a flagship **with** a cleared `cover` now
      features it centered and uncropped (`object-contain`) on the brand
      gradient; without one it still falls back to the `display` wordmark. Before
      this, flagships always rendered the gradient and ignored `cover`.
    - Tooling note: PyMuPDF (`pip install pymupdf`) renders the PDFs; LibreOffice
      failed on the PPTX files, so embedded media was pulled straight out of the
      OOXML zip (`ppt/media/`).
    - **Workfront is now the only flagship still on placeholders.**

### Later session — every published project on real assets

30. Cleared the remaining placeholder work and made several system-wide calls.
    - **Atrómitos.** Rewritten honestly: the client arrived with their art
      direction settled and didn't want a redesign, so the case study says so
      plainly and puts the contribution where it was — craft inside their
      system, real interactivity, and the consolidated Knowledge Hub. Wired the
      homepage (cover + browser moment), the Knowledge Hub, and the 65-page
      **Andy Hill CARE Fund** report. Name accented to match their own mark.
    - **IMPORTANT! Colorado.** Wired the campaign brand system (wordmark
      anatomy, hero-mark rationale, three mark variants, palette, the WCAG
      contrast-pairing table), the member carousel, Phase 2 slides, and the
      partner eligibility flowchart. Placeholder decisions replaced with real
      ones drawn from the campaign's own documents; reach/response stays TODO.
    - **Workfront.** The owner's context unlocked it: **Single Spine** was the
      legacy instance (five Workfront systems consolidated into one); the
      **Workfront Restart** was a new instance built from scratch around its
      pain points. Both are now named in the copy. Wired the from/to process
      model (cover), a Single-Spine-chaos vs Restart-phase-table pair, the
      six-phase process, reviews/delegation, the everyday surface, and the
      "Workfront That Works" adoption poster. Staged launch (MVP Jan 2026,
      full launch Apr 2026) added as an outcome.
    - **EverMark held back** via a new reversible `draft` flag — the proposal
      isn't signed, so it isn't an engagement to show. Drafts are filtered from
      every listing, get no route (`dynamicParams = false`), are unreachable via
      `getProject`, and stay out of the sitemap and capabilities deck. Flip
      `draft` off to publish. Independents renumbered 01–07 afterwards.

31. **Thumbnail format — decided.** Covers range from 0.65 (a tall poster) to
    2.00 (a wide screenshot), so no single crop served them; the old Work row
    thumbnail was a 2.5:1 letterbox. Everything now presents the piece **whole**
    (`object-contain`) in a 4:3 plate — Work rows, leadership cards, case-study
    heroes, and the `pair`/`gallery`/`detail` frames inside "The work".
    **Plates are neutral (`bg-ink-2`), not palette gradients** — the owner
    rejected site colour behind the work; the only colour on screen comes from
    the work itself. Thumbnail parallax tightened to ±8px so contained art
    can't slide out of its plate.

32. **Body typeface: Geist → Instrument Sans** (via `next/font`, self-hosted).
    Geist reads as the AI/dev-tool default; Instrument Sans has editorial warmth
    that sits with Fraunces. The four AI Lab theme presets referenced the removed
    `--font-geist` and were repointed.

33. **Mobile pass.** Contact values (email, profile URL) overflowed their cards —
    grid children default to `min-width:auto`, so they got `min-w-0` plus
    wrap-anywhere. Manifesto's dot-nav numerals pushed the transport buttons
    off-screen at 375px (now hidden below `sm`). Section rhythm was `py-28`
    (112px top and bottom) on phones across every section — now `16 / sm:24 /
    md:40`. Audited all routes at 375px: no horizontal page scroll. The Lab tab
    strip still overflows *by design* (scrollable container).

34. **Testimonials are live.** Four verified quotes published (Todd Mills /
    Colony Coffee, Harry J. Brown / Brown Estate Planning, Josh H. / web
    developer, Brenda W. / communications specialist). Stored verbatim in
    `src/lib/testimonials.ts` — the `verified: true` gate and the "never invent
    a testimonial" rule still stand, and names given as an initial stay that
    way. `Testimonials.tsx` moved to a two-column layout; it was written for one
    or two quotes at display size. The section renders on `/leadership` and had
    correctly been returning `null` until now.

Tooling note: PyMuPDF renders the source PDFs; LibreOffice fails on these PPTX
files, so deck graphics are pulled straight from the OOXML zip (`ppt/media/`),
filtering out logos and icons by size.

Scratch artifacts from earlier sessions (safe to delete): `hero-mockups.html`,
`hero-mockups-2.html`, and `.claude/launch.json`. Dependencies unchanged this
session (`framer-motion`, `lenis`, `next-view-transitions` already present).

---

## When you're picking this up cold

1. Read this whole file.
2. Run `npm run dev` and open `/`. Scroll through all 8 sections, then visit
   `/lab`, `/capabilities`, and at least one `/work/<slug>`.
3. The live site is exactly `origin/main` (Netlify builds every push). If
   local `main` is ahead, the difference is what hasn't shipped yet.
4. Before changing anything that touches the headings / contrast / aria
   patterns, re-read the Accessibility section — those decisions cost a
   long audit cycle.

### Later session — flagship covers unified; section numbering corrected

35. **All three flagship covers now share one treatment**: the piece itself on a
    light neutral plate (`#f4f2ef`) with a soft drop shadow, composed at
    1800×1350 and served at `coverAspect: "4 / 3"`. Carelon is a spread of four
    real deliverables; Marketing Bench is the platform homepage centered
    (cropped to the header/hero/Quick Links framing the owner asked for);
    Workfront is the "Future State Overview" slide on the same plate. The
    Marketing Bench cover uses the **clean, un-annotated** homepage — extracted
    as the embedded source bitmap from page 2 of the user guide PDF
    (`get_images` → 1709×2029), not a re-render of the annotated page. The
    annotated walkthrough returned to "The work" as its opening moment, so
    neither image is used twice.
    - Note: a composite of the poster + a slide + a UI screenshot was tried for
      Workfront and **rejected by the owner** ("that woman poster mixed with the
      weird slide and screenshot are not doing it for me"). Composites work when
      the pieces are finished artifacts (Carelon); they don't when the set is
      mostly screenshots. Reverted, then replaced with the real program slides
      the owner supplied.

36. **Section numbering ran backwards between 05 and 06.** `About` renders
    before `Services` on the home page but was numbered 06 against Services'
    05, so the rail's 05 dot jumped past About and its 06 dot jumped backwards.
    Renumbered to follow DOM order — **05 About, 06 Consulting** — in
    `SectionRail.tsx` and both section eyebrows. The page order was left alone:
    About → ResumePreview → Consulting is the right narrative, and the numbers
    exist to ascend as you scroll. Verified in a browser that all eight rail
    targets resolve and their page positions are strictly ascending.

37. **IMPORTANT! Colorado — cover and opener swapped.** The cover is now the
    member-facing social carousel as one square 2×2 set (`carousel-set.jpg`,
    `coverAspect: "1 / 1"`) — the campaign as the public actually meets it,
    not the deck cover. "The work" now opens with `system-at-a-glance.jpg`, a
    12-tile montage of the campaign's real documents in reading order: the
    partner eligibility flowchart, brand-guidelines pages 1–6, and all five
    Phase 2 immigrant-coverage slides, rendered from the source PDFs onto the
    same light neutral plate the flagship covers use.
    - Two moments removed as duplicates of the new cover/opener: the three-slide
      carousel gallery (the cover now carries all four slides) and the closing
      standalone flowchart (it leads the montage). `carousel-1..4.jpg`,
      `cover.jpg`, and `flowchart.jpg` stay on disk, just unreferenced.

### Later session — design-review pass (type system, cursor, leadership page)

38. **A designer friend reviewed the live site.** Acted on the points that were
    system problems; deferred the one that would undo a settled decision.
    - **Type scale (`globals.css`).** The complaint "no consistent pattern of
      size, font, coloration section to section" was measurable: 25 distinct
      heading clamps site-wide, nine on the home page alone, with peer-level
      section headings at 4.4rem / 5.4rem / 8.4rem maxima, plus five body-text
      opacities. Added a four-rung display scale (`t-display-xl/lg/md/sm`),
      three body ranks (`t-lede`, `t-body`, `t-body-mute`) and two mono label
      sizes (`t-label`, `t-label-sm`). Home page now renders H1 85px → section
      H2 77px → band H2 42px. Deliberate one-off display moments (the Manifesto
      numeral, the Showpiece pull-quote) stay bespoke — they're accents, not
      rungs. `text-bone/90` and `/75` folded into `/85` and `/80`.
    - **Accent-label overuse.** ~250 mono-uppercase label instances across ten
      near-identical recipes. The About experience column was the worst case —
      company, title, date and eight tool pills all mono uppercase, ~20 shouting
      lines with no rank. Company now sets in the display face, role in
      sentence-case sans, and only the date stays mono (it's data). Same fix for
      the strengths/tools pills and the Leadership "what I can lead" pills.
    - **Cursor.** 32 distinct `data-cursor` values, most of them nouns naming a
      destination ("site", "cta", "ghost", "leadership") rather than an action —
      unreadable as a cursor label. `CustomCursor` now keeps a short allow-list
      (`LABELS`) and shows a word only for those; everything else gets the ring
      alone. The ring no longer fills solid (it was a colour block on top of the
      thing you were pointing at), the dot stays visible so you never lose the
      aim point, and the label trails below-right instead of underneath.
    - **Leadership page rhythm.** Six identical bands of "11px mono eyebrow
      beside a wall of content" — no rung between label and body. `Block` now
      takes a `heading` rendered at `t-display-md`, and the label column sticks
      as the band scrolls.
    - **Support-page visual.** `/leadership` opened on pure type. Added
      `public/brand/portrait-duotone.png` — the existing portrait put through a
      Bayer 8×8 ordered dither, mapped ink→green, with the cream paper floored
      out so the texture lands on the drawing and not the background. Sits at
      0.3 opacity behind the hero, masked so it dissolves left; it reads as
      texture, not as a competing image. Generated with PIL + numpy.
    - **Movement.** Hover response added where it was missing rather than
      everywhere: leadership cards lift and their artwork scales (matching the
      home cards), and list-row `↳` markers track right on hover.

    **Deferred deliberately — the home hero.** The friend asked for "a dynamic
    more visual hero image on the home page." That's the one piece already
    iterated to a settled answer: animated mark → drifting work contact sheet
    (rejected as too busy/floaty) → the quiet monogram. Changing it is an
    owner's call, not a review note to action. Raised, not implemented.

    **Accessibility note.** An axe run mid-pass reported colour-contrast
    failures with foreground values (#757575, #595959) that match no token in
    the system — the scanner was sampling elements part-way through their
    `whileInView` reveal, where the blended colour is neither the start nor the
    end state. Re-run after letting reveals settle: **0 violations** on `/` and
    `/leadership`. Worth remembering before chasing a phantom regression.

### Later session — the home hero: topographic isolines

39. **The hero visual is now a live contour field** (`HeroIsolines.tsx`), chosen
    by the owner from a set of six generative options built as running
    prototypes. It replaces **both** `HeroMonogram` (which competed with it for
    the headline's right-side gap) and the 80px background grid (two line
    systems in the same space muddied each other). `HeroMonogram.tsx` is left
    on disk, unimported, in case it's ever wanted back.
    - **What it is:** real isolines — marching squares over a drifting 3-octave
      value-noise field — so it produces closed loops, islands and saddles and
      never repeats. Not a stack of sine waves; that was the first attempt and
      it read as overlapping waves, which is why it was rejected.
    - **Cost control:** cell size is derived from viewport area against a target
      sample count, so cost is flat from a phone to a 5K display. Throttled to
      30fps, paused by IntersectionObserver when the hero scrolls away and by
      `visibilitychange` when the tab is hidden. Pointer swell is added only on
      fine pointers. Under `prefers-reduced-motion` it draws **one static
      frame** and never starts a loop.
    - **Tuning lives in the `FIELD` constant** at the top of the file.

    **Two traps worth remembering.**
    1. **`-z-10` hid it completely.** A negative z-index child paints below its
       ancestors' backgrounds, and `body` carries an opaque ink background — so
       the canvas was drawing correctly (measurable via `getImageData`) while
       compositing to nothing on screen. The pre-existing hero grid/glow div had
       the same bug and had presumably never been visible either. Fix: the field
       and glow sit at `z-0` and every content layer in the hero got
       `relative z-10`. **Never diagnose a canvas by reading the canvas** —
       screenshot the composited page and sample its pixels.
    2. **Contrast has to be measured against the composited page.** axe reads
       DOM background colours, so a canvas behind text is invisible to it and
       reports 0 violations while small grey text sits on bright lines. Measured
       properly, `text-mute` over the field fell to **2.39:1**. Two changes
       fixed it: field intensity came down to 0.75, and the hero's own greys
       moved up (`text-mute` → `text-bone/70`, `text-mute-2` → `text-bone/55`)
       because the hero is the one section whose background isn't flat ink. The
       system tokens elsewhere are unchanged. Worst-case small-text ratio over
       the field is now **5.14:1**; axe still reports 0 violations, 27 passes.

    Verified: animates, pauses when scrolled away, single static frame under
    reduced motion, no horizontal scroll at 390px, other routes untouched. The
    dev-only reduced-motion hydration warning is the pre-existing one noted in
    change #25 (it fires in `ScrollProgress`/`ScrollBackdrop`, not here).

40. **Workfront Restart pulled from the leadership set** at the owner's request,
    while a stronger third example is curated. Done with the same reversible
    `draft: true` flag as EverMark — the case study stays written and fully
    wired (cover, four program slides, "The work" moments, adoption poster);
    flip the flag off to republish. Verified: `/work/workfront-workflow-transformation`
    404s, it's out of the sitemap, and no page links to it.
    - Both grids that showed the flagships were hard-coded to three columns and
      would have left a hole. `Work.tsx` and `LeadershipPage.tsx` now pick their
      column count from `LEADERSHIP_PROJECTS.length`, and the leadership band
      heading went from "Three programs, start to finish." to the count-agnostic
      "Programs led start to finish."
    - **Left in place deliberately:** the Workfront lines in the Leadership
      page's `EXPERIENCE` and `PROOF` lists ("Workfront and production workflow
      ownership", "Reworked Workfront intake, review, and approval across ~75+
      projects a month"). Those are true statements about the work John has
      done, independent of whether the case study is on the site. Remove them
      only if he wants the experience itself de-emphasised, not as a side effect
      of pulling the case study.


### Later session — the neutral copy deck

41. **Applied the neutral copy deck** (`carmancreative-neutral-copy-deck.md`,
    Part A of the v2 brief). The site no longer presents as a job search or a
    sales pitch; it presents as a creative director's portfolio and the
    practice he runs. Nothing about the visual system, type, motion, or the
    case studies changed — this was copy, IA, and metadata only.
    - **`AudienceSplit` → `Intro`.** The two-card "Hiring John / Work With
      Carman Creative" split collapsed into one `// John Carman` identity band
      with the deck's headline and body, and two quiet links (View the work,
      About). `AudienceSplit.tsx` is deleted, not orphaned.
    - **Contact** lost its availability strip (now the four disciplines), lost
      the hiring/project card split, and lost the pre-filled mailto intakes.
      One "Email me" button on a bare `mailto:`. Detail cards went 4 → 3:
      Based in / Email / LinkedIn (the Availability card is gone).
    - **Footer** `// status` → `// practice`; the "Open to the right
      leadership opportunity" line and the availability line under John's name
      are both gone.
    - **Services** is section **06 — Practice** (rail label too, previously
      "Consulting"); heading "Work with Carman Creative." → "The work of
      Carman Creative."; the Creative Direction card's "I lead. I hire…" pitch
      and the second-person "your team" both neutralized.
    - **`PROFILE`** dropped `location.availability` and `location.line`, and
      gained `practice` / `practiceLine`. The file header now says why there
      is no availability field.
    - **SEO** per the deck: title base and og:title are `John Carman — Carman
      Creative`; description is the deck's one-liner, mirrored to og/twitter
      and the Person JSON-LD. `/capabilities` lost its availability sentence.
      Case-study pages already used `project.blurb` as their description, so
      the deck's §6 ask was already satisfied there.
    - **Beyond the deck, from its final sweep:** `/leadership` ("Contact John
      About a Role" → "Get in touch"; "Considering John for a leadership
      role?" → "Happy to talk about any of it."; `?subject=Leadership
      opportunity` dropped from every mailto), `/resume` (availability line
      and "Seeking a senior in-house creative leadership role." removed), and
      About ("I'm now looking to bring that experience to a more challenging
      leadership environment" → a neutral through-line sentence).
    - **Two judgment calls worth knowing.** (1) The Hero's CTA stack led with
      View Leadership Work + Download Résumé; the work now leads, with
      Leadership and Résumé one rung down. (2) Inserting the Intro band left
      the hero and the band saying the same thing twice, so the hero's
      biographical paragraph was cut and the band carries it. Both are
      one-diff reversions if the hero should stay as it was.
    - **Deliberately not swept:** `caseStudy.mandate` in `projects.ts`. There
      "mandate" means the project brief, not a hiring mandate.
    - **Email stayed on Gmail.** The deck pointed the button at
      `john@carmancreative.com`; the mailbox still isn't provisioned, so the
      standing rule held. Flip `PROFILE.contact.email` when it exists.

    Verified: clean `npm run build` (20 pages), `tsc --noEmit` clean, eslint
    down from 74 problems to 71 (the remainder are the pre-existing `// eyebrow`
    `react/jsx-no-comment-textnodes` convention), and `/`, `/leadership`,
    `/resume` read clean of every sweep term in a running browser.

42. **Stamp Out Stigma promoted to the leadership set (L03).** Times Square was
    **Beacon Health Options** work, not a Carman Creative engagement, but it
    was filed as independent `06` with "Stamp Out Stigma" listed as its own
    client — which credited the campaign to itself and understated the role.
    It is now `tier: "leadership"`, `flagship: true`, client Beacon Health
    Options, with the role stated as creative lead over concept, messaging and
    OOH, plus a `roleSummary` so it reads alongside the other flagships.
    - Workfront (still `draft`) moved `L03` → `L04`; Spike's K9 Fund moved
      `07` → `06` so the independents close their gap at **01–06**.
    - The flat `gallery` array was retired in favour of the `caseStudy.work`
      sequence the other flagships use — the Times Square dusk shot came back
      as a full-width moment rather than a thumbnail in a strip. `gallery` is
      now `[]`, which `ProjectDetail` already guards on.
    - This restores a **third published leadership example**, so the "Case
      study in progress" badge came off the leadership cards in `Work.tsx`.
      The count-agnostic grid from change #40 handled the column math without
      edits.

### Later session — the site as it now stands

43. **The live site had never been built from this repo.** Netlify's production
    deploy was a manual drag-and-drop from 2026-08-02 (`deploy_source: "drop"`,
    no commit, no branch), which is why every prior Workfront removal was
    correct in git and invisible on the web. Fixed by linking the folder
    (`netlify link --id 789dda90-…`) and deploying with
    `netlify deploy --build --prod` from the owner's Mac (superseded by the
    GitHub link in #53 — chaining a local `npm run build` ahead of that
    command produced one transient "Error while running build" from the two
    builds racing). `main` was merged forward (keeping this tree over two
    superseded parallel commits: a candidate-forward hero and a
    deletion-based Workfront removal); it reached GitHub in #53.

44. **Retyped on Newsreader, ground warmed, hero rebuilt around the portrait.**
    Direction C of three rendered on the real page (A: Instrument Serif /
    Archivo; B: Space Grotesk / Spectral; C: Newsreader throughout) — the owner
    chose C. Tokens above. Four lab components still referenced
    `var(--font-fraunces)` and would have fallen back to a default serif in
    silence; repointed. The portrait hero came from the discarded `1d49c56`
    layout with its availability copy stripped; the contour field stays as its
    background. Intro, How I lead and Work each had a `col-span-4` label rail
    beside `col-span-8` content — every heading started a third of the way
    across and then got capped, reading as a narrow column floating mid-page.
    All three are left-anchored now. Headline chosen from four rendered
    options; the Intro band switched to the copy deck's plainer alternate so it
    stops echoing the hero.

45. **Systems tier.** `tier: "systems"` + `SYSTEMS_PROJECTS` for self-initiated
    work, on its own shelf ("Built for myself, not for a client") so nothing
    borrows a client engagement's credibility: **Carman OS** (S01, the 24-prompt
    four-phase method), **CQAP** (S02, Creative Quality Assurance Platform —
    labelled Alpha with a visible TODO where pilot data would go) and
    **Premier Friends Club** (S03). Case studies written from the live sites
    (carmanos.netlify.app, cqap.vercel.app, premier-friends-club.netlify.app),
    screens captured with Playwright. **CQAP is redacted by design:** its
    Creative Intelligence screen renders Elevance's real brand architecture and
    is not exported at all; the workspace cover stops above the "Recently
    Learned" block, which carries internal job vocabulary. Five richer review
    screens exist but only as chat attachments — they need to land on disk
    (`public/work/cqap/`) before the agreed blur pass (proof content and job
    identifiers obscured, UI chrome sharp).

46. **Leadership thumbnails, twice.** First pass: the cards read as
    low-resolution but the files were fine — a 4:3 plate at 366px gave each of
    four composited deliverables ~120px, so their copy turned to mush.
    (A `sizes` theory was checked and was wrong: 750px into a 366px box at 2×
    is correct.) Second pass, on the owner's read: **Carelon** now shows the
    rebrand itself — Beacon lockup above, Carelon lockup below, a chevron
    between, marks lifted from the real guideline pages (`card-rebrand.jpg`).
    **Stamp Out Stigma** shows the placement, not the artwork — the daytime
    Times Square photo cropped to the screens (`card-timessquare.jpg`), because
    the graphic is a few years old and a thumbnail invites a designer to pick
    at it. The dusk shot (`gallery-2.png`) was rejected: its street signage
    renders as garbled text, the fingerprint of a generated image, on a piece
    whose whole claim is a real buy. The creative moved inside the case study
    as a detail moment. **Marketing Bench** is the platform screen edge to
    edge. Carman OS and CQAP crop into real detail rather than shrinking a
    whole page onto a plate.

47. **Green muted with the wordmark.** `#1cb791` → `#3b9a7e` (same hue and
    lightness, saturation ~74% → ~44%), previewed on the live page by remapping
    all three sources at once — the token, the SVG fills, and the canvas
    `rgba()` via a `strokeStyle` setter patch — so the preview couldn't lie
    about scope. Chosen from current / muted / sage. Applied to the tokens,
    every piece of chrome, `CCMark`/`CCWordmark`, the four brand SVGs, the
    favicon and apple-touch icon, the OG image, the BIAD demo's "Carman" preset
    (it *is* this brand) and the capabilities deck's token spec (which was also
    stale on ground and typeface). Contrast re-measured: 5.72:1 on ink.

    **Two files the owner keeps sending as chat attachments** never reach disk
    and so can't be used: the portrait-orientation engraving (`…1mz7ah…png`)
    and the five CQAP review screens. Finder's search hides `~/Developer`;
    ⌘⇧G with the full path works, and so does saving to the Desktop and saying
    so. A UNIX symlink on the Desktop does *not* work as a Finder shortcut.

48. **Image sharpness — audited, fixed at the pipeline, and a rule for new
    assets.** The owner reported screenshots reading blurry across case
    studies, the lab and the leadership cards. Measured (Playwright at 2×,
    every `<img>` on seven pages: CSS width × 2 vs. served width vs. source
    width): the pipeline was requesting correctly (`w=3840`); the sources
    were the ceiling. Full-bleed `work` moments render at ~1320 CSS px and
    need ~2650px on a 2× display; the captures were 2880 but had been exported
    at 2000 — a 1.32× upscale, self-inflicted. Covers were 1600 into 1772.
    And everything served at `q=75`, which softens UI text even with the
    pixels present.
    - **`next.config.ts`:** `qualities: [75, 90]` (Next 16 only optimises
      listed qualities — a `quality` prop outside the list is coerced to 75,
      silently), `deviceSizes` gains a **2880** bucket (a 2650px slot was
      rounding up to 3840), `formats: avif + webp`. Netlify serves WebP; a
      2880px q90 full-bleed screenshot delivers at ~104 KB.
    - **`quality={90}`** on every screenshot-bearing `<Image>`: the shared
      `Frame` in `ProjectDetail` (all work moments), the case-study hero,
      `Showpiece`, the Work cards, the leadership cards.
    - **Sources re-exported at native 2880** for PFC, Carman OS and FRP;
      covers rebuilt at 2400×1800. Before/after: 2 blurry / 15 soft / 41 ok →
      2 / 4 / 52. The four remaining "soft" are CQAP (2150 is the owner's
      native capture width) and the Carelon rebrand card (a composition of
      small logo crops). The two "blurry" need new sources, not pipeline work:
      the **Colony showpiece** (`gallery-2.png`, 905px into a 1429px frame —
      resolved in #49 with recreated mockups) and Carelon's
      `system-graphic-language.jpg` (a 1600px PDF render; re-render at 2× with
      PyMuPDF if the PDF is to hand).

    **The rule for any new asset.** Full-bleed work moment: **≥ 2650px wide**
    (capture at 1440 CSS × 2 = 2880). Pair / detail / gallery: ≥ 1300px.
    Cover: 2400×1800 (any ratio works since thumbnails went `object-cover`
    in #55; frames inside case studies still contain, so crop to the frame's
    `aspect`). Save masters as JPEG q92 or PNG; don't pre-shrink —
    the optimiser resizes and re-encodes per device, and the raw file never
    ships. `ls -lat` sorts by modified date, which macOS preserves on move;
    sort by **date added** (`mdls -name kMDItemDateAdded`) when looking for a
    file someone just AirDropped.

49. **Colony Coffee — recreated mockups, and a local 2× upscale path.** The
    owner regenerated the Colony mockups (ChatGPT) to replace the 905px
    render flagged in #48. Three files: the three-bag lineup is now the
    `cover` (Work thumbnail, case-study hero, and the home Showpiece);
    Liberty and Founders are a `pair` moment inside "The work", replacing
    the old single Founders inset (`cover.png`, still on disk, unreferenced).
    The label sheet (`gallery-3.png`) and the exploration board
    (`gallery-1.jpg`) stay. The "Selected stills" strip (`gallery: []`) was
    dropped — it repeated two images already in the sequence plus the one
    being retired.
    - **ChatGPT tops out at ~1536–1672px**, under the #48 rule. Rather than
      wait on a manual upscale, **Photoshop 2026 was driven by script** —
      `osascript -e 'tell application "Adobe Photoshop 2026" to do
      javascript "…"'` with `doc.resizeImage(…, ResampleMethod.
      PRESERVEDETAILS, 20)` (Preserve Details 2.0, Adobe's ML upscaler).
      No window opens. Verified the small label type at 1:1 before
      shipping: clean edges, no artifacts. Masters are now 3344×1882 and
      3072×2048, saved JPEG q92. **Two gotchas:** Photoshop can't open a
      `.jsx` from the session scratchpad under `/private/tmp` (pass the
      script inline as a string), and it writes fine to `~/Desktop`. The
      script lives nowhere in the repo — it's three lines, rebuild it.
    - The lineup is a dark, detailed render, so its 2880 q90 WebP is
      ~680 KB — heavier than a UI screenshot, acceptable for the one image
      carrying the home page.
    - This is the path for anything else that arrives from an image
      generator at 1536: drop it in `~/Desktop/For Claude/`, upscale 2× in
      Photoshop by script, then place it.

50. **Hero portrait: the recrop nobody saw, and the rule it taught.** The
    owner reported dead paper above the head *after* #48's recrop had shipped
    — his screenshot showed the head top at ~29% of the frame; the live file
    measured 15%. The cause: `portrait-hero.jpg` was recomposed under the
    **same filename**, and Netlify serves `/_next/image` responses with
    `cache-control: public, max-age=31536000, immutable` — a returning browser
    never re-fetches. Fixed by cropping another 75px of paper (head top now
    ~10% of the frame, verified at 1440×760 / 1280×900 / 1920×1080) and
    renaming to **`portrait-hero-v3.jpg`**; the old file is deleted.
    **Rule: any image swapped under an existing name is invisible to
    returning visitors for a year. Bump the filename** (`-v4`, a date, a
    hash) whenever the pixels change. Case-study assets have all been new
    names so far; the portrait was the one that wasn't.

51. **Colony — the real bags.** The owner sent a phone photo of the printed
    bags on the shelf at the shop (`IMG_1971.jpg`, 4284×3514 — it landed in
    `~/Downloads`, found by date-added). Cropped to 4:3 with the sign's top
    edge trimmed, saved as `on-shelf.jpg`. The owner's call on hierarchy:
    **the polished mockups stay as the cover, thumbnail and first image**;
    the photo goes inside. "The work" now runs: Liberty/Founders mockup pair
    → **"On the shelf" / "The concepts it came from"** pair (the photo beside
    the label-design sheet) → the exploration board. Status is "On the shelf
    — first batch shipped"; the outcome line matches. Note the pair puts a
    dark photo beside a white document plate — raised with the owner, left
    as is.

52. **Wordmark goes home from every route.** The nav logo linked to `#top`,
    an id that only exists in `Hero`. From `/leadership`, `/lab` or a case
    study it scrolled the *current* page to its top and went nowhere. `Nav`
    now sets `href={pathname === "/" ? "#top" : "/"}` — an in-page Lenis
    glide on home, a real navigation (with the cross-document crossfade)
    everywhere else. Verified from three routes and from mid-home.

53. **Repo, GitHub and the live site are finally one thing.** Two gaps closed
    in one sitting. (a) `main` had never been pushed from this machine — 54
    commits ahead, and the earlier `git fetch` successes were misleading
    because the repo is public and reads need no auth. The owner ran
    `gh auth login --web` and `gh auth setup-git`; pushed as `johnny5vb`.
    (b) The owner linked the Netlify site to the GitHub repo (Project
    configuration → Build & deploy → Link repository; `main`, `npm run
    build`, `.next` — picked up from `netlify.toml`). Proven with an empty
    commit: pushed from here, built on Netlify in 41 s, published, with
    nothing run locally. **The deploy flow is now `git push` and nothing
    else** — see the Deployment section. This retires the "Netlify is
    usually a bit ahead of any uncommitted local work" note in the cold-start
    checklist: the live site is exactly `origin/main`.

54. **Image sharpness — the remaining list, cleared.** Live audit went from
    **77 ok / 9 soft / 10 blurry** (14 pages, 96 images) to **95 / 2 / 0**.
    Every replaced image got a **new filename** (`-v2`) per #50.
    - **Atrómitos** homepage + Knowledge Hub recaptured at 2880 from the
      client's live site. It is `atromitosconsulting.com` — `atromitos.com`
      is a parked domain. The site stacks a CookieYes banner, a second
      shadow-DOM cookie banner (`#cookiez-banner`), an Elementor webinar
      popup and two accessibility widgets (`#cya11y-container`,
      `#ea11y-root`); remove those by id before capturing. Cookies declined,
      not accepted.
    - **PDF re-renders at 2880** with PyMuPDF (`python3 -m pip install
      pymupdf`, now installed): the Colony label sheet (`CC-Label Mockup
      Design Options-Full.pdf`, page 1, iCloud), the IMPORTANT! Phase 2
      eligibility slide (`Phase 2-Immigrant Coverage Slides-English-062326.pdf`,
      page 2), and the wordmark-anatomy slide from the brand guidelines —
      which only exist as a `.pptx`, so **PowerPoint was driven by
      `osascript`** (`save … as save as PDF`) to get a PDF first. PowerPoint
      needed the file copied to `~/Desktop/For Claude/` to open it.
    - **Photoshop 2× (Preserve Details 2.0, per #49)** on everything whose
      source is off this Mac: the three CQAP review screens, the two
      leadership cards, Carelon's graphic-language page (thin-line vector on
      flat colour — ideal for it; the portrait document it came from is not
      the landscape `Carelon_Brand_Guidelines_v2.0` PDF in Downloads), the
      three Marketing Bench user-guide screens, and all four Stamp Out
      Stigma images. **These last two sets are interim**: the Stamp photos
      started at 1100px and are still 1.2× at full width; the Marketing
      Bench guide PDF and the original Times Square photos would still beat
      the upscale. The audit script is `audit.mjs` in the session
      scratchpad — it imports Playwright from `~/frp-website-preview/
      node_modules`, since this repo has none.

55. **Work section reordered, thumbnails fill, SOS.** Owner's order for the
    independents: Colony, FRP, SFT, Important!, Spike's, Atrómitos (01–06);
    systems: PFC, CQAP, Carman OS (S01–S03). Order is array order in
    `projects.ts` — the blocks were physically moved and renumbered. Stamp Out
    Stigma's `display` label is `SOS`. **Thumbnails are `object-cover`** in
    `Work.tsx` (cards and rows) and `LeadershipPage.tsx`: the owner didn't
    want some plates full and others letterboxed. Reverses the #31 "present
    whole" rule for thumbnails only; frames inside case studies still contain.
    - **Netlify Image CDN incident, 2026-09-16 12:37 UTC.** Every
      `/_next/image` request returned 502/504 for ~40 minutes; raw files
      served fine. Started minutes before a deploy, so it looked like the
      deploy — it wasn't (yesterday's deploy permalink failed the same way,
      and netlifystatus.com had the incident open). **Check
      `https://www.netlifystatus.com/api/v2/incidents/unresolved.json`
      before debugging blank images.** A one-line `images.unoptimized: true`
      is the emergency fallback; it wasn't needed.

56. **Four case studies re-sequenced on the owner's read** ("some of the
    images chosen are the wrong screens"). Every new file is a new name.
    - **PFC** recaptured from the live site (the hero changed): `home-v2` /
      `cover-v2` (hero), `posters.jpg` (two rows of the Match Center
      posters, cropped at the row gap by scanning for the next poster's top
      edge), `callouts.jpg` (the season-ahead cards, "Foolish faith, kept
      together", and "The nine" stacked as one board on the site's cream),
      `table-v2` + `standings.jpg` as a 3:2 pair, `roster.jpg`. Gallery
      dropped — nobody has posted in it. The standings table on `/members`
      renders after a fetch; wait ~6 s before capturing.
    - **FRP** re-sequenced on its most visual pages: About ("Founded in
      1961"), Housewarming (move-in room, the family, the $100K ask),
      Homeownership (rowhouses), Impact, GRIT. Served from `~/frp-website-
      preview/v4` with `python3 -m http.server 8765`; the pages carry a
      yellow "Review draft" banner and a sticky nav — both removed before
      capture (`frpsec3.mjs` in the scratchpad: `element.screenshot()` of
      each `<section>`, so crops are exact). `pair` moments now take an
      optional `aspect` (default 16/10) so section crops fill their frames.
    - **CQAP** in the owner's order: dashboard → package ready → findings →
      clean review → approved, all full-width.
    - **Carman OS** was untouched — "nothing showing" was the CDN incident.

57. **IMPORTANT! Colorado — the video leads.** The owner supplied the Phase 3
    materials and asked for the awareness video as the featured item. New
    `coverVideo` on the project: `video-loop.mp4` (first 34 s of the 9/15
    1.0× share, 1280×720, muted, crf 27, **1.1 MB**) autoplays in the
    case-study hero; `cover-v2.jpg` (frame F02) is the Work thumbnail. New
    work-moment kind `video`: `film-540p.mp4` (the 11 MB 540p share, 2:59)
    with controls and `preload="none"`, poster F07 so it doesn't repeat the
    hero. Then `film-frames.jpg` (all sixteen frames at 2880), a `gallery`
    of the three universal social posts, the provisions flyer + walk-by
    flyer as a 17/22 pair, the Partner Reference Guide pp. 1–2 as a pair,
    and the nine member slides as a 3×3 sheet (PowerPoint → PDF by
    `osascript` again, then PyMuPDF). ffmpeg is the `imageio-ffmpeg` binary
    (`python3 -c "import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())"`).
    **The brand-system renders (wordmark anatomy, marks, palette, WCAG
    table, Phase 2 slides, carousel) are unreferenced but still on disk** —
    the owner asked for the new materials to replace them.
    - **⚠ The film is Draft 5, in HCPF review as of 9/15 — not released.**
      The caption says "in client review, Fall 2026" and Status says so. If
      the client objects, `coverVideo` and the video moment are two deletions
      and `cover` falls back to a still. Raised with the owner.

58. **FRP recaptured — the screenshots had fired before the page finished.**
    The owner saw missing photos and copy in the FRP frames. Cause: the FRP
    site arms every `.reveal` block to opacity 0 and un-hides it on
    intersection (3-second failsafe), the arched hero photo is a
    `clip-path` wipe, the stats count up from zero, and photos are
    `loading="lazy"` — the #56 captures fired at ~700 ms. Fix, now the
    **rule for capturing any animated site**: Playwright context with
    `reducedMotion: "reduce"` (FRP's reduced-motion path renders final
    state instantly), strip `.is-armed`, flip `loading="lazy"` → `eager`,
    scroll the whole page, `await` every `img.complete`, *then* shoot. The
    home hero now carries its photo and the four-figure band (captured to
    the band's bottom edge, 2880×2306 — `browser` moments take an `aspect`
    now, like `pair`). GRIT's "A safe place" photo and Impact's band were
    also missing before. Files are `v4-*`; the ask and Impact are their own
    full moments. **PFC audited the same way: nothing hidden, all images
    loaded — those captures stand.** `frp4.mjs` / `frp5.mjs` in the
    scratchpad are the reference scripts.

59. **Carman OS recaptured under the #58 routine; CQAP audited, unchanged.**
    Carman OS (`carmanos.netlify.app`) has no images and no reveal
    animations (the one hidden element is an inactive toast), so the old
    captures weren't broken — but they undersold it: the "library" frame
    showed two of seven categories. Now: `home-v2` (front page through the
    first category, 1.618), `library-v2` (categories two and three, 1.21),
    `library-deep-v2` (the back four, 0.837 — trimmed to the last card row by
    scanning for the last non-background line), `preview-v2` (the modal,
    reopened by clicking the first "Preview"), `cover-v2`. Old files
    deleted. **CQAP**: the public page (`cqap.vercel.app`) is a single
    empty-state screen — "Your table is clear" — and the five review screens
    are the owner's own logged-in captures, so there is nothing to recapture;
    the `cover.jpg` crop of a real review stays. **FRP follow-up**: the
    owner flagged the "same apartment" frame — a faithful capture, but the
    site's layout leaves that row 60% empty at desktop width, so it now
    pairs with the move-in room as the page's own before/after
    (`v4-hw-family-b.jpg`, cropped to the room's 1.80) and Homeownership
    stands alone. Lesson: a faithful section capture can still be the wrong
    frame for a portfolio; compose to the content, not the section box.

60. **The two enterprise flagships rebuilt on the real sources.** The owner
    supplied the full Carelon Brand Guidelines (v2.0, April 2022 — the same
    115-page deck as `~/Downloads/Carelon_Brand_Guidelines_v2.0_20220420.pdf`)
    and the *Carelon* Marketing Bench training deck (March 2023).
    - **Beacon → Carelon** now runs Beacon → the system as delivered (pp. 5
      logo and name, 8 at a glance, 7 toolkit + 48 modifiers, 45 clear space
      + 52 palette, 63 supergraphics) → the name-change poster → the team's
      collateral before/after → the production gallery. Pages rendered at
      2880 then **cropped to the visual on the owner's ask**: nav icons
      painted over with the page background, footer band dropped, the
      title/intro column trimmed by taking the bbox of non-background pixels
      right of 30% width (`cbg-pNNc.jpg`). **Story reframed for honesty:**
      the identity arrived from Elevance; the claim is translating it into
      Carelon Behavioral Health's system and running the 1,500-asset
      migration — not authoring the brand. The old brand-system renders
      (graphic language, photo mask, dark cover, data viz, sub-brands) are
      unreferenced on disk. **Dates corrected to 2022–2023 on the owner's
      confirmation** (the entry had said 2018–2020; the poster on the page
      says Beacon became Carelon Behavioral Health on March 1, 2023) — in the
      case study, the `/leadership` experience list and the `/resume` line.
    - **Marketing Bench** was showing the 2019 Beacon-era guide. It now shows
      the Carelon platform: native screenshots pulled from the deck's
      `ppt/media/` (the configurator is 3224px native; the rest went through
      Photoshop 2×), the before/after homepage pair, the three configurators
      (flyer, brochure, capability doc), the "what files are configurable"
      governance table and "next steps" (slide renders cropped to content),
      stationery/translations, and SalesHub beside it. **Dates corrected to
      2022–2023 (launched March 2023)** from the deck's own title slide.
      Cover is the Carelon homepage (`cb-cover.jpg`, 16/10). The flyer
      configurator lost its Safari chrome and the vendor helpdesk email/phone
      (painted out — a vendor support line has no place on a portfolio). The
      Beacon-era assets (`output-*`, `client-catalog`, `template-picker` …)
      are unreferenced on disk. `~/Desktop/For Claude/mb-src/` holds the
      extracted originals and the 2× upscales. **Follow-up on the owner's
      read:** the hero-only crop wasn't compelling as a thumbnail, so the
      cover is now the *full* homepage — hero + Quick links + the Featured
      items strip, stitched from two deck screenshots (`cb-home-full.jpg`)
      and set on the flagship light plate with a soft shadow at 2400×1800
      (`cb-cover-v2.jpg`, `coverAspect: "4 / 3"`). The "Next steps / coming
      April 1" slide came out at the owner's ask; the annotated
      "Marketing Bench overview" training slide (`cb-overview-slide.jpg`)
      pairs with SalesHub instead.

61. **Stamp Out Stigma — the real photograph leads; the generated composites
    are gone.** The page had opened *and* closed on the two AI dusk shots
    (`gallery-2`/`gallery-3`, the garbled-signage ones #46 rejected for the
    thumbnail) while the only real photograph appeared just as a card crop.
    Now: the real daytime Times Square photo full-width (4:3), then a pair —
    the creative beside a mid-frame crop of the placement. Both dusk files
    deleted. **Sources are still 1080px** — only two files exist anywhere on
    this Mac (`~/Downloads/Images/SOS Ad 1.jpg`, `SOS Times Sq Ad.jpg`, both
    1080×810; no PSD, no originals; web search found no larger press copies)
    — so they went through Photoshop **3×** (Preserve Details, noise 25) to
    3240 and read soft at full width; a tight billboard crop was tried and
    dropped because the billboard is ~265px in the source. The originals
    (layered creative, the PR Newswire/MultiVu photo) remain the ask.

62. **Beacon → Carelon, third pass — the story as before/after.** The owner
    found the #60 crops too tight (some cut the visual) and asked for the
    comparison to be side by side: logo vs logo, colour vs colour, type vs
    type, and the progression from Beacon to Carelon. Both guideline decks
    are on disk — Beacon's (Sept 2019, 38 pp., `CC Website Materials/Beacon
    to Carelon/Beacon/Beacon-Brand-Guidelines.pdf`) and Carelon's v2.0 — so
    every page is a fresh 2880 render, not the owner's pasted screenshots.
    - **Sequence:** `transition-strip.jpg` (Beacon mark → the full name-change
      poster → the Carelon Behavioral Health lockup, three cards on the
      flagship plate with chevrons; the marks are clipped from the PDFs by
      `page.search_for()` on their captions, the poster is the old
      `cover.jpg` at 1600×2473 — the `card-namechange` crop cut the copy
      mid-sentence) → four pairs, Beacon p6/p10/p15/p20 against Carelon
      p41/p45/p52/p59 (`bg-*` / `cbg-*`) → Carelon at a glance (p8) → the
      collateral before/after → the production gallery.
    - **Crop rule revised:** "generous" — footer band dropped, Carelon nav
      painted out, then the content bbox *including title and intro column*
      plus a 110px margin, padded back onto the page background so the margin
      holds even where content ran to the page edge. The #60 `cbg-pNNc`
      tight crops are deleted.
    - **Follow-up on the owner's read:** the transition strip (mark → poster
      → mark) "doesn't feel like a good visual" — retired and deleted. The
      case study now **opens on "Our brand at a glance"** (p8, the splay of
      finished Carelon pieces) and the **toolkit page (p7, `cbg-toolkit.jpg`)**
      takes the later slot so nothing repeats. **Cover is
      `card-stacked-v3.jpg`**: the two *stacked* marks — Beacon p6 tile,
      Carelon p42 "Vertical logo" tile, both clipped by `search_for()` on
      their captions and inset past the tile borders — on white cards over
      the flagship plate with a chevron; stacked forms fill a 4:3 plate
      where the horizontal lockups left it half empty. `card-rebrand-v2.jpg`
      stays on disk, unreferenced.


63. **Beacon → Carelon, fourth pass — and the deploy hold.** The owner
    rejected the card-and-chevron cover ("boxes… drop shadows… the arrow
    looks cheap") and four images: the Beacon "Not feeling like yourself?"
    flyer, the Carelon paragraph style guide, and the Website (p101) and
    Collateral (p105) guideline pages. A diagonal split-screen cover
    (Beacon Blue left, Carelon Purple right, reversed logos) was built and
    **rejected too — the owner will compose the cover himself.** Until his
    file lands, the cover is back on `card-rebrand-v2.jpg` (horizontal
    lockups, chevron). Three cover attempts have now failed (stacked cards,
    chevron strip, split screen): stop generating covers for this project
    and wait for his. **It landed the same day** — a two-tone composition of
    the stacked marks, pasted into chat. Pasted images *do* reach disk now:
    the harness saves them under the session's `images/` folder and names
    the path in the message (`images/15.webp` here) — the #47 note that
    attachments never reach disk is out of date. Supplied at 1672×941;
    Photoshop 2× to 3344, then the two grounds extended top and bottom to
    4:3 (`card-owner-v5.jpg`, 3344×2508) so the thumbnail's centre crop
    keeps both wordmarks. The tail of "The work" is now sales sheet +
    crisis sheet (the team's Carelon Behavioral Health collateral), the
    Stationery (p110) + Posters (p113) pages as a "smallest and largest"
    pair, and the pocket folder full-width. Rejected files deleted or left
    unreferenced (`before-beacon-flyer`, `type-system`, `card-stacked-v3`).
    - **⚠ Netlify quota hit (2026-09-18).** The owner's Netlify plan is at
      its limit, so **commits are held locally — do not push `origin/main`**
      until he either buys headroom or picks the moment. Every push
      auto-builds (#53), so holding the push is the hold. Local `main` is
      ahead of `origin/main` by these commits; `git log origin/main..main`
      lists what's queued.
