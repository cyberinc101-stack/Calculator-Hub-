# CalcHub

Static HTML/JS calculator and converter site, deployed on Vercel.

- Live pages (converters, loan calculators, quick-answer pages, and static
  pages like about.html/contact.html) live at the project root and under
  `calculator-types/`.
- Hundreds of the calculator pages are machine-generated — see
  `seo-system/README-seo-system.md` for how the generator system works and
  how to add a new page.
- Analytics: Google Analytics (gtag.js) is wired into every generated page.
- Monetization: Google AdSense (see `core/partials/ads.html` — needs a real
  publisher ID) plus whatever's already on the static pages.

## Deploy

```powershell
git add .
git commit -m "..."
git push
vercel --prod
```
