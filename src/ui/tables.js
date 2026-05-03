function formatValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(4) : "—";
}

function demandAssumptionText(demandMode, inputs = {}) {
  const initialTrips = formatValue(inputs.fixedDemand);
  if (demandMode === "elastic") {
    return `Case: elastic demand. Initial trips ${initialTrips} is the zero-cost X-intercept of C(q) = A - Bq; the solver chooses the demand where willingness to pay equals equilibrium generalised cost. Positive demand requires A to be above the no-flow OD travel cost.`;
  }
  return `Case: fixed demand. Demand is held at Initial trips ${initialTrips} in both link scenarios; inverse-demand parameters are not used to choose demand.`;
}

function renderModeComparison(modeComparison, elasticOffResult, elasticOnResult) {
  if (!modeComparison || !elasticOffResult || !elasticOnResult) return "";

  const rows = [
    ["Without added link", modeComparison.offFixed, elasticOffResult],
    ["With added link", modeComparison.onFixed, elasticOnResult],
  ];

  return `
    <div class="subsection-note">
      <strong>Fixed vs elastic demand check.</strong>
      This compares each link scenario against the same network solved with fixed demand equal to the Initial trips intercept.
    </div>
    <table class="metric-table compact">
      <thead>
        <tr><th>Scenario</th><th>Fixed demand</th><th>Elastic demand</th><th>Elastic minus fixed</th><th>Fixed cost</th><th>Elastic cost</th></tr>
      </thead>
      <tbody>
        ${rows
          .map(([label, fixedResult, elasticResult]) => {
            const deltaDemand = Number(elasticResult.quantity) - Number(fixedResult.quantity);
            return `
              <tr>
                <th>${label}</th>
                <td>${formatValue(fixedResult.quantity)}</td>
                <td>${formatValue(elasticResult.quantity)}</td>
                <td>${formatValue(deltaDemand)}</td>
                <td>${formatValue(fixedResult.equilibriumCost)}</td>
                <td>${formatValue(elasticResult.equilibriumCost)}</td>
              </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderElasticDemandWarnings(offResult, onResult) {
  const warnings = [
    offResult.zeroDemandReason ? `Without added link: ${offResult.zeroDemandReason}` : "",
    onResult.zeroDemandReason ? `With added link: ${onResult.zeroDemandReason}` : "",
  ].filter(Boolean);

  if (warnings.length === 0) return "";

  return `
    <div class="callout warn demand-warning">
      <strong>Elastic demand is zero in one scenario because the demand curve chokes off before positive trips occur.</strong>
      <span>${warnings.join(" ")}</span>
      <span>Raise the Y-intercept A above the no-flow travel cost, or lower link free-flow costs, to get positive elastic demand.</span>
    </div>
  `;
}

export function renderComparisonTable(container, offResult, onResult, comparison, demandMode = "fixed", inputs = {}, modeComparison = null) {
  if (!offResult || !onResult || !comparison) {
    container.innerHTML = `<p class="empty-state">Run “Solve both cases” to fill in the comparison table.</p>`;
    return;
  }

  const rows = [
    ["Demand", offResult.quantity, onResult.quantity, comparison.deltaDemand],
    ["Equilibrium cost", offResult.equilibriumCost, onResult.equilibriumCost, comparison.deltaCost],
    [
      "Total travel time",
      offResult.metrics.totalTravelTime,
      onResult.metrics.totalTravelTime,
      comparison.deltaTravelTime,
    ],
    [
      "Consumer surplus",
      offResult.metrics.consumerSurplus,
      onResult.metrics.consumerSurplus,
      comparison.deltaConsumerSurplus,
    ],
    ["Total welfare", offResult.metrics.totalWelfare, onResult.metrics.totalWelfare, comparison.deltaWelfare],
    ["Braess paradox?", "—", "—", comparison.paradox ? "Yes" : "No"],
    ["Demand falls too?", "—", "—", comparison.reducedDemand ? "Yes" : "No"],
  ];

  container.innerHTML = `
    <p class="scenario-assumption">${demandAssumptionText(demandMode, inputs)}</p>
    ${demandMode === "elastic" ? renderElasticDemandWarnings(offResult, onResult) : ""}
    <table class="metric-table">
      <thead>
        <tr><th>Metric</th><th>Without added link</th><th>With added link</th><th>Change</th></tr>
      </thead>
      <tbody>
        ${rows
          .map(
            ([label, off, on, delta]) => `
            <tr>
              <th>${label}</th>
              <td>${typeof off === "string" ? off : formatValue(off)}</td>
              <td>${typeof on === "string" ? on : formatValue(on)}</td>
              <td>${typeof delta === "string" ? delta : formatValue(delta)}</td>
            </tr>`,
          )
          .join("")}
      </tbody>
    </table>
    <div class="callout-grid">
      <div class="callout ${comparison.paradox ? "warn" : "good"}">
        <strong>${comparison.paradox ? "Adding the link makes equilibrium cost worse" : "Adding the link does not make equilibrium cost worse"}</strong>
      </div>
      <div class="callout ${comparison.reducedDemand ? "warn" : "neutral"}">
        <strong>${
          demandMode === "elastic"
            ? comparison.reducedDemand
              ? "Link effect under elastic demand: ON has lower demand than OFF"
              : "Link effect under elastic demand: ON demand is not lower than OFF demand"
            : "ON-vs-OFF demand reduction is only tested in elastic-demand mode"
        }</strong>
        <span>${comparison.reducedDemand ? "This is induced demand running in reverse." : ""}</span>
      </div>
    </div>
    ${demandMode === "elastic" ? renderModeComparison(modeComparison, offResult, onResult) : ""}
  `;
}

export function renderBatchTable(container, sweepResult) {
  if (!sweepResult?.rows?.length) {
    container.innerHTML = `<p class="empty-state">Sweep rows will appear here after a batch run.</p>`;
    return;
  }

  const columns = [
    "x",
    "y",
    "offDemand",
    "onDemand",
    "offCost",
    "onCost",
    "deltaCost",
    "deltaDemand",
    "paradox",
    "reducedDemand",
    "welfareLoss",
  ];

  container.innerHTML = `
    <div class="table-scroll">
      <table class="metric-table compact">
        <thead>
          <tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${sweepResult.rows
            .slice(0, 16)
            .map(
              (row) => `
                <tr>${columns
                  .map((column) => `<td>${typeof row[column] === "number" ? formatValue(row[column]) : row[column]}</td>`)
                  .join("")}</tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <p class="table-note">Showing the first 16 rows of ${sweepResult.rows.length}. Use “Export CSV” for the full sweep grid.</p>
  `;
}
