# Where every file in data/ comes from

All copied from the product repository `ARCY-Official` at commit `15c611c` (2026-11-24). Never edit them here:
copy a new version from the product and rebuild. The results page reads every `results/*.json` in date order,
so a new measurement appears by dropping its file in.

| File | Source in ARCY-Official |
|---|---|
| `results/tooluse_suite.stage2-baseline-2026-11-23.json` | `benchmarks/arcy-bench/results/` (same name) |
| `results/tooluse_suite.b1-after-096dbb5.json` | `benchmarks/arcy-bench/results/` (same name) |
| `RESULTS-section-20.md` | `benchmarks/arcy-bench/RESULTS.md`, lines 1668-1720 (section 20) |
| `narrative.json` | written by hand from `RESULTS-section-20.md`: the owner's verdict, causes, limits |

**Removed on copy (2026-11-24):** `summary.kept` and `summary.chain.file` from
`tooluse_suite.b1-after-096dbb5.json`, which held local paths of the owner's machine. Nothing else changed. The
guard fails if any file in data/ or dist/ contains a local home path.
