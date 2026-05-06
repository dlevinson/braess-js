# braess

Browser-only JavaScript web app for exploring the Braess paradox, elastic demand, and the link between higher generalized cost and reduced equilibrium demand.

## What It Does

- Runs as a direct-open, browser-only STREET-style app from `web/index.html`.
- Loads the built-in canonical Braess network from GMNS-style CSV preset files.
- Lets users edit the built-in network directly by clicking links, dragging nodes, and changing link-specific lanes, capacity, length, speed, and link performance functions.
- Solves static user equilibrium without and with the candidate Braess link.
- Supports fixed demand and one elastic-demand model: inverse demand `C(q) = A - B q`.
- Provides a demand-curve editor: in fixed-demand mode, Initial trips is fixed; in elastic mode, click the axes to move the inverse-demand intercepts.
- Reports equilibrium cost, equilibrium demand, total travel time, consumer surplus, total welfare, Braess-paradox flag, and reduced-demand flag.
- Draws the editable network with a scale, link-flow width legend, and selectable link/node properties.
- Runs in-browser parameter sweeps, draws a generic two-parameter heatmap, and draws the 3D elastic-assumption outcome space.
- Exports sweep rows as CSV and graphics as SVG or PNG where supported.

This version does **not** expose CSV upload in the UI. The GMNS-compatible CSV files are used for the built-in preset and as source material for later extension.

## Run Locally

Install dependencies and run the Vite dev server:

```bash
npm install
npm run dev
```

Build and test:

```bash
npm run build
npm test
```

STREET-style web runtime:

- Run `npm run build`.
- Open `web/index.html` directly in the browser, the same way the other STREET web apps are launched.

Optional Vite production build:

```bash
npm run build:vite
```

## Built-In Preset Files

The app starts from the canonical Braess network stored in GMNS-style CSV files under `public/presets/`:

- `braess_node.csv`
- `braess_link.csv`
- `braess_demand.csv`

The parser still understands the GMNS-style fields used by those files, including node coordinates, link endpoints, length, capacity, free speed, lanes, cost-function parameters, and candidate-link flags. In the current app, users change those values through the network editor rather than by uploading replacement CSV files.

## Equations

Fixed demand:

- Solve static Wardrop user equilibrium with Method of Successive Averages.
- The browser app includes a fuller model write-up at `web/model-notes.html` after `npm run build` or `public/model-notes.html` in source form.

Link costs:

- Affine: `t(x) = a + b x`
- BPR: `t(x) = t0 * (1 + alpha * (x / capacity)^beta)`

Elastic demand:

- Inverse demand: `C(q) = A - B q`
- Outer loop finds `q` such that network equilibrium generalized cost matches inverse demand.

Consumer surplus:

- `CS = A q - 0.5 B q^2 - C_eq q`

Total welfare:

- `W = CS - total system travel time`

Braess test:

- paradox if `cost_on - cost_off > tolerance`

Reduced-demand bridge:

- reduced demand if paradox is true and `demand_on < demand_off`

## Reproducing the Built-In Braess Example

1. Start the app and click `Load Braess Example`.
2. Keep the default affine variable links at `b = 10`, constant links at `45`, candidate link at `0`, and fixed demand at `6`.
3. Click `Solve both cases`.
4. The OFF equilibrium should be lower than the ON equilibrium, reproducing the classic paradox.
5. Switch demand mode to `elastic` with default `A = 180` and `B = 30`, then compare again.
6. The ON scenario should both raise equilibrium cost and reduce equilibrium demand.

## Findings Paper Artifacts

The repository includes a short Findings-style paper draft and reproducible exports under `findings-paper/`.

Regenerate the paper data and figures from the repo root:

```bash
node tools/export-findings-artifacts.mjs
MPLCONFIGDIR=/private/tmp/matplotlib-braess python3 tools/plot-findings-figures.py
```

Compile the paper from `findings-paper/`:

```bash
pdflatex -interaction=nonstopmode -halt-on-error main.tex
bibtex main
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex
```

## Citation

If you use Braess Explorer or the accompanying paper artifacts, please cite this repository. GitHub should display citation metadata from `CITATION.cff`.

```text
Levinson, D. (2026). Braess Explorer: Browser-only Braess paradox and elastic-demand model. https://github.com/dlevinson/braess-js
```

## License

Software code in this repository is licensed under the MIT License. The Findings paper, figures, exported data, and other research artifacts in `findings-paper/` are licensed under Creative Commons Attribution 4.0 International (CC BY 4.0), unless otherwise noted.

## Project Layout

```text
src/
  app.js
  main.js
  state.js
  ui/
  model/
public/
  presets/
  model-notes.html
findings-paper/
web/
tests/
```

## Limitations

- One OD pair at a time.
- Static user equilibrium only.
- No CSV upload UI in the current version.
- Simple-path enumeration is suitable for small research examples, not large production networks.
- No dynamic assignment, no multi-OD equilibrium, no backend.
