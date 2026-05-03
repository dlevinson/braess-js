import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { parseGmnsBundle } from "../src/model/gmnsParser.js";

function presetText(name) {
  return readFileSync(new URL(`../public/presets/${name}`, import.meta.url), "utf8");
}

describe("GMNS parser", () => {
  test("parses canonical Braess CSV files", () => {
    const network = parseGmnsBundle({
      nodeText: presetText("braess_node.csv"),
      linkText: presetText("braess_link.csv"),
      demandText: presetText("braess_demand.csv"),
      name: "test",
    });

    expect(network.nodes).toHaveLength(4);
    expect(network.links).toHaveLength(5);
    expect(network.demandRows[0].demand).toBe(6);
    expect(network.links.find((link) => link.candidateFlag)?.id).toBe(5);
    expect(network.nodes[1].geometryBaseX).toBe(network.nodes[1].x);
    expect(network.nodes[1].geometryBaseY).toBe(network.nodes[1].y);
  });
});
