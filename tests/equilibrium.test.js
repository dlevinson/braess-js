import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { parseGmnsBundle } from "../src/model/gmnsParser.js";
import { buildScenarioNetwork } from "../src/model/network.js";
import { DEFAULT_INPUTS } from "../src/model/presets.js";
import { solveElasticDemandEquilibrium, solveFixedDemandEquilibrium } from "../src/model/equilibrium.js";

function loadPresetNetwork() {
  return parseGmnsBundle({
    nodeText: readFileSync(new URL("../public/presets/braess_node.csv", import.meta.url), "utf8"),
    linkText: readFileSync(new URL("../public/presets/braess_link.csv", import.meta.url), "utf8"),
    demandText: readFileSync(new URL("../public/presets/braess_demand.csv", import.meta.url), "utf8"),
    name: "Canonical Braess network",
  });
}

describe("equilibrium solver", () => {
  test("finds a higher fixed-demand equilibrium cost when the candidate link is enabled", () => {
    const networkData = loadPresetNetwork();
    const baseOptions = {
      ...DEFAULT_INPUTS,
      selectedDemandKey: networkData.demandRows[0].key,
      selectedCandidateLinkId: "5",
    };

    const offNetwork = buildScenarioNetwork(networkData, { ...baseOptions, scenarioMode: "off" });
    const onNetwork = buildScenarioNetwork(networkData, { ...baseOptions, scenarioMode: "on" });
    const off = solveFixedDemandEquilibrium(offNetwork, { demand: 6, maxIterations: 200, tolerance: 1e-8 });
    const on = solveFixedDemandEquilibrium(onNetwork, { demand: 6, maxIterations: 200, tolerance: 1e-8 });

    expect(off.equilibriumCost).toBeCloseTo(75, 3);
    expect(on.equilibriumCost).toBeCloseTo(90, 3);
    expect(off.equilibriumCost).toBeLessThan(on.equilibriumCost);
  });

  test("elastic demand falls when the paradox raises cost", () => {
    const networkData = loadPresetNetwork();
    const baseOptions = {
      ...DEFAULT_INPUTS,
      selectedDemandKey: networkData.demandRows[0].key,
      selectedCandidateLinkId: "5",
      demandMode: "elastic",
      inverseDemandA: 90,
      inverseDemandB: 0.5,
    };

    const offNetwork = buildScenarioNetwork(networkData, { ...baseOptions, scenarioMode: "off" });
    const onNetwork = buildScenarioNetwork(networkData, { ...baseOptions, scenarioMode: "on" });
    const off = solveElasticDemandEquilibrium(offNetwork, {
      inverseDemand: { A: 90, B: 0.5 },
      maxIterations: 200,
      tolerance: 1e-8,
      maxOuterIterations: 60,
    });
    const on = solveElasticDemandEquilibrium(onNetwork, {
      inverseDemand: { A: 90, B: 0.5 },
      maxIterations: 200,
      tolerance: 1e-8,
      maxOuterIterations: 60,
    });

    expect(off.quantity).toBeGreaterThan(on.quantity);
    expect(on.equilibriumCost).toBeGreaterThan(off.equilibriumCost);
  });

  test("default elastic-demand Braess state produces BP and reduced demand", () => {
    const networkData = loadPresetNetwork();
    const baseOptions = {
      ...DEFAULT_INPUTS,
      selectedDemandKey: networkData.demandRows[0].key,
      selectedCandidateLinkId: "5",
      demandMode: "elastic",
    };

    const offNetwork = buildScenarioNetwork(networkData, { ...baseOptions, scenarioMode: "off" });
    const onNetwork = buildScenarioNetwork(networkData, { ...baseOptions, scenarioMode: "on" });
    const off = solveElasticDemandEquilibrium(offNetwork, {
      inverseDemand: { A: DEFAULT_INPUTS.inverseDemandA, B: DEFAULT_INPUTS.inverseDemandB },
      maxIterations: 200,
      tolerance: 1e-8,
      maxOuterIterations: 60,
    });
    const on = solveElasticDemandEquilibrium(onNetwork, {
      inverseDemand: { A: DEFAULT_INPUTS.inverseDemandA, B: DEFAULT_INPUTS.inverseDemandB },
      maxIterations: 200,
      tolerance: 1e-8,
      maxOuterIterations: 60,
    });

    expect(DEFAULT_INPUTS.inverseDemandA / DEFAULT_INPUTS.inverseDemandB).toBeCloseTo(DEFAULT_INPUTS.fixedDemand);
    expect(on.equilibriumCost).toBeGreaterThan(off.equilibriumCost);
    expect(on.quantity).toBeLessThan(off.quantity);
  });
});
