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
| `/shred` | `ShredGame` (client-only) | **SHRED // 1999** — a full arcade snowboard game built on Three.js. Standalone: site nav, section rail, custom cursor and Lenis are all suppressed on this route. |

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

## SHRED // 1999 (`/shred`)

A complete browser snowboard game living inside the portfolio — the kind of
thing the Lab pages talk about, actually shipped. It shares the site's fonts
and build, and nothing else: it mounts its own WebGL canvas, its own HUD and
its own keyboard handling.

**Stack.** Three.js (`three@0.180`), one client component, no game assets at
all — terrain, riders, boards, textures, music and sound effects are generated
at runtime, so the whole game is JavaScript.

**Where it lives.** `src/game/shred/`, organised so each system can be worked on
without reading the others:

```
core/     math, seeded rng, simplex noise, keyboard input,
          save/progression, and Game.ts (the loop + mode rules)
world/    TerrainGen (the analytic mountain), Terrain (chunk streaming),
          Scatter (instanced forest), Props (bridges/lifts/villages), Sky
player/   Physics (carving + air + landings), TrickSystem (naming + scoring),
          RiderRig (procedural character), RiderGear (helmets/hair/goggles/
          jackets/boots), BoardArt (canvas topsheets)
camera/   ChaseCamera
fx/       Particles, Trails, Weather, PostFX
audio/    Audio (synthesised soundtrack + ride bed)
data/     riders, boards, modes
ui/       ShredGame (shell), Hud, Menus, shred.css
```

**The load-bearing ideas**, in case any of this needs changing later:

- **The mountain is one function.** `TerrainGen.height(x, z)` is analytic, so
  the renderer and the physics sample exactly the same surface — the board can
  never drift off the visible ground. Features (kickers, halfpipes, lakes,
  bridges…) are assigned per 150m segment from a hash of the segment index, so
  a whole mountain is reproducible from one seed and any point can be evaluated
  without generating its neighbours. The daily challenge is just
  `hashString(YYYY-MM-DD)`.
- **Carving adds energy.** Velocity is split into forward and lateral
  components; grip decides how fast the lateral part bleeds off, and a loaded
  edge converts some of it into drive. Chasing speed *through* a turn is the
  whole feedback loop.
- **Landings are the payoff.** Grade is computed from heading error, flip
  alignment and impact. Tapping Space in the last 0.3s before touchdown
  "stomps" — upgrades the grade and hands you a free re-pop, which is how
  combos chain.
- **Tricks are derived, not memorised.** The name comes from what you actually
  did (spin + flip + grabs), so a first-timer can throw a Cork 720 Melon by
  accident.
- **Time is not linear.** `timeScale` bends for freeze frames on perfect
  landings and slow motion on big air, and every system reads the scaled dt so
  the world, camera and audio bend together.
- **The HUD writes to the DOM, not to React state.** Anything that moves at
  60fps is set from a rAF loop through refs; React only handles popups and
  menus. Read a value at React-render time and it goes stale the moment a run
  is rebuilt — that bug has been fixed once already.

**Rendering.** Terrain and props are `MeshStandardMaterial`s patched via
`onBeforeCompile` (keeps three's shadows and fog, adds the stylised snow
albedo, cloud shadows, sparkle and rim). Post-processing is hand-rolled:
bright pass → 3 blurred mips → composite with radial motion blur, bloom, god
rays, chromatic aberration, ACES tonemap, colour grade, vignette, grain and an
optional CRT pass. Quality presets plus adaptive resolution keep it at 60fps.

**Mobile.** The game is playable on a phone with no keyboard at all:

- **Left half is a floating analog stick.** It appears wherever the thumb lands
  rather than at a fixed spot. Left/right steers (and spins in the air), up
  tucks (front flip), down brakes (back flip). It is genuinely analog, so a
  phone gets *finer* control over edge angle than a keyboard does.
- **Bottom right is JUMP, a four-way grab diamond, and a TWEAK modifier** that
  turns each grab into its tweaked variant — exactly what Shift does.
- Both feed the same `Input` the keyboard uses, so the physics has no idea
  which is driving, and a laptop with a touchscreen can use either. Settings →
  *On-screen controls* forces them on or off.
- Quality is guessed on first run from pointer type, core count and device
  memory; the chunk window (`Terrain.setDetail`) shrinks with it, so a phone
  streams less terrain rather than just rendering it smaller.
- Portrait works but is the lesser view: the camera pitches down to trade
  useless sky for terrain, the speedo moves to the top-left away from the
  thumbs, and the menus collapse to one column. There's a nudge to turn the
  phone sideways.
- Dropping in asks for fullscreen and a landscape lock — both best-effort,
  neither required.
- Backgrounding the tab pauses the run and releases every held control.

Two mobile-specific traps worth remembering: the HUD sits in a layer whose
children have `pointer-events: auto`, so every readout needs it explicitly
turned back off or it eats thumbs aimed at the stick underneath; and the
`.sh-overlay` menus use `align-content: safe center` so a short landscape
phone can still scroll to the bottom of a panel that doesn't fit.

**Characters.** A rider's look is an `Appearance` (`data/appearance.ts`) —
build, skin, hair, headwear, face gear, eyewear, jacket cut, pants cut, gloves,
colours, accessory — and nothing else in the game reads anything else about how
they look. `RiderGear.ts` turns each field into geometry; `RiderRig` assembles
and poses it.

The governing idea, and the one to keep if this is ever reworked: **the rig
cannot sell a human face, so it puts equipment in front of one.** A helmet takes
the skull, goggles take the eyes, a gaiter or balaclava takes the mouth and jaw,
and a baffled puffy takes the torso. What's left — silhouette, layering, colour
— is what procedural geometry is actually good at. Every option in the creator
is either a piece of kit or a way of breaking up the outline; there is no face
sculptor and there shouldn't be one.

Things that were got wrong once and are easy to get wrong again:
- Torso volumes are **scaled spheres with stated depth/height/width**, not
  rotated capsules. A capsule rotated to lie across the body extends along its
  length axis, which buried the arms inside the jacket first time round.
  Nothing on the torso may exceed |z| = 0.152; the arms hang at 0.165.
- Anything worn under a jacket (bib straps, bib panel) is only drawn when the
  jacket doesn't cover it — otherwise it pokes out through the baffles.
- Goggles are worn **over** headwear, so the strap radius (0.119) is larger
  than any hat brim, and brims sit on the forehead above the goggle band.
- Cloth materials carry a shared 128px procedural weave as a bump map. It is
  one canvas for the whole game and it does more for perceived quality than any
  amount of extra geometry.

The **character creator** (`ui/Creator.tsx` + `ui/RiderPreview.tsx`) writes one
`Appearance` and a riding archetype into `save.customRiders`. Custom riders are
never locked, appear at the head of the Riders tab with edit/delete, and are
resolved by `riderById(id, extra)` in `Game.build`. Archetypes (`ARCHETYPES` in
`data/riders.ts`) exist so a home-made rider sits inside the same balance
envelope as the roster — the creator is about looking like yourself, not about
min-maxing. `RiderPreview` shares **one page-lifetime renderer** for the same
iOS reason `core/renderer.ts` does, and runs at 30fps because the game is
already drawing behind it.

**Smoothness.** Four things, all worth keeping:
- `RiderPhysics.renderPos` is `pos` advanced by the un-simulated remainder of
  the fixed 1/120s accumulator. The rig and the chase camera read it; the
  simulation reads `pos`. Without it the rider steps in 120Hz quanta whenever
  the frame rate drifts against the substep rate.
- `RiderRig.update` is allocation-free. Every vector and quaternion it needs is
  preallocated on the instance — per-frame allocation here shows up as GC
  hitches, not as a correctness bug.
- Keyboard steering is **ramped** (`Input.steer`), fast on and faster off, so a
  tap gives a light lean and a hold gives a full edge. The trick system reads
  `steerRaw`/`pitchRaw` instead, because it already does its own spin easing
  and smoothing it twice makes air rotation feel late.
- `Terrain.budgetPerFrame` adapts to the measured frame rate (1/2/3 chunks).
  Building two chunks during an already-long frame is what turns a slow frame
  into a visible hitch.

**Terrain pacing.** The fall line is no longer one constant grade. `pitchAt(z)`
modulates steepness with two sines and `gradeDrop(z)` is its closed-form
integral — that antiderivative is the whole reason the pitch can vary at all,
since `height(x, z)` has to be evaluable at any point without walking the run
from the top. Amplitudes (`PITCH_A`, `PITCH_B`) must stay well under 1: a flat
spot on a snowboard means walking. Feature kinds are up to 17, including
`ramps` (a jump line that steps up from a tap to a booter), `gap` (launch lip,
hole, landing ramp — no way across) and `tunnel` (terrain carves the trench,
`Props.buildTunnel` arches an ice roof over it, because a heightfield can only
describe one surface per point). `sectionAt(z)` names the current stretch for
the HUD, which is what makes the variety legible rather than just felt.

**Every mountain has a bottom.** `MountainPreset.length` sets it, `Props`
builds a finish gate into whichever segment straddles it, and `Game.finishZ`
ends the run there. Endless mode is the deliberate exception.

**Steering sign.** The chase camera looks down +Z, which puts world +X on the
*left* of the screen — so a positive steer axis has to *decrease* yaw. This was
backwards until it was reported; if steering ever feels mirrored again, that
sign in `Game.stepGameplay` is the place to look, not the input layer.

**Progression** lives in `localStorage` under `shred1999.save.v1`. Everything
unlocks from lifetime totals — no currency, nothing to buy — and unlocks are
re-evaluated both on boot and at the end of every run.

The starter set is deliberately generous: **4 riders, 5 boards, 3 mountains**
plus 3 light presets are already unlocked on first boot. This was originally
1/1/1, which made a game whose whole pitch is a quiver read as a game with one
board. `DEFAULT.unlocked` in `core/save.ts` is the list; `load()` unions it with
any saved progress, so widening it retroactively grants the new starters to
existing saves. If you add content, decide explicitly whether it's a starter or
a reward — don't default to locking it.

Content lives in three places and is intentionally data-only: `data/riders.ts`
(10), `data/boards.ts` (12) and `MOUNTAINS` in `world/TerrainGen.ts` (8).
Mountain, rider and board cards all read their copy straight from those objects
— there is no parallel switch statement in the UI to keep in sync. Board
requirements live on the board; **mountain** requirements are the one exception
and still live in `mountainReq` inside `core/save.ts`. Adding a board art kind
means adding a case to `BoardArt.ts` and, if the finish differs, an entry in
`boardFinish()`; adding a rider accessory means a case in `RiderRig.ts`.

**Accessibility note.** The route's `<main>` carries the only `<h1>` (visually
hidden); the title screen headline is an `<h2>` so heading order stays clean.
The site's global `cursor: none` is overridden inside `.shred-root` so the
menus have a real pointer, and re-hidden while riding.

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

### Later session — SHRED // 1999

25. Built a complete arcade snowboard game at `/shred` (see the section above).
    Three.js, ~7k lines across `src/game/shred/`, zero binary assets. Endless
    procedural mountains with 14 feature types, riders, boards, mountains,
    6 light presets, 8 game modes, 8 camera filters, a synthesised reactive
    soundtrack, photo mode and a full unlock table. (Content counts have since
    grown — see item 32 and the SHRED section above for the current numbers.)
26. Suppressed the site chrome on `/shred`: `RouteChrome` returns null,
    `CustomCursor` and `SmoothScroll` bail on the route (Lenis would otherwise
    keep a RAF loop running against the game loop).
27. Mobile pass: analog touch stick + grab cluster, device-aware quality
    defaults, portrait camera bias, safe-area insets, fullscreen/orientation
    request, background pause, and responsive menus. Verified touch-only (no
    keyboard events at all) at 844×390 and 390×844.
28. Bugs found and fixed during playtesting, worth remembering:
    - menu selections ran their side effect inside a `setState` updater, so on a
      screen where nothing else re-rendered the first Enter did nothing;
    - `AnimatePresence mode="wait"` between screens made every transition wait
      on the previous screen's exit, which swallowed fast input and could wedge
      after repeated swaps — screens now render directly;
    - `mergeGeometries` refuses to mix indexed and non-indexed sources, which
      broke the cave set-piece (`IcosahedronGeometry` is non-indexed);
    - HUD labels read from the snapshot at React-render time went stale when a
      run was rebuilt.
29. Rendering + character pass: PMREM-baked IBL from the sky shader, MSAA on
    the scene target (shipping with `samples: 0` *and* `antialias: false` was
    the "crunchy edges" defect), full-resolution render target, and a rebuilt
    `RiderRig` — capsule limbs, an extruded deck plate with sidecut, a real
    head/helmet/goggle stack, and legs that stay bolted along the board while
    only the upper body opens to the stance angle.
30. iOS hardening (`core/renderer.ts`). One memoised `WebGLRenderer` per canvas
    that outlives the Game — iOS caps live WebGL contexts and doesn't reliably
    release them, so rebuilding per run could hand back a dead context. Caps
    are probed rather than assumed: half-float colour attachments and MSAA
    sample counts are verified by checking framebuffer completeness, falling
    back 4 → 2 → 0 samples and then to 8-bit targets. Startup failures now
    surface as a readable overlay with a safe-mode retry instead of an endless
    spinner. **Not reproduced locally** — Playwright's WebKit download is
    blocked by the network policy here, so real Safari remains unverified.
31. Trick easement. Spin eases in over ~0.25s and carries momentum for ~0.4s
    after release (it was a near-instant damp, which read as a switch rather
    than a body). A landing assist eases yaw toward the nearest 180° and flip
    toward the nearest 360° inside the last 0.6s before predicted touchdown,
    scaled by urgency, rider balance, and inversely by how much the player is
    still actively rotating — so it never fights deliberate input.
32. Content pass, in response to "I want a selection of riders, a quiver of
    boards and different mountains": riders 7 → 10, boards 7 → 12 (five new
    procedural topsheets: checker, topo contours, flame, camo, chrome, plus
    per-art `boardFinish()` so chrome actually takes the environment map),
    mountains 5 → 8 (Long Meadow, Sawtooth Spine, Midnight Mile). Mountain
    blurbs moved out of a switch in `Menus.tsx` and onto `MountainPreset`.
    Crucially, the **starter set went from 1/1/1 to 4/5/3** and the whole
    unlock ladder came down (top rider gate was 250k in a run; it's 40k now) —
    the original complaint was really that first boot showed one of everything.
    Garage tabs now show "4/10" style counts and the title screen shows the
    current loadout.

33. Character system + smoothness pass, in response to "we should be able to
    create characters… give them attributes or clothing that helps conceal
    [the lack of realistic features]… better looking characters and smoother
    game play".
    - New `data/appearance.ts` + `player/RiderGear.ts`: build, skin, 9 hair
      styles, 8 headwear pieces (helmet, visor helmet, beanie, pom beanie,
      hood, cap, bucket, bare), 4 face coverings, 5 eyewear types, 5 jacket
      cuts, 4 pants cuts, 3 glove types, accessories — all procedural, still
      zero assets. Riders lost their flat `colors` block in favour of an
      `Appearance`, and `riderSwatches()` derives the garage swatches from it.
    - Geometry upgrades that did the most work: baffled puffy jackets, real
      boots with highbacks and two binding straps, proper goggle frames and
      straps, hair that escapes from under a hat and swings on the head's
      rotation, and a shared procedural weave used as a bump map on all cloth.
    - Character creator at Garage → Riders → New rider: live turntable preview
      plus option rows, saved into `save.customRiders`, never locked, editable
      and deletable, selected automatically once built.
    - Smoothness: `renderPos` interpolation off the fixed-timestep remainder,
      an allocation-free `RiderRig.update`, ramped keyboard steering (with the
      trick system reading the raw axes so air spin stays sharp), and a
      frame-rate-adaptive terrain chunk budget.

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
