import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { DEFAULT_ELASTIC_MAP, DEFAULT_INPUTS, loadBraessPreset } from "../src/model/presets.js";
import { buildScenarioNetwork } from "../src/model/network.js";
import { solveElasticDemandEquilibrium, solveFixedDemandEquilibrium } from "../src/model/equilibrium.js";
import { compareScenarios } from "../src/model/paradox.js";
import { runElasticOutcomeSpace } from "../src/model/elasticRegions.js";
import { applyGroupedLinkParameters } from "../src/model/sweep.js";

const outDir = resolve("findings-paper");
const dataDir = resolve(outDir, "data");

function fmt(value) {
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  return String(value ?? "");
}

function csv(rows) {
  const headers = Object.keys(rows[0] ?? {});
  const lines = rows.map((row) =>
    headers
      .map((header) => {
        const value = fmt(row[header]);
        return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
      })
      .join(","),
  );
  return `${headers.join(",")}\n${lines.join("\n")}\n`;
}

function fixedSolve(networkData, preparedNetwork, inputs, scenarioMode) {
  const network = buildScenarioNetwork(preparedNetwork, { ...inputs, scenarioMode });
  return solveFixedDemandEquilibrium(network, {
    demand: inputs.fixedDemand,
    maxIterations: inputs.maxIterations,
    tolerance: inputs.tolerance,
    inverseDemand: {
      A: inputs.inverseDemandA,
      B: inputs.inverseDemandB,
    },
  });
}

function elasticSolve(preparedNetwork, inputs, scenarioMode) {
  const network = buildScenarioNetwork(preparedNetwork, { ...inputs, scenarioMode });
  return solveElasticDemandEquilibrium(network, {
    inverseDemand: {
      A: inputs.inverseDemandA,
      B: inputs.inverseDemandB,
    },
    maxIterations: inputs.maxIterations,
    tolerance: inputs.tolerance,
    maxOuterIterations: inputs.maxOuterIterations,
    quantityTolerance: inputs.quantityTolerance,
    costTolerance: inputs.costTolerance,
  });
}

function scenarioRow(mode, demandMode, result) {
  return {
    demand_mode: demandMode,
    scenario: mode === "off" ? "Without added link" : "With added link",
    demand: result.quantity,
    equilibrium_cost: result.equilibriumCost,
    total_travel_time: result.metrics.totalTravelTime,
    consumer_surplus: result.metrics.consumerSurplus,
    total_welfare: result.metrics.totalWelfare,
  };
}

function comparisonRows(fixedOff, fixedOn, fixedComparison, elasticOff, elasticOn, elasticComparison) {
  return [
    scenarioRow("off", "fixed", fixedOff),
    scenarioRow("on", "fixed", fixedOn),
    {
      demand_mode: "fixed",
      scenario: "Change",
      demand: fixedComparison.deltaDemand,
      equilibrium_cost: fixedComparison.deltaCost,
      total_travel_time: fixedComparison.deltaTravelTime,
      consumer_surplus: fixedComparison.deltaConsumerSurplus,
      total_welfare: fixedComparison.deltaWelfare,
    },
    scenarioRow("off", "elastic", elasticOff),
    scenarioRow("on", "elastic", elasticOn),
    {
      demand_mode: "elastic",
      scenario: "Change",
      demand: elasticComparison.deltaDemand,
      equilibrium_cost: elasticComparison.deltaCost,
      total_travel_time: elasticComparison.deltaTravelTime,
      consumer_surplus: elasticComparison.deltaConsumerSurplus,
      total_welfare: elasticComparison.deltaWelfare,
    },
  ];
}

const networkData = await loadBraessPreset();
const inputs = {
  ...DEFAULT_INPUTS,
  demandMode: "fixed",
  selectedDemandKey: networkData.demandRows[0]?.key ?? "",
  selectedCandidateLinkId: "5",
};
const preparedNetwork = applyGroupedLinkParameters(networkData, inputs);

const fixedOff = fixedSolve(networkData, preparedNetwork, inputs, "off");
const fixedOn = fixedSolve(networkData, preparedNetwork, inputs, "on");
const fixedComparison = compareScenarios(fixedOff, fixedOn, inputs.classificationTolerance);

const elasticInputs = { ...inputs, demandMode: "elastic" };
const elasticOff = elasticSolve(preparedNetwork, elasticInputs, "off");
const elasticOn = elasticSolve(preparedNetwork, elasticInputs, "on");
const elasticComparison = compareScenarios(elasticOff, elasticOn, elasticInputs.classificationTolerance);

const outcomeSpace = await runElasticOutcomeSpace({
  networkData,
  inputs: elasticInputs,
  config: DEFAULT_ELASTIC_MAP,
});
const classCounts = Object.fromEntries(outcomeSpace.classes.map((entry) => [entry.key, 0]));
for (const row of outcomeSpace.rows) {
  classCounts[row.classKey] = (classCounts[row.classKey] ?? 0) + 1;
}

const summary = {
  generatedAt: new Date().toISOString(),
  model: "Canonical Braess network with inverse demand C(q) = A - Bq",
  defaults: {
    fixedDemand: inputs.fixedDemand,
    inverseDemandA: elasticInputs.inverseDemandA,
    inverseDemandB: elasticInputs.inverseDemandB,
    variableCostB: inputs.variableCostB,
    constantLinkCost: inputs.constantLinkCost,
    candidateLinkCost: inputs.candidateLinkCost,
    classificationTolerance: inputs.classificationTolerance,
  },
  fixed: {
    offCost: fixedOff.equilibriumCost,
    onCost: fixedOn.equilibriumCost,
    deltaCost: fixedComparison.deltaCost,
    paradox: fixedComparison.paradox,
    offTotalTravelTime: fixedOff.metrics.totalTravelTime,
    onTotalTravelTime: fixedOn.metrics.totalTravelTime,
    deltaTotalTravelTime: fixedComparison.deltaTravelTime,
  },
  elastic: {
    offDemand: elasticOff.quantity,
    onDemand: elasticOn.quantity,
    deltaDemand: elasticComparison.deltaDemand,
    offCost: elasticOff.equilibriumCost,
    onCost: elasticOn.equilibriumCost,
    deltaCost: elasticComparison.deltaCost,
    paradox: elasticComparison.paradox,
    reducedDemand: elasticComparison.reducedDemand,
    offTotalWelfare: elasticOff.metrics.totalWelfare,
    onTotalWelfare: elasticOn.metrics.totalWelfare,
    deltaTotalWelfare: elasticComparison.deltaWelfare,
  },
  outcomeSpace: {
    config: DEFAULT_ELASTIC_MAP,
    gridPoints: outcomeSpace.rows.length,
    classCounts,
  },
};

await mkdir(dataDir, { recursive: true });
await writeFile(resolve(dataDir, "default-scenario-comparison.csv"), csv(comparisonRows(
  fixedOff,
  fixedOn,
  fixedComparison,
  elasticOff,
  elasticOn,
  elasticComparison,
)), "utf8");
await writeFile(resolve(dataDir, "elastic-outcome-space.csv"), csv(outcomeSpace.rows), "utf8");
await writeFile(resolve(dataDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");

console.log(JSON.stringify(summary, null, 2));
