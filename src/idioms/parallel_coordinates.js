const dimensions = ["Rooms", "Bathrooms", "Area", "Price"];
const integerTick = ["Rooms", "Bathrooms"];
const customColors = ["#1392FF", "#A724FF", "#00FFBF"];

let width, height, colorScale, yScales, xScale;
let parallelCoordinatesSelector = null;

/**
 * Initializes the Parallel Coordinates chart
 * @param {String} selector - DOM element selector for the chart
 */
function createParallelCoordinates(selector) {
  parallelCoordinatesSelector = selector;

  const margin = { top: 25, right: 65, bottom: 10, left: 30 };
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
  colorScale = createColorScale(global_data);

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
 * Creates color scale based on Zone
 * @param {Array} data - The dataset
 * @returns {d3.ScaleOrdinal} - Color scale for Zone
 */
function createColorScale(data) {
  return d3.scaleOrdinal(customColors).domain(data.map((d) => d.Zone));
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
    .on("mouseover", function () {
      d3.select(this).style("stroke-width", "4px");
      d3.select(this).style("stroke", "white");
    })
    .on("mouseout", function () {
      d3.select(this).style("stroke-width", "1.5px");
      d3.select(this).style("stroke", (d) => colorScale(d.Zone));
    });
}

/**
 * Adds axes and brush controls for filtering
 * @param {Object} svg - The SVG container
 */
function addAxesWithBrush(svg) {
  svg
    .selectAll(".dimension")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "dimension")
    .attr("transform", (dim) => `translate(${xScale(dim)})`)
    .each(function (dim) {
      let axis = d3.axisLeft(yScales[dim]);

      if (integerTick.includes(dim)) {
        axis = axis
          .ticks(
            Math.floor(yScales[dim].domain()[1] - yScales[dim].domain()[0])
          ) // Definir intervalo de 1
          .tickFormat(d3.format("d")); // Formato de inteiro
      }

      d3.select(this).call(axis).style("fill", "#6599CB");

      d3.select(this)
        .selectAll(".tick text")
        .style("fill", "white")
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
    .attr("fill", "white")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text((d) => d)
    .style("font-size", "18px")
    .style("font-family", "Arial, sans-serif");
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
  filterDataset();
  updateChart(filtered_data);
}

/**
 * Handles brush end event
 * @param {Object} event - Brush end event
 * @param {String} dim - Dimension being brushed
 */
function brushEnded(event, dim) {
  if (!event.selection) {
    filters[dim] = null;
  }
  filterDataset();
  updateChart(filtered_data);
}

/**
 * Retrieves min and max values for a given dimension
 * @param {Array} data - The dataset
 * @param {String} dim - Dimension to get min/max for
 * @returns {Object} - Contains min, max, and step values
 */
function getMinMaxValues(data, dim) {
  const min = d3.min(data, (d) => +d[dim]);
  const max = d3.max(data, (d) => +d[dim]);
  return { min, max };
}

/**
 * Initializes the default filters for all dimensions
 * @returns {Object} - Filters object with ranges for each dimension
 */
function initializeFilters() {
  dimensions.forEach((dim) => {
    const { min, max } = getMinMaxValues(global_data, dim);
    globalFilters[dim] = [min, max];
  });
}

/**
 * Applies filters to the dataset
 * @param {Array} data - The dataset
 * @param {Object} filters - The filters to apply
 * @returns {Array} - Filtered dataset
 */
function applyFilters(data, filters) {
  return data.filter((d) => {
    return Object.keys(filters).every((key) => {
      const [min, max] = filters[key];
      return d[key] >= min && d[key] <= max;
    });
  });
}

/**
 * Applies the current filters to the dataset and updates the chart
 * @param {Array} filtered_data - The filtered dataset
 */
function updateChart(filtered_data) {
  const svg = d3.select(parallelCoordinatesSelector).select("svg").select("g");
  d3.select(parallelCoordinatesSelector).selectAll(".foreground").remove();
  createPaths(svg, filtered_data);
}
