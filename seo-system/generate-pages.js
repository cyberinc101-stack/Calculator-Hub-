// generate-pages.js
// Usage: node generate-pages.js                 -> generates core + standard tier pages (recommended default)
//        node generate-pages.js --tiers=all      -> generates every tier including niche
//        node generate-pages.js --tiers=core      -> generates only the highest-confidence/highest-traffic pairs
//
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
  Speed: '🚀',
  Area: '📐',
  Time: '⏱️',
  'Data Storage': '💾',
  Energy: '⚡',
  Pressure: '🌬️',
  Power: '🔌',
  Angle: '📐',
  Frequency: '📶',
  Force: '💪',
  Cooking: '🍳',
  Pace: '🏃',
  Torque: '🔧'
};

// --- Unit definitions --------------------------------------------------
// Short, factual one-to-two sentence explanations of each unit, keyed by
// the short code used in conversions.json. Used to add genuine educational
// content per page (varies by unit, not by pair) without per-pair authorship.
const UNIT_DEFINITIONS = {
  km: "The kilometer is the standard metric unit for measuring medium to long distances, equal to 1,000 meters. It's the primary distance unit used on road signs and for trip distances across most of the world.",
  miles: "The mile is an imperial unit of distance equal to 5,280 feet, used primarily in the United States and the United Kingdom for road distances and speed limits.",
  meters: "The meter is the base unit of length in the metric system, used worldwide for everyday length measurements from room sizes to running distances.",
  feet: "The foot is an imperial unit of length equal to 12 inches, commonly used in the US and UK for height, room dimensions, and construction.",
  inches: "The inch is a small imperial unit of length equal to 1/12 of a foot, widely used for screen sizes, paper dimensions, and small objects.",
  cm: "The centimeter is a metric unit of length equal to one-hundredth of a meter, commonly used for height, fabric, and everyday object measurements.",
  yards: "The yard is an imperial unit of length equal to 3 feet, traditionally used in sports fields and fabric measurements.",
  mm: "The millimeter is a small metric unit of length equal to one-thousandth of a meter, used for precise measurements like screen thickness or engineering tolerances.",
  nauticalmiles: "The nautical mile is a unit of distance used in air and sea navigation, equal to 1,852 meters and based on one minute of latitude.",
  micrometers: "The micrometer (micron) is a unit of length equal to one-millionth of a meter, used to measure tiny distances like microchip features.",
  lightyears: "A light-year is the distance light travels in one year, used in astronomy to measure vast distances between stars and galaxies.",
  fathoms: "The fathom is a unit of length traditionally used to measure water depth, equal to 6 feet.",
  furlongs: "The furlong is a unit of distance equal to 1/8 of a mile, still commonly used to measure distances in horse racing.",
  kg: "The kilogram is the base metric unit of mass, equal to 1,000 grams, used worldwide for body weight, food, and general mass.",
  lbs: "The pound is an imperial unit of mass commonly used in the US for body weight, food packaging, and shipping.",
  stone: "The stone is a traditional British unit of mass equal to 14 pounds, still widely used in the UK and Ireland to describe body weight.",
  oz: "The ounce is a small imperial unit of mass equal to 1/16 of a pound, often used for food portions and small package weights.",
  grams: "The gram is a small metric unit of mass equal to one-thousandth of a kilogram, commonly used for cooking, jewelry, and precise measurements.",
  tonnes: "The metric tonne is a unit of mass equal to 1,000 kilograms, used for measuring large quantities like vehicles and cargo.",
  tons: "The US ton (short ton) is a unit of mass equal to 2,000 pounds, used in the US for vehicle weight, shipping, and bulk materials.",
  carats: "The carat is a unit of mass used to weigh gemstones and pearls, equal to 200 milligrams.",
  milligrams: "The milligram is a tiny metric unit of mass equal to one-thousandth of a gram, commonly used in medicine dosages and chemistry.",
  celsius: "Celsius is the metric temperature scale where water freezes at 0° and boils at 100°, used by most of the world for weather and everyday temperatures.",
  fahrenheit: "Fahrenheit is the temperature scale used primarily in the United States, where water freezes at 32° and boils at 212°.",
  kelvin: "Kelvin is the scientific base unit of temperature, starting at absolute zero, used in physics, chemistry, and engineering.",
  liters: "The liter is the standard metric unit of volume, commonly used for liquids like beverages, fuel, and cooking ingredients.",
  gallons: "The US gallon is a unit of volume used primarily in the United States for fuel, milk, and other liquids.",
  cups: "The cup is a common cooking measurement for volume, especially in US recipes, equal to about 236.6 milliliters.",
  ml: "The milliliter is a small metric unit of volume equal to one-thousandth of a liter, commonly used for medicine doses and small liquid measurements.",
  tsp: "The teaspoon is a small cooking measurement of volume, commonly used for spices, baking powder, and small ingredient quantities.",
  tbsp: "The tablespoon is a cooking measurement of volume equal to 3 teaspoons, used for liquids and ingredients in recipes.",
  floz: "The fluid ounce is a US unit of volume used for beverages and liquid ingredients.",
  pint: "The US pint is a unit of volume equal to 16 fluid ounces, commonly used for beer, milk, and ice cream servings.",
  quart: "The US quart is a unit of volume equal to 2 pints, often used for milk and other liquid containers.",
  imperialgallons: "The imperial gallon is a unit of volume used in the UK and historically the British Commonwealth, larger than the US gallon.",
  cubicmeters: "The cubic meter is the metric unit of volume for large quantities, used to measure water usage, shipping containers, and construction materials.",
  barrels: "The oil barrel is a standard unit of volume used in the petroleum industry, equal to 42 US gallons.",
  mph: "Miles per hour is the standard speed unit used in the US and UK for vehicle speed limits and travel speed.",
  kmh: "Kilometers per hour is the standard metric speed unit used by most of the world for vehicle speed and travel.",
  ms: "Meters per second is the scientific unit of speed, commonly used in physics and engineering calculations.",
  knots: "The knot is a unit of speed used in maritime and aviation contexts, equal to one nautical mile per hour.",
  sqft: "The square foot is an imperial unit of area commonly used in the US for real estate, room sizes, and construction.",
  sqm: "The square meter is the metric unit of area used worldwide for measuring rooms, land, and building space.",
  acres: "The acre is a unit of land area traditionally used for farms and real estate, equal to 43,560 square feet.",
  hectares: "The hectare is a metric unit of land area equal to 10,000 square meters, commonly used internationally for farmland.",
  sqmi: "The square mile is a large imperial unit of area used to describe the size of cities, counties, and regions.",
  sqkm: "The square kilometer is a metric unit of area used to describe the size of cities, countries, and large regions.",
  sqyd: "The square yard is an imperial unit of area sometimes used for flooring, carpeting, and landscaping.",
  sqin: "The square inch is a small imperial unit of area used for measuring small surfaces like screens or materials.",
  sqcm: "The square centimeter is a small metric unit of area used for measuring small surfaces in science and engineering.",
  hours: "The hour is a standard unit of time equal to 60 minutes, used universally for scheduling and measuring duration.",
  minutes: "The minute is a unit of time equal to 60 seconds, commonly used for everyday timekeeping.",
  days: "The day is a unit of time based on one full rotation of the Earth, equal to 24 hours.",
  weeks: "The week is a unit of time equal to 7 days, used worldwide for scheduling and calendars.",
  years: "The year is a unit of time based on one orbit of the Earth around the sun, equal to about 365.25 days.",
  months: "The month is a calendar unit of time, averaging about 30.4 days, used for billing cycles, age, and scheduling.",
  seconds: "The second is the base scientific unit of time, used for precise timing in everyday life and science.",
  decades: "The decade is a unit of time equal to 10 years, often used to describe historical periods or long-term trends.",
  kb: "The kilobyte is a unit of digital storage, traditionally equal to 1,024 bytes, used for small files like text documents.",
  mb: "The megabyte is a unit of digital storage equal to 1,024 kilobytes, commonly used to describe photo and document file sizes.",
  gb: "The gigabyte is a unit of digital storage equal to 1,024 megabytes, commonly used to describe phone storage, RAM, and video file sizes.",
  tb: "The terabyte is a unit of digital storage equal to 1,024 gigabytes, commonly used for hard drives and large data storage.",
  bytes: "The byte is the basic unit of digital information, made up of 8 bits, used to measure file and data sizes.",
  pb: "The petabyte is a massive unit of digital storage equal to 1,024 terabytes, used to describe data center and cloud storage capacity.",
  bits: "The bit is the smallest unit of digital information, representing a single 0 or 1, commonly used to describe connection speeds.",
  mbps: "Megabits per second is a unit used to measure internet and network connection speed.",
  mbs: "Megabytes per second is a unit used to measure data transfer speed, such as file download or upload rates.",
  joules: "The joule is the standard scientific unit of energy, used in physics to measure work, heat, and electrical energy.",
  calories: "The calorie is a unit of energy commonly used to describe the energy content of food and physical activity.",
  kwh: "The kilowatt-hour is a unit of energy used to measure electricity consumption, commonly seen on home power bills.",
  btu: "The British Thermal Unit (BTU) is a unit of energy used to describe heating and cooling capacity, such as for air conditioners and furnaces.",
  kcal: "The kilocalorie (often just called 'calorie' on food labels) is a unit of energy equal to 1,000 calories.",
  psi: "Pounds per square inch (PSI) is a unit of pressure commonly used in the US for tire pressure, water pressure, and mechanical systems.",
  bar: "The bar is a metric unit of pressure roughly equal to atmospheric pressure at sea level, commonly used in weather forecasting and engineering.",
  pascal: "The pascal is the SI unit of pressure, used in scientific and engineering contexts to measure force per unit area.",
  atm: "The atmosphere (atm) is a unit of pressure based on average air pressure at sea level, commonly used in chemistry and meteorology.",
  mmhg: "Millimeters of mercury (mmHg) is a unit of pressure traditionally used to measure blood pressure and atmospheric pressure.",
  watts: "The watt is the standard unit of power, measuring the rate of energy use, commonly seen on appliance and light bulb labels.",
  hp: "Horsepower is a traditional unit of power used to describe the output of engines and motors, especially in vehicles.",
  kw: "The kilowatt is a unit of power equal to 1,000 watts, commonly used to describe appliance power and electric vehicle motor output.",
  mw: "The megawatt is a unit of power equal to 1,000 kilowatts, used to describe large-scale power generation such as power plants.",
  degrees: "The degree is the common unit for measuring angles, with a full circle equal to 360 degrees.",
  radians: "The radian is the standard scientific unit for measuring angles, based on the radius of a circle, commonly used in mathematics and physics.",
  gradians: "The gradian (or gon) is a unit of angle measurement where a full circle equals 400 gradians, occasionally used in surveying.",
  hz: "The hertz is the unit of frequency, measuring how many times an event repeats per second, used for sound, electrical signals, and processor speeds.",
  khz: "The kilohertz is a unit of frequency equal to 1,000 hertz, often used for radio frequencies and audio sample rates.",
  mhz: "The megahertz is a unit of frequency equal to 1,000 kilohertz, commonly used for radio frequencies and older processor speeds.",
  ghz: "The gigahertz is a unit of frequency equal to 1,000 megahertz, commonly used to describe modern computer processor speeds.",
  newtons: "The newton is the SI unit of force, defined as the force needed to accelerate one kilogram at one meter per second squared.",
  lbf: "Pound-force is an imperial unit of force, commonly used in engineering and physics in the US.",
  kgf: "Kilogram-force is a unit of force based on the weight of one kilogram under standard gravity, sometimes used in older engineering contexts.",
  grams_flour: "This conversion uses the typical weight of all-purpose flour, where one cup weighs approximately 125 grams, useful for baking recipes.",
  grams_sugar: "This conversion uses the typical weight of granulated sugar, where one cup weighs approximately 200 grams, useful for baking recipes.",
  grams_butter: "This conversion uses the typical weight of butter, where one cup weighs approximately 227 grams, useful for baking recipes.",
  sticks_butter: "In US recipes, a 'stick' of butter is a standard package size equal to half a cup, about 113 grams.",
  cups_water: "This conversion uses the density of water, where one cup of water weighs approximately 8 fluid ounces, useful for kitchen measurements.",
  minperkm: "Minutes per kilometer is a pace measurement commonly used by runners and cyclists training in metric-based countries.",
  minpermile: "Minutes per mile is a pace measurement commonly used by runners and cyclists in the US and UK.",
  nm: "The newton-meter is the SI unit of torque, used to measure rotational force in engineering and mechanics.",
  lbft: "Pound-feet is an imperial unit of torque, commonly used to describe engine torque output in vehicles.",
  lbin: "Pound-inches is a smaller imperial unit of torque, used for precise torque specifications like bolt tightening."
};

function definitionFor(code, fullName) {
  return UNIT_DEFINITIONS[code] || `${fullName} is one of the units supported by this converter.`;
}

// --- Keyword-research overrides --------------------------------------------
// Formulaic title/meta generation leaves real keyword research on the table
// for our highest-traffic pairs. This map swaps in the researched phrase
// (title, meta description, meta keywords) and bumps sitemap priority for
// specific slugs only. Every other row keeps the formulaic generation
// exactly as before. searchVolume is just a comment/reference, not used
// in output.
const KEYWORD_OVERRIDES = {
  'convert-kg-to-lbs': {
    title: 'Kg to Pounds Converter | Kilograms to Pounds | CalcHub',
    metaDescription: 'Use our free kg to pounds converter to convert kilograms to pounds instantly. Includes a quick-reference table for common kg to lbs conversions.',
    metaKeywords: 'kg to pounds converter,kilograms to pounds converter,kg to lbs,convert kilograms to pounds',
    sitemapPriority: 0.9,
    searchVolume: '110K/mo'
  },
  'convert-lbs-to-kg': {
    title: 'Pound to Kg Converter | Pounds to Kilograms | CalcHub',
    metaDescription: 'Use our free pound to kg converter to convert pounds to kilograms instantly. Includes a quick-reference table for common lbs to kg conversions.',
    metaKeywords: 'pound to kg converter,pounds to kg converter,convert pounds to kilograms,lbs to kg',
    sitemapPriority: 0.9,
    searchVolume: '33K/mo'
  },
  'convert-miles-to-km': {
    title: 'Miles to Km Converter | Miles to Kilometers | CalcHub',
    metaDescription: 'Use our free miles to km converter to convert miles to kilometers instantly. Includes a quick-reference table for common miles to km conversions.',
    metaKeywords: 'miles to km converter,miles to kilometers converter,convert miles to km,miles km calculator',
    sitemapPriority: 0.85,
    searchVolume: '74K/mo'
  },
  'convert-feet-to-meters': {
    title: 'Feet to Meter Converter | Feet to Meters | CalcHub',
    metaDescription: 'Use our free feet to meter converter to convert feet to meters instantly. Includes a quick-reference table for common feet to meters conversions.',
    metaKeywords: 'feet to meter converter,feet to meters converter,convert feet to meters,feet meters calculator',
    sitemapPriority: 0.8,
    searchVolume: '27K/mo'
  }
};

// --- Tier selection -------------------------------------------------------
// Default behaviour: only publish "core" and "standard" tier pairs as real
// pages. "niche" pairs stay in the data file (so they're available, sized,
// and ready) but are NOT turned into live indexed pages unless explicitly
// requested with --tiers=all. This keeps page count tied to real demand
// instead of just dumping every accurate-but-low-traffic pair onto the site.
const argTiers = (process.argv.find(a => a.startsWith('--tiers=')) || '').split('=')[1];
const TIERS_TO_BUILD = argTiers === 'all'
  ? ['core', 'standard', 'niche']
  : argTiers === 'core'
    ? ['core']
    : ['core', 'standard']; // default

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const allData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const data = allData.filter(row => TIERS_TO_BUILD.includes(row.tier || 'standard'));
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
let overridesMatched = 0;
const seenSlugs = new Set();

data.forEach(row => {
  const slug = slugFor(row);

  // Guard against duplicate slugs (can happen if two rows share the same
  // from/to short codes, e.g. two different "Cooking" pairs both using
  // generic unit names). Skip and warn rather than silently overwrite.
  if (seenSlugs.has(slug)) {
    console.warn(`Skipping duplicate slug: ${slug} (category: ${row.category})`);
    return;
  }
  seenSlugs.add(slug);

  const override = KEYWORD_OVERRIDES[slug];
  if (override) overridesMatched++;

  const icon = CATEGORY_ICONS[row.category] || '🔢';
  const title = override ? override.title : `${row.fromFull} to ${row.toFull} Converter | CalcHub`;
  const metaDescription = override
    ? override.metaDescription
    : `Convert ${row.fromFull} to ${row.toFull} instantly with our free calculator. Includes a quick-reference table for common ${row.from} to ${row.to} conversions.`;
  const metaKeywords = override
    ? override.metaKeywords
    : `${row.fromFull.toLowerCase()} to ${row.toFull.toLowerCase()} converter,${row.from} to ${row.to},convert ${row.fromFull.toLowerCase()} to ${row.toFull.toLowerCase()},${row.fromFull.toLowerCase()} ${row.toFull.toLowerCase()} calculator`;
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
    .replaceAll('{{FROM_DEFINITION}}', definitionFor(row.from, row.fromFull))
    .replaceAll('{{TO_DEFINITION}}', definitionFor(row.to, row.toFull))
    .replaceAll('{{COMMON_TABLE_ROWS}}', buildCommonTableRows(row))
    .replaceAll('{{RELATED_LINKS}}', buildRelatedLinks(row, data));

  fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), page, 'utf8');
  const sitemapPriority = override ? override.sitemapPriority : 0.7;
  sitemapEntries.push(`  <url><loc>${canonical}</loc><priority>${sitemapPriority}</priority><changefreq>monthly</changefreq></url>`);
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
<meta name="description" content="Browse all unit conversion calculators by category: length, weight, temperature, volume, speed, area, time, data storage, energy, pressure, power, and more.">
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

const skipped = allData.length - data.length;
console.log(`Generated ${count} pages + 1 hub page + 1 sitemap snippet into ${OUTPUT_DIR}`);
console.log(`Tiers built: ${TIERS_TO_BUILD.join(', ')} | ${skipped} lower-tier entries skipped (run with --tiers=all to include them)`);
console.log(`Keyword-research overrides applied: ${overridesMatched} of ${Object.keys(KEYWORD_OVERRIDES).length} configured slugs matched a row in conversions.json`);