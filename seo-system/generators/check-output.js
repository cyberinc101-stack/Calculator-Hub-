#!/usr/bin/env node
// check-output.js
'use strict';
const fs = require('fs');
const path = require('path');

const target = path.resolve(process.argv[2] || path.join(__dirname, '..', 'output'));
const SKIP = new Set(['node_modules', '.git', '.vercel', 'seo-system', '_archive', 'core']);

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) walk(p, out);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

const problems = {
  'bad meta tag': [],
  'invalid JSON-LD': [],
  'unfilled placeholder': [],
  'broken character': []
};

const files = walk(target, []);
for (const file of files) {
  const rel = path.relative(target, file).split(path.sep).join('/');
  const html = fs.readFileSync(file, 'utf8');

  for (const m of html.matchAll(/<meta\s+name="(?:description|keywords)"[^>]*>/g)) {
    if (!/^<meta\s+name="(?:description|keywords)"\s+content="[^"]*"\s*\/?>$/.test(m[0])) {
      problems['bad meta tag'].push(rel);
      break;
    }
  }

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      problems['invalid JSON-LD'].push(rel);
      break;
    }
  }

  if (/\{\{[A-Z0-9_]+\}\}/.test(html)) problems['unfilled placeholder'].push(rel);
  if (html.includes('\uFFFD')) problems['broken character'].push(rel);
}

let total = 0;
console.log('Checked ' + files.length + ' html files in ' + target);
Object.keys(problems).forEach(name => {
  console.log(name + ': ' + problems[name].length);
  problems[name].slice(0, 8).forEach(f => console.log('   ' + f));
  total += problems[name].length;
});
process.exitCode = total ? 1 : 0;
