# Ingredient reading help — update 2026-10-02

## Feature specification
| User goal | Technical feasibility | Interface |
|---|---|---|
| Understand selected ingredient terms and locate the evidence | Open Food Facts GET /api/v2/product/{barcode}.json returns ingredients_text (fallback ingredients_text_en). A small website-maintained glossary matches six terms, case-insensitively. No extra API request is needed. | Native details/summary reveals each website explanation and its reference. Find in original text highlights all occurrences and scrolls to the first. Clear highlight restores the plain display. |

## Ownership and limits
Original ingredient text remains unchanged, including casing, order, punctuation and line breaks. Highlighting creates text nodes and mark elements; it does not interpret API content as HTML. Website explanations are paraphrases, separate from the product record. They do not establish dietary suitability or the animal source of gelatin. Only matched glossary terms appear; unmatched terms are not classified.

## References checked 2026-10-02
- Cultured milk: eCFR 21 CFR 131.112, https://www.ecfr.gov/current/title-21/section-131.112 — dairy ingredients cultured with microorganisms. The website explains the word cultured, without inferring exact fat content.
- Nonfat dry milk: eCFR 21 CFR 131.125, https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-131/subpart-B/section-131.125 — water removed from pasteurized skim milk; supports the plain-language explanation.
- Gelatin: Gelatine Manufacturers of Europe FAQ, https://www.gelatine.org/en/service/faq.html — animal collagen protein. This is an industry association source; its general definition does not verify a particular product's origin.

## Verification
JavaScript syntax and simulated DOM interaction checks passed: repeated and case-insensitive matches, unchanged full original text before/after highlighting, switching selected terms, clearing, missing text, unmatched text, HTTP 404. Native details controls provide keyboard operation, and existing mobile layout remains in place.
Actual browser keyboard behavior, scrolling, visual layout and live API checks for this update still need manual verification; this environment has no installed browser binary.

## Manual check (about 5 minutes)
1. Open index.html, query 0015000047306, open Nonfat dry milk, follow Find in original text, then Clear highlight. Test Tab/Enter/Space and source links.
2. Narrow the browser to phone width. Confirm no horizontal overflow and that explanation text/buttons wrap. Capture the open explanation and highlighted original text for the process document.

## Homepage example entry — update 2026-10-02

The barcode input starts empty. Try an example: Gerber Strawberry is a standard link to product.html?barcode=0015000047306. It bypasses manual typing and uses the existing product-page fetch and loading/error handling; example data is not hardcoded. The link also works without homepage JavaScript and supports keyboard activation.

Checked the target page, exact barcode query parameter, input empty state, and JavaScript syntax. Live browser/API verification remains a manual check: click the example and confirm the product loads, then return home and query another barcode. Image enlargement is now included (see below).


## Packaging image enlargement — update 2026-10-02
| User goal | Technical feasibility | Interface |
|---|---|---|
| Inspect the packaging image more closely | Uses image_front_url or image_url from the existing product response; no additional product API request. | Loaded image becomes a keyboard-operable button with Click to enlarge. Native modal dialog shows the complete image with preserved proportions. Close button, Escape or outside backdrop closes it and returns focus to the image. |

Missing or failed thumbnails show Product image unavailable without an enlargement entry. Failed modal images show the same message with the Close control retained. Source resolution limits detail; no image details are generated. Pink/yellow/blue styling is retained. Modal is viewport-constrained, close control stays visible, and background scrolling is locked while open.

Verification: syntax and simulated image loading/opening/closing/error/missing-data behavior checked. Native browser Escape/focus trapping, real image loading, backdrop positioning and phone appearance need manual verification.

Manual checks: (1) Query the example, open packaging, close by button, Escape and backdrop; test Tab/Enter and focus return. (2) Check phone width and missing/failed image states. Save an annotated screenshot for the process document.

## Content reliability update — 2026-10-02
Added Choline bitartrate (NIH Choline fact sheet), Mixed tocopherols (NIH Vitamin E fact sheet) and Sunflower lecithin (FDA Lecithin inventory). References are linked beside each website-authored explanation. General definitions do not establish product suitability or exact ingredient purpose. No health benefit or allergy classification is inferred.

Unmatched ingredient lists now say: “This website does not yet explain any terms in this ingredient list.” This identifies glossary coverage as the limitation, rather than suggesting the original ingredients are missing.

Energy check compares explicit energy-kcal_100g × 4.184 with energy-kj_100g. It flags differences greater than both 5 kJ and 10% of the larger value to tolerate rounding. Missing, invalid or negative values skip this comparison; the absence of a warning does not verify the record. Both source values remain unchanged. The user-provided Puffs response (0 kcal vs 102 kJ per 100 g) reproduces a source inconsistency and triggers the notice. No guessed replacement value is displayed.

User confirmed image modal Escape and Close button work. Live browser testing of new glossary terms and energy notice remains to be completed.
