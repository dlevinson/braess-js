import { DEMAND_MODE } from "./demand.js";
import { buildScenarioNetwork, cloneNetworkData } from "./network.js";
import { COST_FUNCTION } from "./costs.js";
import { solveElasticDemandEquilibrium, solveFixedDemandEquilibrium } from "./equilibrium.js";
import { compareScenarios } from "./paradox.js";

export const SWEEP_PARAMETERS = [
  { key: "fixedDemand", label: "Fixed demand q" },
  { key: "inverseDemandA", label: "Inverse demand A" },
  { key: "inverseDemandB", label: "Inverse demand B" },
  { key: "variableCostB", label: "Variable-link coefficient b" },
  { key: "constantLinkCost", label: "Constant-link cost" },
  { key: "candidateLinkCost", label: "Candidate-link cost" },
  { key: "bprAlpha", label: "BPR alpha" },
  { key: "bprBeta", label: "BPR beta" },
  { key: "capacityScale", label: "Capacity scale" },
];

function gridValues(min, max, steps) {
  const count = Math.max(1, Number(steps));
  if (count === 1) return [Number(min)];
  const start = Number(min);
  const stop = Number(max);
  const delta = (stop - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => start + delta * index);
}

export function applySweepValue(inputs, key, value) {
  return {
    ...inputs,
    [key]: value,
  };
}

export function applyGroupedLinkParameters(networkData, inputs) {
  const trial = cloneNetworkData(networkData);
  const variableModel = inputs.costModelMode === COST_FUNCTION.BPR ? COST_FUNCTION.BPR : COST_FUNCTION.AFFINE;

  trial.links = trial.links.map((link) => {
    const next = { ...link };

    if (next.parameterGroup === "variable") {
      next.costFunctionType = variableModel;
      if (variableModel === COST_FUNCTION.AFFINE) {
        next.costA = Number(inputs.variableBaseCost);
        next.costB = Number(inputs.variableCostB);
      } else {
        next.costA = Number(inputs.variableBaseCost);
        next.bprAlpha = Number(inputs.bprAlpha);
        next.bprBeta = Number(inputs.bprBeta);
      }
    }

    if (next.parameterGroup === "constant") {
      next.costFunctionType = COST_FUNCTION.AFFINE;
      next.costA = Number(inputs.constantLinkCost);
      next.costB = 0;
    }

    if (next.parameterGroup === "candidate") {
      if (next.costFunctionType === COST_FUNCTION.BPR) {
        next.bprAlpha = Number(inputs.bprAlpha);
        next.bprBeta = Number(inputs.bprBeta);
      } else {
        next.costA = Number(inputs.candidateLinkCost);
        next.costB = Number(inputs.candidateLinkB ?? next.costB ?? 0);
      }
    }

    return next;
  });

  return trial;
}

function solveScenario(networkData, inputs, scenarioMode) {
  const preparedNetwork = applyGroupedLinkParameters(networkData, inputs);
  const network = buildScenarioNetwork(preparedNetwork, {
    ...inputs,
    scenarioMode,
  });

  if (inputs.demandMode === DEMAND_MODE.ELASTIC) {
    return solveElasticDemandEquilibrium(network, {
      inverseDemand: {
        A: Number(inputs.inverseDemandA),
        B: Number(inputs.inverseDemandB),
      },
      maxIterations: Number(inputs.maxIterations),
      tolerance: Number(inputs.tolerance),
      maxOuterIterations: Number(inputs.maxOuterIterations),
      quantityTolerance: Number(inputs.quantityTolerance),
      costTolerance: Number(inputs.costTolerance),
    });
  }

  return solveFixedDemandEquilibrium(network, {
    demand: Number(inputs.fixedDemand),
    maxIterations: Number(inputs.maxIterations),
    tolerance: Number(inputs.tolerance),
    inverseDemand: {
      A: Number(inputs.inverseDemandA),
      B: Number(inputs.inverseDemandB),
    },
  });
}

export async function runParameterSweep({ networkData, inputs, sweepConfig, onProgress, isCancelled }) {
  const xValues = gridValues(sweepConfig.xMin, sweepConfig.xMax, sweepConfig.xSteps);
  const yValues = gridValues(sweepConfig.yMin, sweepConfig.yMax, sweepConfig.ySteps);
  const cells = [];
  const rows = [];
  const total = xValues.length * yValues.length;
  let completed = 0;

  for (const y of yValues) {
    for (const x of xValues) {
      if (isCancelled?.()) {
        throw new Error("Sweep cancelled.");
      }

      let trialInputs = applySweepValue(inputs, sweepConfig.xParameter, x);
      trialInputs = applySweepValue(trialInputs, sweepConfig.yParameter, y);

      const offResult = solveScenario(networkData, trialInputs, "off");
      const onResult = solveScenario(networkData, trialInputs, "on");
      const comparison = compareScenarios(offResult, onResult, Number(inputs.classificationTolerance));

      const row = {
        x,
        y,
        xParameter: sweepConfig.xParameter,
        yParameter: sweepConfig.yParameter,
        offDemand: offResult.quantity,
        onDemand: onResult.quantity,
        offCost: offResult.equilibriumCost,
        onCost: onResult.equilibriumCost,
        deltaCost: comparison.deltaCost,
        deltaDemand: comparison.deltaDemand,
        deltaTravelTime: comparison.deltaTravelTime,
        deltaConsumerSurplus: comparison.deltaConsumerSurplus,
        deltaWelfare: comparison.deltaWelfare,
        paradox: comparison.paradox ? 1 : 0,
        reducedDemand: comparison.reducedDemand ? 1 : 0,
        welfareLoss: comparison.welfareLoss ? 1 : 0,
      };

      rows.push(row);
      cells.push({
        x,
        y,
        value:
          sweepConfig.metric === "paradox"
            ? row.paradox
            : sweepConfig.metric === "reducedDemand"
              ? row.reducedDemand
              : sweepConfig.metric === "welfareLoss"
                ? row.welfareLoss
                : row[sweepConfig.metric],
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
    xValues,
    yValues,
    cells,
    rows,
  };
}
