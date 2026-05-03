import { createInitialState, createStore } from "./state.js";
import { renderLayout } from "./ui/layout.js";
import { bindControls, populateSelect, readFormValues, writeFormValues } from "./ui/controls.js";
import { renderComparisonTable, renderBatchTable } from "./ui/tables.js";
import { renderNetworkView } from "./ui/networkView.js";
import { renderConvergenceChart, renderDemandCurveChart, renderSliceChart } from "./ui/charts.js";
import { renderHeatmap } from "./ui/heatmap.js";
import { renderElasticRegionMap } from "./ui/elasticRegionMap.js";
import { DEFAULT_ELASTIC_MAP, DEFAULT_INPUTS, DEFAULT_SWEEP, loadBraessPreset } from "./model/presets.js";
import { listCandidateLinks, listDemandPairs, buildScenarioNetwork, cloneNetworkData, computeLinkGeometryLength } from "./model/network.js";
import { solveElasticDemandEquilibrium, solveFixedDemandEquilibrium } from "./model/equilibrium.js";
import { DEMAND_MODE } from "./model/demand.js";
import { compareScenarios } from "./model/paradox.js";
import { SWEEP_PARAMETERS, runParameterSweep } from "./model/sweep.js";
import { runElasticOutcomeSpace } from "./model/elasticRegions.js";
import { describeCostFunction } from "./model/costs.js";

function normalizeInputs(rawInputs) {
  const numeric = (key, fallback = DEFAULT_INPUTS[key]) => {
    const parsed = Number(rawInputs[key]);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return {
    ...DEFAULT_INPUTS,
    ...rawInputs,
    fixedDemand: numeric("fixedDemand"),
    variableBaseCost: numeric("variableBaseCost"),
    variableCostB: numeric("variableCostB"),
    constantLinkCost: numeric("constantLinkCost"),
    candidateLinkCost: numeric("candidateLinkCost"),
    candidateLinkB: numeric("candidateLinkB", 0),
    inverseDemandA: numeric("inverseDemandA"),
    inverseDemandB: numeric("inverseDemandB"),
    bprAlpha: numeric("bprAlpha"),
    bprBeta: numeric("bprBeta"),
    capacityScale: numeric("capacityScale"),
    maxIterations: numeric("maxIterations"),
    tolerance: numeric("tolerance"),
    maxOuterIterations: numeric("maxOuterIterations"),
    quantityTolerance: numeric("quantityTolerance"),
    costTolerance: numeric("costTolerance"),
    classificationTolerance: numeric("classificationTolerance"),
  };
}

function syncElasticDemandInputs(inputs, changedKey = "") {
  if (inputs.demandMode !== DEMAND_MODE.ELASTIC) {
    return inputs;
  }

  const safePositive = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };
  const inverseDemandA = safePositive(inputs.inverseDemandA, DEFAULT_INPUTS.inverseDemandA);
  const fixedDemand = safePositive(inputs.fixedDemand, DEFAULT_INPUTS.fixedDemand);
  const inverseDemandB = safePositive(inputs.inverseDemandB, inverseDemandA / fixedDemand);

  if (changedKey === "inverseDemandB") {
    return {
      ...inputs,
      inverseDemandA,
      inverseDemandB,
      fixedDemand: inverseDemandA / inverseDemandB,
    };
  }

  return {
    ...inputs,
    inverseDemandA,
    fixedDemand,
    inverseDemandB: inverseDemandA / fixedDemand,
  };
}

function normalizeSweep(rawSweep) {
  return {
    ...DEFAULT_SWEEP,
    ...rawSweep,
    xMin: Number(rawSweep.xMin),
    xMax: Number(rawSweep.xMax),
    xSteps: Number(rawSweep.xSteps),
    yMin: Number(rawSweep.yMin),
    yMax: Number(rawSweep.yMax),
    ySteps: Number(rawSweep.ySteps),
  };
}

function normalizeElasticMap(rawElasticMap) {
  const numeric = (key, fallback = DEFAULT_ELASTIC_MAP[key]) => {
    const parsed = Number(rawElasticMap[key]);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  return {
    ...DEFAULT_ELASTIC_MAP,
    ...rawElasticMap,
    aMin: numeric("aMin"),
    aMax: numeric("aMax"),
    aSteps: Math.max(2, Math.min(30, Math.round(numeric("aSteps")))),
    bMin: numeric("bMin"),
    bMax: numeric("bMax"),
    bSteps: Math.max(2, Math.min(30, Math.round(numeric("bSteps")))),
    zMin: numeric("zMin"),
    zMax: numeric("zMax"),
    zSteps: Math.max(1, Math.min(12, Math.round(numeric("zSteps")))),
  };
}

function scenarioSummary(state, scenarioMode) {
  const result = state.scenarioResults[scenarioMode];
  return result ?? null;
}

function getSelectedLink(state) {
  if (!state.networkData) return null;
  return (
    state.networkData.links.find((link) => String(link.id) === String(state.selectedLinkId)) ??
    listCandidateLinks(state.networkData)[0] ??
    state.networkData.links[0] ??
    null
  );
}

function getSelectedNode(state) {
  if (!state.networkData) return null;
  return state.networkData.nodes.find((node) => String(node.id) === String(state.selectedNodeId)) ?? null;
}

function selectionDetailHtml(selectedLink, selectedNode) {
  if (selectedLink) {
    return [
      `from ${selectedLink.fromNodeId} to ${selectedLink.toNodeId}`,
      `lanes ${Number(selectedLink.lanes) || 0}, capacity ${Number(selectedLink.capacity) || 0}`,
      `length ${Number(selectedLink.length) || 0}, free speed ${Number(selectedLink.freeSpeed) || 0}`,
      `cost: ${describeCostFunction(selectedLink)}`,
    ]
      .map((line) => `<div>${line}</div>`)
      .join("");
  }

  if (selectedNode) {
    return [
      `zone ${selectedNode.zoneId ?? "—"}, type ${selectedNode.nodeType ?? "intersection"}`,
      `x ${Number(selectedNode.x).toFixed(2)}, y ${Number(selectedNode.y).toFixed(2)}`,
    ]
      .map((line) => `<div>${line}</div>`)
      .join("");
  }

  return `<div>Select a node or link to inspect its properties.</div>`;
}

function solveScenario(networkData, inputs, scenarioMode) {
  const network = buildScenarioNetwork(networkData, {
    ...inputs,
    scenarioMode,
  });

  if (inputs.demandMode === DEMAND_MODE.ELASTIC) {
    return solveElasticDemandEquilibrium(network, {
      inverseDemand: {
        A: inputs.inverseDemandA,
        B: inputs.inverseDemandB,
      },
      maxIterations: inputs.maxIterations,
      tolerance: inputs.tolerance,
      maxOuterIterations: inputs.maxOuterIterations,
      quantityTolerance: inputs.quantityTolerance,
      costTolerance: inputs.costTolerance,
    });
  }

  return solveFixedDemandEquilibrium(network, {
    demand: inputs.fixedDemand,
    maxIterations: inputs.maxIterations,
    tolerance: inputs.tolerance,
    inverseDemand: {
      A: inputs.inverseDemandA,
      B: inputs.inverseDemandB,
    },
  });
}

function solveFixedReferenceScenario(networkData, inputs, scenarioMode) {
  const network = buildScenarioNetwork(networkData, {
    ...inputs,
    scenarioMode,
  });

  return solveFixedDemandEquilibrium(network, {
    demand: inputs.fixedDemand,
    maxIterations: inputs.maxIterations,
    tolerance: inputs.tolerance,
    inverseDemand: {
      A: inputs.inverseDemandA,
      B: inputs.inverseDemandB,
    },
  });
}

function exportCsv(filename, rows) {
  const header = Object.keys(rows[0] ?? {});
  const body = rows.map((row) => header.map((key) => row[key]).join(",")).join("\n");
  const blob = new Blob([`${header.join(",")}\n${body}\n`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportSvg(filename, svgElement) {
  if (!svgElement) return;
  const blob = new Blob([svgElement.outerHTML], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportSvgAsPng(filename, svgElement) {
  if (!svgElement) return;
  const data = new XMLSerializer().serializeToString(svgElement);
  const image = new Image();
  const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  image.onload = () => {
    const canvas = document.createElement("canvas");
    const viewBox = svgElement.viewBox.baseVal;
    canvas.width = viewBox.width || 1200;
    canvas.height = viewBox.height || 600;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    canvas.toBlob((pngBlob) => {
      const pngUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(pngUrl);
    });
  };
  image.src = url;
}

function buildModelDetails(state) {
  const inputs = state.inputs;
  return `
    <p>This app solves a one-origin, one-destination static user-equilibrium problem with Method of Successive Averages. In fixed-trip mode it keeps demand constant. In elastic-trip mode it wraps the same solver in an outer search until route cost matches the inverse-demand curve C(q) = A - Bq.</p>
    <p>The built-in preset uses normalized demand units for a research toy. A default value of 6 means 6 equal demand packets, not 6 literal vehicles. The demand-curve chart makes that scaling visible through its X and Y intercepts.</p>
    <p>Affine links use t(x) = a + bx. BPR links use t(x) = t0 * (1 + alpha * (x / capacity)^beta), with t0 taken from the positive t0 override when present, otherwise from GMNS length / free speed.</p>
    <p>The Braess test is simple: the added link counts as harmful only if equilibrium cost with the link is higher than equilibrium cost without it by more than ${inputs.classificationTolerance}. The reduced-demand test asks whether that higher-cost case also carries fewer trips.</p>
    <p>Current settings: MSA tolerance ${inputs.tolerance}, MSA iterations ${inputs.maxIterations}, outer iterations ${inputs.maxOuterIterations}, quantity tolerance ${inputs.quantityTolerance}, cost tolerance ${inputs.costTolerance}. These are numerical results, not closed-form exact solutions.</p>
  `;
}

function syncSelections(elements, state) {
  const demandOptions = state.networkData
    ? listDemandPairs(state.networkData).map((row) => ({ value: row.key, label: row.label }))
    : [{ value: "", label: "Load a network first" }];
  populateSelect(
    elements.fieldInputs.find((input) => input.dataset.field === "selectedDemandKey"),
    demandOptions,
    state.inputs.selectedDemandKey || demandOptions[0]?.value,
  );

  const candidateOptions = state.networkData
    ? listCandidateLinks(state.networkData).map((link) => ({ value: link.id, label: `${link.id}: ${link.label}` }))
    : [{ value: "", label: "Load a network first" }];
  populateSelect(
    elements.fieldInputs.find((input) => input.dataset.field === "selectedCandidateLinkId"),
    candidateOptions,
    state.inputs.selectedCandidateLinkId || candidateOptions[0]?.value,
  );

  const parameterOptions = SWEEP_PARAMETERS.map((option) => ({ value: option.key, label: option.label }));
  populateSelect(
    elements.sweepInputs.find((input) => input.dataset.sweep === "xParameter"),
    parameterOptions,
    state.sweep.xParameter,
  );
  populateSelect(
    elements.sweepInputs.find((input) => input.dataset.sweep === "yParameter"),
    parameterOptions,
    state.sweep.yParameter,
  );
}

function installControlAccordion(elements) {
  elements.controlCards.forEach((card) => {
    card.addEventListener("toggle", () => {
      if (!card.open) return;
      elements.controlCards.forEach((other) => {
        if (other !== card) {
          other.open = false;
        }
      });
    });
  });
}

export function createApp(root) {
  const elements = renderLayout(root);
  installControlAccordion(elements);
  const store = createStore(createInitialState());
  const sweepController = { cancelled: false };

  function render() {
    const state = store.get();
    const selectedLink = getSelectedLink(state);
    const selectedNode = getSelectedNode(state);
    writeFormValues(elements, state);
    syncSelections(elements, state);
    const isElasticDemand = state.inputs.demandMode === DEMAND_MODE.ELASTIC;
    elements.elasticDemandControls.forEach((control) => {
      control.hidden = !isElasticDemand;
      control.querySelectorAll("input, select").forEach((input) => {
        input.disabled = !isElasticDemand;
      });
    });
    elements.status.textContent = state.status;
    elements.error.textContent = state.error;
    elements.progress.textContent = state.sweepProgress
      ? `Sweep progress: ${(100 * state.sweepProgress.fraction).toFixed(1)}%`
      : "";
    elements.editSelection.textContent = selectedLink
      ? `Selected link ${selectedLink.id}: ${selectedLink.label}`
      : selectedNode
        ? `Selected node ${selectedNode.id}: ${selectedNode.label}`
        : "Select a link or node on the map.";
    elements.selectionDetails.innerHTML = selectionDetailHtml(selectedLink, selectedNode);
    elements.editLinkLanes.value = selectedLink ? String(Math.max(0, Number(selectedLink.lanes) || 0)) : "";
    elements.editLinkCapacity.value = selectedLink ? String(Math.max(0, Number(selectedLink.capacity) || 0)) : "";
    elements.editLinkLength.value = selectedLink ? String(Math.max(0, Number(selectedLink.length) || 0)) : "";
    elements.editLinkFreeSpeed.value = selectedLink ? String(Math.max(0, Number(selectedLink.freeSpeed) || 0)) : "";
    elements.editLinkFunction.value = selectedLink ? String(selectedLink.costFunctionType || "affine") : "affine";
    elements.editLinkCostA.value = selectedLink ? String(Number(selectedLink.costA) || 0) : "";
    elements.editLinkCostB.value = selectedLink ? String(Number(selectedLink.costB) || 0) : "";
    elements.editLinkBprAlpha.value = selectedLink ? String(Number(selectedLink.bprAlpha) || 0.15) : "";
    elements.editLinkBprBeta.value = selectedLink ? String(Number(selectedLink.bprBeta) || 4) : "";
    elements.editLinkLanes.disabled = !selectedLink;
    elements.editLinkCapacity.disabled = !selectedLink;
    elements.editLinkLength.disabled = !selectedLink;
    elements.editLinkFreeSpeed.disabled = !selectedLink;
    elements.editLinkFunction.disabled = !selectedLink;
    elements.editLinkCostA.disabled = !selectedLink;
    elements.editLinkCostB.disabled = !selectedLink;
    elements.editLinkBprAlpha.disabled = !selectedLink;
    elements.editLinkBprBeta.disabled = !selectedLink;
    renderComparisonTable(
      elements.comparisonTable,
      state.scenarioResults.off,
      state.scenarioResults.on,
      state.comparison,
      state.inputs.demandMode,
      state.inputs,
      state.modeComparison,
    );
    renderConvergenceChart(elements.convergenceChart, scenarioSummary(state, state.viewScenario));
    renderDemandCurveChart(elements.demandCurve, state.inputs, handleDemandCurveChange);
    renderSliceChart(elements.sliceChart, state.sweepResult);
    renderHeatmap(elements.heatmap, state.sweepResult, state.sweep);
    renderElasticRegionMap(elements.elasticRegionMap, state.elasticRegionMap);
    renderBatchTable(elements.batchTable, state.sweepResult);
    renderNetworkView(
      elements.network,
      state.networkData,
      scenarioSummary(state, state.viewScenario),
      {
        scenarioMode: state.viewScenario,
        selectedCandidateLinkId: state.inputs.selectedCandidateLinkId,
        selectedLinkId: state.selectedLinkId,
        selectedNodeId: state.selectedNodeId,
        onNodePositionChange: handleNodePositionChange,
        onNodeGeometryPreview: handleNodeGeometryPreview,
        onLinkSelect: handleLinkSelect,
        onNodeSelect: handleNodeSelect,
      },
    );
    elements.modelDetails.innerHTML = buildModelDetails(state);
  }

  function captureForms() {
    const { inputs: rawInputs, sweep: rawSweep, elasticMap: rawElasticMap } = readFormValues(elements);
    return {
      inputs: normalizeInputs(rawInputs),
      sweep: normalizeSweep(rawSweep),
      elasticMap: normalizeElasticMap(rawElasticMap),
    };
  }

  function updateFormsIntoState(sourceInput = null) {
    const { inputs, sweep, elasticMap } = captureForms();
    const changedField = sourceInput?.dataset.field ?? "";
    const changedElasticMap = sourceInput?.dataset.elasticMap ?? "";
    const syncedInputs = syncElasticDemandInputs(inputs, changedField);
    const modelInputChanged = Boolean(changedField && changedField !== "viewScenario");
    store.update((state) => ({
      ...state,
      inputs: {
        ...state.inputs,
        ...syncedInputs,
        selectedDemandKey: syncedInputs.selectedDemandKey,
        selectedCandidateLinkId: syncedInputs.selectedCandidateLinkId,
      },
      sweep,
      elasticMap,
      viewScenario: syncedInputs.viewScenario || state.viewScenario,
      ...(modelInputChanged || changedElasticMap
        ? {
            scenarioResults: { off: null, on: null },
            comparison: null,
            modeComparison: null,
            elasticRegionMap: null,
          }
        : {}),
    }));
  }

  function handleNodePositionChange(nodeId, position) {
    store.update((state) => {
      if (!state.networkData) return state;
      const networkData = cloneNetworkData(state.networkData);
      networkData.nodes = networkData.nodes.map((node) =>
        String(node.id) === String(nodeId) ? { ...node, x: position.x, y: position.y } : node,
      );
      const nodeById = new Map(networkData.nodes.map((node) => [String(node.id), node]));
      networkData.links = networkData.links.map((link) =>
        String(link.fromNodeId) === String(nodeId) || String(link.toNodeId) === String(nodeId)
          ? { ...link, length: computeLinkGeometryLength(link, nodeById) }
          : link,
      );
      return {
        ...state,
        networkData,
        scenarioResults: { off: null, on: null },
        comparison: null,
        modeComparison: null,
        elasticRegionMap: null,
        status: "Moved node and updated connected link lengths. Re-run the model to refresh results.",
      };
    });
  }

  function handleNodeGeometryPreview(nodeId, preview) {
    const state = store.get();
    const selectedPreviewLink =
      preview.links?.find((link) => String(link.id) === String(state.selectedLinkId)) ?? null;
    const selectedPreviewNode = preview.node;

    if (selectedPreviewLink) {
      elements.selectionDetails.innerHTML = selectionDetailHtml(selectedPreviewLink, null);
      elements.editLinkLength.value = String(Math.max(0, Number(selectedPreviewLink.length) || 0));
    } else if (selectedPreviewNode) {
      elements.editSelection.textContent = `Selected node ${selectedPreviewNode.id}: ${selectedPreviewNode.label}`;
      elements.selectionDetails.innerHTML = selectionDetailHtml(null, selectedPreviewNode);
    }
  }

  function handleLinkSelect(linkId) {
    store.update((state) => ({
      ...state,
      selectedLinkId: String(linkId),
      selectedNodeId: "",
      status: `Selected link ${linkId} for editing.`,
      error: "",
    }));
  }

  function handleNodeSelect(nodeId) {
    store.update((state) => ({
      ...state,
      selectedNodeId: String(nodeId),
      selectedLinkId: "",
      status: `Selected node ${nodeId} for inspection.`,
      error: "",
    }));
  }

  function handleDemandCurveChange(nextValues) {
    store.update((state) => ({
      ...state,
      inputs: {
        ...state.inputs,
        inverseDemandA: nextValues.inverseDemandA ?? state.inputs.inverseDemandA,
        inverseDemandB: nextValues.inverseDemandB ?? state.inputs.inverseDemandB,
        fixedDemand: nextValues.fixedDemand ?? state.inputs.fixedDemand,
      },
      scenarioResults: { off: null, on: null },
      comparison: null,
      modeComparison: null,
      elasticRegionMap: null,
      status:
        nextValues.fixedDemand !== undefined
          ? `Initial trips updated to ${nextValues.fixedDemand.toFixed(2)}.`
          : `Demand curve updated: A ${nextValues.inverseDemandA.toFixed(2)}, B ${nextValues.inverseDemandB.toFixed(4)}.`,
      error: "",
    }));
  }

  function installNetwork(networkData, status) {
    const demandKey = networkData.demandRows[0]?.key ?? "";
    const candidateLinkId = listCandidateLinks(networkData)[0]?.id ?? "";
    const selectedLinkId = String(candidateLinkId || networkData.links[0]?.id || "");

    store.update((state) => ({
      ...state,
      networkData,
      selectedLinkId,
      selectedNodeId: "",
      inputs: {
        ...state.inputs,
        selectedDemandKey: demandKey,
        selectedCandidateLinkId: String(candidateLinkId),
      },
      scenarioResults: { off: null, on: null },
      comparison: null,
      modeComparison: null,
      elasticRegionMap: null,
      sweepResult: null,
      status,
      error: "",
    }));
  }

  function handleApplyLinkEdit() {
    const state = store.get();
    const selectedLink = getSelectedLink(state);
    if (!state.networkData || !selectedLink) return;

    const lanes = Math.max(0, Math.round(Number(elements.editLinkLanes.value)));
    const capacity = Math.max(0, Number(elements.editLinkCapacity.value));
    const length = Math.max(0, Number(elements.editLinkLength.value));
    const freeSpeed = Math.max(0, Number(elements.editLinkFreeSpeed.value));
    const costA = Number(elements.editLinkCostA.value);
    const costB = Number(elements.editLinkCostB.value);
    const bprAlpha = Number(elements.editLinkBprAlpha.value);
    const bprBeta = Number(elements.editLinkBprBeta.value);
    const costFunctionType = elements.editLinkFunction.value === "bpr" ? "bpr" : "affine";

    if (
      !Number.isFinite(lanes) ||
      !Number.isFinite(capacity) ||
      !Number.isFinite(length) ||
      !Number.isFinite(freeSpeed) ||
      !Number.isFinite(costA) ||
      !Number.isFinite(costB) ||
      !Number.isFinite(bprAlpha) ||
      !Number.isFinite(bprBeta)
    ) {
      store.update((current) => ({
        ...current,
        error: "Enter valid lanes, capacity, length, free speed, and link performance values before applying the edit.",
      }));
      return;
    }

    const networkData = cloneNetworkData(state.networkData);
    const nodeById = new Map(networkData.nodes.map((node) => [String(node.id), node]));
    networkData.links = networkData.links.map((link) =>
      String(link.id) === String(selectedLink.id)
        ? (() => {
            const from = nodeById.get(String(link.fromNodeId));
            const to = nodeById.get(String(link.toNodeId));
            const currentGeometryDistance =
              from && to ? Math.hypot(Number(to.x) - Number(from.x), Number(to.y) - Number(from.y)) : Number(link.geometryBaseDistance) || 1;
            return {
              ...link,
              lanes,
              capacity,
              length,
              freeSpeed,
              enabled: lanes > 0 && capacity > 0,
              costFunctionType,
              costA,
              costB,
              bprAlpha,
              bprBeta,
              geometryBaseLength: length,
              geometryBaseDistance: currentGeometryDistance,
            };
          })()
        : link,
    );

    store.update((current) => ({
      ...current,
      networkData,
      scenarioResults: { off: null, on: null },
      comparison: null,
      modeComparison: null,
      elasticRegionMap: null,
      status: `Updated link ${selectedLink.id}: lanes ${lanes}, capacity ${capacity}, length ${length}, free speed ${freeSpeed}, ${costFunctionType} LPF.`,
      error: "",
    }));
  }

  function handleCloseSelectedLink() {
    const state = store.get();
    const selectedLink = getSelectedLink(state);
    if (!state.networkData || !selectedLink) return;

    const networkData = cloneNetworkData(state.networkData);
    networkData.links = networkData.links.map((link) =>
      String(link.id) === String(selectedLink.id)
        ? {
            ...link,
            lanes: 0,
            capacity: 0,
            enabled: false,
          }
        : link,
    );

    store.update((current) => ({
      ...current,
      networkData,
      scenarioResults: { off: null, on: null },
      comparison: null,
      modeComparison: null,
      elasticRegionMap: null,
      status: `Link ${selectedLink.id} is now closed with zero lanes and zero capacity.`,
      error: "",
    }));
  }

  async function handleLoadPreset() {
    store.update((state) => ({ ...state, status: "Loading the Braess example...", error: "" }));
    try {
      const networkData = await loadBraessPreset();
      installNetwork(networkData, "Braess example loaded.");
    } catch (error) {
      store.update((state) => ({ ...state, error: error.message, status: "Could not load the Braess example." }));
    }
  }

  function handleSolveScenario(scenarioMode) {
    updateFormsIntoState();
    const state = store.get();
    if (!state.networkData) return;

    try {
      const result = solveScenario(state.networkData, state.inputs, scenarioMode);
      store.update((current) => ({
        ...current,
        scenarioResults: {
          ...current.scenarioResults,
          [scenarioMode]: result,
        },
        modeComparison: null,
        viewScenario: scenarioMode,
        status: result.zeroDemandReason
          ? `Solved ${scenarioMode === "off" ? "without" : "with"} the added link, but elastic demand is zero: ${result.zeroDemandReason}`
          : scenarioMode === "off"
            ? "Solved the case without the added link."
            : "Solved the case with the added link.",
        error: "",
      }));
    } catch (error) {
      store.update((current) => ({ ...current, error: error.message, status: "The solve step failed." }));
    }
  }

  function handleCompare() {
    updateFormsIntoState();
    const state = store.get();
    if (!state.networkData) return;

    try {
      const off = solveScenario(state.networkData, state.inputs, "off");
      const on = solveScenario(state.networkData, state.inputs, "on");
      const comparison = compareScenarios(off, on, state.inputs.classificationTolerance);
      const modeComparison =
        state.inputs.demandMode === DEMAND_MODE.ELASTIC
          ? {
              offFixed: solveFixedReferenceScenario(state.networkData, state.inputs, "off"),
              onFixed: solveFixedReferenceScenario(state.networkData, state.inputs, "on"),
            }
          : null;
      store.update((current) => ({
        ...current,
        scenarioResults: { off, on },
        comparison,
        modeComparison,
        status:
          off.zeroDemandReason || on.zeroDemandReason
            ? "Both cases solved, but elastic demand is zero in at least one scenario because the demand curve intercept is too low."
            : comparison.paradox
              ? "Both cases solved. Adding the link makes equilibrium cost worse."
              : "Both cases solved. Adding the link does not make equilibrium cost worse.",
        error: "",
      }));
    } catch (error) {
      store.update((current) => ({ ...current, error: error.message, status: "The comparison step failed." }));
    }
  }

  async function handleRunSweep() {
    updateFormsIntoState();
    const state = store.get();
    if (!state.networkData) return;

    sweepController.cancelled = false;
    store.update((current) => ({
      ...current,
      sweepRunning: true,
      sweepProgress: { fraction: 0, completed: 0, total: 1 },
      status: "Running the parameter sweep...",
      error: "",
    }));

    try {
      const result = await runParameterSweep({
        networkData: state.networkData,
        inputs: state.inputs,
        sweepConfig: state.sweep,
        onProgress(progress) {
          store.update((current) => ({
            ...current,
            sweepProgress: progress,
          }));
        },
        isCancelled() {
          return sweepController.cancelled;
        },
      });

      store.update((current) => ({
        ...current,
        sweepResult: result,
        sweepRunning: false,
        sweepProgress: null,
        status: `Sweep finished with ${result.rows.length} grid cells.`,
      }));
    } catch (error) {
      const cancelled = sweepController.cancelled;
      store.update((current) => ({
        ...current,
        sweepRunning: false,
        sweepProgress: null,
        status: cancelled ? "Sweep cancelled." : "The sweep failed.",
        error: cancelled ? "" : error.message,
      }));
    }
  }

  async function handleRunElasticMap() {
    updateFormsIntoState();
    const state = store.get();
    if (!state.networkData) return;
    const gridPoints = state.elasticMap.aSteps * state.elasticMap.bSteps * state.elasticMap.zSteps;

    sweepController.cancelled = false;
    store.update((current) => ({
      ...current,
      sweepRunning: true,
      sweepProgress: { fraction: 0, completed: 0, total: 1 },
      status: `Drawing ${gridPoints} A-B-Z points, with OFF and ON equilibrium solves at each point. This can take a moment.`,
      error: "",
    }));

    try {
      const result = await runElasticOutcomeSpace({
        networkData: state.networkData,
        inputs: state.inputs,
        config: state.elasticMap,
        onProgress(progress) {
          store.update((current) => ({
            ...current,
            sweepProgress: progress,
          }));
        },
        isCancelled() {
          return sweepController.cancelled;
        },
      });

      store.update((current) => ({
        ...current,
        elasticRegionMap: result,
        sweepRunning: false,
        sweepProgress: null,
        status: `Elastic-demand outcome space finished with ${result.rows.length} assumption points.`,
      }));
    } catch (error) {
      const cancelled = sweepController.cancelled;
      store.update((current) => ({
        ...current,
        sweepRunning: false,
        sweepProgress: null,
        status: cancelled ? "Elastic-demand map cancelled." : "The elastic-demand map failed.",
        error: cancelled ? "" : error.message,
      }));
    }
  }

  function handleCancelSweep() {
    sweepController.cancelled = true;
    store.update((state) => ({
      ...state,
      status: "Cancelling the sweep...",
    }));
  }

  bindControls(elements, {
    "load-preset": handleLoadPreset,
    "apply-link-edit": handleApplyLinkEdit,
    "close-link": handleCloseSelectedLink,
    "solve-off": () => handleSolveScenario("off"),
    "solve-on": () => handleSolveScenario("on"),
    compare: handleCompare,
    "run-sweep": handleRunSweep,
    "run-elastic-map": handleRunElasticMap,
    "cancel-sweep": handleCancelSweep,
    "export-csv": () => {
      const { sweepResult } = store.get();
      if (sweepResult?.rows?.length) {
        exportCsv("braess-sweep-results.csv", sweepResult.rows);
      }
    },
    "export-svg": () => {
      exportSvg("braess-heatmap.svg", elements.heatmap.querySelector("svg"));
    },
    "export-png": () => {
      exportSvgAsPng("braess-heatmap.png", elements.heatmap.querySelector("svg"));
    },
  });

  [...elements.fieldInputs, ...elements.sweepInputs, ...elements.elasticMapInputs].forEach((input) => {
    input.addEventListener("input", () => {
      updateFormsIntoState(input);
    });
    input.addEventListener("change", () => {
      updateFormsIntoState(input);
    });
  });

  store.subscribe(render);
  render();
  handleLoadPreset();
}
