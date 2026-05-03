import { describe, expect, test } from "vitest";
import { compareScenarios } from "../src/model/paradox.js";

describe("paradox classification", () => {
  test("flags Braess and reduced-demand conditions from scenario deltas", () => {
    const comparison = compareScenarios(
      {
        equilibriumCost: 48,
        quantity: 6,
        metrics: { totalTravelTime: 288, consumerSurplus: 36, totalWelfare: -252 },
      },
      {
        equilibriumCost: 51,
        quantity: 4.5,
        metrics: { totalTravelTime: 229.5, consumerSurplus: 20.25, totalWelfare: -209.25 },
      },
      1e-6,
    );

    expect(comparison.paradox).toBe(true);
    expect(comparison.reducedDemand).toBe(true);
    expect(comparison.deltaCost).toBeGreaterThan(0);
    expect(comparison.deltaDemand).toBeLessThan(0);
  });
});
