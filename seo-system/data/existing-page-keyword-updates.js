// existing-page-keyword-updates.js
//
// Your existing calculator-types/loan.html, auto-loan-calculator.html, and
// mortgage.html already rank-eligible for some of the highest-volume terms
// in the new keyword set. These are NOT new pages — just better <title> /
// meta description / meta keywords for the pages you already have,
// based on real search volume from the keyword research CSV.
//
// Drop these into the <head> of each existing file (or merge into a
// KEYWORD_OVERRIDES-style map if you later move these into the generator).
//
// NOTE: I deliberately excluded brand-specific terms from this keyword set
// (e.g. "bank of america auto loan calculator", "navy federal car loan
// rates", "zillow home loan calculator", "capital one auto loan calculator",
// "bankrate loan calculator", "toyota/hyundai/kia payments"). Targeting
// competitor/financial-institution brand names in your own title and meta
// tags is a trademark risk and can also trigger ad network policy issues —
// even though they show real volume in the CSV, I'd recommend leaving
// those out rather than baking them into evergreen SEO metadata.

const EXISTING_PAGE_OVERRIDES = {

  'auto-loan-calculator.html': {
    title: 'Auto Loan Calculator | Car Loan & Automobile Loan Payment | CalcHub',
    metaDescription: 'Calculate your auto loan or car loan monthly payment instantly. Free automobile loan calculator with full amortization, total interest, and payoff timeline.',
    metaKeywords: 'auto loan calculator,automobile loan calculator,car loan calculator,online auto loan calculator,online car loan calculator',
    primaryKeyword: 'auto loan calculator / automobile loan calculator',
    combinedSearchVolume: '823,000/mo + 823,000/mo + 673,000/mo',
    note: 'These three terms are near-duplicate intent (auto/automobile/car loan calculator) — keep them all in metaKeywords but do not create separate pages, that would risk duplicate content / keyword cannibalization against your own pages.'
  },

  'loan.html': {
    title: 'Loan Calculator | Loan Payment Calculator | CalcHub',
    metaDescription: 'Calculate your loan payment, total interest, and payoff schedule for any type of loan. Free, fast, and accurate loan payment calculator.',
    metaKeywords: 'loan calculator,loan payment calculator,simple loan calculator,loan calculators loan payments,finance calculator',
    primaryKeyword: 'loan calculator',
    combinedSearchVolume: '673,000/mo + 110,000/mo',
    note: 'This is your highest-value generic page. Make sure it internally links out to every new dedicated loan-type page (personal, student, business, etc.) below the calculator — that link equity matters more here than on any other page on the site.'
  },

  'mortgage.html': {
    title: 'Mortgage Calculator | Home Loan Payment & Amortization | CalcHub',
    metaDescription: 'Calculate your mortgage payment, total interest, and full amortization schedule. Free home loan calculator including principal, interest, taxes, and insurance.',
    metaKeywords: 'mortgage loan calculator,mortgage loan calculator amortization,home loan amortization calculator,loan calculator home loan,mortgage loan rate calculator,home loan rate calculator,house loan calc',
    primaryKeyword: 'mortgage loan calculator / mortgage loan calculator amortization',
    combinedSearchVolume: '60,500/mo + 74,000/mo + 74,000/mo + 90,500/mo',
    note: 'Strongly consider adding an on-page amortization schedule table (collapsible) if not already present — "amortization" appears in 3 of your top 4 mortgage-related keywords, and a visible schedule is what searchers using that term expect to see.'
  }

};

module.exports = EXISTING_PAGE_OVERRIDES;
