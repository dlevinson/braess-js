# braess

Browser-only JavaScript web app for exploring the Braess paradox, elastic demand, and the link between higher generalized cost and reduced equilibrium demand.

## What it does

- Loads the built-in canonical Braess network from GMNS-style CSV.
- Accepts uploaded `node.csv`, `link.csv`, and `demand.csv`.
- Solves static user equilibrium with the candidate link OFF and ON.
- Supports fixed demand and one elastic-demand model: inverse demand `C(q) = A - B q`.
- Reports equilibrium cost, equilibrium demand, total travel time, consumer surplus, total welfare, paradox flag, and reduced-demand flag.
- Runs in-browser parameter sweeps and draws a heatmap of paradox or welfare regions.
- Exports sweep rows as CSV and heatmaps as SVG or PNG.

## Run locally

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

## File formats

### `node.csv`

Required:

- `node_id`

Supported:

- `x_coord`
- `y_coord`
- `zone_id`
- `node_type`
- `label`

### `link.csv`

Required:

- `from_node_id`
- `to_node_id`

Supported GMNS or app-specific extras:

- `link_id`
- `length`
- `capacity`
- `free_speed`
- `lanes`
- `link_type`
- `cost_function_type`
- `cost_a`
- `cost_b`
- `bpr_alpha`
- `bpr_beta`
- `enabled`
- `candidate_flag`
- `parameter_group`
- `label`

### `demand.csv`

Required for the MVP:

- `origin_zone_id`
- `destination_zone_id`
- `demand`

If multiple OD rows are supplied, the UI lets you choose one row at a time.

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

## Reproducing the built-in Braess example

1. Start the app and click `Load Canonical Braess Preset`.
2. Keep the default affine variable links at `b = 10`, constant links at `45`, candidate link at `0`, and fixed demand at `6`.
3. Click `Compare OFF vs ON`.
4. The OFF equilibrium should be lower than the ON equilibrium, reproducing the classic paradox.
5. Switch demand mode to `elastic` with default `A = 180` and `B = 30`, then compare again.
6. The ON scenario should both raise equilibrium cost and reduce equilibrium demand.

## Project layout

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
web/
tests/
```

## Limitations

- One OD pair at a time.
- Static user equilibrium only.
- Simple-path enumeration is suitable for small research examples, not large production networks.
- No dynamic assignment, no multi-OD equilibrium, no backend.
