const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ADSENSE_SNIPPET = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9286981131873574" crossorigin="anonymous"></script>`;
const OLD_DOMAIN = 'yourdomain.com';
const NEW_DOMAIN = 'calculator-hub-phi-five.vercel.app';

const htmlDirs = [
  '.',
  'calculator-types',
  'calculator-types/longtail',
  'pages',
  'seo-system/templates',
  'seo-system/output',
  'seo-system/output-longtail'
];

const otherFiles = ['robots.txt', 'sitemap.xml'];

function listHtmlFiles(dir) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs.readdirSync(fullDir, { withFileTypes: true })
    .filter(e => e.isFile() && e.name.endsWith('.html'))
    .map(e => path.join(fullDir, e.name));
}

let snippetAdded = 0;
let domainFixedHtml = 0;
let domainFixedOther = 0;
let totalUpdated = 0;

for (const dir of htmlDirs) {
  for (const file of listHtmlFiles(dir)) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (!content.includes('ca-pub-9286981131873574')) {
      if (content.includes('</head>')) {
        content = content.replace('</head>', `  ${ADSENSE_SNIPPET}\n</head>`);
        snippetAdded++;
        changed = true;
      } else {
        console.warn(`WARNING: no </head> in ${file} - snippet not inserted`);
      }
    }

    if (content.includes(OLD_DOMAIN)) {
      content = content.split(OLD_DOMAIN).join(NEW_DOMAIN);
      domainFixedHtml++;
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      totalUpdated++;
      console.log(`Updated: ${path.relative(ROOT, file)}`);
    }
  }
}

for (const name of otherFiles) {
  const file = path.join(ROOT, name);
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(OLD_DOMAIN)) {
    content = content.split(OLD_DOMAIN).join(NEW_DOMAIN);
    fs.writeFileSync(file, content, 'utf8');
    domainFixedOther++;
    totalUpdated++;
    console.log(`Updated: ${name}`);
  }
}

console.log(`\nDone.`);
console.log(`Total files updated: ${totalUpdated}`);
console.log(`AdSense snippet inserted into: ${snippetAdded} HTML files`);
console.log(`Domain fixed in: ${domainFixedHtml} HTML files, ${domainFixedOther} other files`);
