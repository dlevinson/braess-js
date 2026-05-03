export function renderLayout(root) {
  root.innerHTML = `
    <div class="app">
      <header class="header">
        <div class="header-main">
          <p class="eyebrow">Braess</p>
          <h1>Added links, equilibrium traffic, and demand response</h1>
          <p class="panel-blurb">Click a link to edit its lanes and capacity. Drag nodes to adjust the drawing layout.</p>
        </div>
        <div class="header-right">
          <a class="docs-link" href="model-notes.html" target="_blank" rel="noreferrer">Model Notes</a>
          <img class="usyd-logo" src="./branding/usyd-logo.png" alt="University of Sydney logo" />
        </div>
      </header>

      <div class="app-shell">
      <aside class="panel controls-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Braess Explorer</p>
            <h2>Controls</h2>
            <p class="panel-blurb">Open only the sections you need. The middle link is the Braess candidate.</p>
          </div>
        </div>

        <details class="control-card" open>
          <summary>Network</summary>
          <div class="control-body">
            <div class="button-row compact">
              <button type="button" data-action="load-preset">Load Braess Example</button>
            </div>
            <p class="panel-blurb">This version uses the built-in Braess network and direct map editing instead of CSV upload.</p>
            <div class="fields-grid">
              <label>OD pair
                <select data-field="selectedDemandKey"></select>
              </label>
              <label>Added link
                <select data-field="selectedCandidateLinkId"></select>
              </label>
              <label>Map view
                <select data-field="viewScenario">
                  <option value="off">Without added link</option>
                  <option value="on">With added link</option>
                </select>
              </label>
            </div>
          </div>
        </details>

        <details class="control-card">
          <summary>Network editing</summary>
          <div class="control-body">
            <p class="panel-blurb">Ultimo-style direct edit: click a link on the map, then edit its own structure and link performance function here. For BPR links, t0 is length/free speed unless the t0 override is positive.</p>
            <p class="selection-chip" data-role="edit-selection">Select a link on the map to edit it.</p>
            <div class="selection-details" data-role="selection-details"></div>
            <div class="fields-grid two-col">
              <label>Selected link lanes<input type="number" min="0" max="12" step="1" data-role="edit-link-lanes" /></label>
              <label>Selected link capacity<input type="number" min="0" step="1" data-role="edit-link-capacity" /></label>
              <label>Selected link length<input type="number" min="0" step="0.1" data-role="edit-link-length" /></label>
              <label>Selected link free speed<input type="number" min="0" step="0.1" data-role="edit-link-free-speed" /></label>
              <label>Cost function
                <select data-role="edit-link-function">
                  <option value="affine">Affine</option>
                  <option value="bpr">BPR</option>
                </select>
              </label>
              <label>Affine a / t0 override<input type="number" step="0.1" data-role="edit-link-cost-a" /></label>
              <label>Cost b<input type="number" step="0.1" data-role="edit-link-cost-b" /></label>
              <label>BPR alpha<input type="number" step="0.01" data-role="edit-link-bpr-alpha" /></label>
              <label>BPR beta<input type="number" step="0.1" data-role="edit-link-bpr-beta" /></label>
            </div>
            <div class="button-row compact">
              <button type="button" data-action="apply-link-edit">Apply edit</button>
              <button type="button" data-action="close-link">Set selected link to zero</button>
            </div>
          </div>
        </details>

        <details class="control-card">
          <summary>Demand</summary>
          <div class="control-body">
            <div class="fields-grid two-col">
              <label>Demand mode
                <select data-field="demandMode">
                  <option value="fixed">Fixed demand</option>
                  <option value="elastic">Elastic trips</option>
                </select>
              </label>
              <label>Initial trips<input type="number" step="0.1" data-field="fixedDemand" /></label>
              <label data-role="elastic-demand-control">Inverse-demand intercept A<input type="number" step="0.1" data-field="inverseDemandA" /></label>
              <label data-role="elastic-demand-control">Inverse-demand slope B<input type="number" step="0.1" data-field="inverseDemandB" /></label>
            </div>
            <p class="panel-blurb">The built-in Braess example uses normalized demand units for clarity, so the default value 6 means 6 toy demand packets, not 6 literal vehicles. In fixed-demand mode, Initial trips is the X-axis marker. In elastic mode, click the X or Y axis to move the demand-curve intercepts.</p>
            <div data-role="demand-curve"></div>
          </div>
        </details>

        <details class="control-card">
          <summary>Run model</summary>
          <div class="control-body">
            <div class="fields-grid two-col">
              <label>MSA iterations<input type="number" step="1" data-field="maxIterations" /></label>
              <label>MSA tolerance<input type="number" step="0.000001" data-field="tolerance" /></label>
              <label>Outer iterations<input type="number" step="1" data-field="maxOuterIterations" /></label>
              <label>Quantity tolerance<input type="number" step="0.0001" data-field="quantityTolerance" /></label>
              <label>Cost tolerance<input type="number" step="0.0001" data-field="costTolerance" /></label>
              <label>Flag tolerance<input type="number" step="0.000001" data-field="classificationTolerance" /></label>
            </div>
            <div class="button-row compact">
              <button type="button" data-action="solve-off">Solve without link</button>
              <button type="button" data-action="solve-on">Solve with link</button>
              <button type="button" data-action="compare">Solve both cases</button>
            </div>
          </div>
        </details>

        <details class="control-card">
          <summary>Sweep</summary>
          <div class="control-body">
            <div class="fields-grid two-col">
              <label>X axis<select data-sweep="xParameter"></select></label>
              <label>Y axis<select data-sweep="yParameter"></select></label>
              <label>X min<input type="number" step="0.1" data-sweep="xMin" /></label>
              <label>X max<input type="number" step="0.1" data-sweep="xMax" /></label>
              <label>X steps<input type="number" step="1" data-sweep="xSteps" /></label>
              <label>Y min<input type="number" step="0.1" data-sweep="yMin" /></label>
              <label>Y max<input type="number" step="0.1" data-sweep="yMax" /></label>
              <label>Y steps<input type="number" step="1" data-sweep="ySteps" /></label>
              <label class="full-width">Map value
                <select data-sweep="metric">
                  <option value="paradox">Where the added link makes cost worse</option>
                  <option value="reducedDemand">Where the added link also reduces demand</option>
                  <option value="welfareLoss">Where total welfare falls</option>
                  <option value="deltaCost">Change in equilibrium cost</option>
                  <option value="deltaDemand">Change in equilibrium demand</option>
                  <option value="deltaTravelTime">Change in total travel time</option>
                  <option value="deltaConsumerSurplus">Change in consumer surplus</option>
                  <option value="deltaWelfare">Change in total welfare</option>
                </select>
              </label>
            </div>
            <div class="button-row compact">
              <button type="button" data-action="run-sweep">Run sweep</button>
              <button type="button" data-action="cancel-sweep">Cancel</button>
              <button type="button" data-action="export-csv">Export CSV</button>
              <button type="button" data-action="export-svg">Export SVG</button>
              <button type="button" data-action="export-png">Export PNG</button>
            </div>
          </div>
        </details>
      </aside>

      <main class="main-column">
        <section class="panel network-panel">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Editable Network</p>
              <h2>Map, legend, scale, and link selection</h2>
            </div>
            <div class="status-wrap">
              <div class="status" data-role="status"></div>
              <div class="error" data-role="error"></div>
              <div class="progress" data-role="progress"></div>
            </div>
          </div>
          <p class="network-help">Click a link to edit it in the left panel. Dragging nodes updates the drawing geometry and connected link lengths; changing lanes, capacity, or link costs changes the network used by the solver.</p>
          <div class="network-canvas" data-role="network"></div>
        </section>

        <section class="panel results-panel">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Results</p>
              <h2>Without added link vs with added link</h2>
            </div>
          </div>
          <div data-role="comparison-table"></div>
          <details class="model-details">
            <summary>Model details</summary>
            <div data-role="model-details"></div>
          </details>
        </section>

        <section class="chart-grid">
          <section class="panel">
            <div class="panel-title-row">
              <div>
                <p class="eyebrow">Diagnostics</p>
                <h2>Solver convergence</h2>
              </div>
            </div>
            <div data-role="convergence-chart"></div>
          </section>
          <section class="panel">
            <div class="panel-title-row">
              <div>
                <p class="eyebrow">Sweep slice</p>
                <h2>Mid-slice comparison</h2>
              </div>
            </div>
            <div data-role="slice-chart"></div>
          </section>
        </section>

        <section class="panel heatmap-panel">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Elastic assumptions</p>
              <h2>Rotatable 3D outcome space</h2>
              <p class="panel-blurb">X is inverse-demand intercept A, Y is inverse-demand slope B, and Z is the selected cost-function parameter.</p>
              <p class="panel-blurb run-warning">Drawing this space solves two equilibria for every A-B-Z grid point. Start with fewer steps for quick exploration; large grids can take a moment, especially in Safari.</p>
            </div>
            <button type="button" data-action="run-elastic-map">Draw 3D space</button>
          </div>
          <div class="elastic-space-controls">
            <div class="axis-control-row axis-a">
              <div>
                <strong>A: willingness-to-pay intercept</strong>
                <span>Vertical intercept of C(q) = A - Bq, shown on the X axis.</span>
              </div>
              <label>A low<input type="number" step="1" data-elastic-map="aMin" /></label>
              <label>A high<input type="number" step="1" data-elastic-map="aMax" /></label>
              <label>A steps<input type="number" min="2" max="30" step="1" data-elastic-map="aSteps" /></label>
            </div>
            <div class="axis-control-row axis-b">
              <div>
                <strong>B: demand-curve slope</strong>
                <span>How quickly willingness to pay falls as trips increase, shown on the Y axis.</span>
              </div>
              <label>B low<input type="number" step="0.1" data-elastic-map="bMin" /></label>
              <label>B high<input type="number" step="0.1" data-elastic-map="bMax" /></label>
              <label>B steps<input type="number" min="2" max="30" step="1" data-elastic-map="bSteps" /></label>
            </div>
            <div class="axis-control-row axis-z">
              <div>
                <strong>Z: network or cost parameter</strong>
                <span>The third axis rotates out of the A-B plane.</span>
              </div>
              <label>Z variable
                <select data-elastic-map="zParameter">
                  <option value="variableCostB">Variable-link coefficient b</option>
                  <option value="constantLinkCost">Constant-link cost</option>
                  <option value="candidateLinkCost">Added-link free-flow cost</option>
                  <option value="candidateLinkB">Added-link congestion b</option>
                  <option value="bprAlpha">BPR alpha</option>
                  <option value="capacityScale">Capacity scale</option>
                </select>
              </label>
              <label>Z low<input type="number" step="0.1" data-elastic-map="zMin" /></label>
              <label>Z high<input type="number" step="0.1" data-elastic-map="zMax" /></label>
              <label>Z steps<input type="number" min="1" max="12" step="1" data-elastic-map="zSteps" /></label>
            </div>
          </div>
          <div data-role="elastic-region-map"></div>
        </section>

        <section class="panel heatmap-panel">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Generic sweep</p>
              <h2>Single-parameter heatmap</h2>
              <p class="panel-blurb">This is the flexible two-parameter sweep from the left controls. Use the 3D outcome space above for the Braess/demand-response assumption map.</p>
            </div>
          </div>
          <div data-role="heatmap"></div>
        </section>

        <section class="panel">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Batch rows</p>
              <h2>Sweep row preview</h2>
            </div>
          </div>
          <div data-role="batch-table"></div>
        </section>
      </main>
      </div>
    </div>
  `;

  return {
    status: root.querySelector('[data-role="status"]'),
    error: root.querySelector('[data-role="error"]'),
    progress: root.querySelector('[data-role="progress"]'),
    network: root.querySelector('[data-role="network"]'),
    editSelection: root.querySelector('[data-role="edit-selection"]'),
    selectionDetails: root.querySelector('[data-role="selection-details"]'),
    editLinkLanes: root.querySelector('[data-role="edit-link-lanes"]'),
    editLinkCapacity: root.querySelector('[data-role="edit-link-capacity"]'),
    editLinkLength: root.querySelector('[data-role="edit-link-length"]'),
    editLinkFreeSpeed: root.querySelector('[data-role="edit-link-free-speed"]'),
    editLinkFunction: root.querySelector('[data-role="edit-link-function"]'),
    editLinkCostA: root.querySelector('[data-role="edit-link-cost-a"]'),
    editLinkCostB: root.querySelector('[data-role="edit-link-cost-b"]'),
    editLinkBprAlpha: root.querySelector('[data-role="edit-link-bpr-alpha"]'),
    editLinkBprBeta: root.querySelector('[data-role="edit-link-bpr-beta"]'),
    comparisonTable: root.querySelector('[data-role="comparison-table"]'),
    convergenceChart: root.querySelector('[data-role="convergence-chart"]'),
    demandCurve: root.querySelector('[data-role="demand-curve"]'),
    elasticDemandControls: Array.from(root.querySelectorAll('[data-role="elastic-demand-control"]')),
    elasticRegionMap: root.querySelector('[data-role="elastic-region-map"]'),
    sliceChart: root.querySelector('[data-role="slice-chart"]'),
    heatmap: root.querySelector('[data-role="heatmap"]'),
    batchTable: root.querySelector('[data-role="batch-table"]'),
    modelDetails: root.querySelector('[data-role="model-details"]'),
    actions: Array.from(root.querySelectorAll("[data-action]")),
    controlCards: Array.from(root.querySelectorAll(".control-card")),
    fieldInputs: Array.from(root.querySelectorAll("[data-field]")),
    sweepInputs: Array.from(root.querySelectorAll("[data-sweep]")),
    elasticMapInputs: Array.from(root.querySelectorAll("[data-elastic-map]")),
  };
}
