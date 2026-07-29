/**
 * Build SHRED as a single self-contained HTML file.
 *
 * Two outputs from one shell, because the two targets disagree about who owns
 * the document:
 *
 *   dist/shred-1999.html   a complete document — drop it on any host, or zip it
 *                          as index.html and drag it into Netlify.
 *   dist/artifact.html     the same page as a fragment, for a host that supplies
 *                          its own <!doctype>/<head>/<body> wrapper.
 *
 * Both carry the viewport tag and the script that re-asserts it; see shell.html
 * for why that is not optional.
 *
 * Usage: node tools/standalone/build.mjs
 */

import * as esbuild from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const HERE = import.meta.dirname;
const DIST = path.join(HERE, "dist");

const result = await esbuild.build({
  entryPoints: [path.join(HERE, "entry.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".css": "css" },
  write: false,
  // A CSS import needs somewhere nominal to go even when nothing is written.
  outdir: DIST,
  absWorkingDir: ROOT,
  alias: { "@": path.join(ROOT, "src") },
  logLevel: "warning",
});

const out = Object.fromEntries(
  result.outputFiles.map((f) => [path.extname(f.path), f.text]),
);
const js = out[".js"] ?? "";
const css = out[".css"] ?? "";
if (!js) throw new Error("bundle produced no JavaScript");

const shell = await readFile(path.join(HERE, "shell.html"), "utf8");
// Split on the placeholders rather than String.replace: a `$&` or `$1` in the
// minified bundle would otherwise be interpreted as a replacement pattern.
const fragment = shell.split("/*__CSS__*/").join(css).split("/*__JS__*/").join(js);

const document = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
${fragment.trimStart()}
</body>
</html>
`.replace("<div id=\"shred-root\">", "</head>\n<body>\n<div id=\"shred-root\">");

await mkdir(DIST, { recursive: true });
await writeFile(path.join(DIST, "shred-1999.html"), document);
await writeFile(path.join(DIST, "artifact.html"), fragment);

const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(0)} KB`;
console.log(`js ${kb(js)}  css ${kb(css)}`);
console.log(`dist/shred-1999.html  ${kb(document)}`);
console.log(`dist/artifact.html    ${kb(fragment)}`);
