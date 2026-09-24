#!/usr/bin/env node
/*
 * core/inject-ads.js
 * Adds (or removes) the snippet in core/partials/ads.html on every public page.
 *
 *   node core/inject-ads.js                    dry run: report what would change
 *   node core/inject-ads.js --apply            write the snippet into every page
 *   node core/inject-ads.js --remove           dry run of removal
 *   node core/inject-ads.js --remove --apply   strip the snippet from every page
 *
 * Safe by design: UTF-8 only, refuses files with invalid bytes or a U+FFFD
 * broken character (lists them instead), keeps each file's line endings,
 * and is idempotent thanks to marker comments.
 * The pages/ folder (about, contact, privacy, terms) is left out on purpose.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PARTIAL = path.join(__dirname, 'partials', 'ads.html');
const SKIP_DIRS = new Set(['seo-system', '_archive', 'core', 'pages', 'node_modules', '.vercel', '.git']);
const START = '<!-- ads:start -->';
const END = '<!-- ads:end -->';
const BLOCK_RE = /[ \t]*<!-- ads:start -->[\s\S]*?<!-- ads:end -->[ \t]*(\r?\n)?/;

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const REMOVE = args.includes('--remove');

let snippet = '';
if (!REMOVE) {
  snippet = fs.readFileSync(PARTIAL, 'utf8').trim();
  if (!snippet) { console.error('core/partials/ads.html is empty'); process.exit(1); }
}

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), out);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
let changed = 0;
let same = 0;
const skipped = [];

for (const file of walk(ROOT, [])) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  let text;
  try {
    text = decoder.decode(fs.readFileSync(file));
  } catch (e) {
    skipped.push([rel, 'not valid UTF-8']);
    continue;
  }
  if (text.includes('\uFFFD')) {
    skipped.push([rel, 'contains a broken (U+FFFD) character']);
    continue;
  }

  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const managed = BLOCK_RE.test(text);
  let next = text;

  if (REMOVE) {
    if (managed) next = text.replace(BLOCK_RE, '');
  } else {
    if (!managed && /adsbygoogle/i.test(text)) {
      skipped.push([rel, 'has AdSense code outside the managed block']);
      continue;
    }
    if (!/<\/head>/i.test(text)) {
      skipped.push([rel, 'no </head> found']);
      continue;
    }
    const block = START + eol + snippet + eol + END;
    if (managed) next = text.replace(BLOCK_RE, () => block + eol);
    else next = text.replace(/<\/head>/i, () => block + eol + '</head>');
  }

  if (next === text) { same++; continue; }
  changed++;
  if (APPLY) fs.writeFileSync(file, next, 'utf8');
}

const verb = APPLY
  ? (REMOVE ? 'removed from' : 'added to')
  : (REMOVE ? 'would be removed from' : 'would be added to');
console.log('Ads block ' + verb + ': ' + changed + ' files | already correct: ' + same + ' | skipped: ' + skipped.length);
skipped.forEach(function (s) { console.log('  SKIPPED ' + s[0] + ' - ' + s[1]); });
if (!APPLY) console.log('Dry run only. Nothing was written. Add --apply to write changes.');