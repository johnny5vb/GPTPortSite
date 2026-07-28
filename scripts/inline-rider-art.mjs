/**
 * Inline the rider portraits into the game bundle.
 *
 * Same reasoning as `inline-title-art.mjs`, for the same three targets: the
 * site route can serve out of `/public`, the standalone single-file build and
 * the published artifact cannot. So the portraits become data URIs in
 * `src/game/shred/ui/rider-art.ts`.
 *
 * Usage:
 *   node scripts/inline-rider-art.mjs
 *
 * Inputs: `assets/<Name>.png`, one per rider, named for the rider. The file
 * name is matched to a rider id by lowercasing and dropping everything that
 * isn't a letter or a digit — `NULL-9.png` → `null9`, `Solve.png` → `solve` —
 * so adding a rider and a portrait needs no edit here. Ids are checked against
 * `data/riders.ts` and anything that doesn't match is reported rather than
 * silently written, because a portrait keyed to a typo just never appears.
 *
 * A missing portrait is not a failure state: `riderThumb` falls back to
 * rendering the actual rig, which is what every custom rider gets anyway.
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const ASSETS = path.join(ROOT, "assets");
const RIDERS = path.join(ROOT, "src/game/shred/data/riders.ts");
const OUT = path.join(ROOT, "src/game/shred/ui/rider-art.ts");

/**
 * Cropped to the garage card's aspect (`.sh-thumb--rider`, 26/30) rather than
 * letterboxed into it — a portrait is the one image on the card and it should
 * fill it. Cropped from the top because these are all head-and-shoulders with
 * a little sky above; a centre crop takes the chin off.
 *
 * 520×600 is the card at 2× — enough for a retina panel, and small enough that
 * ten of them are a sane share of the bundle.
 */
const WIDTH = 520;
const HEIGHT = 600;
const QUALITY = 78;

/** Anything that isn't a title asset is a candidate portrait. */
const NOT_A_PORTRAIT = /^title-/;

const idOf = (base) => base.toLowerCase().replace(/[^a-z0-9]/g, "");

async function main() {
  if (!existsSync(ASSETS)) {
    console.log("no assets/ directory — nothing to inline");
    return;
  }

  // Only the roster — `riders.ts` also declares ARCHETYPES with the same shape,
  // and reporting "no portrait: park, powder" every run is noise, not a warning.
  const roster = (await readFile(RIDERS, "utf8")).split("ARCHETYPES")[0];
  const known = new Set(
    [...roster.matchAll(/^\s{4}id: "([a-z0-9-]+)",$/gm)].map((m) => m[1]),
  );

  const files = (await readdir(ASSETS))
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .filter((f) => !NOT_A_PORTRAIT.test(f))
    .sort();

  const entries = [];
  const unmatched = [];
  let bytes = 0;

  for (const file of files) {
    const id = idOf(file.replace(/\.[^.]+$/, ""));
    if (!known.has(id)) {
      unmatched.push(`${file} → "${id}"`);
      continue;
    }
    const out = await sharp(await readFile(path.join(ASSETS, file)))
      .resize({ width: WIDTH, height: HEIGHT, fit: "cover", position: "top" })
      .webp({ quality: QUALITY, effort: 6 })
      .toBuffer();
    bytes += out.length;
    entries.push([id, `data:image/webp;base64,${out.toString("base64")}`]);
    console.log(`${id.padEnd(9)} ${file.padEnd(14)} ${(out.length / 1024).toFixed(0)} KB`);
  }

  for (const u of unmatched) console.warn(`SKIPPED  ${u} — no rider with that id`);
  const missing = [...known].filter((id) => !entries.some(([e]) => e === id));
  if (missing.length) console.log(`no portrait: ${missing.join(", ")}`);

  const body = `/**
 * Rider portraits, inlined as data URIs.
 *
 * GENERATED — do not edit by hand. Run \`node scripts/inline-rider-art.mjs\`
 * after changing anything in \`assets/\`. See that script for why these are
 * inlined rather than served out of \`/public\`.
 *
 * Keyed by rider id. A missing id is not a bug — \`riderThumb\` renders the
 * actual rig instead, which is what every custom rider gets.
 */

export const RIDER_ART: Record<string, string> = {
${entries.map(([id, uri]) => `  "${id}":\n    "${uri}",`).join("\n")}
};
`;
  await writeFile(OUT, body);
  console.log(
    `\nwrote ${path.relative(ROOT, OUT)} — ${entries.length} portraits, ` +
      `${(bytes / 1024).toFixed(0)} KB of image`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
