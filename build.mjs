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
const out = parts.map(p => p.raw ?? p.html.replace(/<!--[\s\S]*?-->\n?/g, '')).join('');

await writeFile(OUT, out);
console.log(`index.html  ${(src.length / 1024).toFixed(1)} KB -> ${(out.length / 1024).toFixed(1)} KB`);
