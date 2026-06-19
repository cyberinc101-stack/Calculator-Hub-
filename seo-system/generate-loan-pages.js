// generate-loan-pages.js
// Usage: node generate-loan-pages.js
//
// Reads data/loan-calculators-vehicle-property.json and
// data/loan-calculators-personal-business.json, fills
// templates/loan.template.html, writes one real HTML file per entry into
// output-loans/ (move these into calculator-types/ alongside your existing
// loan.html, auto-loan-calculator.html, and mortgage.html).
//
// These are NOT unit conversions, so they don't fit generate-pages.js's
// linear factor/offset model. Each page instead ships a live amortization
// calculator (standard PMT formula) seeded with realistic example values
// per loan type, plus keyword-researched title/meta and FAQ content with
// FAQPage schema for rich snippets.
//
// Keyword research source: 500-keyword finance/loan CSV (search volume +
// top-of-page bid data). Brand-specific terms (bank names, dealer brands,
// comparison sites) were deliberately excluded from this data set — see
// data/existing-page-keyword-updates.js for why.

const fs = require('fs');
const path = require('path');

const DATA_FILES = [
  path.join(__dirname, 'data', 'loan-calculators-vehicle-property.json'),
  path.join(__dirname, 'data', 'loan-calculators-personal-business.json')
];
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'loan.template.html');
const OUTPUT_DIR = path.join(__dirname, 'output-loans');
const SITE_BASE_URL = 'https://calculator-hub-phi-five.vercel.app';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const data = DATA_FILES.flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8')));
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// Standard loan amortization payment formula
function monthlyPayment(principal, aprPercent, termMonths) {
  const r = (aprPercent / 100) / 12;
  if (r === 0) return principal / termMonths;
  const pow = Math.pow(1 + r, termMonths);
  return principal * (r * pow) / (pow - 1);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function buildFaqHtml(faq) {
  return faq.map(item =>
    `      <div class="faq-item">\n        <h3>${item.q}</h3>\n        <p>${item.a}</p>\n      </div>`
  ).join('\n');
}

function buildFaqSchema(faq) {
  const mainEntity = faq.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a }
  }));
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity
  });
}

function buildRelatedLinks(entry, allEntries) {
  const bySlug = Object.fromEntries(allEntries.map(e => [e.slug, e]));
  return entry.relatedSlugs
    .map(slug => bySlug[slug] ? `    <li><a href="${slug}.html">${bySlug[slug].h1}</a></li>` : null)
    .filter(Boolean)
    .join('\n') || '    <li>No related calculators yet.</li>';
}

const sitemapEntries = [];
const seenSlugs = new Set();
let count = 0;

data.forEach(entry => {
  if (seenSlugs.has(entry.slug)) {
    console.warn(`Skipping duplicate loan-page slug: ${entry.slug}`);
    return;
  }
  seenSlugs.add(entry.slug);

  const { principal, aprPercent, termMonths } = entry.defaultExample;
  const examplePayment = round2(monthlyPayment(principal, aprPercent, termMonths));
  const totalPaid = round2(examplePayment * termMonths);
  const totalInterest = round2(totalPaid - principal);
  const canonical = `${SITE_BASE_URL}/calculator-types/${entry.slug}.html`;

  let page = template
    .replaceAll('{{TITLE}}', entry.title)
    .replaceAll('{{META_DESCRIPTION}}', entry.metaDescription)
    .replaceAll('{{META_KEYWORDS}}', entry.metaKeywords)
    .replaceAll('{{CANONICAL}}', canonical)
    .replaceAll('{{ICON}}', entry.icon)
    .replaceAll('{{CATEGORY}}', entry.category)
    .replaceAll('{{H1}}', entry.h1)
    .replaceAll('{{INTRO}}', entry.intro)
    .replaceAll('{{DEFAULT_PRINCIPAL}}', principal)
    .replaceAll('{{DEFAULT_APR}}', aprPercent)
    .replaceAll('{{DEFAULT_TERM_MONTHS}}', termMonths)
    .replaceAll('{{EXAMPLE_PAYMENT}}', examplePayment.toLocaleString(undefined, { minimumFractionDigits: 2 }))
    .replaceAll('{{EXAMPLE_TOTAL_INTEREST}}', totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 }))
    .replaceAll('{{EXAMPLE_TOTAL_PAID}}', totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 }))
    .replaceAll('{{FAQ_HTML}}', buildFaqHtml(entry.faq))
    .replaceAll('{{FAQ_SCHEMA_JSON}}', buildFaqSchema(entry.faq))
    .replaceAll('{{RELATED_LINKS}}', buildRelatedLinks(entry, data))
    .replaceAll('{{PRIMARY_KEYWORD}}', entry.primaryKeyword);

  fs.writeFileSync(path.join(OUTPUT_DIR, `${entry.slug}.html`), page, 'utf8');
  sitemapEntries.push(`  <url><loc>${canonical}</loc><priority>0.8</priority><changefreq>monthly</changefreq></url>`);
  count++;
});

fs.writeFileSync(
  path.join(OUTPUT_DIR, '_sitemap-snippet-loans.xml'),
  sitemapEntries.join('\n'),
  'utf8'
);

const totalVolume = data.reduce((sum, e) => sum + e.searchVolume, 0);
console.log(`Generated ${count} loan calculator pages into ${OUTPUT_DIR}`);
console.log(`Combined target search volume across primary keywords: ~${totalVolume.toLocaleString()}/mo`);
console.log(`Sitemap snippet written to _sitemap-snippet-loans.xml — append to sitemap.xml`);
