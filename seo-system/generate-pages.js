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

const CATEGORY_ICONS = {
  Length: '📏',
  Weight: '⚖️',
  Temperature: '🌡️',
  Volume: '🧪',
  Speed: '🚀'
};

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

function slugFor(row) {
  return `convert-${row.from}-to-${row.to}`;
}

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

function buildCommonTableRows(row) {
  return COMMON_VALUES.map(v => {
    const out = round4((v * row.factor) + row.offset);
    return `        <tr><td>${v} ${row.from}</td><td>${out} ${row.to}</td></tr>`;
  }).join('\n');
}

function buildRelatedLinks(row, allRows) {
  const related = allRows.filter(r => r.category === row.category && slugFor(r) !== slugFor(row));
  if (related.length === 0) return '    <li>No related conversions yet.</li>';
  return related.map(r =>
    `    <li><a href="${slugFor(r)}.html">${r.fromFull} to ${r.toFull}</a></li>`
  ).join('\n');
}

function buildFormulaText(row) {
  if (row.offset === 0) {
    return `Multiply the ${row.fromFull.toLowerCase()} value by ${row.factor} to get ${row.toFull.toLowerCase()}.`;
  }
  return `Multiply the ${row.fromFull.toLowerCase()} value by ${row.factor}, then add ${row.offset}, to get ${row.toFull.toLowerCase()}.`;
}

const sitemapEntries = [];
let count = 0;

data.forEach(row => {
  const slug = slugFor(row);
  const icon = CATEGORY_ICONS[row.category] || '🔢';
  const title = `${row.fromFull} to ${row.toFull} Converter | CalcHub`;
  const metaDescription = `Convert ${row.fromFull} to ${row.toFull} instantly with our free calculator. Includes a quick-reference table for common ${row.from} to ${row.to} conversions.`;
  const metaKeywords = `${row.fromFull.toLowerCase()} to ${row.toFull.toLowerCase()} converter,${row.from} to ${row.to},convert ${row.fromFull.toLowerCase()} to ${row.toFull.toLowerCase()},${row.fromFull.toLowerCase()} ${row.toFull.toLowerCase()} calculator`;
  const canonical = `${SITE_BASE_URL}/calculator-types/${slug}.html`;
  const h1 = `${row.fromFull} to ${row.toFull} Converter`;
  const oneUnitResult = round4(row.factor + row.offset);

  let page = template
    .replaceAll('{{TITLE}}', title)
    .replaceAll('{{META_DESCRIPTION}}', metaDescription)
    .replaceAll('{{META_KEYWORDS}}', metaKeywords)
    .replaceAll('{{CANONICAL}}', canonical)
    .replaceAll('{{ICON}}', icon)
    .replaceAll('{{H1}}', h1)
    .replaceAll('{{FROM_FULL}}', row.fromFull)
    .replaceAll('{{TO_FULL}}', row.toFull)
    .replaceAll('{{FROM}}', row.from)
    .replaceAll('{{TO}}', row.to)
    .replaceAll('{{FACTOR}}', row.factor)
    .replaceAll('{{OFFSET}}', row.offset)
    .replaceAll('{{CATEGORY}}', row.category)
    .replaceAll('{{FORMULA_TEXT}}', buildFormulaText(row))
    .replaceAll('{{ONE_UNIT_RESULT}}', oneUnitResult)
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
  const icon = CATEGORY_ICONS[cat] || '🔢';
  const links = rows.map(r => `      <li><a href="${slugFor(r)}.html">${r.fromFull} to ${r.toFull}</a></li>`).join('\n');
  return `    <h2>${icon} ${cat}</h2>\n    <ul>\n${links}\n    </ul>`;
}).join('\n');

const hubPage = `<!DOCTYPE html>
<html lang="en">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-2ZT2CL405H"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-2ZT2CL405H');
</script>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>All Unit Converters | CalcHub</title>
<meta name="description" content="Browse all unit conversion calculators by category: length, weight, temperature, volume, and speed.">
<link rel="canonical" href="${SITE_BASE_URL}/calculator-types/convert-index.html">
<link rel="stylesheet" href="../css/vars.css"><link rel="stylesheet" href="../css/base.css"><link rel="stylesheet" href="../css/layout.css">
</head>
<body>
<div class="wrap">
<div id="site-header"></div>
<div class="hero" style="padding:4px 0 36px">
  <div class="hero-eyebrow">🔄 Unit Converters</div>
  <h1 style="font-size:clamp(1.6rem,4vw,2.4rem)">All Unit Converters</h1>
  <p class="hero-sub">Browse every conversion calculator by category.</p>
</div>
<div class="seo-box">
${hubSections}
</div>
<div id="site-footer"></div>
</div>
<script src="../js/app.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'convert-index.html'), hubPage, 'utf8');

console.log(`Generated ${count} pages + 1 hub page + 1 sitemap snippet into ${OUTPUT_DIR}`);
