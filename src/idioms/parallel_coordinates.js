const dimensions = ["Rooms", "Bathrooms", "Area", "Price"];
const integerTick = ["Rooms", "Bathrooms"];
let dragging = {};
let width, height, yScales, xScale;
let parallelCoordinatesSelector = null;
let dimensionGroup = null;

/**
 * Initializes the Parallel Coordinates chart
 * @param {String} selector - DOM element selector for the chart
 */
function createParallelCoordinates(selector) {
  parallelCoordinatesSelector = selector;

  const margin = { top: 25, right: 65, bottom: 10, left: 50 };
  const divElement = d3.select(selector).node();
  width = divElement.clientWidth - margin.left - margin.right;
  height = divElement.clientHeight - margin.top - margin.bottom;

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", divElement.clientWidth)
    .attr("height", divElement.clientHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  yScales = createYScales(global_data);
  xScale = createXScale();

  createPaths(svg, global_data);

  initializeFilters();
  addAxesWithBrush(svg);
}

/**
 * Creates Y scales for each dimension based on data range
 * @param {Array} data - The dataset
 * @returns {Object} - Y scales for each dimension
 */
function createYScales(data) {
  return dimensions.reduce((scales, dim) => {
    scales[dim] = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d[dim]))
      .range([height, 0]);
    return scales;
  }, {});
}

/**
 * Creates X scale based on dimensions
 * @returns {d3.ScalePoint} - X scale for dimensions
 */
function createXScale() {
  return d3.scalePoint().range([0, width]).padding(0.1).domain(dimensions);
}

/**
 * Creates and renders paths for each data point
 * @param {Array} data - The dataset
 * @param {Object} svg - The SVG container
 */
function createPaths(svg, data) {
  const lineGenerator = (d) =>
    d3.line()(dimensions.map((dim) => [xScale(dim), yScales[dim](+d[dim])]));

  if (!data) {
    return;
  }

  // Create tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    
  return svg
    .append("g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", lineGenerator)
    .style("fill", "none")
    .style("stroke", (d) => colorScale(d.Zone)) // Apply color based on Zone
    .style("stroke-width", "1.5px")
    .on("mouseover", function (event, d) {
      d3.select(this).raise();
      d3.select(this).style("stroke-width", "4px");
      d3.select(this).style("stroke", "black");

      // Tooltip content
      const tooltipContent = `
        <strong>Zone:</strong> ${d.Zone}<br>
        <strong>District:</strong> ${d.District}<br>
        <strong>Rooms:</strong> ${d.Rooms}<br>
        <strong>Bathrooms:</strong> ${d.Bathrooms}<br>
        <strong>Area:</strong> ${d.Area} m²<br>
        <strong>Price:</strong> ${d.Price} €<br>
        <strong>AdsType:</strong> ${d.AdsType}<br>
        <strong>Condition:</strong> ${d.Condition}<br>
      `;
      
      // Show tooltip
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html(tooltipContent)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
      
      updateViolinPlotHoverHouse(d.Price, true, d.AdsType, d.Condition);
      updateChoroplethMapHoverDistrict(d.District, true);
    })
    .on("mousemove", function (event) {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY + 10) + "px");
    })
    .on("mouseout", function (event, d) {
      d3.select(this).style("stroke-width", "1.5px");
      d3.select(this).style("stroke", (d) => colorScale(d.Zone));
      tooltip.transition()
        .duration(500)
        .style("opacity", 0); // Hide tooltip
      
      updateViolinPlotHoverHouse(d.Price, false, d.AdsType, d.Condition);
      updateChoroplethMapHoverDistrict(d.District, false);
    });
}

/**
 * Adds axes and brush controls for filtering and allows axes to be reordered
 * @param {Object} svg - The SVG container
 */
function addAxesWithBrush(svg) {
  dimensionGroup = svg
    .selectAll(".dimension")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "dimension")
    .attr("transform", (dim) => `translate(${xScale(dim)})`)
    .call(
      // Add drag behavior to make the axis draggable
      d3
        .drag()
        .subject((dim) => ({ x: xScale(dim) }))
        .on("start", function (event, dim) {
          dragging[dim] = xScale(dim);
        })
        .on("drag", function (event, dim) {
          dragging[dim] = Math.min(width, Math.max(0, event.x));
          dimensions.sort((a, b) => position(a) - position(b));
          xScale.domain(dimensions);
          svg
            .selectAll(".dimension")
            .attr("transform", (d) => `translate(${position(d)})`);
          filterDataset(false);
          updateParallelCoordinates(filtered_data);
          // tick labels on the top
          dimensionGroup.raise();
        })
        .on("end", function (event, dim) {
          delete dragging[dim];
          d3.select(this)
            .transition()
            .attr("transform", `translate(${xScale(dim)})`);
        })
    );

  dimensionGroup
    .each(function (dim) {
      let axis = d3.axisLeft(yScales[dim]);

      if (integerTick.includes(dim)) {
        axis = axis
          .ticks(
            Math.floor(yScales[dim].domain()[1] - yScales[dim].domain()[0])
          )
          .tickFormat(d3.format("d"));
      }

      d3.select(this).call(axis).style("fill", "#6599CB");

      d3.select(this)
        .selectAll(".tick text")
        .style("stroke", "rgba(255, 255, 255, 0.8)")
        .style("stroke-width", "4.0px")
        .style("paint-order", "stroke")
        .style("fill", "#4B7AC4")
        .style("font-size", "13px");

      const brush = d3
        .brushY()
        .extent([
          [-10, 0],
          [10, height],
        ])
        .on("brush", (event) => brushed(event, dim))
        .on("end", (event) => brushEnded(event, dim));

      d3.select(this)
        .append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, [0, height]);
    })
    .append("text")
    .attr("fill", "#4B7AC4")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text((d) => {
      if(d === "Area") {
        return "Area (m²)";
      }
      if(d === "Price") {
        return "Price (€)";
      }
      return d;
    })
    .style("font-size", "18px")
    .style("font-family", "Arial, sans-serif");
    
    // tick labels on the top
    dimensionGroup.raise();
}

/**
 * Computes the position of a dimension, considering dragging
 * @param {String} dim - The dimension
 * @returns {Number} - The x position of the dimension
 */
function position(dim) {
  return dragging[dim] !== undefined ? dragging[dim] : xScale(dim);
}

/**
 * Handles the brush event for filtering
 * @param {Object} event - Brush event
 * @param {String} dim - Dimension being brushed
 */
function brushed(event, dim) {
  const selection = event.selection;
  if (selection) {
    const [yMax, yMin] = selection.map((d) => yScales[dim].invert(d));
    globalFilters[dim] = [yMin, yMax];
  }
  filterDataset(false);
  updateParallelCoordinates(filtered_data);
}

/**
 * Handles brush end event
 * @param {Object} event - Brush end event
 * @param {String} dim - Dimension being brushed
 */
function brushEnded(event, dim) {
  if (event.mode === undefined) return;
  if (!event.selection) {
    globalFilters[dim] = null;
  }
  filterDataset(true);
  updateAllCharts("none");
}

/**
 * Retrieves min and max values for a given dimension
 * @param {Array} data - The dataset
 * @param {String} dim - Dimension to get min/max for
 * @returns {Object} - Contains min, max values
 */
function getMinMaxValues(data, dim) {
  const min = d3.min(data, (d) => +d[dim]);
  const max = d3.max(data, (d) => +d[dim]);
  return { min, max };
}

/**
 * Initializes the default filters for all dimensions
 */
function initializeFilters() {
  dimensions.forEach((dim) => {
    const { min, max } = getMinMaxValues(global_data, dim);
    globalFilters[dim] = [min, max];
  });
}

/**
 * Applies filters to the dataset and updates the chart
 * @param {Array} filteredData - The filtered dataset
 */
function updateParallelCoordinates(filteredData) {
  const svg = d3.select(parallelCoordinatesSelector).select("svg").select("g");
  d3.select(parallelCoordinatesSelector).selectAll(".foreground").remove();
  createPaths(svg, filteredData);
  if (dimensionGroup != null) {
    dimensionGroup.raise();
  }
}

/**
 * Recreates the chart with all the axes and paths
 */
function recreateParallelCoordinates() {
  d3.select(parallelCoordinatesSelector).selectAll("svg").remove();
  createParallelCoordinates(parallelCoordinatesSelector);
}
