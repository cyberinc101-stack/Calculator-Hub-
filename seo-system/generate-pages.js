// generate-pages.js
// Usage: node generate-pages.js
// Reads data/conversions.json, fills templates/converter.template.html,
// writes one real HTML file per row into output/ (you then move these into calculator-types/)

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'data', 'conversions.json');
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'converter.template.html');
const OUTPUT_DIR = path.join(__dirname, 'output');
const SITE_BASE_URL = 'https://calculator-hub-phi-five.vercel.app'; // no trailing slash

const COMMON_VALUES = [1, 5, 10, 25, 50, 100, 500, 1000];

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

function slugFor(row) {
  return `convert-${row.from}-to-${row.to}`;
}

function buildCommonTableRows(row) {
  return COMMON_VALUES.map(v => {
    const out = (v * row.factor) + row.offset;
    const outFmt = Math.round(out * 10000) / 10000;
    return `        <tr><td>${v} ${row.from}</td><td>${outFmt} ${row.to}</td></tr>`;
  }).join('\n');
}

function buildRelatedLinks(row, allRows) {
  const related = allRows.filter(r => r.category === row.category && slugFor(r) !== slugFor(row));
  if (related.length === 0) return '      <li>No related conversions yet.</li>';
  return related.map(r =>
    `      <li><a href="${slugFor(r)}.html">${r.fromFull} to ${r.toFull}</a></li>`
  ).join('\n');
}

const sitemapEntries = [];
let count = 0;

data.forEach(row => {
  const slug = slugFor(row);
  const title = `${row.fromFull} to ${row.toFull} Converter | Free Online Calculator`;
  const metaDescription = `Convert ${row.fromFull} to ${row.toFull} instantly with our free calculator. Includes a quick-reference table for common ${row.from} to ${row.to} conversions.`;
  const canonical = `${SITE_BASE_URL}/calculator-types/${slug}.html`;
  const h1 = `${row.fromFull} to ${row.toFull} Converter`;

  let page = template
    .replaceAll('{{TITLE}}', title)
    .replaceAll('{{META_DESCRIPTION}}', metaDescription)
    .replaceAll('{{CANONICAL}}', canonical)
    .replaceAll('{{H1}}', h1)
    .replaceAll('{{FROM_FULL}}', row.fromFull)
    .replaceAll('{{TO_FULL}}', row.toFull)
    .replaceAll('{{FROM}}', row.from)
    .replaceAll('{{TO}}', row.to)
    .replaceAll('{{FACTOR}}', row.factor)
    .replaceAll('{{OFFSET}}', row.offset)
    .replaceAll('{{CATEGORY}}', row.category)
    .replaceAll('{{COMMON_TABLE_ROWS}}', buildCommonTableRows(row))
    .replaceAll('{{RELATED_LINKS}}', buildRelatedLinks(row, data));

  fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), page, 'utf8');
  sitemapEntries.push(`  <url><loc>${canonical}</loc><priority>0.7</priority><changefreq>monthly</changefreq></url>`);
  count++;
});

// Write a sitemap snippet to paste into sitemap.xml
fs.writeFileSync(
  path.join(OUTPUT_DIR, '_sitemap-snippet.xml'),
  sitemapEntries.join('\n'),
  'utf8'
);

// Build a simple hub/index page linking to every generated page, grouped by category
const categories = [...new Set(data.map(r => r.category))];
const hubSections = categories.map(cat => {
  const rows = data.filter(r => r.category === cat);
  const links = rows.map(r => `      <li><a href="${slugFor(r)}.html">${r.fromFull} to ${r.toFull}</a></li>`).join('\n');
  return `    <h2>${cat}</h2>\n    <ul>\n${links}\n    </ul>`;
}).join('\n');

const hubPage = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Unit Converters | Calculator Hub</title>
<meta name="description" content="Browse all unit conversion calculators by category.">
<link rel="stylesheet" href="../css/vars.css">
<link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/layout.css">
</head>
<body>
<main>
  <h1>All Unit Converters</h1>
${hubSections}
</main>
</body>
</html>`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'convert-index.html'), hubPage, 'utf8');

console.log(`Generated ${count} pages + 1 hub page + 1 sitemap snippet into ${OUTPUT_DIR}`);
