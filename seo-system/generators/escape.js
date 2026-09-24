'use strict';
// escape.js
// Shared by generate-pages.js, generate-loan-pages.js, generate-longtail.js.
//
// Why this exists: several data values in this project legitimately contain
// a literal double-quote character (heights like 5'9", screen sizes like
// 24", FAQ answers that quote something). Every generator was inserting
// values into HTML attributes and hand-built JSON-LD with plain
// .replaceAll() and no escaping, so a value like that silently truncates
// the attribute it lands in and invalidates the JSON-LD script next to it.
// Neither failure throws an error - the page still builds - which is why
// it went unnoticed.

// Safe to drop into an HTML attribute value or text node that is wrapped in
// double quotes in the template, e.g. content="{{...}}" or plain text.
function attr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Safe to splice inside a JSON string that is already wrapped in double
// quotes in the template, e.g. "name":"{{H1_JSON}}". Returns the escaped
// inner content only - no surrounding quotes, and no other JSON structure.
function jsonStr(value) {
  return JSON.stringify(String(value)).slice(1, -1);
}

module.exports = { attr, jsonStr };
