// generate-longtail.js
// Usage: node generate-longtail.js
//
// Reads data/longtail.json, fills templates/longtail.template.html,
// writes one real HTML file per curated value into output-longtail/.
//
// IMPORTANT: unlike generate-pages.js, several long-tail groups are NOT a
// simple (value * factor) + offset relationship in the live mini-calculator:
//   - height_cm_to_ftin: cm -> a feet+inches PAIR, not a single number
//   - height_ftin_to_cm: input is already a fixed ft/in pair, no useful
//     "type a different value" calculator applies the same way
// These groups get a different small inline script instead of the generic
// linear formula, so the live calculator never silently shows a wrong answer.

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'data', 'longtail.json');
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'longtail.template.html');
const OUTPUT_DIR = path.join(__dirname, 'output-longtail');
const SITE_BASE_URL = 'https://calculator-hub-phi-five.vercel.app';

// Maps a long-tail group to the generic converter page it should link back to
// for "need a different value" — must match slugs produced by generate-pages.js
const GENERIC_CONVERTER_LINKS = {
  height_cm_to_ftin: '../calculator-types/convert-cm-to-inches.html',
  height_ftin_to_cm: '../calculator-types/convert-inches-to-cm.html',
  weight_kg_to_lbs: '../calculator-types/convert-kg-to-lbs.html',
  weight_lbs_to_kg: '../calculator-types/convert-lbs-to-kg.html',
  oven_f_to_c: '../calculator-types/convert-fahrenheit-to-celsius.html',
  oven_c_to_f: '../calculator-types/convert-celsius-to-fahrenheit.html',
  temp_c_to_f: '../calculator-types/convert-celsius-to-fahrenheit.html',
  temp_f_to_c: '../calculator-types/convert-fahrenheit-to-celsius.html',
  distance_km_to_miles: '../calculator-types/convert-km-to-miles.html',
  distance_miles_to_km: '../calculator-types/convert-miles-to-km.html',
  screen_in_to_cm: '../calculator-types/convert-inches-to-cm.html'
};

// Simple linear (factor/offset) groups - safe to drive the generic JS formula
const LINEAR_GROUP_CONFIG = {
  weight_kg_to_lbs:    { factor: 2.20462,  offset: 0 },
  weight_lbs_to_kg:    { factor: 0.453592, offset: 0 },
  oven_f_to_c:         { factor: 0.555556, offset: -17.7778 },
  oven_c_to_f:         { factor: 1.8,      offset: 32 },
  temp_c_to_f:         { factor: 1.8,      offset: 32 },
  temp_f_to_c:         { factor: 0.555556, offset: -17.7778 },
  distance_km_to_miles:{ factor: 0.621371, offset: 0 },
  distance_miles_to_km:{ factor: 1.60934,  offset: 0 },
  screen_in_to_cm:     { factor: 2.54,     offset: 0 }
};

// Non-linear groups (height ft/in) get a custom inline script instead
const NONLINEAR_GROUPS = new Set(['height_cm_to_ftin', 'height_ftin_to_cm']);

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

function buildFaq(entry) {
  const primaryUnitSuffix = entry.primaryUnit === 'ft/in' ? '' : ` ${entry.primaryUnit}`;
  const resultUnitSuffix = entry.resultUnit === 'ft/in' ? '' : ` ${entry.resultUnit}`;
  const resultUnitLabel = entry.resultUnit === 'ft/in' ? 'feet and inches' : entry.resultUnit;
  const q1 = `What is ${entry.primaryValue}${primaryUnitSuffix} in ${resultUnitLabel}?`;
  const a1 = `${entry.primaryValue}${primaryUnitSuffix} equals ${entry.resultValue}${resultUnitSuffix}.`;
  const q2 = `Is ${entry.primaryValue}${primaryUnitSuffix} a common conversion to look up?`;
  const a2 = entry.contextNote;
  return { q1, a1, q2, a2 };
}

function buildRelatedTableRows(entry, allEntries) {
  const sameGroup = allEntries.filter(e => e.group === entry.group);
  // Show up to 8 sibling rows from the same group as quick reference
  const sample = sameGroup.slice(0, 8);
  return sample.map(e => {
    const unitSuffix = e.resultUnit === 'ft/in' ? '' : ` ${e.resultUnit}`;
    return `        <tr><td>${e.primaryValue} ${e.primaryUnit}</td><td>${e.resultValue}${unitSuffix}</td></tr>`;
  }).join('\n');
}

function buildInlineScript(entry) {
  if (NONLINEAR_GROUPS.has(entry.group)) {
    if (entry.group === 'height_cm_to_ftin') {
      // Live calculator: typed cm -> feet/inches pair
      return `
  const input = document.getElementById('inputValue');
  const resultEl = document.getElementById('liveResultValue');
  function convert() {
    const cm = parseFloat(input.value) || 0;
    let totalInches = cm / 2.54;
    let feet = Math.floor(totalInches / 12);
    let inches = Math.round((totalInches - feet * 12) * 10) / 10;
    if (inches >= 12) { feet += 1; inches -= 12; }
    resultEl.textContent = feet + "'" + inches + '"';
  }
  input.addEventListener('input', convert);
  convert();`;
    }
    if (entry.group === 'height_ftin_to_cm') {
      // Live calculator: typed total inches -> cm (simplest safe reinterpretation)
      return `
  const input = document.getElementById('inputValue');
  const resultEl = document.getElementById('liveResultValue');
  function convert() {
    const totalInches = parseFloat(input.value) || 0;
    const cm = Math.round(totalInches * 2.54 * 10) / 10;
    resultEl.textContent = cm + ' cm';
  }
  input.addEventListener('input', convert);
  convert();`;
    }
  }
  // Linear groups use the standard factor/offset formula
  const cfg = LINEAR_GROUP_CONFIG[entry.group] || { factor: 1, offset: 0 };
  return `
  const factor = ${cfg.factor};
  const offset = ${cfg.offset};
  const input = document.getElementById('inputValue');
  const resultEl = document.getElementById('liveResultValue');
  function convert() {
    const val = parseFloat(input.value) || 0;
    const out = (val * factor) + offset;
    resultEl.textContent = out.toLocaleString(undefined, { maximumFractionDigits: 4 }) + ' ${entry.resultUnit}';
  }
  input.addEventListener('input', convert);
  convert();`;
}

const sitemapEntries = [];
const seenSlugs = new Set();
let count = 0;

data.forEach(entry => {
  if (seenSlugs.has(entry.slug)) {
    console.warn(`Skipping duplicate longtail slug: ${entry.slug}`);
    return;
  }
  seenSlugs.add(entry.slug);

  const { q1, a1, q2, a2 } = buildFaq(entry);
  const title = `${entry.h1} | CalcHub`;
  const metaDescription = `${entry.primaryValue} ${entry.primaryUnit} = ${entry.resultValue} ${entry.resultUnit}. ${entry.contextNote}`;
  const metaKeywords = `${entry.h1.toLowerCase()},${entry.primaryValue} ${entry.primaryUnit} to ${entry.resultUnit},${entry.primaryUnit} to ${entry.resultUnit} converter`;
  const canonical = `${SITE_BASE_URL}/calculator-types/longtail/${entry.slug}.html`;
  const genericLink = GENERIC_CONVERTER_LINKS[entry.group] || '../calculator-types/convert-index.html';

  // For the "type a different value" input default, use a sensible raw number
  // (for ft/in groups this is total inches; for others it's primaryValue itself)
  let primaryValueRaw = entry.primaryValue;
  if (entry.group === 'height_ftin_to_cm') {
    // primaryValue is like "5'9\"" - convert to total inches for the input default
    const match = String(entry.primaryValue).match(/(\d+)'(\d+(?:\.\d+)?)"/);
    primaryValueRaw = match ? (parseInt(match[1]) * 12 + parseFloat(match[2])) : 69;
  }

  // For ft/in pair values (e.g. 5'8.9" or 5'9"), the value already contains
  // feet/inch marks, so repeating "ft/in" right next to it in headline/FAQ
  // prose reads as a bug. Structural UI labels (input hints, table headers,
  // live-calculator result label) should still show the real unit name, so
  // we use a SEPARATE placeholder for the headline/FAQ-safe version rather
  // than suppressing PRIMARY_UNIT/RESULT_UNIT everywhere.
  const headlineResultUnit = entry.resultUnit === 'ft/in' ? '' : ` ${entry.resultUnit}`;
  const headlinePrimaryUnit = entry.primaryUnit === 'ft/in' ? '' : ` ${entry.primaryUnit}`;

  let page = template
    .replaceAll('{{TITLE}}', title)
    .replaceAll('{{META_DESCRIPTION}}', metaDescription)
    .replaceAll('{{META_KEYWORDS}}', metaKeywords)
    .replaceAll('{{CANONICAL}}', canonical)
    .replaceAll('{{ICON}}', entry.icon)
    .replaceAll('{{CATEGORY}}', entry.category)
    .replaceAll('{{H1}}', entry.h1)
    .replaceAll('{{CONTEXT_NOTE}}', entry.contextNote)
    .replaceAll('{{PRIMARY_VALUE}} {{PRIMARY_UNIT}} equals', `${entry.primaryValue}${headlinePrimaryUnit} equals`)
    .replaceAll('{{PRIMARY_VALUE}} {{PRIMARY_UNIT}} is equal to <strong>{{RESULT_VALUE}} {{RESULT_UNIT}}</strong>', `${entry.primaryValue}${headlinePrimaryUnit} is equal to <strong>${entry.resultValue}${headlineResultUnit}</strong>`)
    .replaceAll('{{RESULT_VALUE}} {{RESULT_UNIT}}</div>', `${entry.resultValue}${headlineResultUnit}</div>`)
    .replaceAll('{{PRIMARY_VALUE}}', entry.primaryValue)
    .replaceAll('{{PRIMARY_VALUE_RAW}}', primaryValueRaw)
    .replaceAll('{{PRIMARY_UNIT}}', entry.primaryUnit)
    .replaceAll('{{RESULT_VALUE}}', entry.resultValue)
    .replaceAll('{{RESULT_UNIT}}', entry.resultUnit)
    .replaceAll('{{RELATED_GROUP_LABEL}}', entry.relatedGroupLabel)
    .replaceAll('{{RELATED_TABLE_ROWS}}', buildRelatedTableRows(entry, data))
    .replaceAll('{{GENERIC_CONVERTER_LINK}}', genericLink)
    .replaceAll('{{FAQ_Q1}}', q1)
    .replaceAll('{{FAQ_A1}}', a1)
    .replaceAll('{{FAQ_Q2}}', q2)
    .replaceAll('{{FAQ_A2}}', a2)
    .replace(
      /const factor = \{\{FACTOR\}\};[\s\S]*?convert\(\);/,
      buildInlineScript(entry).trim()
    );

  fs.writeFileSync(path.join(OUTPUT_DIR, `${entry.slug}.html`), page, 'utf8');
  sitemapEntries.push(`  <url><loc>${canonical}</loc><priority>0.6</priority><changefreq>yearly</changefreq></url>`);
  count++;
});

fs.writeFileSync(
  path.join(OUTPUT_DIR, '_sitemap-snippet-longtail.xml'),
  sitemapEntries.join('\n'),
  'utf8'
);

console.log(`Generated ${count} long-tail pages into ${OUTPUT_DIR}`);
