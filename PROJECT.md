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
  phone gets *finer* control over edge angle than a keyboard does. A faint
  resting stick is drawn at the bottom-left home position and fades the instant
  a real one appears — the mark a first-timer needs and a returning player stops
  seeing, without giving up the floating behaviour.
- **Bottom right is a four-way grab diamond, with JUMP and a TWEAK modifier
  inboard of it.** TWEAK turns each grab into its tweaked variant, exactly what
  Shift does. The arrangement follows the mobile-sports-game convention the
  owner asked for: the action diamond owns the corner, and the control that is
  *held* rather than tapped sits where the thumb rests, inboard and low.
- **Colour is the label.** A thumb travelling to a pad does not read four words,
  it goes to the green one — so each action owns a hue (nose cyan, melon pink,
  indy green, tail amber) and keeps it, and pressing floods the pad with that
  same hue rather than a generic white flash. A pad is a **ring with a dark
  centre**, not a filled disc: the ring is what stays legible over snow, a low
  sun and a rock face, all of which this game puts behind it.
- **The whole cluster sizes off one `--tc` unit**, so a short landscape phone
  and a portrait one shrink it coherently. This replaced a set of media queries
  that re-declared every control's width individually — which is how the
  proportions drift, and did: a later block was silently overriding the newer
  sizes until it was deleted. If a control needs to be smaller on a phone,
  change `--tc`, not the control.
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

**But a bare head still needs a face.** `buildFace` draws brow, cheekbone, lids,
eyes, nose and a closed mouth for the riders wearing nothing over them, and
every piece is skipped the moment goggles or a gaiter cover it, so a rider in
kit pays for none of it. This is the same rule applied honestly rather than an
exception to it: a blank ball is *worse* than a plain face, because the eye goes
looking for the features it knows are there. What's built is **structure** —
brow, socket, bridge, cheekbone — and never expression, because structure
survives being made of spheres and expression does not. Nothing in there can
animate, deliberately.

The numbers matter more than the geometry does. Features are sized to sit
*inside* the skull and show only as a swell through it — the first pass placed
them on the surface at full size, and a nose on a sphere is a beak, a brow bar
across both eyes is a pair of sunglasses. The skull front is x ≈ 0.088 in
head-local space and every offset in `buildFace` is set against it.

**A hairline is not one height.** The hair cap used to be a sphere segment, whose
lower edge is at one angle all the way round — that is a swim cap, and at the
sweep needed to cover the nape it buried the entire face under a fringe. It is
now a parametric shell whose cut angle varies with azimuth (`HAIRLINE`): high
across the forehead, lower past the ear, down the nape at the back. Two things
that went wrong building it and would go wrong again: blending front→side with
`|sin φ|` puts a corner at the front and gives everyone a widow's peak (use
`sin²φ`), and the ring/segment winding has to be `(i0, i0+per, i0+1)` — the
other way round culls the whole cap and leaves a bald rider wearing the inside
of their own hair.

**Beards share `hairColor`** and are only ever drawn on a bare jaw, since a
gaiter or balaclava covers them. Stubble is a *tint of the skin* with a faint
strand normal, not a shell in hair colour — at half hair colour it read as a
short beard, which is a different option in the same list.

**Builds differ by distribution, not by scale.** `BuildScale` carries `waist`
and `chest`, which reshape the torso profile, plus `head` and `neck`, which
deliberately barely move: three uniform scale factors read as one rider at three
zoom levels, and a head that tracks girth turns a stocky character into a child.

Things that were got wrong once and are easy to get wrong again:
- Torso volumes are **scaled spheres with stated depth/height/width**, not
  rotated capsules. A capsule rotated to lie across the body extends along its
  length axis, which buried the arms inside the jacket first time round.
  Nothing on the torso may exceed |z| = 0.152; the arms hang at 0.165.
- Anything worn under a jacket (bib straps, bib panel) is only drawn when the
  jacket doesn't cover it — otherwise it pokes out through the baffles.
- Goggles are worn **over** headwear, so the strap radius (0.119) is larger
  than any hat brim, and brims sit on the forehead above the goggle band.
- Cloth carries a shared procedural **normal + roughness pair**, not a bump
  map. The old 128px greyscale bump of two sines was invisible at any distance
  you could actually see a rider from, which is what made jackets read as
  painted plastic. What sells snow gear is not the weave — far too fine to
  resolve — but the **ripstop grid**, the coarse reinforcement squares that
  catch light along their edges, so that is drawn at a scale you can see. The
  roughness map is half the job: uniform roughness is the other half of the
  plastic look, and a highlight has to travel across fabric rather than sit on
  it. Keep the repeat square — the torso UV runs 0..1 around and 0..1 up, and
  an uneven repeat turns ripstop into corduroy.
- Hair gets its own normal + roughness pair with the grain running root to tip,
  plus a sheen band. Hair is one of the few everyday materials with a visibly
  anisotropic highlight, and a matte dome is unmistakably not it. Uncovered
  styles also carry tapered strand slabs over the crown: a dome is a dome
  however it is shaded, and what stops it reading as a swim cap is an outline
  with pieces in it.
- A jacket needs a hem, a collar and a cuff. Those are the three places real
  outerwear doubles its fabric, and they are what the eye uses to tell a coat
  from a shell of colour.

The **character creator** (`ui/Creator.tsx` + `ui/RiderPreview.tsx`) writes one
`Appearance` and a riding archetype into `save.customRiders`. Custom riders are
never locked, appear at the head of the Riders tab with edit/delete, and are
resolved by `riderById(id, extra)` in `Game.build`. Archetypes (`ARCHETYPES` in
`data/riders.ts`) exist so a home-made rider sits inside the same balance
envelope as the roster — the creator is about looking like yourself, not about
min-maxing. `RiderPreview` shares **one page-lifetime renderer** for the same
iOS reason `core/renderer.ts` does, and runs at 30fps because the game is
already drawing behind it.

**The torso is one lofted surface**, not a stack of blobs (`torsoSurface` in
`RiderGear.ts`). Jacket cut changes its *profile* — puffy rolls baffle ribs
into the radius, an anorak swells at the pouch — and colour bands are baked
per-vertex, so a contrast yoke is part of the same mesh. Sleeve ribs are a
radius `swell` on the limb tube for the same reason. Anything added as a
separate blob here undoes the point of it.

Vertex colour bleeds across a whole quad either side of the boundary, so a
narrow stripe (a zip) has to be geometry, not paint — as a vertex colour it
came out as a fat cross on the chest.

**Legs are an A, not two posts.** The thigh rings drift toward the pelvis via
the `drift` option; the bones stay over the bindings because the pose code
overwrites their rotation every frame, so the convergence has to live in the
geometry.

**Garage cards render the real thing** (`ui/Thumbs.ts`). Riders go through one
shared offscreen renderer — which needs `preserveDrawingBuffer: true`, or
`toDataURL` returns a blank image — and boards are just the topsheet canvas
rotated to landscape. Thumbnails are cached by id and built one per frame at
the call site so opening the garage doesn't stall on twenty rig builds.

**The "black cubes" defect — four rounds, three bugs, one cause.** Worth
keeping in full, because the process went wrong twice before it went right.

What the player reported: black squares, flickering, appearing in random places
while riding *and while paused*.

Three separate defects were found and fixed along the way. Only the last one
was what they were seeing:

1. **The snow sparkle field.** Cells were `floor(vWorldPos * 7.0)` — 14cm
   across, so a few metres in front of the camera each "glint" was a
   dinner-plate of blown-out white. Real, fixed (~1cm cells, rarer, dimmer, with
   a distance window). Not it.
2. **The scarf.** Its verlet chain is simulated in world space and the mesh
   hangs off the rig root, which carries the rider's full world transform, so
   writing world coordinates into its vertex buffer applied that transform
   twice and drew the scarf as far from the rider as the rider was from the
   origin — measured at 52.5m mid-run, now 0.1m. Frustum culling was off, so it
   was submitted every frame wherever it landed. Real, fixed. Also not it.
3. **The bloom chain overflowing.** This was it.

The bloom targets are half-float, which tops out at 65504, and the god-ray pass
sums 24 taps of the blurred bright buffer. One pixel bright enough to saturate
that sum is Inf; ACES then computes Inf/Inf and returns NaN, and a NaN pixel is
black. The blur runs on **downsampled mips** and spreads each texel across its
neighbours, so one bad texel does not come back as one bad pixel — it comes
back as a *square*. It flickers wherever the scene is brightest that frame, it
survives a pause because the post chain never stops, and it is invisible on
some GPUs and obvious on others, which is why it never once appeared in a
local screenshot.

`SAFE` in `PostFX.ts` sanitises every stage. NaN fails every comparison, so
`!(x > -1.0)` is true for NaN and false for every real number; a `min()` takes
Inf and anything merely absurd. Nothing is lost: after blurring and weighting,
48 and 48000 are the same white.

**The process lesson, which cost more than the bug did.** Two fixes were
shipped as "found it" on the strength of a plausible mechanism plus a clean
local screenshot. A clean screenshot on this machine proves nothing — it runs
SwiftShader, and this defect is driver-dependent by construction. What finally
worked was, in order: (a) a scene-graph audit that walks every object every
frame looking for non-finite matrices, NaN vertices, NaN bounding spheres and
anything drawn far from the camera with culling off — which came back clean and
so ruled out geometry entirely; then (b) reading the post chain for arithmetic
that *can* produce a non-finite value, rather than looking for something that
draws a quad. Ask "what could make a black square" before "which system draws
squares".

**Limbs are solved, not posed.** `RiderRig.reachLimb` is a two-bone analytic IK
solver — law of cosines, no iteration — and both the legs and a grabbing arm go
through it. The legs aim at fixed ankle points in **board-local** space, so the
boots stay in the bindings through every crouch, carve and tuck for free, and
the boot hangs off an ankle node that is re-aligned to the deck each frame
(rotating the knee alone points the sole at the sky once it folds past 90°).

**A grab is a whole-body move.** The arms are 0.57m and the deck is 1.3m below
the shoulder, so an arm alone can never reach it — which is exactly what the
old grabs looked like. The tuck is: the board comes up (~0.3m), the rider folds
sideways over the grabbed edge, the torso pitches along the board toward a nose
or tail grab, and then a servo step measures whatever the solver would still
fall short by and lifts the deck by that much, capped at 0.42m — past that the
knees fold further than a knee does. The arm is finally solved to the
*fingers*, not the wrist (forearm + `HAND`), so the mitt lands on the deck.
Every grab now lands within a glove's width of its grip point; verified
numerically through the dev-only `window.__shred` handle rather than by
squinting at screenshots.

Three things that fall out of this and are easy to undo by accident: the board
tweak must be applied *before* the hands are solved, since the grip point lives
in the board's frame; a tweak has to roll the grabbed edge *up*, toward the hand
(it was rolling away, fighting the reach); and the pelvis is parented to the
stance node, not the torso — on the torso it swings away from the legs the
moment the rider folds and opens a gap at the waist.

**Skinned limbs.** Arms and legs are `SkinnedMesh` tubes over two-bone chains
(`player/RiderMesh.ts`), not stacked capsules. The old rigid pairs visibly
interpenetrated at every elbow and knee and nothing deformed when a joint bent
— that, not polygon count, is what read as "blocky". Three traps here:

- `bind()` snapshots bone world matrices to build their inverses, so it can
  only run once the chain is parented **and** world matrices are current.
  `bindLimbs` is called last in `build()` for exactly this reason.
- A limb mesh must be a **sibling** of its chain root at the chain root's rest
  offset, because its geometry is authored in that frame.
- Gear authored in the arm-root frame (`buildHand`) has to be lifted by
  `upperLen` when parented to the elbow, or the mitts float at knee height.

Do not scale a limb bone to fake compression — it scales everything skinned to
it. The knee bend does the compressing.

**Why the characters aren't imported meshes.** Rigged humanoids *are* reachable
(three.js examples, Khronos samples), and all of them are the wrong answer:
Xbot and Soldier are Mixamo-derived so redistribution is a licence problem,
CesiumMan is lower quality than this rig, RobotExpressive is a cartoon robot.
None is a snowboarder, so each would still need the whole gear system on top —
and the gear is what sells a snowboarder. Revisit only with a rigged model
that is actually wearing snow kit.

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

**Surface detail.** `world/Textures.ts` generates seamless normal and mask maps
at runtime (value/ridged noise evaluated on a torus, Sobel to tangent-space
normals) — snow grain and sastrugi, rock strata and fracture, plus a packed
mask for roughness break-up. `SnowMaterial.shDetailNormal` projects them from
**world space**: XZ for anything roughly horizontal, blending to a vertical
projection as the surface tips up, at two non-harmonic scales so the tile never
announces itself. Relief fades out past ~55m because normal maps alias badly at
grazing angles.

Two things that are easy to get wrong here:
- Anything that **moves through the world** must pass `detail: false` to
  `stylizeMaterial` — a world-space projection slides across a moving rider's
  jacket. The rig brings its own fabric bump map instead.
- Relief is a per-pixel cost and lives on the quality preset (`relief`), off
  entirely at low.

Generating rather than shipping images was a deliberate call: snow, ice and
rock are what noise is good at, the maps are seamless by construction, and the
game keeps zero binary assets, zero download weight and no licence tracking.

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

**Pausing stops the world, not the engine.** `AudioEngine.setPaused` ramps the
music and ride buses to zero and parks the ride bed's own gains, and the
scheduler drags its playhead along with the clock so resuming doesn't fire a
burst of catch-up 16ths. The sfx bus deliberately stays live — suspending the
whole `AudioContext` would silence the pause menu's own blips. Finishing a run
zeroes the bed's inputs instead, so the music carries on under the summary.

**Landing feedback escalates in four tiers** (`tierOf` in `Hud.tsx`), set far
apart on purpose: if every landing arrives at full volume then none of them
does. Marks are drawn SVG, one per thing that was hard about it — air, spin,
stomp, perfect, grind. The combo pill heats and grows with the chain, driven
from the rAF loop through a CSS custom property rather than React state.

**Progression** lives in `localStorage` under `shred1999.save.v1`. Everything
unlocks from lifetime totals — no currency, nothing to buy — and unlocks are
re-evaluated both on boot and at the end of every run.

**Picking the hill is part of deciding to ride.** Mountain selection used to
live only in the garage, behind a tab, three taps from the title — so the
drop-in flow never asked, and players rode the same hill until they concluded
the game had one level. It is now a step in the flow: mode → mountain → run,
opening on the one you rode last so "same again" is one key.

The starter set is deliberately generous: **4 riders, 5 boards, 5 mountains**
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

**Type.** Three roles and no more, all inlined as base64 woff2 in
`ui/shred-fonts.css`:

- **Oxanium** — the interface. Menu items, screen titles, buttons, event and
  mountain names, status tags. Set uppercase; it is a squared face drawn for
  exactly that, and it is what makes the UI read as a game rather than an app.
- **Inter** — everything read as prose. Descriptions, tooltips, help. Sentence
  case, always: prose set uppercase stops being read and starts being shouted.
- **IBM Plex Mono** — anything read as an instrument. Score, speed, clock,
  distance, key caps, labels — anything that sits still in a column while its
  digits change.

Inlined rather than fetched because the game has to look identical on the site,
in a standalone build, and inside a published artifact whose CSP blocks every
external host — a webfont that fails in one of those falls back silently.

**The logo carries all the ice this interface needs.** Everything else stays
flat, and the glow is spent only where it means something: the selected item, a
landing worth celebrating, a run's final score. An interface that is all logo
has no logo.

Two heading voices, and the split is load-bearing: `.sh-title` is Oxanium Bold
uppercase for screen titles, with `.sh-title--prose` as the deliberate
exception for a title that is a *sentence* (an error message shouted at someone
who already has a problem is worse than no styling at all). `.sh-shout` is
reserved for achievement moments — the trick name, the banner, the final score.

**One menu language everywhere.** Tiles with icons: title screen, pause, mode
select. A console menu is read as shapes first and words second — you learn
where "Garage" *is* on the screen — and that only works if each entry is a
block with a position and its own icon. Identical icons across a list are worse
than none. Rows (`.sh-btn`) survive only where a screen is a list of *settings*
rather than actions, because a value on the right is what a row is for.

**Rider portraits** live in `assets/<Name>.png` and are inlined by
`scripts/inline-rider-art.mjs` into `ui/rider-art.ts` — same reason as the fonts
and the title art. The file name is matched to a rider id by lowercasing and
dropping punctuation (`NULL-9.png` → `null9`), checked against `data/riders.ts`,
and cropped to the card's aspect from the top. `riderThumb` returns the portrait
when there is one and falls back to rendering the rig otherwise, which is what
every custom rider gets — and is the right answer for them, since the point of
the creator is seeing the thing you built.

**The game owns its own CSS reset.** `.shred-root *` sets `box-sizing:
border-box`. This is not belt-and-braces: every `.sh-card` is a `<button>`,
which the UA stylesheet already makes border-box, *except* the character-creator
card, which is a `<div>` — so `width: 100%` plus padding made it 25px wider than
its grid track and it sat on top of the next card. Invisible on the site, which
inherits Tailwind's preflight; obvious in the standalone build and the artifact,
which have no reset at all. Anything that ships to all three has to own its
reset rather than borrow the host page's.

**Title artwork** lives in `assets/` and is inlined by
`scripts/inline-title-art.mjs` into `ui/title-art.ts` as data URIs — same
reason as the fonts. The script keys a white card out from behind a wordmark
and trims the transparent margin so centring centres the artwork. Absent
artwork is not a failure state: the title screen falls back to a drawn
typographic lockup, which the loading screen uses too.

**Units.** The simulation is metric; everything the player reads is imperial,
converted through `MPH` / `FEET` / `MILES` in `core/math.ts` so a speedo and a
distance can't drift out of step.

**Rails and boxes** (`Jib` in `TerrainGen.ts`) are deliberately **not** part of
`height()`. A 40cm rail is far below the tessellation the terrain mesh works
at, so a rail in the heightfield is a surface the physics can feel and the
renderer cannot draw. `Props.buildJibs` builds the geometry from the same `Jib`
records that `sample()` reads back, so the two agree by construction.

Three things had to be true before rails were fun, and all three are easy to
undo:
- **Getting on.** Each jib has a snow approach ramp that *is* terrain
  (`jibRampHeight`), and the metal only stands as proud as the ramp leaves it
  (`max(0, height − ramp)`), so the two curves add to a constant. Give the
  metal its own entry bevel as well and you rebuild the hump.
- **Staying on.** The rail snap in `Physics` is a spring to the centre line.
  Without it the target is a few centimetres at 15 m/s and nobody ever lands a
  grind; with too much of it the rail drives the board.
- **The ground checks.** They must use `rideHeightAt`, not `heightAt`. `heightAt`
  is the snow, and a rider standing on a rail is a metre above the snow — using
  it launched the rider off every box they touched.

**Every gap has a way out.** A crevasse with no exit isn't a hazard, it's the
end of the run. The far end of a `gap` is a diagonal: down the middle it's a
wall, so clearing it lands you on solid ground, and out at one edge it runs out
over several times the depth. The floor drains toward that side so gravity
answers "which way is the opening" instead of the player guessing.

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

34. Grabs, legs and the sparkle defect. The long-hunted flickering quads turned
    out to be the snow sparkle field (see the SHRED section) — found from the
    player's own observation that they flickered while paused. Grabs became a
    whole-body move solved with two-bone IK instead of an arm waved near the
    board, and the legs went onto the same solver so the boots track the deck
    through crouches, carves and tucks. Pausing now silences the soundtrack and
    the ride bed while leaving menu sounds alive. Added a dev-only
    `window.__shred` handle, which is what made it possible to verify the grab
    geometry numerically instead of by eye.


35. The black cubes, resolved — after two wrong answers. The sparkle field and
    the scarf were both genuine bugs and both got fixed, but neither was what
    the player was seeing. It was the bloom chain: half-float targets, a
    god-ray pass that sums 24 taps, one over-bright pixel saturating that sum
    to Inf, and ACES turning Inf/Inf into NaN — which is black, and which the
    downsampled blur spreads into a *square*. Every stage of the post chain
    sanitises now. See the SHRED section for the full account, including why
    two clean local screenshots proved nothing.

36. Design system pass: the wordmark, the three-role type system, one-bar
    control legend, imperial units. See the SHRED section.

37. The board rebuilt as four layers off one extrusion — topsheet, sidewall,
    steel edge, sintered base with its own graphic — plus real bindings, and a
    deck graphic that runs once tail-to-nose instead of repeating at every
    hinge.

38. Terrain: gap runouts (every crevasse is escapable, verified with a
    least-climb puck from the worst spot in all 15 across 8 mountains), a new
    `jibs` feature kind, and rails and boxes that are actually rideable — 175
    of them across the eight mountains, with snow approach ramps, a centre-line
    snap, and grinds that derive their names the way the air tricks do.

39. Landings escalate: four tiers, drawn marks for what was hard, a combo pill
    that heats as the chain climbs.

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
