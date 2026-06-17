# Programmatic SEO System for Calculator Hub

## What this is
A small Node script that turns ONE template + ONE data file into many real,
working HTML pages. Run it, it generates the files, you copy them into
`calculator-types/`, commit, push — Vercel deploys them like any other page.

## Folder layout (drop this whole `seo-system` folder into your calchub repo root)
```
calchub/
  seo-system/
    data/conversions.json        <- your "database" of pages to generate
    templates/converter.template.html
    generate-pages.js
    output/                      <- generated files land here (gitignore this if you want)
  calculator-types/              <- existing site, where you move the output files into
```

## Workflow
1. Add more rows to `data/conversions.json` (any unit pair: weight, volume, speed, data storage, currency-adjacent stuff — anything with a fixed numeric conversion factor).
2. Run:
   ```
   cd seo-system
   node generate-pages.js
   ```
3. Copy everything from `seo-system/output/*.html` into `calchub/calculator-types/`.
4. Open `_sitemap-snippet.xml` (in output/) and paste those `<url>` entries into your real `sitemap.xml`.
5. Add a link to `convert-index.html` from your homepage nav so Google can crawl into the new pages (this matters — orphaned pages with no internal links rank much slower).
6. `git add .` / commit / push as usual.

## Styling
The template uses class names (`calc-widget`, `reference-table`, `related-links`, `calc-result`) that aren't in your current `base.css`/`layout.css`. Add a few rules for those classes so the pages match your site's look — otherwise they'll render unstyled. I kept it minimal on purpose so it inherits your existing CSS variables from `vars.css`.

## The one rule that matters more than anything else
Each page must have **real, working functionality** (the live calculator) **and unique content beyond the template** (the reference table here). That's what separates this from a "doorway page" pattern. Google's scaled-content-abuse policy (2024+) specifically targets sites where pages are templated with nothing unique — and the penalty isn't per-page, it can suppress the whole site's rankings. Don't generate pages for combinations nobody actually searches for just to inflate the count; quality-checked volume beats raw volume.

## Scaling this up
Once this pattern is proven on unit conversions, the same script structure works for:
- Currency/GST/VAT rate pages per country
- Time zone city-pair converters
- "X calculator for [profession/scenario]" variants — only where the content genuinely differs (tipping conventions, tax brackets), not just a find-and-replace of a name

Each new "page type" = one new data file + one new template, reusing the same `generate-pages.js` pattern (or extending it to loop over multiple template/data pairs).
