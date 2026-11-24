# Evidence the articles cite

Every number in an article is written `[[number|path]]`, and the guard (`scripts/guard.mjs`) needs that path inside
this repository. This folder holds only what the draft articles' numbers need, copied from the product repository
(`ARCY-Official`) on 2026-11-24 under neutral names: no provider or model names in any path. The build copies the
folder to `dist/evidence/` so a reader can open the source of a number.

| File | From the product repository | What was changed |
|---|---|---|
| `plan-2026-11-24-extract.md` | `.sites-runtime/evidence/2026-11-24/PROJECT-PLAN.md` (in Arabic) | Only the cited lines, copied as written, source line numbers given; `[…]` marks a third-party name and two uncited decisions removed inside kept lines. |
| `stage2-findings-extract.md` | `.sites-runtime/evidence/2026-11-23/stage2/FINDINGS.md` | Only the owner's verdict, the corrections and one quality note; model and provider names replaced by a description in square brackets. |
| `design-study-b3-extract.md` | `.sites-runtime/evidence/2026-11-24/b3-design/DESIGN-MIND.md` | Only the cited lines, source line numbers given; one model name replaced; section 7 (other companies) and model comparisons left out. |
| `second-model-trial.json` | `benchmarks/arcy-bench/results/` (the second-provider run of 2026-11-24) | Trimmed to id, name, pass, steps, failed steps, seconds, stop and refusal; costs, names and error texts removed; counts computed from the rows. |

`product-record-2026-11-24.md` holds the commit messages and two counts behind the "what sets ARCY apart" section of the
home and Product pages, with what each says is not done.

`company-story.md` is not an extract: it records the founder's account that the About page tells, and says which
parts of that page are testimony and which are measured.

Also cited, already in this repository: `data/RESULTS-section-20.md` (the product's results, section 20) and
`content/GUARD.md` (rule 4).

Factual sentences without a number rest on the same files, on the product's working agreement (`AGENTS.md`) and on
its commits: the five repairs (089ab92, 12286da, 19cb481, a90e89c, 096dbb5), the drawing guide (ee4f781), the
provider adapter (2ecdb76, 961daa3), and the bridge from a mass to a building's shell, built after the study
(ce8ee54, with 93f6c83 reading a court of walls as a court).

The drafts and their authors' guard self-checks are kept in the product's evidence of 2026-11-24 (`articles/`).
