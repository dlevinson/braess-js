export function compareScenarios(offResult, onResult, tolerance = 1e-6) {
  const deltaCost = Number(onResult.equilibriumCost) - Number(offResult.equilibriumCost);
  const deltaDemand = Number(onResult.quantity) - Number(offResult.quantity);
  const deltaTravelTime = Number(onResult.metrics.totalTravelTime) - Number(offResult.metrics.totalTravelTime);
  const deltaConsumerSurplus =
    Number(onResult.metrics.consumerSurplus) - Number(offResult.metrics.consumerSurplus);
  const deltaWelfare = Number(onResult.metrics.totalWelfare) - Number(offResult.metrics.totalWelfare);

  return {
    deltaCost,
    deltaDemand,
    deltaTravelTime,
    deltaConsumerSurplus,
    deltaWelfare,
    paradox: deltaCost > tolerance,
    reducedDemand: deltaCost > tolerance && deltaDemand < -tolerance,
    welfareLoss: deltaWelfare < -tolerance,
    consumerSurplusLoss: deltaConsumerSurplus < -tolerance,
  };
}
