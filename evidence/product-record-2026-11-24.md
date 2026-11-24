# The product record of 2026-11-24: the lines the "what sets ARCY apart" section cites

Extracts from the product repository (`ARCY-Official`), copied on 2026-11-24. Each block gives the commit and the
words of its message that the site relies on, copied as written; lines naming a third-party search service or a
model are replaced by a description in square brackets, and author trailers are left out. Two counts were taken
from the product's own tools on the same day and are recorded with how they were taken. The site may say what is
below and no more; where a block says something is not done, the site says so too.

## Counts taken on 2026-11-24 (branch `generalist-agent`, commit `d9dd0de`)

- **71 capabilities.** The coverage map of the tool-use suite (`benchmarks/arcy-bench/tooluse_suite.mjs --coverage --json`)
  reads the registry the agent itself assembles, with every optional part switched on, and returns 71 rows, one
  per capability.
- **34 guides.** The agent's guides live one to a folder under `worker/agent/skills/`; there are 34.

## The host bridge (commits `3850036`, `bb254b5`)

> merge: the host bridge: one protocol, ARCY's side and a Blender connector run for real. A closed protocol with
> pairing over a local channel; every change a proposal applied as one undoable step. The Rhino, Revit, AutoCAD,
> QGIS and ArcGIS adapters are specified, not written.

> feat(host): the connector core and the Blender add-on, run for real in Blender 5.2 without a window. [...]
> Measured in Blender 5.2.1 headless: read the scene, apply a five-operation proposal, read it back, a failing
> proposal rolled back with no undo entry, one Undo reverses all five. The sidebar panel was not seen in a window.

## The daylight engine against an independent solution (commit `887fca4`)

> merge: engines checked against references; daylight now within 3% of an independent solution. Light through a
> window integrated over the pane and reflected light by radiosity: the error at seven points went from
> -14%..+48% to -0.9%..+2.8%. [...] The Radiance comparison runs only in Docker and is not yet rerun.

## The check before "done" (commit `e106b64`)

> feat(agent): nothing delivered is done without its check; sheets are read back by the server. [...] each output
> a request made gets the check that applies (sheet read back, model accuracy, fidelity, looked at, report read
> again); an answer claiming done over an unchecked or failing output rides on the one answer-check bounce [...]
> compute.run reads back every sheet with no consistency report against the newest IFC in reach.

## Research in the open (commits `aaa3a91`, `44b0575`, `7c21ef2`)

> feat(research): ARCY's own search engine first, no one else's key. web.research's page backend takes a finder:
> ARCY's own [search engine instance] is used first, [a third-party search key] only if set. Results are kept to
> public pages before anything is opened; no key leaves the server.

> feat(research): web research with any model, and a third scholarly index. [...] papers.search adds [a third
> scholarly index]: one-line summaries and influential citations, merged by DOI.

> merge: research without anyone's key, and a browser the agent drives where the person can watch. [...]
> browser.open/read/follow/scroll/find drive a private headless browser through a proxy that admits only public
> addresses, every step shown with its screenshot.

## Subdivision plan review (commits `40a7a96`, `fa5db50`)

> merge: the foundation of subdivision plan review (phase C): a sourced rules register and a reader for someone
> else's plan. 93 rules with their documents, pages and Arabic sentences (78 read, 3 snippets, 12 unverified, 6
> conflicts left for the owner); GeoJSON and DXF read into one record; eight checks measured, planted violations found.

> feat(plan-review): plan.review reads a subdivision plan someone else drew and reviews it against the planning
> register. [...] each row comes back with its rule, document and page, measured and required values and verdict
> [...] A PDF is not read yet. Draft review, not an approval.

## The generative interface (commit `c5fd78e`)

> merge: generative UI: the agent composes its view from twelve trusted components, and the person's act comes
> back to it.

## Sub-agents in parallel (commit `0b4dd6e`)

> merge: delegation runs sub-agents in parallel with their own budgets, visible progress and writes kept apart.
> Up to four sub-agents per call, an equal share of what money is left each, progress events with identity and
> colour slot, same-name outputs kept apart, one stop signal.

## Free-form surfaces (commit `8f33760`)

> feat(freeform): a free-form engine: NURBS surfaces, fields, panels, the shell in the IFC, out to Rhino and STEP.
> [...] export to .3dm and STEP [...] Not done: [...] the two evidence designs and clay renders were not made.

## Not said here

None of these blocks measures how good the agent's outputs are. That is `data/RESULTS-section-20.md`: 11 of 19 paid
tasks passed, and the owner's verdict put no output above 1 of 4.


## Landed later on 2026-11-24: the capability commits (messages as written, attribution lines removed)

From the product repository's history. The site may describe these by what they do; counts in the text (98 works, eleven moves) are read from these messages.

### b06672a feat(design): a reference library of 98 built works with licence-checked pictures, the critic shown the bar, and four fixed presentation layouts

image.references picks precedents by type, climate and quality from worker/agent/references
(158 Commons pictures re-checked by scripts/check-references.mjs) and image.fetch brings them in;
design.critique takes references; present.template fills a concept board, a design board, a
drawing sheet and a report page in ARCY's monochrome type system.


### d3bae4d Merge worktree-agent-a8eb7877d8c5bf57d: picture check, independent judge before delivery, the judge leads among options that meet the conditions


### 9259210 feat(design): measures are conditions and the independent judge's order leads what goes forward

design.compare no longer ranks options by their measures. Each measure is a
condition met or failed with its number (design-ranking.js conditionsOf:
hot glass shaded >= 0.5, an outdoor room >= 20 m2 with >= 0.1 in summer
shade, daylight >= 0.7, programme within 0.1; a plain block fails unless the
person weights compactness). Among the options that pass, an independent
model orders them as architecture, shown all at once in two orders and
summed (design-judge.js); its first and the next different idea go forward.
The measures stay as a table and as trade-offs from the judge's first.

The against_measures gate and design.option's `criterion` are removed; the
one_idea and concepts gates stay. The design guide and the tests that
pinned the ranking are updated.


### 97a91a2 feat(massing): the moves of leading offices as parameters of a scheme, measured, searched and built into IFC

massing_moves writes twist, taper, lean, stack, cascade, cantilever, carve, slot,
diagonal_court, roof (a sloped or folded plane) and landform with the Scheme's own
parts; massing_read measures each from the storeys and surfaces; massing_surface holds
roof planes and landforms as flat facets with their rules, shadows and drawings;
shell_surface writes them into IFC. The parti vocabulary gains 'move' (massing_ideas
and critique-ideas.js, held equal); a move both forms lack is left out of the distance,
so forms without moves compare as before. The design guide's third idea is built on a move.


### 9004d73 Merge: environmental engines validated against NREL SPA, CIE 171, Radiance and ASHRAE 140


### 40c9eaa fix(environment): engines held to published references; daylight glass by its angle, facade ground in shadow, routing to the validated engine

- arcy.daylight: each ray through a pane weighted as Radiance's glass (glass_share); room averages now within 3% of
  Radiance (were +4.5 to +10%); sky component within 0.6% of CIE 171:2006 tests 5.9 and 5.11.
- arcy.sun.radiation: ground reflection counts the shadow on the ground (ground_light); facades within 2.2% of
  Radiance per orientation (north was +14.5%).
- arcy.solar held to NREL SPA over 1990-2100 (0.015 deg max); ISO 13790 inside ASHRAE 140 case 620.
- arcy.comfort reads weather through sun.read_epw (one EPW parser).
- Validation table in docs/ENVIRONMENT_VALIDATION.md; accuracy in docstrings and the sun, daylight, energy skills;
  skills and environment_simulate send the agent to the validated engine before compute_run, with a test.


### 09114ee feat(engines): the numbers engines held to worked examples; a development appraisal; cooling with one answer; footings on the net pressure

- arcy.appraisal (new): NPV, IRR with every root, XNPV, XIRR, PMT, DSCR, yields, VAT, RETT, the white land
  fee, a monthly development cash flow and the residual land value; each figure with unit, method and source.
- arcy.frame: footing() on the net allowable pressure, size(wall_load=), section checks moved to
  arcy.frame_sections (frame.py 900 -> 734 lines, out of debt).
- arcy.services: cooling on the layout's SBC 602-1 envelope and 0.5 air changes, roof and envelope= inputs;
  the IPC bathroom group (6 DFU).
- benchmarks/arcy-bench/engines_worked.py: 30 worked examples (Excel, StructurePoint, ACI, IPC, hand
  take-off), run by tests/agent-engines-worked.test.mjs; RESULTS.md section 24 before and after.
- Guides: feasibility teaches the appraisal; services sends AC sizing to the engine and asks the envelope
  (real-user test s11, 1.29 TR); frame passes wall_load to size; energy says its peak is not plant sizing.


### d11c34d feat(delivery): outputs are cross-checked against each other before delivery

Drawings, bill, feasibility study, pro-forma and regulation inputs are held to the current model, and the answer's quoted figures to the measured ones; each mismatch goes back to the agent with both numbers and their sources, then to the person.


### 72c50d4 feat(regulations): every Saudi rule carries its source, edition and last verification; a warning report lists the stale and undated


### 65d228d feat(render): the design in its real surroundings, from open data and nothing invented

site.context keeps a scene (arcy.context_scene): OpenStreetMap footprints and heights,
heights OSM lacks estimated at 7 m and counted, streets with class widths, Terrain Tiles
heights and the WorldCover ground picture. model.render with site {real} builds it in
Blender (render_context.py): neighbours in massing white, estimated ones grey, the real
sun, a street preset. The caption and metadata list each source with date and licence.
/fidelity whole_frame measures the surroundings, sky and unclassed pixels as classes.
Google 3D Tiles and Earth are not used: their terms forbid it. Offline Riyadh fixture.


### 9b7e8ec feat(security): what the agent reads is fenced as data, hidden text is removed and said, and content cannot send or keep

worker/agent/untrusted.js: results of outside capabilities (documents, pages, search, browser, MCP, host labels,
sub-agents' reports) are fenced by first and last JSON keys only the harness writes (asData drops every fence mark
from content); hidden HTML text (comments, hidden elements, white or zero-size text, alt text) and invisible, white or
sub-point PDF text (services/vision/hidden_text.py) are kept out of the text and reported as hidden_text; PDF metadata
is never read; the registry refuses a send or keep that carries an e-mail, long token, address or eight copied words
from outside material and not from the person. tests/security-injection-corpus.test.mjs: six cases with a model that
obeys the content; nothing is sent, kept, accepted or deleted. Threat model section 2a; LLM01 updated. Open: text read
from a picture's pixels, and paraphrased instructions.


### e64dd80 feat(agent): a smart intake before substantial work, remembered preferences with origin and a switch, and the real-user fixes to confirmation, language and uploads

- situation.confirm takes intake: at most three ChoiceQuestions (budget, priorities, style, deliverables), each with its default and kept as a view; intake.js refuses a topic the request answers, a small request and a short cheap plan, and reminds the agent only for substantial work with topics open
- a complete brief is not stopped for confirmation; the card text is in the summary's language; the done-means table shows no ids, method names or English notes
- memory entries carry a topic, an origin (settings, conversation, intake) and an off switch; the brief says they are remembered, not said now; the routes move to memory-api.js; the export carries the memory; schema in docs/agent/MEMORY.md
- attachments that are programs or whose bytes do not match their name are refused (attachment-check.js)
- Studio: intake ticks and answers sent to their views; Settings › الذاكرة shows topic, origin, the person's words and a switch




## Also on the integration branch on 2026-11-24 (messages as written, attribution lines removed)

### 1ad3d2d feat(models): two seats, a strong model and a fast one for steps known to be mechanical; the cost cap is hard before a call

The person may choose a fast model beside the chosen one (setting fastModel, Studio Settings > ARCY, or fastModel in
the ask body); the default is the same model in both seats. models.js decides who may sit there (same payer, sees
pictures, priced, not retired) and writes the gateway's seat table; worker/providers/seats.js routes a call that names
seat 'fast' and counts every call by seat; the ledger writes agent_usage.seat (drizzle/0013) and usage has bySeat.
Only reader, surveyor and researcher sub-agents and the research-page summary sit in the fast seat; the lead never.
Measured offline on the recorded paid runs (seat_split.mjs, RESULTS.md section 24): 34 of 191 lead calls mechanical,
21% predictable before the call; ceiling saving 10.7% on [a fast model], nothing on these records as shipped.

The real-user test (problem 5) saw single calls at 13 to 74 times a USD 0.001 cap. The gateway now refuses a call whose
input and a 256-token reply cannot fit in what is left; only the loop's closing turn answers from its kept reserve, and
the loop writes its own closing note when even that is refused. Tests that pinned the old overrun now pin the refusal.


### e64dd80 feat(agent): a smart intake before substantial work, remembered preferences with origin and a switch, and the real-user fixes to confirmation, language and uploads

- situation.confirm takes intake: at most three ChoiceQuestions (budget, priorities, style, deliverables), each with its default and kept as a view; intake.js refuses a topic the request answers, a small request and a short cheap plan, and reminds the agent only for substantial work with topics open
- a complete brief is not stopped for confirmation; the card text is in the summary's language; the done-means table shows no ids, method names or English notes
- memory entries carry a topic, an origin (settings, conversation, intake) and an off switch; the brief says they are remembered, not said now; the routes move to memory-api.js; the export carries the memory; schema in docs/agent/MEMORY.md
- attachments that are programs or whose bytes do not match their name are refused (attachment-check.js)
- Studio: intake ticks and answers sent to their views; Settings › الذاكرة shows topic, origin, the person's words and a switch


### c5fd78e merge: generative UI: the agent composes its view from twelve trusted components, and the person's act comes back to it

The registry now adds both the 'next' hint and the 'present' hint to a result; ui.show is offered beside
situation.confirm; one skill_read limit (3200) holds the freeform, host and showing guides.


### 39ae908 feat(agent): generative interface: the agent composes views from trusted components, as data

ui.show (one capability in the one registry) takes a view of 1 to 5 components from a fixed vocabulary of
twelve (ChoiceQuestion, OptionBranch, DataTable, ParameterPanel, PlanChecklist, ProposalGhost, Form, Gallery,
MetricStrip, Progress, ApprovalBar, Text), validated on the server (ui-contract.js): unknown components and
props refused with the allowed list, typed and bounded props, text that is text, only ids and addresses the
session holds, honesty labels set by the server. A view that waits ends the request; the person's act comes
back through POST views/:vid/events and reaches the agent in their next turn as structured brief lines;
a slider bound to a study re-runs massing.envelope live with no model call (views/:vid/live). Results carry a
`present` hint, the showing guide teaches when a view beats words, and a plain-text question with 2 to 5
listed answers is offered back as choices (ui-offer.js). A small dependency-free renderer and a static demo of
eight recorded views live in public/generative-ui/, outside the Studio's JavaScript budget.


### 5efe0aa feat(studio): the front door as one raised field and three example cards; the agent's generative views hosted as cards in the conversation; the rail in its own stylesheet


### 276babd feat(design): design system v7, subtraction: near-white surfaces, neutral greys, no frames, one translucent elevation level for what floats, the system face on Apple devices, quiet motion


### 083598e docs(rule): human-crafted, never machine-looking: every output including heat maps and charts passes through crafted styles and the professional graphics toolbox



## Not merged on 2026-11-24 (so the site says "coming")

### 779d342 feat(studio): the run's place in the heavy-job queue, quietly beside its clock («دورك الثاني، حوالي دقيقة»), only while the server says it; the coach mark never takes a press meant for what lies under it (branch, not merged)

