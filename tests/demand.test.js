import { describe, expect, test } from "vitest";
import { consumerSurplusInverseDemand, inverseDemandCost } from "../src/model/demand.js";
import { evaluateAffineCost, evaluateBprCost } from "../src/model/costs.js";

describe("demand and cost helpers", () => {
  test("computes inverse-demand consumer surplus analytically", () => {
    const cost = inverseDemandCost({ A: 60, B: 2 }, 6);
    const surplus = consumerSurplusInverseDemand({ A: 60, B: 2 }, 6, cost);

    expect(cost).toBe(48);
    expect(surplus).toBe(36);
  });

  test("evaluates affine and BPR link costs", () => {
    expect(evaluateAffineCost({ costA: 5, costB: 2 }, 3)).toBe(11);
    expect(evaluateBprCost({ costA: 10, bprAlpha: 0.15, bprBeta: 4, capacity: 2 }, 2)).toBeCloseTo(11.5);
    expect(evaluateBprCost({ costA: 0, length: 30, freeSpeed: 10, bprAlpha: 0.15, bprBeta: 4, capacity: 2 }, 2)).toBeCloseTo(3.45);
  });
});
