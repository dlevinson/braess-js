import * as d3 from "d3";

function createSvg(container, emptyMessage) {
  container.innerHTML = "";
  if (!container.clientWidth) {
    container.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    return null;
  }
  return d3
    .select(container)
    .append("svg")
    .attr("class", "chart-svg")
    .attr("viewBox", `0 0 ${container.clientWidth} 260`);
}

export function renderConvergenceChart(container, result) {
  if (!result?.convergence?.length) {
    container.innerHTML = `<p class="empty-state">Solver iterations will appear here after a run.</p>`;
    return;
  }

  const svg = createSvg(container, "");
  if (!svg) return;

  const width = container.clientWidth;
  const height = 260;
  const margin = { top: 20, right: 20, bottom: 34, left: 52 };
  const x = d3.scaleLinear().domain([1, result.convergence.length]).range([margin.left, width - margin.right]);
  const y = d3
    .scaleLog()
    .domain([Math.max(d3.min(result.convergence, (row) => row.gap), 1e-8), Math.max(d3.max(result.convergence, (row) => row.gap), 1e-6)])
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((row) => x(row.iteration))
    .y((row) => y(Math.max(row.gap, 1e-8)));

  svg.append("path").datum(result.convergence).attr("fill", "none").attr("stroke", "#a53d2d").attr("stroke-width", 2.5).attr("d", line);
  svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")));
  svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(5, ".1e"));
}

export function renderSliceChart(container, sweepResult) {
  if (!sweepResult?.rows?.length) {
    container.innerHTML = `<p class="empty-state">Run a sweep to extract a one-dimensional slice.</p>`;
    return;
  }

  const yValues = [...new Set(sweepResult.rows.map((row) => row.y))].sort((a, b) => a - b);
  const targetY = yValues[Math.floor(yValues.length / 2)];
  const rows = sweepResult.rows.filter((row) => row.y === targetY).sort((a, b) => a.x - b.x);
  const svg = createSvg(container, "");
  if (!svg) return;

  const width = container.clientWidth;
  const height = 260;
  const margin = { top: 20, right: 20, bottom: 34, left: 52 };
  const x = d3.scaleLinear().domain(d3.extent(rows, (row) => row.x)).range([margin.left, width - margin.right]);
  const y = d3
    .scaleLinear()
    .domain([
      d3.min(rows, (row) => Math.min(row.offCost, row.onCost)),
      d3.max(rows, (row) => Math.max(row.offCost, row.onCost)),
    ])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const line = (key) =>
    d3
      .line()
      .x((row) => x(row.x))
      .y((row) => y(row[key]));

  svg.append("path").datum(rows).attr("fill", "none").attr("stroke", "#2f6f90").attr("stroke-width", 2.5).attr("d", line("offCost"));
  svg.append("path").datum(rows).attr("fill", "none").attr("stroke", "#a53d2d").attr("stroke-width", 2.5).attr("d", line("onCost"));
  svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).ticks(6));
  svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(6));
}

export function renderDemandCurveChart(container, inputs, onCurveChange) {
  container.innerHTML = "";
  if (!container.clientWidth) {
    container.innerHTML = `<p class="empty-state">Demand curve controls will appear here.</p>`;
    return;
  }

  const A = Math.max(0.000001, Number(inputs.inverseDemandA) || 0.000001);
  const fixedTrips = Math.max(0.000001, Number(inputs.fixedDemand) || 0.000001);
  const isFixedDemand = inputs.demandMode === "fixed";
  const xIntercept = fixedTrips;
  const xMax = Math.max(xIntercept * 1.2, 10);
  const yMax = Math.max(A * 1.15, 10);
  const width = container.clientWidth;
  const height = 260;
  const margin = { top: 20, right: 20, bottom: 40, left: 52 };
  const svg = d3
    .select(container)
    .append("svg")
    .attr("class", "chart-svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const x = d3
    .scaleLinear()
    .domain([0, xMax])
    .range([margin.left, width - margin.right]);
  const y = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([height - margin.bottom, margin.top]);
  const line = d3
    .line()
    .x((point) => x(point.x))
    .y((point) => y(point.y));

  const updateYAxisIntercept = (pixelY) => {
    if (isFixedDemand) {
      return;
    }
    const nextA = Math.max(0.000001, y.invert(Math.max(margin.top, Math.min(height - margin.bottom, pixelY))));
    onCurveChange?.({
      inverseDemandA: nextA,
      inverseDemandB: nextA / xIntercept,
    });
  };

  const updateXAxisIntercept = (pixelX) => {
    const nextQ = Math.max(0.000001, x.invert(Math.max(margin.left, Math.min(width - margin.right, pixelX))));
    if (isFixedDemand) {
      onCurveChange?.({
        fixedDemand: nextQ,
      });
      return;
    }
    onCurveChange?.({
      inverseDemandA: A,
      inverseDemandB: A / nextQ,
      fixedDemand: nextQ,
    });
  };

  if (isFixedDemand) {
    svg
      .append("line")
      .attr("x1", x(fixedTrips))
      .attr("x2", x(fixedTrips))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#2f6f90")
      .attr("stroke-width", 3);
  } else {
    svg
      .append("path")
      .datum([
        { x: 0, y: A },
        { x: xIntercept, y: 0 },
      ])
      .attr("fill", "none")
      .attr("stroke", "#2f6f90")
      .attr("stroke-width", 3)
      .attr("d", line);
  }

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(6));
  svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(6));

  svg
    .append("rect")
    .attr("x", margin.left - 14)
    .attr("y", height - margin.bottom - 14)
    .attr("width", width - margin.left - margin.right + 28)
    .attr("height", 28)
    .attr("fill", "transparent")
    .style("cursor", "ew-resize")
    .on("click", (event) => {
      const [pixelX] = d3.pointer(event, svg.node());
      updateXAxisIntercept(pixelX);
    });

  svg
    .append("rect")
    .attr("x", margin.left - 14)
    .attr("y", margin.top - 14)
    .attr("width", 28)
    .attr("height", height - margin.top - margin.bottom + 28)
    .attr("fill", "transparent")
    .style("cursor", isFixedDemand ? "default" : "ns-resize")
    .on("click", (event) => {
      const [, pixelY] = d3.pointer(event, svg.node());
      updateYAxisIntercept(pixelY);
    });

  svg.append("text").attr("x", width / 2).attr("y", height - 8).attr("text-anchor", "middle").attr("class", "legend-label").text("Trips");
  svg
    .append("text")
    .attr("transform", `translate(16,${height / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .attr("class", "legend-label")
    .text("Generalised cost");

  const yHandleX = x(0);
  const yHandleY = y(A);
  const xHandleX = x(xIntercept);
  const xHandleY = y(0);

  svg
    .append("line")
    .attr("x1", xHandleX)
    .attr("x2", xHandleX)
    .attr("y1", margin.top)
    .attr("y2", xHandleY)
    .attr("stroke", "rgba(27, 127, 107, 0.2)")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5 5");

  const xHandleHit = svg
    .append("circle")
    .attr("cx", xHandleX)
    .attr("cy", xHandleY)
    .attr("r", 18)
    .attr("fill", "transparent")
    .attr("class", "drag-handle-hit")
    .style("cursor", "ew-resize");

  const xHandle = svg
    .append("circle")
    .attr("cx", xHandleX)
    .attr("cy", xHandleY)
    .attr("r", 9)
    .attr("fill", "#1b7f6b")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 2)
    .style("cursor", "ew-resize");

  if (!isFixedDemand) {
    const yHandleHit = svg
      .append("circle")
      .attr("cx", yHandleX)
      .attr("cy", yHandleY)
      .attr("r", 18)
      .attr("fill", "transparent")
      .attr("class", "drag-handle-hit")
      .style("cursor", "ns-resize");

    const yHandle = svg
      .append("circle")
      .attr("cx", yHandleX)
      .attr("cy", yHandleY)
      .attr("r", 9)
      .attr("fill", "#a53d2d")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .style("cursor", "ns-resize");

    const yDrag = d3.drag().on("drag", (event) => {
      updateYAxisIntercept(event.y);
    });

    yHandle.call(yDrag);
    yHandleHit.call(yDrag);

    svg
      .append("text")
      .attr("x", x(0) + 10)
      .attr("y", y(A) - 10)
      .attr("class", "legend-label")
      .text(`Y intercept ${d3.format(".2f")(A)}`);
  }

  svg
    .append("text")
    .attr("x", xHandleX - 10)
    .attr("y", y(0) - 10)
    .attr("text-anchor", "end")
    .attr("class", "legend-label")
    .text(`Initial trips ${d3.format(".2f")(xIntercept)}`);

  const xDrag = d3.drag().on("drag", (event) => {
    updateXAxisIntercept(event.x);
  });

  xHandle.call(xDrag);
  xHandleHit.call(xDrag);
}
