/**
 * Inline the title-screen artwork into the game bundle.
 *
 * SHRED has to look identical in three places that don't share an asset
 * pipeline: the site route, a standalone single-file build, and a published
 * artifact whose CSP blocks every external host. Only the first of those can
 * serve a file out of `/public`, so anything the title screen needs has to be
 * *in* the bundle. This turns the source images into data URIs and writes them
 * to `src/game/shred/ui/title-art.ts`.
 *
 * Usage:
 *   node scripts/inline-title-art.mjs
 *
 * Inputs (both optional — a missing one just stays null and the title screen
 * falls back to the typographic lockup it draws itself):
 *   assets/title-logo.png   the SHRED 1999 wordmark
 *   assets/title-bg.(jpg|png|webp)  the scene behind it
 *
 * The logo is keyed: near-white pixels become transparent, because a wordmark
 * exported on a white card would otherwise sit on the mountain in a white box.
 * The key is deliberately conservative — it only removes pixels that are both
 * very bright and very desaturated, so the white *inside* the letterforms
 * survives as long as it has any shading on it at all. If a logo arrives with
 * real transparency it passes through untouched.
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const ASSETS = path.join(ROOT, "assets");
const OUT = path.join(ROOT, "src/game/shred/ui/title-art.ts");

/**
 * Sizes chosen so the artwork stays a sane share of the bundle. The logo goes
 * out as WebP rather than PNG: it is photographic — chrome, spray, a rendered
 * mountain — and PNG is the wrong compressor for that, by about 6×. WebP has
 * carried alpha in every browser that can run WebGL2 for years.
 */
const LOGO_WIDTH = 1280;
const LOGO_QUALITY = 88;
const BG_WIDTH = 1920;
const BG_QUALITY = 80;

async function find(base) {
  if (!existsSync(ASSETS)) return null;
  const files = await readdir(ASSETS);
  const hit = files.find((f) => f.replace(/\.[^.]+$/, "") === base);
  return hit ? path.join(ASSETS, hit) : null;
}

/**
 * Knock a white card out from behind a wordmark.
 *
 * Brightness alone is not enough — the highlights *in* a chrome logo are white
 * too. What separates the card from the artwork is that the card is perfectly
 * flat: maximum brightness and no saturation at all. So the alpha ramps over a
 * narrow band at the very top of that range, which takes the background and
 * leaves the letterforms.
 */
async function keyWhite(buf) {
  const img = sharp(buf).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // If it already has real transparency, leave it alone.
  let transparent = 0;
  for (let i = 3; i < data.length; i += channels) if (data[i] < 250) transparent++;
  if (transparent > width * height * 0.02) return buf;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    // 1 where the pixel is flat white, 0 where it has any colour or shading.
    const flat = Math.max(0, Math.min(1, (min - 232) / 20)) * Math.max(0, 1 - sat * 14);
    data[i + 3] = Math.round(data[i + 3] * (1 - flat));
  }
  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}

async function main() {
  const logoPath = await find("title-logo");
  const bgPath = await find("title-bg");

  let logo = null;
  let logoAspect = 1.5;
  if (logoPath) {
    const keyed = await keyWhite(await readFile(logoPath));
    // Trim whatever transparent margin the export left, so the logo's box is
    // the artwork and centring it actually centres it.
    const out = await sharp(keyed)
      .trim({ threshold: 1 })
      .resize({ width: LOGO_WIDTH, withoutEnlargement: true })
      .webp({ quality: LOGO_QUALITY, alphaQuality: 92, effort: 6 })
      .toBuffer({ resolveWithObject: true });
    logo = `data:image/webp;base64,${out.data.toString("base64")}`;
    logoAspect = out.info.width / out.info.height;
    console.log(
      `logo   ${path.basename(logoPath)} → ${out.info.width}×${out.info.height}, ` +
        `${(out.data.length / 1024).toFixed(0)} KB`,
    );
  } else {
    console.log("logo   (none at assets/title-logo.*)");
  }

  let bg = null;
  if (bgPath) {
    const out = await sharp(await readFile(bgPath))
      .resize({ width: BG_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: BG_QUALITY, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    bg = `data:image/jpeg;base64,${out.data.toString("base64")}`;
    console.log(
      `bg     ${path.basename(bgPath)} → ${out.info.width}×${out.info.height}, ` +
        `${(out.data.length / 1024).toFixed(0)} KB`,
    );
  } else {
    console.log("bg     (none at assets/title-bg.*)");
  }

  const body = `/**
 * Title-screen artwork, inlined as data URIs.
 *
 * GENERATED — do not edit by hand. Run \`node scripts/inline-title-art.mjs\`
 * after changing anything in \`assets/\`. See that script for why this is
 * inlined rather than served: the standalone build and the published artifact
 * have no \`/public\` to fetch from.
 *
 * A null here is not a bug. The title screen falls back to the typographic
 * lockup it draws itself, which is also what the loading screen uses, so that
 * path has to keep working whether or not artwork is supplied.
 */

/** The SHRED 1999 wordmark, keyed and trimmed. */
export const TITLE_LOGO: string | null = ${logo ? `\n  "${logo}"` : "null"};

/** Natural aspect ratio (width / height) of the wordmark. */
export const TITLE_LOGO_ASPECT = ${logoAspect.toFixed(4)};

/** The scene behind it. */
export const TITLE_BG: string | null = ${bg ? `\n  "${bg}"` : "null"};
`;
  await writeFile(OUT, body);
  console.log(`wrote  ${path.relative(ROOT, OUT)} (${(body.length / 1024).toFixed(0)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
