import * as d3 from "d3";

const CLASS_COLORS = new Map([
  ["BP_RD", "#5b1136"],
  ["BP_NRD", "#ef553b"],
  ["BP_ID", "#f4a261"],
  ["NBP_RD", "#2a9d8f"],
  ["NBP_NRD", "#d7dee8"],
  ["NBP_ID", "#457b9d"],
]);

const AXIS_STYLES = {
  A: { color: "#2f6f95" },
  B: { color: "#9a5b1f" },
  Z: { color: "#6b5aa6" },
};

const DEFAULT_ROTATION = {
  x: 0.54,
  y: -0.72,
};

const ZERO_COUNT_HIDDEN_CLASSES = new Set(["BP_ID", "NBP_RD"]);

function classCounts(result) {
  const counts = new Map(result.classes.map((entry) => [entry.key, 0]));
  result.rows?.forEach((row) => {
    counts.set(row.classKey, (counts.get(row.classKey) ?? 0) + 1);
  });
  return counts;
}

function extent(values) {
  const min = d3.min(values);
  const max = d3.max(values);
  return min === max ? [min - 1, max + 1] : [min, max];
}

function normalized(value, [min, max]) {
  return ((Number(value) - min) / Math.max(max - min, 1e-9)) * 2 - 1;
}

function tickFormat(values) {
  const [min, max] = extent(values);
  const span = Math.abs(max - min);
  if (span >= 20) return d3.format(".0f");
  if (span >= 2) return d3.format(".1f");
  return d3.format(".2f");
}

function renderLegend(container, result) {
  const counts = classCounts(result);
  const visibleClasses = result.classes.filter(
    (entry) => (counts.get(entry.key) ?? 0) > 0 || !ZERO_COUNT_HIDDEN_CLASSES.has(entry.key),
  );
  const legend = document.createElement("div");
  legend.className = "elastic-map-legend";
  legend.innerHTML = visibleClasses
    .map(
      (entry) => `
        <span class="elastic-map-key">
          <span class="elastic-map-swatch" style="background:${CLASS_COLORS.get(entry.key) ?? "#ffffff"}"></span>
          ${entry.label} (${counts.get(entry.key) ?? 0})
        </span>`,
    )
    .join("");
  container.appendChild(legend);
}

function renderOutcomeSpace(container, result) {
  const toolbar = document.createElement("div");
  toolbar.className = "outcome-space-toolbar";
  toolbar.innerHTML = `
    <span>Drag the graph to rotate. The shaded regions summarize the colored outcome clouds.</span>
    <button type="button">Reset graph view</button>
  `;
  container.appendChild(toolbar);

  const width = container.clientWidth || 860;
  const height = 560;
  const svg = d3
    .select(container)
    .append("svg")
    .attr("class", "chart-svg outcome-space-svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const aExtent = extent(result.points.map((point) => point.inverseDemandA));
  const bExtent = extent(result.points.map((point) => point.inverseDemandB));
  const zExtent = extent(result.points.map((point) => point.zValue));
  const scale = Math.min(width, height) * 0.25;
  const center = { x: width * 0.48, y: height * 0.52 };
  let rotationY = DEFAULT_ROTATION.y;
  let rotationX = DEFAULT_ROTATION.x;
  let animationFrame = 0;

  const volumeLayer = svg.append("g");
  const frame = svg.append("g");
  const ticksLayer = svg.append("g");
  const pointsLayer = svg.append("g");
  const labelLayer = svg.append("g");

  const cubeVertices = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ];
  const cubeEdges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  const axisEdges = [
    { axis: "A", points: [[-1, -1, -1], [1, -1, -1]] },
    { axis: "B", points: [[-1, -1, -1], [-1, 1, -1]] },
    { axis: "Z", points: [[-1, -1, -1], [-1, -1, 1]] },
  ];

  const aTicks = d3.ticks(aExtent[0], aExtent[1], 5);
  const bTicks = d3.ticks(bExtent[0], bExtent[1], 5);
  const zTicks = d3.ticks(zExtent[0], zExtent[1], 5);
  const tickRows = [
    ...aTicks.map((value) => ({
      axis: "A",
      value,
      line: [
        [normalized(value, aExtent), -1, -1],
        [normalized(value, aExtent), -1.06, -1],
      ],
      label: [normalized(value, aExtent), -1.18, -1],
      format: tickFormat(aTicks),
    })),
    ...bTicks.map((value) => ({
      axis: "B",
      value,
      line: [
        [-1, normalized(value, bExtent), -1],
        [-1.06, normalized(value, bExtent), -1],
      ],
      label: [-1.2, normalized(value, bExtent), -1],
      format: tickFormat(bTicks),
    })),
    ...zTicks.map((value) => ({
      axis: "Z",
      value,
      line: [
        [-1, -1, normalized(value, zExtent)],
        [-1.06, -1, normalized(value, zExtent)],
      ],
      label: [-1.2, -1, normalized(value, zExtent)],
      format: tickFormat(zTicks),
    })),
  ];

  const axisLabels = [
    { axis: "A", text: "A: inverse-demand intercept", vector: [1.58, -1.1, -1] },
    { axis: "B", text: "B: demand slope", vector: [-1.12, 1.58, -1] },
    { axis: "Z", text: `Z: ${result.zParameterLabel}`, vector: [-1.12, -1.08, 1.58] },
  ];
  const pointsByClass = d3.group(result.points, (point) => point.classKey);
  const visibleVolumeClasses = result.classes.filter((entry) => (pointsByClass.get(entry.key)?.length ?? 0) >= 3);

  function project([x, y, z]) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    return {
      x: center.x + x1 * scale,
      y: center.y - y1 * scale,
      depth: z2,
    };
  }

  function pointVector(point) {
    return [
      normalized(point.inverseDemandA, aExtent),
      normalized(point.inverseDemandB, bExtent),
      normalized(point.zValue, zExtent),
    ];
  }

  const frameLines = frame
    .selectAll("line.frame-edge")
    .data(cubeEdges)
    .join("line")
    .attr("class", "frame-edge")
    .attr("stroke", "rgba(22, 50, 79, 0.16)")
    .attr("stroke-width", 1.1);

  const axisLines = frame
    .selectAll("line.axis-edge")
    .data(axisEdges)
    .join("line")
    .attr("class", "axis-edge")
    .attr("stroke", (entry) => AXIS_STYLES[entry.axis].color)
    .attr("stroke-width", 2.2);

  const tickLines = ticksLayer
    .selectAll("line")
    .data(tickRows)
    .join("line")
    .attr("stroke", (entry) => AXIS_STYLES[entry.axis].color)
    .attr("stroke-width", 0.9)
    .attr("opacity", 0.75);

  const tickLabels = ticksLayer
    .selectAll("text")
    .data(tickRows)
    .join("text")
    .attr("class", "axis-tick-label")
    .attr("text-anchor", "middle")
    .attr("fill", (entry) => AXIS_STYLES[entry.axis].color)
    .text((entry) => entry.format(entry.value));

  const volumePaths = volumeLayer
    .selectAll("path")
    .data(visibleVolumeClasses)
    .join("path")
    .attr("fill", (entry) => CLASS_COLORS.get(entry.key) ?? "#ffffff")
    .attr("stroke", (entry) => CLASS_COLORS.get(entry.key) ?? "#ffffff")
    .attr("stroke-width", 1.2)
    .attr("opacity", 0.3);

  const pointEntries = result.points.map((point) => ({ point, vector: pointVector(point) }));
  const pointCircles = pointsLayer
    .selectAll("circle")
    .data(pointEntries)
    .join("circle")
    .attr("fill", (entry) => CLASS_COLORS.get(entry.point.classKey) ?? "#ffffff")
    .attr("stroke", "rgba(255,255,255,0.62)")
    .attr("stroke-width", 0.35)
    .attr("opacity", 0.48);

  pointCircles
    .append("title")
    .text(
      (entry) => `A ${d3.format("~g")(entry.point.inverseDemandA)}
B ${d3.format("~g")(entry.point.inverseDemandB)}
${entry.point.zParameterLabel} ${d3.format("~g")(entry.point.zValue)}
${entry.point.classKey}
OFF q ${entry.point.offDemand.toFixed(3)}, ON q ${entry.point.onDemand.toFixed(3)}
OFF cost ${entry.point.offCost.toFixed(3)}, ON cost ${entry.point.onCost.toFixed(3)}`,
    );

  const axisNameLabels = labelLayer
    .selectAll("text")
    .data(axisLabels)
    .join("text")
    .attr("class", "axis-name-label")
    .attr("text-anchor", "middle")
    .attr("fill", (entry) => AXIS_STYLES[entry.axis].color)
    .text((entry) => entry.text);

  function updateScene() {
    animationFrame = 0;

    frameLines
      .attr("x1", ([from]) => project(cubeVertices[from]).x)
      .attr("y1", ([from]) => project(cubeVertices[from]).y)
      .attr("x2", ([, to]) => project(cubeVertices[to]).x)
      .attr("y2", ([, to]) => project(cubeVertices[to]).y);

    axisLines
      .attr("x1", (entry) => project(entry.points[0]).x)
      .attr("y1", (entry) => project(entry.points[0]).y)
      .attr("x2", (entry) => project(entry.points[1]).x)
      .attr("y2", (entry) => project(entry.points[1]).y);

    tickLines
      .attr("x1", (entry) => project(entry.line[0]).x)
      .attr("y1", (entry) => project(entry.line[0]).y)
      .attr("x2", (entry) => project(entry.line[1]).x)
      .attr("y2", (entry) => project(entry.line[1]).y);

    tickLabels
      .attr("x", (entry) => project(entry.label).x)
      .attr("y", (entry) => project(entry.label).y);

    volumePaths.attr("d", (entry) => {
      const projected = (pointsByClass.get(entry.key) ?? []).map((point) => {
        const point2d = project(pointVector(point));
        return [point2d.x, point2d.y];
      });
      const hull = d3.polygonHull(projected);
      return hull ? `M${hull.map((point) => point.join(",")).join("L")}Z` : "";
    });

    pointCircles
      .attr("cx", (entry) => project(entry.vector).x)
      .attr("cy", (entry) => project(entry.vector).y)
      .attr("r", (entry) => 1.15 + (project(entry.vector).depth + 1) * 0.22);

    axisNameLabels
      .attr("x", (entry) => project(entry.vector).x)
      .attr("y", (entry) => project(entry.vector).y);
  }

  function requestSceneUpdate() {
    if (animationFrame) return;
    animationFrame = window.requestAnimationFrame(updateScene);
  }

  svg
    .call(
      d3.drag().on("drag", (event) => {
        rotationY += event.dx * 0.008;
        rotationX += event.dy * 0.008;
        requestSceneUpdate();
      }),
    )
    .style("cursor", "grab");

  toolbar.querySelector("button").addEventListener("click", () => {
    rotationY = DEFAULT_ROTATION.y;
    rotationX = DEFAULT_ROTATION.x;
    requestSceneUpdate();
  });

  svg
    .append("text")
    .attr("x", 18)
    .attr("y", 24)
    .attr("class", "legend-title")
    .text("Drag to rotate outcome space");
  svg
    .append("text")
    .attr("x", 18)
    .attr("y", 44)
    .attr("class", "legend-label")
    .text("Each point is one A, B, and cost-parameter assumption.");

  updateScene();
}

export function renderElasticRegionMap(container, result) {
  container.innerHTML = "";
  if (!result) {
    container.innerHTML = `<p class="empty-state">Set the A, B, and third-axis ranges, then click “Draw 3D space.”</p>`;
    return;
  }

  if (result.mode !== "outcomeSpace" || !result.points?.length) {
    container.innerHTML = `<p class="empty-state">Set the A, B, and third-axis ranges, then click “Draw 3D space.”</p>`;
    return;
  }

  renderOutcomeSpace(container, result);
  renderLegend(container, result);
  container.insertAdjacentHTML(
    "beforeend",
    `<p class="map-note">With one downward-sloping inverse-demand curve, BP/increased-demand and No BP/reduced-demand are logically inconsistent, so zero-count versions are hidden from the legend. Shaded regions are projected envelopes of the point cloud, not a separate continuous solver.</p>`,
  );
}
