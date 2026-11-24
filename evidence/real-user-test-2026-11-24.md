# Real-user test, 2026-11-24 (copy)

A copy of `ARCY-Official/.sites-runtime/evidence/2026-11-24/real-user-test/REPORT.md`, kept here so the site can cite it. Paths inside are relative to that folder. Scores are by a single rater (ordinal). Model and provider names replaced by a description in square brackets; nothing else edited.

# ARCY real-user test, 2026-11-24

Tested: branch `generalist-agent` at **0391bba**, in a separate detached worktree (removed afterwards). Model: [the one strong model the server offered] (the only one available that day). Pictures: [an image model]. Machine: macOS, 18 cores, 36 GB.

All paths below are relative to this folder (`.sites-runtime/evidence/2026-11-24/real-user-test/`).

## 0. What was spent, per part

The ceiling was lowered three times while the test ran (40 → 24 → 14 USD). Final ceiling: **14 USD**. Spent: **14.039 USD** (usage ledger `data/arcy.sqlite`, table `agent_usage`, summed). The 0.039 over the ceiling is itself a finding (problem 5).

| Part | USD | Source |
|---|---:|---|
| Pilot, 3 UI sessions, 6 requests (cap 2 USD/request) | 3.551 | `phase-pilot.json`, `pilot.log` |
| Coverage batch A, 7 sessions in parallel, 13 requests (cap 1 USD) | 7.088 | `phase-coverage-a.json` |
| Coverage batch B, 6 sessions in parallel, 7 requests (cap 1 USD) | 3.287 | `phase-coverage-b.json` |
| Load, 4 parallel paid requests (cap 0.001 USD) | 0.112 | `phase-load4.json` |
| Load, 8 parallel upload sessions; 8/16/32-owner upload bursts | 0 | `phase-load8-free.json`, `burst-*.json` |
| UX tests with no model call | 0 | `screens/ux-uploads/`, `screens/ux-large-pdf/` |
| Award comparisons | 0 | desk work, section 7 |
| Published benchmarks | 0 (not run) | section 8 |
| **Total** | **14.039** | |

## 1. How it was run

- **Server**: the production server (`server/main.mjs` `createProductionServer`) on loopback, real agent, real gateway, real sandbox (`harness/server.mjs`). The changes from a deployment are configuration only. There is no namespace sandbox on macOS, so `ARCY_REQUIRE_ISOLATED_SANDBOX` was not set. OIDC values are placeholders, and 40 owners were signed in the way `/auth/callback` signs people in. Every session had its own owner. No product code was changed.
- **People**: `harness/rut.mjs` drove the real Studio in Chromium. It typed every request into `#input`, attached files through the Studio's file field, answered confirmation cards with the card's own button, and accepted a proposal with the proposal bar. Each UI session was filmed (`screens/<session>/<session>.webm`) and screenshotted every 30 s and at each step.
- **Measures**: times come from the event stream (server clock). Cost and tokens come from the ledger rows each request added. Steps and failures come from `tool_call` and `tool_result` events. All figures are in `analysis.json` / `analysis.txt`.
- **Clean-up**: 57 byte-identical copies (checked with `cmp`) of the 104 MB guideline PDF, made by the bursts, were deleted. Duplicate video copies were replaced by the recorder's originals. The folder went from 9.8 GB to 2.5 GB. The inventory is in `cleanup-inventory.txt`.

## 2. Metric definitions

| Metric | Definition |
|---|---|
| Goal | **yes / partly / no**: the deliverables named in the request, checked against the files and answer |
| Requests | paid requests the person needed (a confirmation answer counts as one) |
| Steps / failed / repeated | capability calls; calls returning `ok:false`; calls repeated with identical arguments |
| First object | seconds from send until a new card appeared on the canvas |
| Total | seconds from send to the last event of the request |
| Longest silence | longest gap between visible events |
| USD / tokens | ledger rows for the request (work + review + pictures) |
| Asked | stopped to confirm: **needed** (a fact was missing) or **needless** (the brief was complete) |
| Sourced | links or page citations on factual claims in the answer |
| Factual errors | verified against the source or a published figure; "probable" when judged by practice and not verified |
| On canvas | deliverables appeared as canvas cards |
| Language | wrong-language or internal text shown to the person |
| Friction | UI events that cost the person time or confidence |
| Client / Office | 1–10: a demanding client / a world-class office. Single rater, so treat as ordinal |

## 3. Every request

AR-d = Saudi dialect, AR-f = formal Arabic, EN = English. Times in seconds.

| # | Session | Style | Goal | Asked | 1st obj | Total | Steps (failed) | USD | Tok in/out | Client/Office | Why |
|---|---|---|---|---|---:|---:|---|---:|---|---|---|
| 1 | s01 feasibility | AR-d, numbers, typos | yes | no | 123 | 623 | 31 (9) | 1.436 | 1.05M/26k | 7/6 | Pro-forma, sensitivity, yield and payback, every price marked as an assumption. Base 9,145 SAR/m² is inside the Al Narjis asking range I found (about 9.7–13.4k, Bayut). No XLSX: `xlsxwriter` is missing. The review ended "revise" twice, unresolved. |
| 2 | s01 r2 | AR-d, change of mind | yes | no | 64 | 109 | 15 (3) | 0.189 | 321k/7k | 8/7 | Re-ran only the changed price, gave the break-even (10,732), and flagged the mixed case was never modelled. |
| 3 | s02 landscape confirmation | EN vague | – | needed | – | 28 | 1 | 0.016 | 34k/0.6k | – | Good questions with defaults, but the card's headings and notes are **Arabic** in an English session. |
| 4 | s02 landscape | EN | partly | – | 63 | 817 | 74 (15) | 0.960 | 1.83M/19k | 5/4 | 1:100 PDF and 3D views. No species, no irrigation. |
| 5 | s03 IFC confirmation | EN precise + IFC | – | needed | – | 87 | 5 | 0.133 | 155k/1.4k | – | Asked about a stair outside the footprint, a real constraint. |
| 6 | s03 IFC round trip | EN | yes | – | 89 | 638 | 51 (6) | 0.818 | 2.15M/19k | 8/7 | ifcopenshell check: all 21 original products kept; 2 bedrooms, a hall, a stair and railings added; A-102 sheet dimensioned. 25 outputs, including 3 IFC versions. |
| 7 | s04 research confirmation | EN precise | – | **needless** | 43 | 77 | 5 | 0.196 | 116k/1.8k | – | |
| 8 | s04 research | EN | partly | – | 48 | 200 | 47 (2) | 0.585 | 765k/8.5k | 7/7 | SBC 201 §903.2.8 with page-anchored official links. Honest that SBC 801 could not be read. Rejected its own unverifiable quotes. |
| 9 | s05 plan review confirmation | AR-f precise + IFC | – | **needless** | 41 | 59 | 10 | 0.193 | 152k/2.3k | – | |
| 10 | s05 plan review | AR-f | yes | – | 42 | 431 | 78 (10) | 0.944 | 1.67M/20k | 8/7 | Missing WC (5-1-4 p.28) and kitchen glazing 1.00 < 1.197 m² (5-1-15 p.35), placed on the plan from the MOMRAH 2024 PDF. Unchecked items listed. Best screen of the test. |
| 11 | s06 urban confirmation | AR-d vague | – | needed | – | 19 | 1 | 0.019 | 34k/0.9k | – | |
| 12 | s06 subdivision | AR-d | partly | – | 48 | 529 | 60 (**31**) | 1.193 | 1.86M/25k | 6/5 | 25 or 35 plots, DXF in metres. No subdivision rule checked; public-use share (about 25–27 %) not compared with any requirement. |
| 13 | s07 interior confirmation | AR-d | – | needed | – | 18 | 1 | 0.019 | – | – | |
| 14 | s07 interior | AR-d | partly | – | 64 | 606 | 49 (**22**) | 0.792 | 1.30M/16k | 5/3 | 1:25 plan and DXF, motif sourced to the DASC handbook p.7. The picture (`data/agent/o-e9c9…/s-93a0136f-2b0d/files/j5-majlis-interior.png`) is a bland beige box. |
| 15 | s08 compound confirmation | AR-f long | – | needed | – | 30 | 1 | 0.024 | – | – | |
| 16 | s08 compound | AR-f | partly | – | 73 | 628 | 56 (15) | 1.325 | 2.07M/26k | 5/3 | **Stopped at the cost cap.** Regulations ✓, 3 concepts ✓, IFC + A2 drawings + 4-page PDF ✓. Feasibility: **no numbers**. Render: **replaced by a model view**. Box villa; the site plan shows a solid block for a "courtyard house". |
| 17 | s09 mood board | AR-d vague | yes | no | 154 | 406 | 48 (**21**) | 0.715 | 1.36M/15k | 7/5 | Attractive A3 board with palette; generic, not regional. |
| 18 | s09 r2 | AR-d, change of mind | yes | no | 103 | 442 | 42 (13) | 0.696 | 1.68M/10k | 7/5 | AlUla version, old board kept. Same template as the first. English proposal label in an Arabic session. |
| 19 | s10 documents | AR-d + PDF | yes | no | 7 | 146 | 26 (7) | 0.387 | 580k/8k | 7/6 | Correct clause/value/page table. The PDF is a list, not the table asked for. `fitz` and Pillow `raqm` are missing. |
| 20 | s11 analysis | EN long + IFC | partly | no | 16 | 578 | 67 (8) | 1.057 | 1.99M/20k | 6/5 | All six items answered with methods, traceable to IFC ids. **Probable underestimate**: whole-house AC 1.29 TR for 109 m² in Riyadh. No answer on the 20 cm slab. Used `compute.run`, not `environment.simulate` / `model.quantities`. |
| 21 | s12 sketch edit + accept | AR-d + picture | partly | approval (requested) | 27 | 32 | 4 | 0.076 | 179k/0.6k | 6/5 | The proposal → accept flow works; the original is kept. English label in the Arabic UI. |
| 22 | s13 site (API) | EN | – | – | – | 461 | 24 (7) | 0.729 | 558k/11k | not scored | Cancelled by the tester to stay within the ceiling. |
| 23 | s15 research AR | AR-d vague | partly | **should have asked** | 53 | 259 | 18 (7) | 0.625 | 441k/8k | 6/5 | XPS roof and rock-wool facade, from manufacturer sources. No U-values, no SBC 602 thresholds, no cost. |
| 24 | s16 long PDF | AR-d, 17 MB Arabic guideline | yes | no | 8 | 57 | 33 (3) | 0.228 | 325k/3k | 9/8 | Every figure **verified** with pdftotext at its cited page. |
| 25 | s16 outline | AR-d | yes | no | 5 | 368 | 35 (0) | 0.494 | 708k/3.5k | 9/8 | Matches the printed contents. But 6 min and 0.49 USD, **0.41 of it the review**. |
| 26 | s16 page 20 | AR-d | yes | no | – | 38 | 6 (1) | 0.080 | 182k/1.8k | 9/9 | Handled the printed-vs-PDF page ambiguity; the quote is verified. |
| 27 | s17 compare two PDFs | EN, 17 + 29 MB | – | – | – | – | – | 0 | – | not run | Skipped by the budget guard; estimated 0.5–1.0 USD. |

**Totals:** 788 steps, **180 failed (22.8 %)**, 109 repeated. 21.6 M input and 258 k output tokens. Work 8.31 USD, **review 5.40 USD (38.8 %)**, pictures 0.22 USD. Seven requests confirmed first; two of those were needless. One vague request that should have asked did not (s15).

**Per family (Client/Office):**

| Family | Client/Office |
|---|---|
| Documents | 8.5/7.8 |
| Plan review | 8/7 |
| IFC | 8/7 |
| Feasibility | 7.5/6.5 |
| Research | 6.5/6 |
| Mood board | 7/5 |
| Analysis | 6/5 |
| Picture edit | 6/5 |
| Urban | 6/5 |
| Landscape | 5/4 |
| Interior | 5/3 |
| Compound | 5/3 |
| Site | not scored |

**Per prompt style:**

| Style | Client/Office | Failed steps |
|---|---|---:|
| Precise | 7.7/7.0 | 9 % |
| Follow-ups | about 8.2/7.4 | 5–14 % |
| Saudi dialect | 7.2/6.0 | 32 % |
| English | 6.5/5.8 | 12 % |
| Short vague | 6.2/4.8 | 36 % |
| Long compound | 5/3 | 26 % |

Dialect, typos and vague asks were understood every time; no request was misread. The higher failure share in dialect sessions comes from the capabilities those sessions used (image work, urban), not from the language.

## 4. Load

| Test | Parallel | Result | Node peak | Sandbox children peak | Errors |
|---|---:|---|---|---|---|
| Coverage A, real work | 7 owners | finished 7–14 min each | 580 MB, 38 % | **4.2 GB, 1273 % CPU** | none |
| Pilot | 3 | 10–14 min | 344 MB | 3.7 GB, **1427 %** | none |
| Load-4, paid at cap 0.001 USD (2 UI + 2 API) | 4 | first event 5–50 ms, total 9–11 s | 177 MB | – | none |
| Load-8 uploads (2 UI + 6 API; 17 + 29 MB PDFs, IFC, picture) | 8 | 32 × 201; PDFs 0.5–0.9 s | 223 MB | – | none |
| Bursts of the 104 MB PDF | 8/16/32 owners | all 201; slowest 1.7/3.4/6.4 s | 249/268/**291 MB**, 180 % CPU | – | none |

- **Isolation**: every cross-owner read of a session, run stream, output or file returned 404. No load session's token appeared in any other owner's store (12 tokens checked, 0 leaks).
- **Breaking point**: not reached. The limit in sight is **sandbox CPU**.
- **Not tested**: the per-owner limit of 2 concurrent requests (it would have cost money).

## 5. Top problems, ranked by harm

1. **22.8 % of agent steps fail, mostly from two avoidable errors.**
   - 88 failures: `image.view` is called with a region that does not exist ("whole image", "overview"), although its own description says to omit `region` for the whole image.
   - 54 failures: the agent tries to read its own outputs as documents or images ("Known documents: none").
   - Each failure is a paid turn and adds waiting.
   - Suspected files: `worker/agent/caps/image.js` (~l.340), `worker/agent/session.js:607` (regions) and `:416` (documents know only uploads, not outputs).
2. **The review is 39 % of all spend and decides little.** Most reviews end "revise" twice and stay unresolved; the reviewer is the same model; an outline cost 0.08 work + 0.41 review. Suspected files: `worker/agent/peer-review.js`, `worker/agent/index.js` `ask()`.
3. **Design quality is far below the bar.** Villa: a box, its "courtyard" drawn solid, no render. Interior: bland. Mood boards: one template, nothing regional. Landscape: no planting. Suspected files: `worker/agent/skills/design`, `interior`, `landscape`, `moodboard`, and `worker/agent/caps/present-template.js`.
4. **Sandbox packages are missing**: `xlsxwriter` (so no Excel), `fitz` (PDF in code), `arabic_reshaper` and Pillow `raqm` (Arabic text in pictures). 11 failures. Suspected: `.venv-capabilities` requirements, `worker/agent/sandbox.js`.
5. **The per-request cost cap is not hard.** At a cap of 0.001 USD, a single call cost 0.013–0.074 USD, 13–74 × the cap. Suspected: `worker/providers/gateway.js` `#admit()`, `worker/agent/loop.js` cost-reserve check.
6. **The compound request ran out of cap and dropped two of six deliverables** (numbers, render) after spending on the rest. Suspected: `worker/agent/loop.js`, `worker/agent/next-steps.js`.
7. **Wrong-language and internal text reaches the person**: Arabic headings on English confirmation cards; English proposal labels in Arabic sessions; jargon such as "(k1, …)", "output.exists", "no measures.json result…". Suspected: `worker/agent/caps/confirm.js:131-133`, `worker/agent/acceptance.js:486`.
8. **The Studio's money meter stays at 0.00 after spending.** For example, owner 9 shows 0.00 while the API reports 1.41 USD spent, and one screen shows a request costing SAR 2.19 beside "0.00 of 90.00". Suspected: `public/studio/js/account.js` (read once at page load).
9. **Confirmation is miscalibrated**: needless on complete briefs (60–80 s and a click), missing on a vague Arabic research question. Suspected: `worker/agent/caps/confirm.js`, `worker/agent/prompt.js`.
10. **Probable AC-load underestimate**: 1.29 TR for 109 m² in Riyadh. Suspected: `worker/agent/skills/services`, `energy`.
11. **Specialised capabilities are bypassed**: 88 `compute.run` calls overall instead of `environment.simulate` / `model.quantities`. Suspected: `worker/agent/skills/sun`, `daylight`, `energy`.
12. **Uploads accept anything**: an `.exe`, a fake `.docx` and a fake `.dwg` were attached with a success message. Suspected: `worker/agent/api.js` attachments route (~l.597), `public/studio/js/lifecycle.js` `upload()`.

## 6. Coverage: capabilities not reached

- **Budget**: `capture.reconstruct`, `model.film`, `video.read`, `property.study`, `papers.search`, `plot.record`, `design.facade`, document comparison (s17). Site context (s13) was cancelled mid-run.
- **The agent chose another path**: `environment.simulate` and `model.quantities` were not used even when the analysis request asked for that work.
- **Not a single-user path**: `host.*`, `tool.*` (tool maker off), MCP, `memory.*`/`project.*`, `ui.show`, `review.precedents`/`review.checklist`, `requirements.propose`, `document.remember`.

## 7. Award and practice comparison

There are no side-by-side pictures, because downloading reference images needs the owner's approval. Each comparison is against the published description. Gap: 0 = at the reference's level, 10 = nothing comparable.

| ARCY output | Reference | Gap | What separates them |
|---|---|---:|---|
| Landscape | Wadi Hanifa Wetlands, AKAA 2010 (Moriyama & Teshima, Buro Happold) | 8 | Water, native planting and ecology versus a shade roof and gravel. |
| Compound villa | Tuwaiq Palace, AKAA 1998 | 8 | A plain box. |
| Interior | Majlis precedents in the DASC Central Najdi handbook (the source ARCY cited) | 7 | No timber ceiling, niches or low light. |
| Mood boards | Top-studio practice boards | 5 | One template for every place. |
| Drawings | RIBA Plan of Work 2020, Stage 2 | 3 | Missing room tags with areas, north on all sheets, a drawing register. |
| Feasibility | Turner & Townsend KSA Market Intelligence 2025 (Riyadh average 3,112 USD/m²) | 4 | Build cost not reconciled to any published index; no REGA transactions. |
| Research | Official SBC 201-AR-2024 | 2 | SBC 801 not read. |
| Documents | The source guideline itself | 1 | Every figure checked against its page. |

## 8. Published benchmarks

**Not run.** Downloading the GAIA, BrowseComp, DocVQA, FinanceBench and tau-bench question sets needs the owner's own approval in chat, and the budget was used up. No local copies exist. The only AEC benchmark the repository cites is Snaptrude's AECBench (`docs/INTEGRATED_PLAN.md:184`).

Estimated cost, from this test's measured cost per request:

| Subset | Estimated USD |
|---|---|
| GAIA validation, Level 1, 20 questions | 3–6 |
| BrowseComp, 20 questions | 6–12 |
| DocVQA, 50 pages | 4–8 |
| FinanceBench, 20 questions | 3–6 |
| tau-bench retail, 10 tasks | 3–6 |

None of these subsets is large enough to compare with published leaderboards; say so beside any number.

## 9. UX: what a new person experiences

**First five minutes**
- **The first screen is delightful**: "What shall we design today?", four real examples, and an honest "up to SAR 9.00" beside send (`screens/s01-feasibility/01-first-visit.png`).
- **Unexplained controls**: "Ask first", "Auto" and the shield icon are not explained to a newcomer.
- **Confirmation cards are long**: s03's card fills the screen and its **Confirm** button scrolls away (`screens/s03-ifc-roundtrip/08-r2-confirm-card.png`).
- **Waiting**:
  - First object on the canvas after 5–154 s (median about 50 s).
  - Whole answer after 2–14 min.
  - Silent gaps of 13–91 s.
- **Where a person would give up**:
  - The long waits for design work.
  - The end of a run, where the review panel buries the answer.
  - A money meter that still reads 0.00 after paying.

**Uploads**
- **Delightful**:
  - The drag-and-drop veil (`screens/ux-uploads/14-drag-veil.png`).
  - The 104 MB PDF accepted in 0.5 s, 64 pages detected, three useful suggestions.
  - Clear error messages for a fake PNG and a broken PDF.
- **Annoying**:
  - A slow upload (17 MB at 400 KB/s) shows "Preparing…" for 43 s with no percentage or time left (`29-slow-3.png`).
  - PDFs go to the bottom bar instead of the canvas.
  - The composer fills up with 8 chips, 2 errors and 3 suggestion blocks (`35-*.png`).
- **Wrong**: an `.exe`, a fake `.docx` and a fake `.dwg` were accepted as attachments.

**Research**
- **Good**: page-anchored official links, and the code page shown on the canvas (`screens/s04-research/16-r2-finished.png`).
- **Weak**:
  - Source cards are named "fetched-1", "fetched-2".
  - The canvas card showed the reviewer's page, not the answer's.
  - The first useful text took 277 s because of a needless confirmation.

**Documents**
- **Best**: verified page citations and the printed-vs-PDF page handling.
- **Missing**: page numbers are plain text, not links that open the PDF at that page.

**Proposals**
- The accept flow works.
- The label is English in an Arabic session, the change is hard to see at 41 % zoom, and the bar covers the mood board.

**Canvas**
- Cards get clipped after auto-framing (`screens/s01-feasibility/14-r1-live-0300s.png`).
- s03 ended with "8 pictures, 27 files" for one request.

**Language switch**
- Instant and complete.
- The mixed-language text comes from the server, not the Studio.

**Mistakes and recovery**
- No character counter, and send stays enabled at 8,100 characters.
- A request stopped at the cost cap shows a system summary full of internal ids, and the composer controls are truncated ("ت…") (`screens/load4-1/05-r1-finished.png`).

**Downloads**
- All outputs work.
- File names gain `-2`/`-3` suffixes with no "latest" marker.

**Real moments for marketing and film**
- `screens/s05-plan-review/24-r2-finished.png` (regulation checklist).
- `screens/s03-ifc-roundtrip/30-r2-finished.png` (A-102 sheet).
- `screens/s09-moodboard/18-r1-finished.png` and `35-r2-finished.png`.
- `screens/s04-research/16-r2-finished.png`.
- `screens/ux-uploads/14-drag-veil.png`.
- Films: `screens/s03-ifc-roundtrip/s03-ifc-roundtrip.webm`, `screens/s05-plan-review/s05-plan-review.webm`, `screens/s09-moodboard/s09-moodboard.webm`.

## 10. Design proposals (ranked by impact)

1. **Answer first, review after.** Scroll to the answer's first line when a run ends, and fold the review into one line under it. Files: `public/studio/js/conversation.js` (`completeAnswer`, `showOutcome`), `public/studio/js/peer-record.js`.
2. **A live progress line instead of a silent timer**: "Step 7 of ~12 · drawing the plan · about 4 min left". Files: `public/studio/js/progress.js`, `public/studio/js/run.js`.
3. **A short confirmation card**: only the questions, each with a default chip, and **Confirm** pinned at the bottom. Skip the card on complete briefs. Files: `public/studio/js/conversation.js` `confirmCard`, with `worker/agent/caps/confirm.js`.
4. **A live money meter** that refreshes on every `result` event. Files: `public/studio/js/account.js`, `public/studio/js/usage.js`.
5. **Upload progress**: a ring with percent, time left and cancel. Refuse executables and unknown binaries. Put PDFs on the canvas. Files: `public/studio/js/lifecycle.js`, `public/studio/js/composer.js`.
6. **A clear composer**: collapse attachment chips after 3, show at most one suggestion row, add a character counter from 7,000. File: `public/studio/js/composer.js`.
7. **Sources you can open**: page citations that open the PDF at that page, source cards named by title, the answer's page shown rather than the reviewer's. Files: `public/studio/js/evidence.js`, `public/studio/js/research-objects.js`, `public/studio/js/provenance.js`.
8. **One card per deliverable with a version switcher**, latest on top. Files: `public/studio/js/files.js`, `public/studio/js/board.js`.
9. **Framing that never clips**, and no auto-framing while the person is panning. Files: `public/studio/js/frame.js`, `public/studio/js/layout.js`.
10. **The person's language everywhere**, and no internal ids. Files: `public/studio/js/i18n.js`, `public/studio/js/conversation.js`, plus the server strings in `worker/agent/caps/confirm.js` and `worker/agent/acceptance.js`.
11. **A proposal bar with a before/after slider** and a label in the person's language, not covering the work. Files: `public/studio/js/options.js`, `public/studio/js/tray.js`.
12. **Explain the three composer controls once**, and never truncate them. Files: `public/studio/js/composer.js`, `public/studio/js/preferences.js`.

## 11. Limits of this record

- **One rater**: all scores are a single tester's judgement against the stated reasons.
- **Small sample**: one request per family for most families.
- **Load scope**: tested on an 18-core Mac, without the Linux namespace sandbox.
- **Caps changed between phases** (2 → 1 → 0.001 USD), so costs are not comparable across phases.
- **Not verified**: the AC-load and design-quality judgements. The s16 page citations and the s03 IFC contents were verified.
- **Tested commit**: 0391bba. The branch has since moved to 532e546.