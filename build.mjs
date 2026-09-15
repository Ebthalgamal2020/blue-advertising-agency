// Builds the published page from the readable source.
//
//   index.src.html  - the file to edit: commented CSS and JS
//   index.html      - what GitHub Pages serves: same markup, with the inline
//                     CSS and JS minified and HTML comments dropped
//
// Run after every edit:  npm run build
// Only the insides of <style> and plain <script> blocks are rewritten, by
// esbuild. Markup and whitespace between tags are left exactly as written,
// because inline spacing is part of how the page renders.

import { readFile, writeFile } from 'node:fs/promises';
import { transform } from 'esbuild';

const SRC = new URL('./index.src.html', import.meta.url);
const OUT = new URL('./index.html', import.meta.url);

const src = await readFile(SRC, 'utf8');
const parts = [];
let last = 0;

// <style>...</style> and attribute-less <script>...</script>
const block = /<(style|script)>([\s\S]*?)<\/\1>/g;
for (let m; (m = block.exec(src)); ) {
  parts.push({ html: src.slice(last, m.index) });
  const loader = m[1] === 'style' ? 'css' : 'js';
  const { code } = await transform(m[2], { loader, minify: true, legalComments: 'none' });
  parts.push({ raw: `<${m[1]}>${code.trim()}</${m[1]}>` });
  last = block.lastIndex;
}
parts.push({ html: src.slice(last) });

// HTML comments only outside the blocks above
let out = parts.map(p => p.raw ?? p.html.replace(/<!--[\s\S]*?-->\n?/g, '')).join('');

// Poppins is embedded in the page rather than fetched. Loaded as separate
// files - even preloaded - Chrome paints the hero text in the fallback font,
// swaps to Poppins, and records neither paint as the Largest Contentful
// Paint, so PageSpeed reports LCP (and the whole Performance score) as an
// error. With the four weights already in the page, the first paint of the
// headline is in Poppins and is recorded. Caveat only draws the handwritten
// notes, so it stays a normal file.
const fontDir = new URL('./assets/fonts/', import.meta.url);
for (const weight of [400, 500, 600, 800]) {
  const file = `poppins-${weight}.woff2`;
  const b64 = (await readFile(new URL(file, fontDir))).toString('base64');
  const ref = `url(assets/fonts/${file})`;
  if (!out.includes(ref)) throw new Error(`build: ${ref} not found in the CSS`);
  out = out.replace(ref, `url(data:font/woff2;base64,${b64})`);
  out = out.replace(new RegExp(`<link rel="preload" href="assets/fonts/${file}"[^>]*>\\n?`), '');
}

await writeFile(OUT, out);
console.log(`index.html  ${(src.length / 1024).toFixed(1)} KB -> ${(out.length / 1024).toFixed(1)} KB`);
