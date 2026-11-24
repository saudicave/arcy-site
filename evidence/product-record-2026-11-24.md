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
