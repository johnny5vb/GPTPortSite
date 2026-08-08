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
| `/work/[slug]` | `ProjectDetail` | Case studies — `colony-coffee`, `friends-rehab`, `harrison-bounds`, `special-forces-trust`, `stamp-out-stigma`, `spikes-k9-fund`, `beacon-van` |
| `/capabilities` | `CapabilitiesDeck` | Snap-scrolling capabilities deck (not currently linked from the home page; the link in Footer's connect list points to it for sharing) |
| `/shooting-stars` | `BandHero, BandAbout, BandMusic, BandTour, BandPress, BandContact, BandFooter` | **The Shooting Stars** band microsite — a separate product living in the same app. See its own section below. |

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
- Email: `johnbcarman@gmail.com`
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

## The Shooting Stars — band microsite (`/shooting-stars`)

A separate product that happens to share this Next.js app. It is **not**
Carman Creative work-in-a-portfolio-frame: it has its own identity, palette,
typefaces, header, and footer, and it is deliberately unlinked from the
portfolio nav (same posture as `/capabilities`).

**The band.** The Shooting Stars — a four-piece garage rock / power pop band
out of Virginia Beach, formed 2024. Voice: confident, dry, a little
self-aware, never winking so hard it undercuts the design. "Four kids, one
garage" is the thesis; the layout around it is treated completely straight,
which is what makes it read as a real band site rather than a joke.

**All content is placeholder** — band member names, tour dates, venues,
release titles, streaming links (`#`), and the `@theshootingstars` /
`*.band` email addresses are invented to look like a working band's. Swap
them for the real thing; nothing else needs to change.

### Where things live

| Thing | Path |
| --- | --- |
| Every word, name, date, release | `src/lib/shootingStars.ts` |
| Components | `src/components/shooting-stars/` |
| Route, metadata, band fonts | `src/app/shooting-stars/layout.tsx` |
| Favicon | `src/app/shooting-stars/icon.svg` (static file convention) |
| Share card | `src/app/shooting-stars/opengraph-image.tsx` |
| Tokens + scoped CSS | `globals.css`, second `@theme` block + `.ss-page` section |

### Brand tokens (`ss-` namespace)

Namespaced so they can never collide with the Carman Creative tokens.

```
ss-night    #08070f   (background)
ss-deep     #04040a
ss-panel    #100e1c
ss-panel-2  #171427
ss-line     #221f36
ss-line-2   #322d4d   ← border tone only; 1.5:1 on night, never use for text
ss-cream    #f6f2e9   (primary text)
ss-smoke    #a49dba   (7.8:1 on night — safe for body copy)
ss-gold     #ffc94a   (primary accent, 12.9:1)
ss-ember    #ff5a3c   (secondary, 6.4:1)
ss-violet   #7c5cff   (4.6:1 — decoration and large type only)
```

Signature graphic device: the **comet gradient**, violet → ember → gold, on
rules, the logo trail, and the badge ring.

### Typography

- **Anton** (`--font-anton` → `--font-band`) — gig-poster display, uppercase.
- **Space Grotesk** (`--font-space-grotesk` → `--font-band-body`) — body/UI.
- **JetBrains Mono** — reused from the portfolio for eyebrows and ticket-stub
  detail lines.

Two gotchas, both already handled, both easy to reintroduce:

1. `--font-band: var(--font-anton)` is declared **twice** — once in `@theme`
   (so the `font-band` utility exists) and again on `.ss-page`. The second one
   is load-bearing: a custom property is substituted at the element that
   declares it, and `:root` has no `--font-anton` (the band layout puts it on
   the wrapper), so the `@theme` copy alone computes to nothing and every
   heading silently falls back to Geist.
2. Anton's cap height is ~0.83em, so **line-height below 0.92 makes
   consecutive lines touch**. Both `.ss-page h1,h2,h3` and `.ss-display` sit at
   0.92 and live in `@layer components` so Tailwind `leading-*` utilities can
   still loosen a specific block.

Also: never size Anton text with `ch` widths — the face is condensed enough
that `max-w-[20ch]` measures far narrower than the text sets, which broke the
press pull quote into one word per line.

### Identity

`StarLogo.tsx` — a four-point sparkle with a tapered comet trail. Three
lockups: `StarMark` (symbol), `LogoLockup` (nav/footer), `BandBadge`
(circular seal, slow-rotating, for poster and merch moments). Gradients are
declared once by `<StarLogoDefs />` in the band layout and referenced by id,
so nothing depends on a hydration-unsafe id counter.

### Imagery — all drawn, no photography

There are no band photos, so the site draws its own and treats that as the
art direction rather than a gap:

- `AlbumArt.tsx` — four procedural record sleeves (`comet`, `eclipse`,
  `orbit`, `signal`) sharing one palette and one type treatment. Title size
  steps down for long release names. `compact` drops the sleeve type for
  thumbnail use. **Note:** an earlier `prism` design was replaced because it
  had drifted into a direct restaging of a famous existing album cover —
  keep new sleeves original.
- `StagePoster.tsx` — the "band photo" stand-in: raking stage beams, halftone
  moon, backline silhouettes (drums, amps, mic stands), crowd.
- `StarField.tsx` — canvas star field with occasional shooting stars behind
  the hero. Paints one static frame under reduced motion.

### Integration with the portfolio

- `RouteChrome.tsx` and `CustomCursor.tsx` both bail on `/shooting-stars`.
- The portfolio hides the system cursor globally; `.ss-page` in `globals.css`
  hands the native cursor back. If you ever remove that rule, the band site
  loses its cursor entirely.
- Lenis smooth scroll and the `noise-fixed` grain stay on — they suit both.
- The `#main-content` skip-link target is honoured by the band page's `<main>`.

### Accessibility

axe-core (wcag2a/aa + wcag21a/aa + best-practice): **0 violations, 45 passes**
at 1440px and 390px. No horizontal overflow at either width. Reduced motion
verified: every reveal completes, and marquees/badge rotation park at their
start instead of collapsing to a 0.001ms frame.

The one open item is ~45 axe **incompletes**, all `color-contrast` on elements
sitting over the canvas star field, the blurred aurora blooms, or the
`backdrop-blur` header — axe cannot sample those backgrounds. Measured by
hand, the worst realistic case (`ss-smoke` over the brightest part of the
violet bloom) is ~5.8:1, so they pass AA in fact. This is the one place the
band site does not match the portfolio's 0-incomplete result, and it is a
consequence of having a canvas hero at all.

Decisions worth preserving:
- `ss-line-2` is a **border** tone. Putting copy on it fails contrast (1.5:1).
- The h1 uses solid colours, not the comet gradient — `background-clip: text`
  needs `color: transparent`, which contrast scanners read as invisible.
  `.ss-comet-text` and `.ss-outline-text` exist for `aria-hidden` decoration.
- The mailing-list form composes a `mailto:` and says so on the button and in
  the helper text. The site is static; a form that swallowed an address and
  replied "thanks" would be lying.
- Sold-out and past shows render as static text, not dead links.

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

### Later session — The Shooting Stars band microsite

25. Built `/shooting-stars`, a complete band site for The Shooting Stars,
    inside this app but art-directed as a separate product: own logo system,
    own `ss-` palette, own typefaces (Anton + Space Grotesk), own header and
    footer, own favicon and OG card. Sections: hero (canvas star field,
    poster wordmark, latest-release and next-show capsules), 01 The Band
    (story, drawn gig poster, stat strip, four-up lineup), 02 Music (featured
    release with tracklist + back-catalog grid, all sleeves drawn in SVG),
    03 Tour (upcoming rows with ticket states, played shows, booking CTA),
    press quotes, 04 Contact (booking email, mailto mailing list, socials).
    `RouteChrome` and `CustomCursor` opt out of the route; Lenis stays on.
    Full write-up in the section above. Anton TTFs added to `/public/fonts`
    for the OG card.

Scratch artifacts from this session (safe to delete): `hero-mockups.html`,
`hero-mockups-2.html` (the visual option mockups), and `.claude/launch.json`
(preview-server config). New dependencies: `lenis`, `next-view-transitions`.

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
