## 20. Stage 2: the agent on nineteen paid tasks, the owner's verdict, and the first fix cycle (2026-11-23 and 24)

**The measurement** (2026-11-23, `openai/gpt-6.2-sol`, one run per task, `results/tooluse_suite.stage2-baseline-2026-11-23.json`):
19 tasks, 11 passed (58%), 46 of 57 criteria met, 25 of 205 steps failed, USD 4.65. By area: a guide lookup and a
site's surroundings 2 of 2; site, plot, property, rules and reviews 2 of 8; building, render, quantities, daylight,
options, facade, board, picture and film 7 of 9. Times were taken on a loaded machine (Docker tests and another
project's local model ran beside them) and are upper bounds: 11 s to 17 min a task; the film alone took 1008 s.
Not measured: research, memory, project records, capture, video reading, delegation and the tool maker.

**The owner's verdict on the outputs** (he looked at every one): none is above 1 of 4 on a scale where 3 is what a
large consultancy would show a client. A first scoring by one model reviewer had put most at 2; it was too generous
and is not the record. A pass in this suite therefore says a capability was used correctly, not that its output is good.

**Causes found in the session records**, and what the first fix cycle (B1 of the project plan) did about them:

| Task | Cause | Fix |
|---|---|---|
| 11 guideline value with its page | the model sent `assess` with an empty parameter beside a plain question; all 31 lookups answered PARAMETER_NOT_FOUND | 089ab92 |
| c70 plot from its sketch | figures the sketch does not show came as empty texts and zeros and were refused as invalid figures | 12286da |
| c72 two typed land listings | a listing with no address was refused | 19cb481 |
| c40 a site of four plots | the one-plot guide was read and the site model never made; the urban guide never named `site_model` | 096dbb5 (guides) |
| answers | files linked as `sandbox:/mnt/data/...`, shown to the person as raw markdown (4 of 8 answers) | a90e89c |

The first two share a root: a model held to a strict schema fills every field it does not mean.

**After** (2026-11-24, the four tasks the fixes touch, `results/tooluse_suite.b1-after-096dbb5.json`, USD 0.70):

| Task | Before | After |
|---|---|---|
| 11 | fail, 33 steps, 104 s, $0.317 | pass, 1 step, 11 s, $0.076 |
| c70 | fail, 7 steps (5 failed), 95 s | pass, 2 steps (0 failed), 25 s, $0.054 |
| c72 | fail, no listing kept | pass, both kept at 3,500 and 4,000 SAR/m², 6 steps, 77 s, $0.287 |
| c40 | fail | fail: the urban guide was read this time, the plan was still drawn with code and `site_model` not called |

3 of 4 now, 0 of 4 then (McNemar p = 0.25: four tasks, one run each, say a direction and no more). c70 also needed
its scorer fixed: it read the recorded area, which is a record, as a number, so the task could not pass.

**Not fixed, and why.** c19: a review of a clause of the person's own document cannot be re-checked by measurement
(`review.record`'s re-check takes only the regional guideline data), so review, repair and re-check does not close
for a custom document. c38: the facade engine makes a plain grid and sends anything with depth to `model.build`; the
task asks for sun-breakers and expects the engine, so the task's criterion is wrong for the request, and shading
devices are a gap of the engine. c42 and c28 were not touched. Two of the stage 2 notes were wrong and are corrected
in the evidence record: Arabic file names are kept (the download carries the output's name), and "the agent goes
around its engines" held for c40 only.
