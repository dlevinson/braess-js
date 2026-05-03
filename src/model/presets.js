import { parseGmnsBundle } from "./gmnsParser.js";

const BRAESS_NODE_CSV = `node_id,x_coord,y_coord,zone_id,node_type,label
1,0,0,1,origin,Origin
2,1,1,,intersection,Upper
3,1,-1,,intersection,Lower
4,2,0,4,destination,Destination
`;

const BRAESS_LINK_CSV = `link_id,from_node_id,to_node_id,length,capacity,free_speed,lanes,link_type,cost_function_type,cost_a,cost_b,bpr_alpha,bpr_beta,enabled,candidate_flag,parameter_group,label
1,1,2,1,10,1,1,road,affine,0,10,0.15,4,true,false,variable,Origin to Upper
2,1,3,1,10,1,1,road,affine,45,0,0.15,4,true,false,constant,Origin to Lower
3,2,4,1,10,1,1,road,affine,45,0,0.15,4,true,false,constant,Upper to Destination
4,3,4,1,10,1,1,road,affine,0,10,0.15,4,true,false,variable,Lower to Destination
5,2,3,1,10,1,1,road,affine,0,0,0.15,4,false,true,candidate,Upper to Lower
`;

const BRAESS_DEMAND_CSV = `origin_zone_id,destination_zone_id,demand
1,4,6
`;

export const DEFAULT_INPUTS = {
  costModelMode: "affine",
  demandMode: "fixed",
  fixedDemand: 6,
  variableBaseCost: 0,
  variableCostB: 10,
  constantLinkCost: 45,
  candidateLinkCost: 0,
  candidateLinkB: 0,
  inverseDemandA: 180,
  inverseDemandB: 30,
  bprAlpha: 0.15,
  bprBeta: 4,
  capacityScale: 1,
  maxIterations: 120,
  tolerance: 1e-6,
  maxOuterIterations: 40,
  quantityTolerance: 1e-4,
  costTolerance: 1e-4,
  classificationTolerance: 1e-5,
};

export const DEFAULT_SWEEP = {
  xParameter: "variableCostB",
  yParameter: "fixedDemand",
  xMin: 1,
  xMax: 20,
  xSteps: 40,
  yMin: 2,
  yMax: 10,
  ySteps: 40,
  metric: "paradox",
};

export const DEFAULT_ELASTIC_MAP = {
  aMin: 90,
  aMax: 270,
  aSteps: 13,
  bMin: 15,
  bMax: 45,
  bSteps: 11,
  zParameter: "variableCostB",
  zMin: 4,
  zMax: 16,
  zSteps: 4,
};

export async function loadBraessPreset() {
  return parseGmnsBundle({
    nodeText: BRAESS_NODE_CSV,
    linkText: BRAESS_LINK_CSV,
    demandText: BRAESS_DEMAND_CSV,
    name: "Canonical Braess network",
  });
}
