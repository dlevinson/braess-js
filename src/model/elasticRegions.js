import { buildScenarioNetwork } from "./network.js";
import { solveElasticDemandEquilibrium } from "./equilibrium.js";
import { compareScenarios } from "./paradox.js";
import { applyGroupedLinkParameters, applySweepValue } from "./sweep.js";

export const ELASTIC_REGION_CLASSES = [
  { key: "BP_RD", label: "BP / reduced demand", paradox: true, demandTrend: "RD", feasible: true },
  { key: "BP_NRD", label: "BP / no demand change", paradox: true, demandTrend: "NRD", feasible: false },
  { key: "BP_ID", label: "BP / increased demand", paradox: true, demandTrend: "ID", feasible: false },
  { key: "NBP_RD", label: "No BP / reduced demand", paradox: false, demandTrend: "RD", feasible: false },
  { key: "NBP_NRD", label: "No BP / no demand change", paradox: false, demandTrend: "NRD", feasible: true },
  { key: "NBP_ID", label: "No BP / increased demand", paradox: false, demandTrend: "ID", feasible: true },
];

export const ELASTIC_SLICE_PARAMETERS = [
  { key: "variableCostB", label: "Variable-link coefficient b", min: 4, max: 16 },
  { key: "constantLinkCost", label: "Constant-link cost", min: 20, max: 70 },
  { key: "candidateLinkCost", label: "Added-link free-flow cost", min: 0, max: 30 },
  { key: "candidateLinkB", label: "Added-link congestion b", min: 0, max: 8 },
  { key: "bprAlpha", label: "BPR alpha", min: 0.05, max: 0.6 },
  { key: "capacityScale", label: "Capacity scale", min: 0.5, max: 2 },
];

function gridValues(min, max, steps) {
  const count = Math.max(1, Math.round(Number(steps)));
  if (count === 1) return [Number(min)];
  const start = Number(min);
  const stop = Number(max);
  const delta = (stop - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => start + delta * index);
}

function classifyDemandTrend(deltaDemand, tolerance) {
  if (deltaDemand < -tolerance) return "RD";
  if (deltaDemand > tolerance) return "ID";
  return "NRD";
}

function classKey(paradox, demandTrend) {
  return `${paradox ? "BP" : "NBP"}_${demandTrend}`;
}

function ceilToStep(value, step) {
  return Math.ceil(Number(value) / step) * step;
}

export function defaultElasticRegionConfig(inputs = {}) {
  const intercept = Math.max(20, Number(inputs.inverseDemandA) || 90);
  const slope = Math.max(0.5, Number(inputs.inverseDemandB) || 15);
  const aMin = 0;
  const aMax = ceilToStep(Math.max(140, intercept * 1.5), 5);
  const bMin = 0.5;
  const bMax = ceilToStep(Math.max(20, slope * 1.5), 0.5);
  return {
    aMin,
    aMax,
    aSteps: 13,
    bMin,
    bMax,
    bSteps: 11,
  };
}

export function defaultElasticOutcomeSpaceConfig(inputs = {}) {
  const parameter = ELASTIC_SLICE_PARAMETERS[0];
  return {
    ...defaultElasticRegionConfig(inputs),
    zParameter: parameter.key,
    zMin: parameter.min,
    zMax: parameter.max,
    zSteps: 4,
  };
}

function sliceParameterLabel(key) {
  return ELASTIC_SLICE_PARAMETERS.find((entry) => entry.key === key)?.label ?? key;
}

export async function runElasticAssumptionMap({ networkData, inputs, config = {}, onProgress, isCancelled }) {
  const resolvedConfig = {
    ...defaultElasticRegionConfig(inputs),
    ...config,
  };
  const aValues = gridValues(resolvedConfig.aMin, resolvedConfig.aMax, resolvedConfig.aSteps);
  const bValues = gridValues(resolvedConfig.bMin, resolvedConfig.bMax, resolvedConfig.bSteps);
  const cells = [];
  const rows = [];
  const total = bValues.length * aValues.length;
  let completed = 0;

  for (const aIntercept of aValues) {
    for (const inverseDemandB of bValues) {
      if (isCancelled?.()) {
        throw new Error("Elastic assumption map cancelled.");
      }

      const trialInputs = {
        ...inputs,
        demandMode: "elastic",
        fixedDemand: aIntercept / Math.max(inverseDemandB, 1e-9),
        inverseDemandA: aIntercept,
        inverseDemandB,
      };

      const preparedNetwork = applyGroupedLinkParameters(networkData, trialInputs);
      const offNetwork = buildScenarioNetwork(preparedNetwork, { ...trialInputs, scenarioMode: "off" });
      const onNetwork = buildScenarioNetwork(preparedNetwork, { ...trialInputs, scenarioMode: "on" });
      const solveOptions = {
        inverseDemand: {
          A: aIntercept,
          B: inverseDemandB,
        },
        maxIterations: Number(inputs.maxIterations),
        tolerance: Number(inputs.tolerance),
        maxOuterIterations: Number(inputs.maxOuterIterations),
        quantityTolerance: Number(inputs.quantityTolerance),
        costTolerance: Number(inputs.costTolerance),
      };
      const offResult = solveElasticDemandEquilibrium(offNetwork, solveOptions);
      const onResult = solveElasticDemandEquilibrium(onNetwork, solveOptions);
      const comparison = compareScenarios(offResult, onResult, Number(inputs.classificationTolerance));
      const demandTrend = classifyDemandTrend(comparison.deltaDemand, Number(inputs.classificationTolerance));
      const key = classKey(comparison.paradox, demandTrend);
      const row = {
        inverseDemandA: aIntercept,
        inverseDemandB,
        initialTrips: aIntercept / Math.max(inverseDemandB, 1e-9),
        offDemand: offResult.quantity,
        onDemand: onResult.quantity,
        offCost: offResult.equilibriumCost,
        onCost: onResult.equilibriumCost,
        deltaCost: comparison.deltaCost,
        deltaDemand: comparison.deltaDemand,
        paradox: comparison.paradox ? 1 : 0,
        demandTrend,
        classKey: key,
      };

      rows.push(row);
      cells.push({
        x: inverseDemandB,
        y: aIntercept,
        value: key,
      });

      completed += 1;
      onProgress?.({
        completed,
        total,
        fraction: completed / total,
      });
      await Promise.resolve();
    }
  }

  return {
    mode: "single",
    config: resolvedConfig,
    xValues: bValues,
    yValues: aValues,
    cells,
    rows,
    classes: ELASTIC_REGION_CLASSES,
  };
}

export async function runElasticOutcomeSpace({
  networkData,
  inputs,
  config = {},
  onProgress,
  isCancelled,
}) {
  const resolvedConfig = {
    ...defaultElasticOutcomeSpaceConfig(inputs),
    ...config,
  };
  const aValues = gridValues(resolvedConfig.aMin, resolvedConfig.aMax, resolvedConfig.aSteps);
  const bValues = gridValues(resolvedConfig.bMin, resolvedConfig.bMax, resolvedConfig.bSteps);
  const zValues = gridValues(resolvedConfig.zMin, resolvedConfig.zMax, resolvedConfig.zSteps);
  const points = [];
  const rows = [];
  const total = aValues.length * bValues.length * zValues.length;
  let completed = 0;

  for (const zValue of zValues) {
    for (const aIntercept of aValues) {
      for (const inverseDemandB of bValues) {
        if (isCancelled?.()) {
          throw new Error("Elastic outcome space cancelled.");
        }

        const trialInputs = applySweepValue(
          {
            ...inputs,
            demandMode: "elastic",
            fixedDemand: aIntercept / Math.max(inverseDemandB, 1e-9),
            inverseDemandA: aIntercept,
            inverseDemandB,
          },
          resolvedConfig.zParameter,
          zValue,
        );
        const preparedNetwork = applyGroupedLinkParameters(networkData, trialInputs);
        const offNetwork = buildScenarioNetwork(preparedNetwork, { ...trialInputs, scenarioMode: "off" });
        const onNetwork = buildScenarioNetwork(preparedNetwork, { ...trialInputs, scenarioMode: "on" });
        const solveOptions = {
          inverseDemand: {
            A: aIntercept,
            B: inverseDemandB,
          },
          maxIterations: Number(inputs.maxIterations),
          tolerance: Number(inputs.tolerance),
          maxOuterIterations: Number(inputs.maxOuterIterations),
          quantityTolerance: Number(inputs.quantityTolerance),
          costTolerance: Number(inputs.costTolerance),
        };
        const offResult = solveElasticDemandEquilibrium(offNetwork, solveOptions);
        const onResult = solveElasticDemandEquilibrium(onNetwork, solveOptions);
        const comparison = compareScenarios(offResult, onResult, Number(inputs.classificationTolerance));
        const demandTrend = classifyDemandTrend(comparison.deltaDemand, Number(inputs.classificationTolerance));
        const key = classKey(comparison.paradox, demandTrend);
        const point = {
          inverseDemandA: aIntercept,
          inverseDemandB,
          zParameter: resolvedConfig.zParameter,
          zParameterLabel: sliceParameterLabel(resolvedConfig.zParameter),
          zValue,
          initialTrips: aIntercept / Math.max(inverseDemandB, 1e-9),
          offDemand: offResult.quantity,
          onDemand: onResult.quantity,
          offCost: offResult.equilibriumCost,
          onCost: onResult.equilibriumCost,
          deltaCost: comparison.deltaCost,
          deltaDemand: comparison.deltaDemand,
          paradox: comparison.paradox ? 1 : 0,
          demandTrend,
          classKey: key,
        };

        points.push(point);
        rows.push(point);
        completed += 1;
        onProgress?.({
          completed,
          total,
          fraction: completed / total,
        });
        await Promise.resolve();
      }
    }
  }

  return {
    mode: "outcomeSpace",
    config: resolvedConfig,
    aValues,
    bValues,
    zValues,
    zParameterLabel: sliceParameterLabel(resolvedConfig.zParameter),
    points,
    rows,
    classes: ELASTIC_REGION_CLASSES,
  };
}
