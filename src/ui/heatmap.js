import * as d3 from "d3";
import { SWEEP_PARAMETERS } from "../model/sweep.js";

const BINARY_METRICS = new Set(["paradox", "reducedDemand", "welfareLoss"]);

const METRIC_LABELS = new Map([
  ["paradox", "Added link makes cost worse"],
  ["reducedDemand", "Added link also reduces demand"],
  ["welfareLoss", "Total welfare falls"],
  ["deltaCost", "Change in equilibrium cost"],
  ["deltaDemand", "Change in demand"],
  ["deltaTravelTime", "Change in total travel time"],
  ["deltaConsumerSurplus", "Change in consumer surplus"],
  ["deltaWelfare", "Change in total welfare"],
]);

function parameterLabel(key) {
  return SWEEP_PARAMETERS.find((entry) => entry.key === key)?.label ?? key;
}

function metricLabel(key) {
  return METRIC_LABELS.get(key) ?? key;
}

function metricPalette(metric, valueExtent) {
  if (BINARY_METRICS.has(metric)) {
    return d3.scaleOrdinal().domain([0, 1]).range(["#e8edf2", "#d1495b"]);
  }
  return d3.scaleSequential(d3.interpolateRdBu).domain([valueExtent[1], valueExtent[0]]);
}

function numericStep(values) {
  const sorted = Array.from(new Set(values.map(Number))).sort((a, b) => a - b);
  if (sorted.length < 2) return 1;
  return d3.min(sorted.slice(1).map((value, index) => Math.abs(value - sorted[index]))) || 1;
}

function tickFormatter(values) {
  const [min, max] = d3.extent(values.map(Number));
  const span = Math.abs(max - min);
  if (span >= 20) return d3.format(".0f");
  if (span >= 2) return d3.format(".1f");
  if (span >= 0.2) return d3.format(".2f");
  return d3.format(".3f");
}

function renderLegend(svg, { fill, metric, valueExtent, width, height, margin }) {
  const legend = svg.append("g").attr("class", "heatmap-legend");
  const legendX = width - margin.right - 210;
  const legendY = 18;

  legend
    .append("text")
    .attr("x", legendX)
    .attr("y", legendY - 5)
    .attr("class", "legend-title")
    .text(metricLabel(metric));

  if (BINARY_METRICS.has(metric)) {
    const entries = [
      { value: 1, label: "Yes" },
      { value: 0, label: "No" },
    ];
    const item = legend
      .selectAll("g.binary-legend-item")
      .data(entries)
      .join("g")
      .attr("class", "binary-legend-item")
      .attr("transform", (_, index) => `translate(${legendX + index * 82},${legendY + 8})`);

    item
      .append("rect")
      .attr("width", 18)
      .attr("height", 12)
      .attr("rx", 3)
      .attr("fill", (entry) => fill(entry.value));

    item
      .append("text")
      .attr("x", 24)
      .attr("y", 10)
      .attr("class", "legend-label")
      .text((entry) => entry.label);
    return;
  }

  const gradientId = `heatmap-gradient-${metric}`;
  const defs = svg.append("defs");
  const gradient = defs
    .append("linearGradient")
    .attr("id", gradientId)
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");

  d3.range(0, 1.0001, 0.1).forEach((offset) => {
    const value = valueExtent[0] + offset * (valueExtent[1] - valueExtent[0]);
    gradient
      .append("stop")
      .attr("offset", `${offset * 100}%`)
      .attr("stop-color", fill(value));
  });

  legend
    .append("rect")
    .attr("x", legendX)
    .attr("y", legendY + 8)
    .attr("width", 180)
    .attr("height", 12)
    .attr("rx", 3)
    .attr("fill", `url(#${gradientId})`);

  const format = tickFormatter(valueExtent);
  legend
    .append("text")
    .attr("x", legendX)
    .attr("y", legendY + 36)
    .attr("class", "legend-label")
    .attr("text-anchor", "start")
    .text(format(valueExtent[0]));
  legend
    .append("text")
    .attr("x", legendX + 180)
    .attr("y", legendY + 36)
    .attr("class", "legend-label")
    .attr("text-anchor", "end")
    .text(format(valueExtent[1]));
}

export function renderHeatmap(container, sweepResult, sweepConfig) {
  container.innerHTML = "";
  if (!sweepResult?.cells?.length) {
    container.innerHTML = `<p class="empty-state">The parameter heatmap will appear here after a sweep.</p>`;
    return;
  }

  const width = container.clientWidth || 720;
  const height = 400;
  const margin = { top: 62, right: 28, bottom: 70, left: 76 };
  const svg = d3
    .select(container)
    .append("svg")
    .attr("class", "chart-svg heatmap-svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const xValues = sweepResult.xValues;
  const yValues = sweepResult.yValues;
  const xExtent = d3.extent(xValues, Number);
  const yExtent = d3.extent(yValues, Number);
  const xStep = numericStep(xValues);
  const yStep = numericStep(yValues);
  const xDomain = xValues.length === 1 ? [xExtent[0] - 1, xExtent[0] + 1] : [xExtent[0] - xStep / 2, xExtent[1] + xStep / 2];
  const yDomain = yValues.length === 1 ? [yExtent[0] - 1, yExtent[0] + 1] : [yExtent[0] - yStep / 2, yExtent[1] + yStep / 2];
  const x = d3.scaleLinear().domain(xDomain).nice(6).range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain(yDomain).nice(6).range([height - margin.bottom, margin.top]);
  const valueExtent = d3.extent(sweepResult.cells, (cell) => Number(cell.value));
  const fill = metricPalette(sweepConfig.metric, valueExtent);
  const xCellWidth = Math.abs(x(xExtent[0] + xStep) - x(xExtent[0])) * 0.96;
  const yCellHeight = Math.abs(y(yExtent[0] + yStep) - y(yExtent[0])) * 0.96;
  const xTickFormat = tickFormatter(xValues);
  const yTickFormat = tickFormatter(yValues);

  svg
    .append("g")
    .selectAll("rect")
    .data(sweepResult.cells)
    .join("rect")
    .attr("x", (cell) => x(Number(cell.x)) - xCellWidth / 2)
    .attr("y", (cell) => y(Number(cell.y)) - yCellHeight / 2)
    .attr("width", xCellWidth)
    .attr("height", yCellHeight)
    .attr("fill", (cell) => fill(Number(cell.value)));

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(xTickFormat));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(7).tickFormat(yTickFormat));

  svg
    .append("text")
    .attr("class", "axis-title")
    .attr("x", (margin.left + width - margin.right) / 2)
    .attr("y", height - 22)
    .attr("text-anchor", "middle")
    .text(parameterLabel(sweepConfig.xParameter));

  svg
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", `translate(22,${(margin.top + height - margin.bottom) / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .text(parameterLabel(sweepConfig.yParameter));

  renderLegend(svg, {
    fill,
    metric: sweepConfig.metric,
    valueExtent,
    width,
    height,
    margin,
  });
}
