import { DEFAULT_ELASTIC_MAP, DEFAULT_INPUTS, DEFAULT_SWEEP } from "./model/presets.js";

export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  return {
    get() {
      return state;
    },
    set(nextState) {
      state = nextState;
      listeners.forEach((listener) => listener(state));
    },
    update(updater) {
      this.set(updater(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function createInitialState() {
  return {
    networkData: null,
    selectedLinkId: "",
    selectedNodeId: "",
    inputs: {
      ...DEFAULT_INPUTS,
      selectedDemandKey: "",
      selectedCandidateLinkId: "",
    },
    sweep: { ...DEFAULT_SWEEP },
    elasticMap: { ...DEFAULT_ELASTIC_MAP },
    viewScenario: "on",
    scenarioResults: {
      off: null,
      on: null,
    },
    comparison: null,
    modeComparison: null,
    elasticRegionMap: null,
    sweepResult: null,
    sweepProgress: null,
    sweepRunning: false,
    status: "Loading canonical Braess preset...",
    error: "",
  };
}
