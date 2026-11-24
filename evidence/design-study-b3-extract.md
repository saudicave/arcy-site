# Design study B3, 2026-11-24: the lines the articles cite

An extract of the product's read-only study of cycle B3 ("The architectural mind: why the box, and what to change
first", `b3-design/DESIGN-MIND.md`, evidence of 2026-11-24). Lines are copied as written, except one model name,
replaced by a description in square brackets. Its section 7 (other companies) and model comparisons are left out.

<!-- source lines 1-7 (header) -->
# B3. The architectural mind: why the box, and what to change first

Written 2026-11-24. A read-only study for cycle B3 of `../PROJECT-PLAN.md`. No code was changed and no paid
model call was made. One free local trial of the existing library was run (section 2.3); its files were temporary
and are deleted. Every claim below names a file and line, or a session step. Session steps are written `c30 H25`:
the task, then the index of the entry in that session's `history` list. Things inferred and not read are marked
"inferred".

<!-- source lines 19-42 (section 0, the answer in short) -->
## 0. The answer in short

The box is not one fault. It is the cheapest path through the product, and three instruments wave it through.

1. **The form is fixed in the first program, as a list of room rectangles.** In c30 that is `H25`: seven
   rectangles that fill 10 × 12 m on the ground floor, six that fill it again above. Everything after it (19 steps)
   moves doors.
2. **The path that would give another form exists and stops at a diagram.** `arcy.massing` makes and measures
   courts, L forms and stepped sections, and c42 used it. Nothing turns such a mass into a building. To build one
   the agent must hand-fit rooms, roofs and parapets to a quarter of a wall thickness. In my own free trial of a
   court house with the existing calls, three of four attempts were refused (section 2.3).
3. **The instruments lean towards the box.** In c42 the measured ranking put the compact two-storey block first
   (0.647 against 0.429 for the court house), and the box went forward as one of the "two to develop" (`c42 H45`).
   In c30 the model was reported "plain: 6 of 6" three times and the agent answered in a sentence of its log,
   which the note itself allows. The one gate that asks for concepts fired after the building was finished and
   was passed in the same call.

The earlier design-intelligence plan (E1, 2026-11-19) diagnosed most of this. Its first half was built (mass,
measures, gates). Its second half was not (the building blocks that carry a mass into a model, the knowledge
library, refinement, the benchmark), and the half that was built has never been run through to a building in a
paid session. So B3 does not need a new idea. It needs the missing bridge, three corrections to instruments that
already exist, and a budget in which the method can finish.

---

<!-- source lines 44-48, 49 (section 1.1, the request; the model's name replaced) -->
## 1. Where the box comes from

### 1.1 c30 step by step

Request (Arabic): "build me a model of a two-storey house 10 × 12 m, majlis, living room and kitchen below, three
bedrooms above". Model [the one measured], cap $1.00, spent $0.80, 19 steps, 5 failed.

<!-- source lines 51-52, 59-60 (section 1.1, steps H25 and H29) -->
| Step | What happened | What it fixed |
|---|---|---|
| `H25` `compute_run` | The building: `b.rooms('Ground', G)` and `b.rooms('First', F)`, both lists spanning 0.125 to 9.875 by 0.125 to 11.875. The only move in the outline is the entrance hall starting 0.65 m further in. Windows are placed room by room. Fails (a door wider than the shared wall). | **The form is fixed here.** The program has the shape of the bim guide's own example (`worker/agent/skills/bim/SKILL.md:50-62`): a house of "outer size 12 x 10 m" with Majlis, Living, Kitchen, WC and Stair hall, layered external walls, doors in a loop, a window per room. The example is nearly the brief. |
| `H29` `compute_run` | Patch by string replacement; the model is written. `bim.check` prints: "the building is plain: 6 of 6 absences hold … Answer them in the form …, or name plainness as the decision", and "the windows follow no order" on three sides. | The measure sees the box at once. |

<!-- source lines 74-75, 84-87 (section 1.2, c42: the three ideas and the ranking) -->
### 1.2 c42 step by step


| `H21-H27` `compute_run` × 3 failed | `massing.Site(..., street_width=None, setbacks={}, rules={})` refused; patched to `street_width=15` (the value in the guide's example, `design/SKILL.md:37`); then setbacks refused; patched to zero on every side. | The brief gives no street width or setback. The guide says "never from memory" (`design/SKILL.md:14`); `regulation_check` was not called; the library refuses `None` but accepts 0. So the site entered the form as "no setbacks, no rules, no neighbours". `site.reading()` was never called. |
| `H30` `compute_run` | Three schemes written by hand, one variant each: A a ring round an 8 × 7.5 m court with a partial upper floor; B a street wing with a one-storey arm; C a 12 × 12.5 m block of two equal floors. `massing.search` (200 free variants a parti, `massing.py:986`) not used. | Three fixed prisms. The search that costs nothing was skipped. |
| `H35-H37` `design_option` × 3 | Measured by the server: A court / stepped, plain 1 of 6; B L / stepped, 3; C compact / flat, plain 5 of 6. | The measures tell them apart correctly. |
| `H42` `design_compare` | Three different ideas. **Ranking by measures: C 0.647, A 0.429, B 0.387, `robust: true`.** The critic (asked between C and A, both orders) prefers A. `forward`: C and A. | The instrument leads with the box. |

<!-- source lines 93-98 (why the ranking leads with the box) -->
Why the ranking leads with the box (`critique.js:354`, `massing.py:880-915`, `massing.py:317-357`). Seven
objectives, unweighted. Three reward compactness directly: `outdoor_room_m2` (the one largest rectangle of open
land, so a 60 m² court counts for nothing beside a 180 m² rear strip), `envelope_ratio` (lower is better) and
`strips_share`. Two were ties (daylight 1, 1, 1; winter sun 10.5 h each). Shade is measured only on that one
rectangle and was 3 to 6% for all. Only `plain_count` pulls the other way. Privacy, the reason for a court in
Riyadh and the reason the critic gave, is not measured at all. The same lean is in the library's own demonstration

<!-- source lines 155, 168-174 (section 2.3, the free trial) -->
### 2.3 A free trial: how hard is a court house with today's calls?

Four programs, one usable result, and that one mis-measured. The refusals are correct and well worded; the point
is the price. For a model that pays 2 to 7 cents a program and has 30% of a dollar before it is told to deliver,
a stepped court house costs five or six programs and a box costs one. `b.rooms` can express the plan (it accepts
any connected set of rectangles and walls round a court, `bim.py:1271-1330`). What is missing is everything a
change of level needs: the roof of the lower part, its parapet against the upper wall, the terrace, the court's
edge. That is the bridge.


<!-- source lines 177, 182-183, 191 (section 3, the earlier plan: building blocks) -->
## 3. The earlier design-intelligence plan (E1): what was built, what was dropped


| E1 step | Proposed | State today |
| 6 Building blocks | `rooms_in`, `court`, `double_height`, `terrace`, `loggia`, `shade`, `screened_opening`, `entrance`, `boundary_wall`, `roofscape`, `stair_core` | **Not built.** None of the eleven is in `bim.py`. This is the bridge of section 2.3. |

<!-- source lines 200-208 (section 3, second reading) -->
before the rooms and then cannot become them.

Second, **no paid run has taken the staged method from masses to a building.** RESULTS.md holds the four villa
proofs (all before the method), the library's own demonstration with no model call, and c42 and c45 (masses
only). E1's milestone M1 was never run. So it is not known whether the built half works; cycle B3 would be its
first measurement. The four villa attempts in the plan's risk list are all from 2026-11-18, before any of this
existed. The third of them is still the only time the box was beaten (3 planes, 2.4 m deep, entrance marked,
juror 4.38 of 10 against 2.38), and what changed before it was a tool that let the agent see its building and
a check that named the box in every result, not a guide (RESULTS.md 602-624).

<!-- source lines 219-230 (change 1, the bridge) -->
### Change 1. The bridge: a mass becomes the building's shell in one call

- **What changes.** One function in the sandbox library (in `arcy.massing` or a small module beside it, not in
  `bim.py`, which is already 3,700 lines): given a `Scheme` and a `Building`, it writes what the mass promised and
  nothing more. For each storey: the external walls round the storey's outline, courts included
  (`walls_from_outline` exists); the floor slabs with their voids; a roof with its parapet on every roof level,
  already fitted against the walls that rise beside it; a terrace where the floor above steps back; the boundary
  wall with its gates where the scheme has one. It returns, per storey, the rectangles inside the walls for the
  agent to divide into rooms with the existing `b.rooms`. It holds no design decision: every figure comes from
  the scheme the agent wrote. Then `bim.check` already compares the model's measured form with the stated parti.
  With it, fix what attempt 1 of section 2.3 found: a court made of rooms must be read as a court.
- **Why it should work.** It makes the non-box as cheap as the box: one call instead of five or six programs

<!-- source lines 340-346 (an honest limit on the target) -->
An honest limit on the target. Changes 1 to 3 aim at the absence the owner named: the architecture. They can make
the form an idea, in plan and in section. A 3 from the owner also needs the facade to have depth and order, the
drawings of B2 and the context of B4. The third villa was not a box and its juror score was 4.38 of 10,
"competent but ordinary". So the first cycle should be judged on a narrower question the owner can answer by eye:
**is there an idea in the mass, the plan and the section?** If the answer is yes and the score is 2, the cycle
worked and the rest is B2 and B4. If the answer is no after changes 1 to 3, the plan's rule applies: show the
owner the alternatives before spending more.

<!-- source lines 350-372 (section 5, the test set and the order of spending) -->
## 5. The test set for B3

Five briefs. Each is two messages: the brief, then "yes, go on with your assumptions", as the stage 2 tasks do.
Each gives a real site, because a brief with no site cannot test whether the site reaches the form. The owner
judges one fixed set of pictures a brief: the street view at eye height in its context; the plot from above; the
ground plan; one section cut through the idea; the idea in one sentence with its diagram.

| Id | Brief | A 3 of 4 must show, by eye |
|---|---|---|
| T1 | **Corner villa, Riyadh.** Plot 25 × 30 m, a 20 m street on the north, a 12 m street on the east. A family of six; a majlis for guests with its own entrance; about 450 m². | Two street faces that differ, and a corner that is resolved, not a blank side. Guests and family arrive from different sides; no guest crosses family rooms. A private outdoor room no street sees. More than one roof level, or a void. The south and west glass shaded by the form. The boundary wall and gates drawn as part of the design. |
| T2 | **Courtyard house.** Plot 15 × 25 m, street south, two-storey neighbours on three sides, Riyadh; about 300 m². | The court is the heart: the main rooms look into it, and the plan cannot be explained without it. Few, small openings to the street. A bent entrance: no view from the door into the house. The court's shade on a summer afternoon measured and said. A roof terrace screened from the neighbours. |
| T3 | **Small neighbourhood mosque.** 150 worshippers, a corner plot 30 × 30 m on the street grid, Riyadh. | The prayer hall turned to the qibla, which ARCY computes and states, and the leftover geometry between hall and plot made into a forecourt, not left as slivers. Ablution on the way in. A separate way in for women. A qibla wall that reads from outside. Light that is not ordinary windows. A different idea from a house: rows, not rooms. |
| T4 | **Narrow town house.** Plot 8 × 25 m, party walls on both long sides, the only street on the west; three storeys. | The section does the work: a light well, court or stair that brings daylight to the middle of a 25 m depth. The west face screened or recessed, not glazed flat. Front and back that differ. A roof that is used. |
| T5 | **The regression: c30's request, word for word.** "ابني لي نموذج لبيت من دورين 10 × 12 م، فيه مجلس وصالة ومطبخ تحت، وثلاث غرف نوم فوق." | Before and after on the same request, as the owner's rule requires. Even inside 10 × 12 m and with no site given: the assumptions about plot, street and north are stated and visible; the entrance is recessed and shaded; the upper floor steps or holds a terrace; openings stand on shared axes; the roof line is not one flat parapet; it does not measure "plain: 6 of 6". |

Order of spending. Stage 0, free: the tests and the three clay shells of change 1. Stage 1, about $0.30: the
routing check of change 2. Stage 2, about $2.50: T1 alone, judged by the owner. Stage 3, about $10: T2 to T5,
only if T1 shows an idea. Every figure here is an estimate from the earlier runs' costs, to be replaced by what
the runs cost.


<!-- source lines 378-381 (section 6, first item) -->
## 6. What I could not determine

- **Whether the staged method works at all.** No paid run has gone from masses to a building since it was built.
  Everything in section 4 is reasoned from two sessions, four older proofs and one free trial.
