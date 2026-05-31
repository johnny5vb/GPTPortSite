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
| `/work/[slug]` | `ProjectDetail` | Case studies — `colony-coffee`, `friends-rehab`, `harrison-bounds`, `special-forces-trust` |
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
- **`HeroMark.tsx`** — The animated CC mark on the right side of the hero.
  Top-aligned with the headline letterforms, magnetic cursor pull, brightness
  + glow ramp on proximity. `lg+` only. Decorative (`aria-hidden`,
  `pointer-events-none`). Sized via clamps; tuned tight with `right-` /
  `top-` to clear the section rail.
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
- **`PageTransition.tsx`** + **`src/app/template.tsx`** — Page-level fade +
  slide-up entrance on every route change.
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
- Email: `johnbcarman@gmail.com`
- LinkedIn: `https://www.linkedin.com/in/johncarman/`
- Instagram: `https://www.instagram.com/jbcarms` (display `@jbcarms`)
- Capabilities deck: linked in Footer's connect list as `/capabilities`

### Availability strip
Currently reads `Q2 2026 onward / Retainer / Project / Fractional CD`.
The pulsing green "Open for new work" indicator was removed (didn't want
to sound desperate). Footer status reads "Always grinding" / "Q2 2026 onward".

### About stats
- `20+` years of creative direction
- `175+` projects shipped
- `∞` time spent exploring AI

The `Stat` component in `About.tsx` takes either `to={number}` (animated count
via `CountUp`) or `display="∞"` (static value with `aria-label`).

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

Local CSS warnings about `min-h-[&!]` are harmless — Tailwind v4's CSS
optimizer chokes on a corrupted class string somewhere, but the build still
completes successfully both locally and on Netlify. The previous Netlify
deploy errors were from concurrent deploys canceling each other, not from
the CSS warning itself.

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
