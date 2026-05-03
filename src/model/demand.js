export const DEMAND_MODE = {
  FIXED: "fixed",
  ELASTIC: "elastic",
};

export function normalizeDemandMode(value) {
  return String(value ?? "").trim().toLowerCase() === DEMAND_MODE.ELASTIC
    ? DEMAND_MODE.ELASTIC
    : DEMAND_MODE.FIXED;
}

export function inverseDemandCost({ A, B }, quantity) {
  return Number(A) - Number(B) * Math.max(0, quantity);
}

export function inverseDemandMaxQuantity({ A, B }) {
  const intercept = Number(A);
  const slope = Number(B);
  if (!Number.isFinite(intercept) || !Number.isFinite(slope) || slope <= 0) {
    return 0;
  }
  return Math.max(0, intercept / slope);
}

export function consumerSurplusInverseDemand({ A, B }, quantity, generalizedCost) {
  const q = Math.max(0, Number(quantity));
  const intercept = Number(A);
  const slope = Math.max(0, Number(B));
  const totalWillingnessToPay = intercept * q - 0.5 * slope * q * q;
  return totalWillingnessToPay - Number(generalizedCost) * q;
}
