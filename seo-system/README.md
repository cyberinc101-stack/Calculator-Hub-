# seo-system/

Generates the calculator pages under `calculator-types/` from JSON data files
and HTML templates, using `publish.ps1` to move finished pages into the live
site.

## Layout

```
seo-system/
  generators/
    generate-pages.js        -> unit converter pages (data/conversions.json + templates/converter.template.html)
    generate-loan-pages.js    -> loan calculator pages (data/loans.json + templates/loan.template.html)
    generate-longtail.js      -> "how many X in a Y" quick-answer pages (data/longtail.json + templates/longtail.template.html)
    check-output.js           -> read-only QA scan (bad meta tags, invalid JSON-LD, unfilled {{PLACEHOLDERS}}, broken chars)
    lib.js                    -> shared escaping/formatting helpers (attr, json, jsStr, fill, money)
  data/
    conversions.json
    loans.json
    longtail.json
  templates/
    converter.template.html
    loan.template.html
    longtail.template.html
  output/                     -> generated HTML lands here (gitignored, staging only)
```

## Running

```powershell
cd seo-system\generators
node generate-pages.js              # core + standard tier converter pages
node generate-pages.js --tiers=all  # include niche pairs too
node generate-loan-pages.js
node generate-longtail.js
node check-output.js ..\output      # QA pass before publishing
```

Then run `seo-system\publish.ps1` to copy `output/**/*.html` into
`calculator-types/` and merge the new URLs into the site's `sitemap.xml`
(each generator writes its own `_sitemap-snippet.xml` for that purpose).

## Adding a new page

- **Converter pair**: add a row to `data/conversions.json` (needs `from`,
  `to`, `fromFull`, `toFull`, `category`, `factor`, `offset`, `tier`).
- **Loan calculator**: add a row to `data/loans.json` (needs `slug`,
  `category`, `h1`, `intro`, `defaultPrincipal`, `defaultApr`,
  `defaultTermMonths`, and exactly the `faqs` array — any number of FAQ pairs).
- **Longtail quick-answer page**: add a row to `data/longtail.json` (needs
  `slug`, `category`, `h1`, `contextNote`, `fromFull`, `toFull`, `factor`,
  `offset`, `primaryValue`, `genericConverterSlug`, and exactly **two**
  `faqs` entries — the template has two fixed FAQ slots).

Re-run the matching generator, then `check-output.js`, before publishing.

## Known gaps

- `KEYWORD_OVERRIDES` in `generate-pages.js` only covers 4 researched slugs;
  everything else gets formulaic title/meta text.
- AdSense loader snippet lives at `core/partials/ads.html` — it needs the
  real `ca-pub-XXXXXXXXXXXXXXXX` publisher ID swapped in, and needs to be
  wired into `core/` so it's included on every page (converters, loans,
  longtail, and static pages like about.html/contact.html).
