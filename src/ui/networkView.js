import * as d3 from "d3";
import { describeCostFunction } from "../model/costs.js";
import { computeLinkGeometryLength } from "../model/network.js";

function flowForLink(result, linkId) {
  return result?.linkFlows?.get(linkId) ?? 0;
}

function costForLink(result, linkId) {
  return result?.linkCosts?.get(linkId) ?? 0;
}

function paddedExtent(values) {
  const [min, max] = d3.extent(values);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) return [min - 1, max + 1];
  const padding = (max - min) * 0.12;
  return [min - padding, max + padding];
}

function scaleBarUnits(span) {
  const target = Math.max(span / 4, 1);
  const exponent = 10 ** Math.floor(Math.log10(target));
  const fraction = target / exponent;
  const niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return niceFraction * exponent;
}

function equalAspectScales(nodes, width, height, margin) {
  const xExtent = paddedExtent(nodes.flatMap((node) => [node.x, node.geometryBaseX ?? node.x]));
  const yExtent = paddedExtent(nodes.flatMap((node) => [node.y, node.geometryBaseY ?? node.y]));
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xSpan = Math.max(xExtent[1] - xExtent[0], 1e-9);
  const ySpan = Math.max(yExtent[1] - yExtent[0], 1e-9);
  const unitsPerPixel = Math.max(xSpan / plotWidth, ySpan / plotHeight);
  const xCenter = (xExtent[0] + xExtent[1]) / 2;
  const yCenter = (yExtent[0] + yExtent[1]) / 2;
  const xHalfSpan = (plotWidth * unitsPerPixel) / 2;
  const yHalfSpan = (plotHeight * unitsPerPixel) / 2;

  return {
    xScale: d3.scaleLinear().domain([xCenter - xHalfSpan, xCenter + xHalfSpan]).range([margin.left, width - margin.right]),
    yScale: d3.scaleLinear().domain([yCenter - yHalfSpan, yCenter + yHalfSpan]).range([height - margin.bottom, margin.top]),
  };
}

function linkPath(link, nodeById, xScale, yScale) {
  const from = nodeById.get(String(link.fromNodeId));
  const to = nodeById.get(String(link.toNodeId));
  if (!from || !to) return "";

  const x1 = xScale(from.x);
  const y1 = yScale(from.y);
  const x2 = xScale(to.x);
  const y2 = yScale(to.y);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const curve = link.candidateFlag ? 0.02 : 0.1;
  const mx = x1 + dx * 0.5 - dy * curve;
  const my = y1 + dy * 0.5 + dx * curve;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

function linkTooltipLines(link, scenarioResult) {
  const flow = flowForLink(scenarioResult, link.id);
  const cost = costForLink(scenarioResult, link.id);
  return [
    link.label,
    `${link.fromNodeId} -> ${link.toNodeId}`,
    `lanes ${Number(link.lanes) || 0}, capacity ${Number(link.capacity) || 0}`,
    `length ${Number(link.length) || 0}, free speed ${Number(link.freeSpeed) || 0}`,
    `flow ${d3.format(".2f")(flow)}, cost ${d3.format(".2f")(cost)}`,
    describeCostFunction(link),
  ];
}

function nodeTooltipLines(node) {
  return [
    node.label,
    `node_id ${node.id}, zone_id ${node.zoneId ?? "—"}`,
    `x ${d3.format(".2f")(node.x)}, y ${d3.format(".2f")(node.y)}`,
  ];
}

function tooltipSize(lines) {
  const maxChars = lines.reduce((max, line) => Math.max(max, String(line).length), 0);
  return {
    width: Math.max(150, Math.min(280, maxChars * 6.5 + 22)),
    height: lines.length * 16 + 18,
  };
}

function clampTooltipPosition(x, y, width, height, bounds) {
  return {
    x: Math.max(bounds.left, Math.min(bounds.right - width, x)),
    y: Math.max(bounds.top, Math.min(bounds.bottom - height, y)),
  };
}

export function renderNetworkView(
  container,
  networkData,
  scenarioResult,
  {
    scenarioMode = "off",
    selectedCandidateLinkId,
    selectedLinkId,
    selectedNodeId,
    onNodePositionChange,
    onNodeGeometryPreview,
    onLinkSelect,
    onNodeSelect,
  } = {},
) {
  container.innerHTML = "";
  if (!networkData) {
    container.innerHTML = `<p class="empty-state">Load the Braess example or upload GMNS files to draw the network.</p>`;
    return;
  }

  const width = container.clientWidth || 760;
  const height = 430;
  const margin = { top: 28, right: 28, bottom: 42, left: 28 };
  const nodes = networkData.nodes.map((node) => ({ ...node }));
  const links = networkData.links.map((link) => ({ ...link }));
  const nodeById = new Map(nodes.map((node) => [String(node.id), node]));

  function refreshIncidentLinkLengths(nodeId) {
    links.forEach((link) => {
      if (String(link.fromNodeId) === String(nodeId) || String(link.toNodeId) === String(nodeId)) {
        link.length = computeLinkGeometryLength(link, nodeById);
      }
    });
  }

  const { xScale, yScale } = equalAspectScales(nodes, width, height, margin);

  const svg = d3
    .select(container)
    .append("svg")
    .attr("class", "chart-svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const defs = svg.append("defs");
  defs
    .append("marker")
    .attr("id", "network-arrow")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 8)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z")
    .attr("fill", "#325f7e");

  const flows = links.map((link) => flowForLink(scenarioResult, link.id));
  const costs = links.map((link) => costForLink(scenarioResult, link.id));
  const maxFlow = d3.max(flows) || 1;
  const maxCost = d3.max(costs) || 1;
  const widthScale = d3.scaleLinear().domain([0, maxFlow]).range([2.5, 14]);
  const colorScale = d3.scaleLinear().domain([0, maxCost]).range(["#d9e9f4", "#24506e"]).interpolate(d3.interpolateLab);

  const legendGradient = defs
    .append("linearGradient")
    .attr("id", "travel-time-gradient")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");
  legendGradient.append("stop").attr("offset", "0%").attr("stop-color", "#d9e9f4");
  legendGradient.append("stop").attr("offset", "100%").attr("stop-color", "#24506e");

  svg
    .append("text")
    .attr("x", margin.left)
    .attr("y", 18)
    .attr("class", "legend-title")
    .text(scenarioMode === "on" ? "Map shows the case with the added link" : "Map shows the case without the added link");

  const linkLayer = svg.append("g");
  const labelLayer = svg.append("g");
  const nodeLayer = svg.append("g");
  const tooltipLayer = svg.append("g");

  const linkSelection = linkLayer
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("fill", "none")
    .attr("stroke-linecap", "round")
    .attr("marker-end", "url(#network-arrow)");

  const nodeSelection = nodeLayer
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("class", "map-node");

  linkSelection
    .append("title")
    .text((link) => {
      const flow = flowForLink(scenarioResult, link.id);
      const cost = costForLink(scenarioResult, link.id);
      return `${link.label}
lanes: ${Number(link.lanes) || 0}
capacity: ${Number(link.capacity) || 0}
length: ${Number(link.length) || 0}
free speed: ${Number(link.freeSpeed) || 0}
flow: ${d3.format(".2f")(flow)}
cost: ${d3.format(".2f")(cost)}
${describeCostFunction(link)}`;
    });

  nodeSelection.append("circle").attr("r", 11).attr("fill", "#16324f");
  nodeSelection
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dy", -18)
    .attr("fill", "#16324f")
    .attr("font-size", 12)
    .attr("font-weight", 600)
    .text((node) => node.label);
  nodeSelection
    .append("title")
    .text((node) => `${node.label}
node_id: ${node.id}
zone_id: ${node.zoneId ?? "—"}
x: ${d3.format(".2f")(node.x)}
y: ${d3.format(".2f")(node.y)}`);

  labelLayer
    .append("text")
    .attr("x", margin.left)
    .attr("y", height - 18)
    .attr("class", "legend-label")
    .text("Click a link to edit it. Drag nodes to move the drawing.");

  function updateGeometry() {
    linkSelection.select("title").text((link) => {
      const flow = flowForLink(scenarioResult, link.id);
      const cost = costForLink(scenarioResult, link.id);
      return `${link.label}
lanes: ${Number(link.lanes) || 0}
capacity: ${Number(link.capacity) || 0}
length: ${Number(link.length) || 0}
free speed: ${Number(link.freeSpeed) || 0}
flow: ${d3.format(".2f")(flow)}
cost: ${d3.format(".2f")(cost)}
${describeCostFunction(link)}`;
    });

    linkSelection
      .attr("d", (link) => linkPath(link, nodeById, xScale, yScale))
      .attr("stroke", (link) => {
        const isSelectedLink = String(link.id) === String(selectedLinkId);
        const isSelectedCandidate = String(link.id) === String(selectedCandidateLinkId);
        if (isSelectedLink) return link.candidateFlag && isSelectedCandidate ? "#a53d2d" : "#16324f";
        if (link.candidateFlag && isSelectedCandidate) return "#a53d2d";
        return colorScale(costForLink(scenarioResult, link.id));
      })
      .attr("stroke-width", (link) => widthScale(flowForLink(scenarioResult, link.id)) + (String(link.id) === String(selectedLinkId) ? 1.5 : 0))
      .attr("stroke-dasharray", (link) => {
        const structurallyClosed = (Number(link.lanes) || 0) <= 0 || (Number(link.capacity) || 0) <= 0;
        return link.candidateFlag && (scenarioMode === "off" || structurallyClosed) ? "8 6" : null;
      })
      .attr("opacity", (link) => {
        const structurallyClosed = (Number(link.lanes) || 0) <= 0 || (Number(link.capacity) || 0) <= 0;
        return link.candidateFlag && (scenarioMode === "off" || structurallyClosed) ? 0.72 : 1;
      });

    nodeSelection
      .attr("transform", (node) => `translate(${xScale(node.x)}, ${yScale(node.y)})`)
      .select("circle")
      .attr("fill", (node) => (String(node.id) === String(selectedNodeId) ? "#a53d2d" : "#16324f"));

    tooltipLayer.selectAll("*").remove();
    const bounds = {
      left: margin.left,
      top: margin.top,
      right: width - margin.right,
      bottom: height - margin.bottom,
    };

    const selectedLink = links.find((link) => String(link.id) === String(selectedLinkId));
    const selectedNode = nodes.find((node) => String(node.id) === String(selectedNodeId));

    if (selectedLink) {
      const from = nodeById.get(String(selectedLink.fromNodeId));
      const to = nodeById.get(String(selectedLink.toNodeId));
      if (from && to) {
        const rawX = (xScale(from.x) + xScale(to.x)) / 2 + 12;
        const rawY = (yScale(from.y) + yScale(to.y)) / 2 - 18;
        const lines = linkTooltipLines(selectedLink, scenarioResult);
        const size = tooltipSize(lines);
        const pos = clampTooltipPosition(rawX, rawY, size.width, size.height, bounds);
        const box = tooltipLayer.append("g").attr("transform", `translate(${pos.x}, ${pos.y})`);
        box.append("rect").attr("class", "selection-tooltip-box").attr("width", size.width).attr("height", size.height).attr("rx", 12);
        const text = box.append("text").attr("class", "selection-tooltip-text").attr("x", 10).attr("y", 16);
        lines.forEach((line, index) => {
          text.append("tspan").attr("x", 10).attr("dy", index === 0 ? 0 : 16).text(line);
        });
      }
    } else if (selectedNode) {
      const rawX = xScale(selectedNode.x) + 14;
      const rawY = yScale(selectedNode.y) - 22;
      const lines = nodeTooltipLines(selectedNode);
      const size = tooltipSize(lines);
      const pos = clampTooltipPosition(rawX, rawY, size.width, size.height, bounds);
      const box = tooltipLayer.append("g").attr("transform", `translate(${pos.x}, ${pos.y})`);
      box.append("rect").attr("class", "selection-tooltip-box").attr("width", size.width).attr("height", size.height).attr("rx", 12);
      const text = box.append("text").attr("class", "selection-tooltip-text").attr("x", 10).attr("y", 16);
      lines.forEach((line, index) => {
        text.append("tspan").attr("x", 10).attr("dy", index === 0 ? 0 : 16).text(line);
      });
    }
  }

  linkSelection.style("cursor", "pointer").on("click", (_, link) => {
    onLinkSelect?.(link.id);
  });

  nodeSelection.style("cursor", "pointer").on("click", (_, node) => {
    onNodeSelect?.(node.id);
  });

  nodeSelection.call(
    d3
      .drag()
      .on("drag", (event, node) => {
        node.x = xScale.invert(event.x);
        node.y = yScale.invert(event.y);
        refreshIncidentLinkLengths(node.id);
        onNodeGeometryPreview?.(node.id, {
          node: { ...node },
          links: links
            .filter((link) => String(link.fromNodeId) === String(node.id) || String(link.toNodeId) === String(node.id))
            .map((link) => ({ ...link })),
        });
        updateGeometry();
      })
      .on("end", (_, node) => {
        onNodePositionChange?.(node.id, { x: node.x, y: node.y });
      }),
  );

  updateGeometry();

  const legend = svg.append("g").attr("transform", `translate(${width - 236}, 24)`);
  legend.append("rect").attr("width", 188).attr("height", 142).attr("rx", 14).attr("fill", "rgba(255,255,255,0.92)").attr("stroke", "#d8e1ea");
  legend.append("text").attr("x", 14).attr("y", 22).attr("class", "legend-title").text("Legend");
  legend.append("text").attr("x", 14).attr("y", 42).attr("class", "legend-label").text("Link travel time");
  legend.append("rect").attr("x", 14).attr("y", 50).attr("width", 110).attr("height", 10).attr("rx", 5).attr("fill", "url(#travel-time-gradient)");
  legend
    .append("text")
    .attr("x", 14)
    .attr("y", 74)
    .attr("class", "legend-label")
    .text(`low ${d3.format(".2f")(0)}  to  high ${d3.format(".2f")(maxCost)}`);

  const flowLevels = [0, maxFlow / 2, maxFlow].map((value) => Number.isFinite(value) ? value : 0);
  legend.append("text").attr("x", 14).attr("y", 92).attr("class", "legend-label").text("Link width = flow");
  flowLevels.forEach((value, index) => {
    const y = 100 + index * 16;
    legend
      .append("line")
      .attr("x1", 16)
      .attr("x2", 78)
      .attr("y1", y)
      .attr("y2", y)
      .attr("stroke", "#325f7e")
      .attr("stroke-width", Math.max(widthScale(value), 1.5))
      .attr("stroke-linecap", "round");
    legend
      .append("text")
      .attr("x", 88)
      .attr("y", y + 4)
      .attr("class", "legend-label")
      .text(d3.format(".2f")(value));
  });
  legend.append("text").attr("x", 14).attr("y", 152).attr("class", "legend-label").text("Dashed line = closed or off");

  const xDomain = xScale.domain();
  const units = scaleBarUnits(xDomain[1] - xDomain[0]);
  const pixels = (units / (xDomain[1] - xDomain[0])) * (width - margin.left - margin.right);
  const scaleX = margin.left;
  const scaleY = height - margin.bottom + 8;
  svg.append("line").attr("x1", scaleX).attr("x2", scaleX + pixels).attr("y1", scaleY).attr("y2", scaleY).attr("stroke", "#16324f").attr("stroke-width", 3);
  svg.append("line").attr("x1", scaleX).attr("x2", scaleX).attr("y1", scaleY - 6).attr("y2", scaleY + 6).attr("stroke", "#16324f").attr("stroke-width", 2);
  svg
    .append("line")
    .attr("x1", scaleX + pixels)
    .attr("x2", scaleX + pixels)
    .attr("y1", scaleY - 6)
    .attr("y2", scaleY + 6)
    .attr("stroke", "#16324f")
    .attr("stroke-width", 2);
  svg
    .append("text")
    .attr("x", scaleX)
    .attr("y", scaleY - 10)
    .attr("class", "legend-label")
    .text(`${d3.format(".3~g")(units)} coordinate units`);
}
