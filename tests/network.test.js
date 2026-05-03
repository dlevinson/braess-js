import { describe, expect, test } from "vitest";
import { computeLinkGeometryLength } from "../src/model/network.js";

describe("network geometry editing", () => {
  test("updates link length proportionally from the original drawn length", () => {
    const link = {
      fromNodeId: 1,
      toNodeId: 2,
      length: 1,
      geometryBaseLength: 1,
      geometryBaseDistance: Math.SQRT2,
    };
    const nodeById = new Map([
      ["1", { id: 1, x: 0, y: 0 }],
      ["2", { id: 2, x: 0.5, y: 0.5 }],
    ]);

    expect(computeLinkGeometryLength(link, nodeById)).toBeCloseTo(0.5);
  });
});
