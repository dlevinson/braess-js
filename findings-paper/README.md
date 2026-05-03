# Findings paper draft

This folder contains a draft Transport Findings-style manuscript and reproducible output artifacts for the Braess Explorer model.

## Regenerate outputs

From the repo root:

```bash
node tools/export-findings-artifacts.mjs
MPLCONFIGDIR=/private/tmp/matplotlib-braess python3 tools/plot-findings-figures.py
```

The exporter writes:

- `data/default-scenario-comparison.csv`
- `data/elastic-outcome-space.csv`
- `data/summary.json`

The plotting script writes 300-DPI JPEGs and SVG copies in `figures/`.

## Manuscript files

- `main.tex`
- `references.bib`
- `figures/*.jpeg`
- `data/*.csv`

The body follows the Findings spine: `Questions`, `Methods`, and `Findings`.
