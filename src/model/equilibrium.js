import { DEMAND_MODE, inverseDemandCost, inverseDemandMaxQuantity } from "./demand.js";
import { evaluateLinkCost } from "./costs.js";
import { computeScenarioWelfare } from "./welfare.js";
import { adjacencyFromLinks } from "./network.js";

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function buildPathId(path) {
  return path.links.map((link) => link.id).join(">");
}

export function enumerateSimplePaths(network, maxDepth = network.nodes.length + 1) {
  const adjacency = adjacencyFromLinks(network.links);
  const paths = [];

  function visit(nodeId, visited, pathLinks) {
    if (pathLinks.length > maxDepth) return;
    if (nodeId === network.destinationId) {
      paths.push({
        id: buildPathId({ links: pathLinks }),
        links: [...pathLinks],
      });
      return;
    }

    const outgoing = adjacency.get(nodeId) ?? [];
    for (const link of outgoing) {
      if (visited.has(link.toNodeId)) continue;
      visited.add(link.toNodeId);
      pathLinks.push(link);
      visit(link.toNodeId, visited, pathLinks);
      pathLinks.pop();
      visited.delete(link.toNodeId);
    }
  }

  const visited = new Set([network.originId]);
  visit(network.originId, visited, []);
  return paths;
}

function zeroLinkFlowMap(links) {
  return new Map(links.filter((link) => link.enabled).map((link) => [link.id, 0]));
}

function linkCostsFromFlows(links, linkFlows) {
  const costs = new Map();
  for (const link of links) {
    if (!link.enabled) continue;
    costs.set(link.id, evaluateLinkCost(link, linkFlows.get(link.id) ?? 0));
  }
  return costs;
}

function pathCost(path, linkCosts) {
  return sum(path.links.map((link) => linkCosts.get(link.id) ?? 0));
}

function linkFlowsFromPathFlows(paths, pathFlows) {
  const flows = new Map();
  paths.forEach((path, index) => {
    const pathFlow = pathFlows[index] ?? 0;
    for (const link of path.links) {
      flows.set(link.id, (flows.get(link.id) ?? 0) + pathFlow);
    }
  });
  return flows;
}

function shortestPathIndex(paths, linkCosts) {
  let bestIndex = 0;
  let bestCost = Infinity;
  paths.forEach((path, index) => {
    const cost = pathCost(path, linkCosts);
    if (cost < bestCost - 1e-12) {
      bestCost = cost;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function relativeGap(paths, pathFlows, linkCosts, shortestCost, demand) {
  if (demand <= 0 || shortestCost <= 0) return 0;
  let excess = 0;
  paths.forEach((path, index) => {
    const flow = pathFlows[index] ?? 0;
    if (flow <= 0) return;
    const cost = pathCost(path, linkCosts);
    excess += flow * Math.max(0, cost - shortestCost);
  });
  return excess / Math.max(demand * shortestCost, 1e-9);
}

function solveZeroDemand(network, demandMode, inverseDemand) {
  const paths = enumerateSimplePaths(network);
  const linkFlows = zeroLinkFlowMap(network.links);
  const linkCosts = linkCostsFromFlows(network.links, linkFlows);
  const equilibriumCost = paths.length > 0 ? Math.min(...paths.map((path) => pathCost(path, linkCosts))) : 0;
  const metrics = computeScenarioWelfare({
    demandMode,
    quantity: 0,
    equilibriumCost,
    inverseDemand,
    linkFlows,
    linkCosts,
  });

  return {
    quantity: 0,
    equilibriumCost,
    shortestPathCost: equilibriumCost,
    paths,
    pathFlows: paths.map(() => 0),
    linkFlows,
    linkCosts,
    convergence: [],
    metrics,
  };
}

export function solveFixedDemandEquilibrium(network, options = {}) {
  const demand = Math.max(0, Number(options.demand ?? 0));
  const maxIterations = Math.max(1, Number(options.maxIterations ?? 120));
  const tolerance = Math.max(1e-10, Number(options.tolerance ?? 1e-6));

  if (demand <= 0) {
    return solveZeroDemand(network, DEMAND_MODE.FIXED, options.inverseDemand);
  }

  const paths = enumerateSimplePaths(network);
  if (paths.length === 0) {
    throw new Error("No enabled origin-destination path exists in the current network.");
  }

  let pathFlows = paths.map(() => 0);
  const convergence = [];

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const linkFlows = linkFlowsFromPathFlows(paths, pathFlows);
    const linkCosts = linkCostsFromFlows(network.links, linkFlows);
    const bestIndex = shortestPathIndex(paths, linkCosts);
    const shortestCost = pathCost(paths[bestIndex], linkCosts);
    const aonFlows = paths.map((_, index) => (index === bestIndex ? demand : 0));
    const stepSize = iteration === 1 ? 1 : 1 / iteration;

    pathFlows = pathFlows.map((value, index) => value + stepSize * (aonFlows[index] - value));

    const updatedLinkFlows = linkFlowsFromPathFlows(paths, pathFlows);
    const updatedLinkCosts = linkCostsFromFlows(network.links, updatedLinkFlows);
    const updatedShortestCost = pathCost(paths[shortestPathIndex(paths, updatedLinkCosts)], updatedLinkCosts);
    const gap = relativeGap(paths, pathFlows, updatedLinkCosts, updatedShortestCost, demand);

    convergence.push({
      iteration,
      stepSize,
      shortestCost: updatedShortestCost,
      gap,
    });

    if (iteration >= 5 && gap <= tolerance) {
      break;
    }
  }

  const finalLinkFlows = linkFlowsFromPathFlows(paths, pathFlows);
  const finalLinkCosts = linkCostsFromFlows(network.links, finalLinkFlows);
  const pathCosts = paths.map((path) => pathCost(path, finalLinkCosts));
  const weightedCost =
    demand > 0 ? sum(pathCosts.map((cost, index) => cost * pathFlows[index])) / demand : 0;
  const shortestPathCost = Math.min(...pathCosts);
  const metrics = computeScenarioWelfare({
    demandMode: DEMAND_MODE.FIXED,
    quantity: demand,
    equilibriumCost: weightedCost,
    inverseDemand: options.inverseDemand,
    linkFlows: finalLinkFlows,
    linkCosts: finalLinkCosts,
  });

  return {
    quantity: demand,
    equilibriumCost: weightedCost,
    shortestPathCost,
    paths,
    pathFlows,
    linkFlows: finalLinkFlows,
    linkCosts: finalLinkCosts,
    convergence,
    metrics,
  };
}

export function solveElasticDemandEquilibrium(network, options = {}) {
  const inverseDemand = {
    A: Number(options.inverseDemand?.A ?? 0),
    B: Number(options.inverseDemand?.B ?? 0),
  };
  const maxOuterIterations = Math.max(1, Number(options.maxOuterIterations ?? 40));
  const quantityTolerance = Math.max(1e-8, Number(options.quantityTolerance ?? 1e-4));
  const costTolerance = Math.max(1e-8, Number(options.costTolerance ?? 1e-4));
  const qMax = Math.max(Number(options.maxDemand ?? inverseDemandMaxQuantity(inverseDemand)), 0);

  if (qMax <= 0) {
    return {
      ...solveZeroDemand(network, DEMAND_MODE.ELASTIC, inverseDemand),
      zeroDemandReason: "Inverse-demand slope/intercept imply no positive maximum demand.",
    };
  }

  const evaluate = (quantity) => {
    const result = solveFixedDemandEquilibrium(network, {
      demand: quantity,
      maxIterations: options.maxIterations,
      tolerance: options.tolerance,
      inverseDemand,
    });
    const willingnessToPay = inverseDemandCost(inverseDemand, quantity);
    return {
      quantity,
      result,
      generalizedCost: result.shortestPathCost,
      diff: result.shortestPathCost - willingnessToPay,
      willingnessToPay,
    };
  };

  const zeroCost = solveZeroDemand(network, DEMAND_MODE.ELASTIC, inverseDemand);
  if (zeroCost.equilibriumCost >= inverseDemand.A) {
    return {
      ...zeroCost,
      zeroDemandReason: `No-flow OD cost ${zeroCost.equilibriumCost.toFixed(4)} is at or above inverse-demand intercept A ${inverseDemand.A.toFixed(4)}.`,
    };
  }

  let lower = evaluate(0);
  let upper = evaluate(qMax);
  let best = Math.abs(lower.diff) <= Math.abs(upper.diff) ? lower : upper;

  for (let iteration = 0; iteration < maxOuterIterations; iteration += 1) {
    const midQuantity = 0.5 * (lower.quantity + upper.quantity);
    const current = evaluate(midQuantity);
    current.iteration = iteration + 1;
    best = Math.abs(current.diff) < Math.abs(best.diff) ? current : best;

    if (Math.abs(current.diff) <= costTolerance || Math.abs(upper.quantity - lower.quantity) <= quantityTolerance) {
      best = current;
      break;
    }

    if (current.diff > 0) {
      upper = current;
    } else {
      lower = current;
    }
  }

  const metrics = computeScenarioWelfare({
    demandMode: DEMAND_MODE.ELASTIC,
    quantity: best.quantity,
    equilibriumCost: best.result.equilibriumCost,
    inverseDemand,
    linkFlows: best.result.linkFlows,
    linkCosts: best.result.linkCosts,
  });

  return {
    ...best.result,
    quantity: best.quantity,
    inverseDemand,
    outerTrace: [lower, upper, best].filter(Boolean),
    metrics,
  };
}
