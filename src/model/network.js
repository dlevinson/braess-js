import { safeNumber } from "./costs.js";

function normalizeBoolean(value, fallback = true) {
  if (typeof value === "boolean") return value;
  const key = String(value ?? "").trim().toLowerCase();
  if (!key) return fallback;
  return !["false", "0", "no", "off"].includes(key);
}

function resolveNodeIdByZone(nodes, zoneId) {
  const match = nodes.find((node) => String(node.zoneId ?? node.id) === String(zoneId));
  return match?.id ?? null;
}

export function listDemandPairs(networkData) {
  return networkData.demandRows.map((row) => ({
    ...row,
    label: `${row.originZoneId} -> ${row.destinationZoneId} (${row.demand})`,
  }));
}

export function listCandidateLinks(networkData) {
  return networkData.links.filter((link) => link.candidateFlag);
}

export function cloneNetworkData(networkData) {
  return {
    ...networkData,
    nodes: networkData.nodes.map((node) => ({ ...node })),
    links: networkData.links.map((link) => ({ ...link })),
    demandRows: networkData.demandRows.map((row) => ({ ...row })),
  };
}

export function computeLinkGeometryLength(link, nodeById) {
  const from = nodeById.get(String(link.fromNodeId));
  const to = nodeById.get(String(link.toNodeId));
  if (!from || !to) return safeNumber(link.length, 0);

  const dx = safeNumber(to.x, 0) - safeNumber(from.x, 0);
  const dy = safeNumber(to.y, 0) - safeNumber(from.y, 0);
  const currentDistance = Math.hypot(dx, dy);
  const baseDistance = safeNumber(link.geometryBaseDistance, currentDistance);
  const baseLength = safeNumber(link.geometryBaseLength, link.length);
  if (baseDistance <= 1e-9) return baseLength;
  return baseLength * (currentDistance / baseDistance);
}

export function buildScenarioNetwork(networkData, options = {}) {
  const demandRow =
    networkData.demandRows.find((row) => row.key === options.selectedDemandKey) ??
    networkData.demandRows[0];
  const candidateLinkId = Number(options.selectedCandidateLinkId) || null;
  const scenarioMode = options.scenarioMode === "on" ? "on" : "off";
  const capacityScale = Math.max(Number(options.capacityScale ?? 1), 1e-9);

  const nodes = networkData.nodes.map((node) => ({ ...node }));
  const links = networkData.links.map((baseLink) => {
    const link = { ...baseLink };
    const isCandidate = candidateLinkId ? link.id === candidateLinkId : Boolean(link.candidateFlag);
    const structuralActive = Math.max(0, Number(link.lanes) || 0) > 0 && Math.max(0, Number(link.capacity) || 0) > 0;
    link.enabled = isCandidate ? scenarioMode === "on" && structuralActive : normalizeBoolean(link.enabled, true) && structuralActive;
    link.capacity = Math.max(safeNumber(link.capacity, 1) * capacityScale, 1e-9);

    return link;
  });

  const originId = resolveNodeIdByZone(nodes, demandRow.originZoneId);
  const destinationId = resolveNodeIdByZone(nodes, demandRow.destinationZoneId);

  if (!originId || !destinationId) {
    throw new Error("Could not map the selected demand row onto node zone_ids or node_ids.");
  }

  return {
    name: networkData.name,
    nodes,
    links,
    originId,
    destinationId,
    demandRow,
    scenarioMode,
    candidateLinkId,
  };
}

export function adjacencyFromLinks(links) {
  const adjacency = new Map();
  for (const link of links) {
    if (!link.enabled) continue;
    if (!adjacency.has(link.fromNodeId)) adjacency.set(link.fromNodeId, []);
    adjacency.get(link.fromNodeId).push(link);
  }
  return adjacency;
}
