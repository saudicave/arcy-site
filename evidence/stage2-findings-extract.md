# Stage 2 findings: the lines the articles cite

An extract of the product's running record of the stage 2 measurement (`stage2/FINDINGS.md`, evidence of 2026-11-23,
with entries of 2026-11-24). Lines are copied as written, except where a model or provider is named: the name is
replaced by a description in square brackets.

<!-- source line 43, batch 2, the first-pass quality note (its last sentences) -->
The house design itself is a box: the programme is solved (majlis by the entrance, away from the family hall), the architecture is absent.

<!-- source lines 51-53 -->
## The owner's verdict (2026-11-24), which governs
After seeing every output in the gallery: no output is above 1 of 4; all are at 1 or below. The first-pass scores above ([one model reviewer]: mostly 2, two at 3 visually) were too generous against the stated standard (a world-class consultancy). [A second model reviewer], re-reading the same outputs, agrees with the owner: the drawings carry two overall dimensions and no grids, the buildings are boxes in an empty desert, the boards are mostly empty, and the two attractive pictures are not tied to a measured design.
The owner also ruled that batch 3 is not needed: the problems are clear. Measurement stops at 19 tasks, about $4.64 of $30; the rest is kept for before/after runs on the fixes. Not measured, and said so: research, documents beyond one lookup, memory, project records, capture, video reading, delegation and the tool maker (gaps F1 and F4 of the roadmap stay open).

<!-- source lines 55-64 -->
## Corrections after reading the code (2026-11-24, cycle B1 diagnosis)
Two of the cross-cutting findings above were wrong or too broad, and the real cause of two more is now known.

- **Finding 6 (Arabic file names lost) is wrong.** The output's name keeps the Arabic («مقارنة-أراضي-الرياض.csv») and is what a download carries (`worker/agent/download-name.js`); only the file on disk has an ASCII name, by design. I had read the disk name.
- **Findings 4 and 7 (the agent goes around its specialised engines) are too broad.** For c38 the facade engine's own description says it makes a plain regular grid and that anything with depth is to be built with model.build; vertical sun-breakers have depth, so the agent did what it was told. The task's criterion is wrong for that request, and the engine not covering shading devices is a product gap, not agent behaviour. c40 (site.model never linked) still stands.
- **One root cause behind tasks 11 and c70: a model held to a strict schema fills what it does not mean.** [The model measured] sends every optional field. `capabilities.js meant()` already drops empty strings, nulls and objects of such, but not an object that also carries a zero or a default:
  - task 11: `assess: {parameter: "", width_m: 0, height_m: 0}` put guideline.lookup in assessment mode, so all 31 lookups answered PARAMETER_NOT_FOUND. Fixed in 089ab92 with a behaviour test.
  - c70: each figure the sketch does not show came as `{value: "" or 0, page: 1, box: [0,0,0,0], as: "printed"}` and was refused as an invalid figure (municipality, neighbours, street widths of sides with no street, every planning figure).
  This matters beyond these two: ARCY's rule is that any model may answer, and this is how [one provider's] route behaves.
- **c72:** property.study keeps a listing only with its address (provenance and the sites' terms). A listing the person typed has none, so it is refused. To keep: a listing with no address whose price and area are in the person's own words, recorded as said by the person.
