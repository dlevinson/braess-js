import Papa from "papaparse";
import { COST_FUNCTION } from "./costs.js";

function parseCsv(text) {
  const parsed = Papa.parse(text.trim(), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0].message);
  }
  return parsed.data;
}

function parseNumber(value, fallback = undefined) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value, fallback = true) {
  if (value === undefined || value === null || value === "") return fallback;
  return !["false", "0", "no", "off"].includes(String(value).trim().toLowerCase());
}

export function parseNodeCsv(text) {
  return parseCsv(text).map((row, index) => ({
    id: parseNumber(row.node_id, index + 1),
    x: parseNumber(row.x_coord, index),
    y: parseNumber(row.y_coord, 0),
    geometryBaseX: parseNumber(row.x_coord, index),
    geometryBaseY: parseNumber(row.y_coord, 0),
    zoneId: parseNumber(row.zone_id, parseNumber(row.node_id, index + 1)),
    nodeType: row.node_type || "intersection",
    label: row.label || `Node ${row.node_id}`,
  }));
}

export function parseLinkCsv(text) {
  return parseCsv(text).map((row, index) => ({
    id: parseNumber(row.link_id, index + 1),
    fromNodeId: parseNumber(row.from_node_id),
    toNodeId: parseNumber(row.to_node_id),
    length: parseNumber(row.length, 1),
    capacity: parseNumber(row.capacity, 10),
    freeSpeed: parseNumber(row.free_speed, 1),
    lanes: parseNumber(row.lanes, 1),
    linkType: row.link_type || "road",
    costFunctionType:
      String(row.cost_function_type || "").trim().toLowerCase() === COST_FUNCTION.BPR
        ? COST_FUNCTION.BPR
        : COST_FUNCTION.AFFINE,
    costA: parseNumber(row.cost_a, 0),
    costB: parseNumber(row.cost_b, 0),
    bprAlpha: parseNumber(row.bpr_alpha, 0.15),
    bprBeta: parseNumber(row.bpr_beta, 4),
    enabled: parseBoolean(row.enabled, true),
    candidateFlag: parseBoolean(row.candidate_flag, false),
    parameterGroup: row.parameter_group || "generic",
    label: row.label || `Link ${row.link_id}`,
  }));
}

export function parseDemandCsv(text) {
  return parseCsv(text).map((row, index) => {
    const originZoneId = parseNumber(row.origin_zone_id ?? row.o_zone_id ?? row.origin);
    const destinationZoneId = parseNumber(row.destination_zone_id ?? row.d_zone_id ?? row.destination);
    const demand = parseNumber(row.demand, 0);
    return {
      key: `${originZoneId}-${destinationZoneId}-${index}`,
      originZoneId,
      destinationZoneId,
      demand,
    };
  });
}

export function parseGmnsBundle({ nodeText, linkText, demandText, name = "GMNS network" }) {
  const nodes = parseNodeCsv(nodeText);
  const nodeById = new Map(nodes.map((node) => [String(node.id), node]));
  const links = parseLinkCsv(linkText).map((link) => {
    const from = nodeById.get(String(link.fromNodeId));
    const to = nodeById.get(String(link.toNodeId));
    const geometryBaseDistance =
      from && to
        ? Math.hypot(parseNumber(to.x, 0) - parseNumber(from.x, 0), parseNumber(to.y, 0) - parseNumber(from.y, 0))
        : link.length;
    return {
      ...link,
      geometryBaseLength: link.length,
      geometryBaseDistance,
    };
  });
  const demandRows = demandText ? parseDemandCsv(demandText) : [];

  if (nodes.length === 0) throw new Error("node.csv did not contain any rows.");
  if (links.length === 0) throw new Error("link.csv did not contain any rows.");
  if (demandRows.length === 0) {
    throw new Error("demand.csv is required for the current MVP.");
  }

  return {
    name,
    nodes,
    links,
    demandRows,
  };
}
