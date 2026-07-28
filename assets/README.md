# Title-screen source artwork

Drop the SHRED title art here, then run:

```
node scripts/inline-title-art.mjs
```

That reads whatever is in this folder and writes the images into
`src/game/shred/ui/title-art.ts` as data URIs, which is where the game reads
them from.

| File | What it is |
| --- | --- |
| `title-logo.png` | The SHRED 1999 wordmark. A white background is fine — the script keys it out. |
| `title-bg.jpg` | The scene behind it. `.png` and `.webp` work too. |

Both are optional. Without them the title screen falls back to the typographic
lockup it draws itself, which is also what the loading screen uses.

## Why these aren't in `/public`

The game runs in three places: the site route, a standalone single-file build,
and a published artifact whose CSP blocks every external host. Only the first
of those can serve a file out of `/public`, so anything the title screen needs
has to be *inside* the bundle. Hence the inlining step.

Keep the sources here — they're the originals, and the generated file is not
something you can edit back into an image.
