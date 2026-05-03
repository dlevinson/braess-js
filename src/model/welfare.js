import { consumerSurplusInverseDemand } from "./demand.js";

export function totalSystemTravelTime(linkFlows, linkCosts) {
  let total = 0;
  for (const [linkId, flow] of linkFlows.entries()) {
    total += Number(flow) * Number(linkCosts.get(linkId) ?? 0);
  }
  return total;
}

export function computeScenarioWelfare({
  demandMode,
  quantity,
  equilibriumCost,
  inverseDemand,
  linkFlows,
  linkCosts,
}) {
  const totalTravelTime = totalSystemTravelTime(linkFlows, linkCosts);
  const consumerSurplus =
    demandMode === "elastic"
      ? consumerSurplusInverseDemand(inverseDemand, quantity, equilibriumCost)
      : 0;

  return {
    totalTravelTime,
    averageTravelTime: quantity > 0 ? totalTravelTime / quantity : equilibriumCost,
    consumerSurplus,
    totalWelfare: consumerSurplus - totalTravelTime,
  };
}
