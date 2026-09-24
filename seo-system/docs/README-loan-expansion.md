# CalcHub — Loan Calculator SEO Expansion

Source: 500-keyword finance/loan research CSV (search volume + top-of-page
bid data). 18 new dedicated loan-calculator pages targeting ~1.31M/mo
combined search volume, several with very high CPC (a strong RPM signal for
AdSense): VA loan calculator ($23.91), debt consolidation ($72.56), home
equity/HELOC ($11.25), student loan ($11.02), personal loan ($10.43).

## What's in this folder

```
data/
  loan-calculators-vehicle-property.json     7 entries  (car/vehicle/boat/rv/motorcycle/land/HELOC)
  loan-calculators-personal-business.json   11 entries  (personal/student/business/VA/FHA/amortization/payoff/etc.)
  existing-page-keyword-updates.js          better title/meta for your 3 existing loan pages
templates/
  loan.template.html                        new template, amortization calculator + FAQ schema
generate-loan-pages.js                      generator script, same pattern as generate-pages.js
output-loans/                               18 pre-generated pages (already run for you)
```

## Why a third generator instead of reusing generate-pages.js / generate-longtail.js

Your two existing generators are both built around a **linear formula**
(`value * factor + offset`) — perfect for unit conversion. Loan payments use
the standard amortization formula (PMT), which isn't linear in the same way,
so it needed its own generator rather than forcing it into
`LINEAR_GROUP_CONFIG`. `generate-loan-pages.js` follows the exact same
conventions as your other two scripts (same header comment style, same
`SITE_BASE_URL`, same output-dir + sitemap-snippet pattern) so it should
feel familiar to drop in.

## To regenerate

```
node generate-loan-pages.js
```

Reads both JSON files in `data/`, writes 18 HTML files to `output-loans/`,
plus `_sitemap-snippet-loans.xml` — append that into your main `sitemap.xml`
the same way you do with the other two generators' snippets.

## Before you move output-loans/*.html into calculator-types/

I did **not** have your actual `css/vars.css`, `css/base.css`,
`css/layout.css`, or `js/app.js` — only the class names referenced inside
your generator scripts (`wrap`, `hero`, `hero-eyebrow`, `hero-sub`,
`seo-box`, `site-header`, `site-footer`). The template reuses those exactly,
so the page shell should match your site automatically. For the
calculator-specific pieces that don't exist in your CSS yet (`.calc-box`,
`.calc-row`, `.calc-results`, `.faq-item`), I included a small `<style>`
block directly in the template with sensible fallback values — safe to
delete once you've styled equivalents in `layout.css`, or just leave it,
it won't conflict with anything.

`js/app.js` is referenced as-is (assumed to inject `#site-header` /
`#site-footer`, same as your hub page) — if it does anything else you'll
want to check the new pages render correctly with your real header/footer.

## Brand-name keywords — deliberately excluded

The source CSV included real volume for terms like "bank of america auto
loan calculator," "navy federal car loan rates," "zillow home loan
calculator," "capital one auto loan calculator," and several dealer brand
names (Toyota/Hyundai/Kia payments). I left all of these out of the
metadata. Targeting another company's brand name in your own title/meta
tags is a trademark risk and can trigger ad network policy issues —
not worth it on evergreen SEO pages. Full detail and reasoning is in
`data/existing-page-keyword-updates.js`.

## Internal linking — do this part by hand

Each new page has 2-3 `relatedSlugs` wired in, but the highest-leverage
move is adding a link to relevant new pages from your existing `loan.html`
and from CalcHub's homepage/category nav, since `loan.html` already targets
the single highest-volume term in the whole set (673,000/mo for "loan
calculator"). That page passing link equity down to the 18 new pages
matters more than any on-page tweak.
