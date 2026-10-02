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

## 部署问题案例 — 2026-10-02

**问题：**源码上传到 GitHub 后，公开网站还不能访问。上传完成与网站发布完成被误认为同一步。

**已确认的初始配置：**Pages 的 Source 为 GitHub Actions，页面仍展示 Static HTML / Jekyll 的 Configure 入口，没有显示已部署网站。现有截图没有证明工作流已配置或成功运行，因此不能把首次无法访问归因为 HTML/JS 代码错误。

**处理：**改为 Deploy from a branch，选择 main 与 / (root)，保存。之后截图出现 GitHub Pages source saved，并显示从 main 分支构建的配置。

**尚未确认：**当时仍无部署成功提示。尚未查看 Actions 的实际运行结果；不能断定构建失败，也不能断定只是等待。需要检查 pages build and deployment 的状态与日志。若成功后首页仍404，再核对 index.html 是否位于发布目录根部。

**反思：**我学会区分源码上传、发布来源配置、构建与部署、公开链接验证这几个环节。排查时应先看部署状态和错误日志，而不是反复改代码。最终结果待实际访问网站后补记。

**证据：**image(20261002-064312).png（初始 GitHub Actions 来源）；image(20261002-064446).png（已保存 main / root 配置）。

### 部署案例结案 — 2026-10-02
后续 Actions 截图 image(20261002-064659).png 显示最新 pages build and deployment 成功，但公开首页仍404。仓库截图 image(20261002-064755).png 确认根目录只有 baby-food-label-reader 子文件夹，首页文件在该文件夹内；发布来源却选择仓库根目录，导致根网址找不到 index.html。这是文件路径与发布目录不匹配，不是API或网页JavaScript故障。

处理建议是把 index.html、product.html、style.css、script.js 放到发布根目录。用户随后确认此诊断正确、网站成功打开，并提供 image(20261002-065101).png 显示正常首页。最后实际采取的是移动文件还是访问子目录，截图未展示地址栏/更新后的文件列表，暂不把具体操作写成已证实事实。

结果：用户确认网站可访问，首页截图正常；上线后的产品API查询和交互仍应单独测试。学习：绿色部署成功只说明发布流程完成，不保证所访问的URL对应有效首页；需要核对发布目录、入口文件与URL路径。

## Mobile repair — 2026-10-02
Removed constrained mobile image aspect ratio, allowed grid children to shrink, contained image and hint in natural flow, wrapped metadata and long text. Pink/yellow/blue style retained. Actual phone and 320/390/430px verification pending. See PROCESS-DRAFT.md and USE-CASE.svg for project evidence draft.
