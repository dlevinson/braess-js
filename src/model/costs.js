export const COST_FUNCTION = {
  AFFINE: "affine",
  BPR: "bpr",
};

export function normalizeCostFunction(value) {
  const key = String(value ?? "").trim().toLowerCase();
  return key === COST_FUNCTION.BPR ? COST_FUNCTION.BPR : COST_FUNCTION.AFFINE;
}

export function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function evaluateAffineCost(link, flow) {
  const a = safeNumber(link.costA, 0);
  const b = safeNumber(link.costB, 0);
  return a + b * Math.max(0, flow);
}

export function resolveBprFreeFlowTime(link) {
  const overrideT0 = safeNumber(link.costA, NaN);
  if (Number.isFinite(overrideT0) && overrideT0 > 0) {
    return overrideT0;
  }

  const length = Math.max(safeNumber(link.length, 1), 1e-9);
  const freeSpeed = Math.max(safeNumber(link.freeSpeed, 1), 1e-9);
  return length / freeSpeed;
}

export function evaluateBprCost(link, flow) {
  const t0 = Math.max(resolveBprFreeFlowTime(link), 1e-9);
  const alpha = safeNumber(link.bprAlpha, 0.15);
  const beta = safeNumber(link.bprBeta, 4);
  const capacity = Math.max(safeNumber(link.capacity, 1), 1e-9);
  return t0 * (1 + alpha * Math.pow(Math.max(0, flow) / capacity, beta));
}

export function evaluateLinkCost(link, flow) {
  const type = normalizeCostFunction(link.costFunctionType);
  if (type === COST_FUNCTION.BPR) {
    return evaluateBprCost(link, flow);
  }
  return evaluateAffineCost(link, flow);
}

export function describeCostFunction(link) {
  const type = normalizeCostFunction(link.costFunctionType);
  if (type === COST_FUNCTION.BPR) {
    const t0 = resolveBprFreeFlowTime(link);
    const source = safeNumber(link.costA, 0) > 0 ? "override" : "length/free_speed";
    return `t(x) = ${t0.toFixed(4)} * (1 + ${link.bprAlpha} * (x/${link.capacity})^${link.bprBeta}) [t0 from ${source}]`;
  }
  return `t(x) = ${link.costA} + ${link.costB} x`;
}
