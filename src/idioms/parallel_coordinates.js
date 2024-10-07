const dimensions = ["Rooms", "Bathrooms", "Area", "Price"];
const integerTick = ["Rooms", "Bathrooms"];
const customColors = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
  "#9e6e1d",
  "#ff9896",
  "#c5b0d5",
  "#f7b6d2",
  "#c49c94",
  "#dbdb8d",
  "#8c6d31",
  "#e377c2",
  "#7f7f7f",
];

let width, height, colorScale, yScales, xScale, filters;
let globalData = null;
let globalSelector = null;

/**
 * Initializes the Parallel Coordinates chart
 * @param {Array} data - Data to visualize
 * @param {String} selector - DOM element selector for the chart
 */
function createParallelCoordinates(data, selector) {
  globalData = data;
  globalSelector = selector;

  const margin = { top: 25, right: 65, bottom:10, left: 30 };
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

  yScales = createYScales(data);
  xScale = createXScale();
  colorScale = createColorScale(data);

  createPaths(svg, data);

  filters = initializeFilters();
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
 * Creates color scale based on Districts
 * @param {Array} data - The dataset
 * @returns {d3.ScaleOrdinal} - Color scale for Districts
 */
function createColorScale(data) {
  return d3.scaleOrdinal(customColors).domain(data.map((d) => d.District));
}

/**
 * Creates and renders paths for each data point
 * @param {Object} svg - The SVG container
 * @param {Array} data - The dataset
 */
function createPaths(svg, data) {
  const lineGenerator = (d) =>
    d3.line()(dimensions.map((dim) => [xScale(dim), yScales[dim](+d[dim])]));

  return svg
    .append("g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", lineGenerator)
    .style("fill", "none")
    .style("stroke", (d) => colorScale(d.District)) // Apply color based on District
    .style("stroke-width", "1.5px")
    .on("mouseover", function () {
      d3.select(this).style("stroke-width", "3px");
    })
    .on("mouseout", function () {
      d3.select(this).style("stroke-width", "1.5px");
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

      d3.select(this).call(axis);

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
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text((d) => d)
    .style("font-size", "16px");
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
    filters[dim] = [yMin, yMax];
  }
  const filteredData = applyFilters(globalData, filters);
  updateChart(filteredData);
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
  const filteredData = applyFilters(globalData, filters);
  updateChart(filteredData);
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
  return dimensions.reduce((filterObj, dim) => {
    const { min, max } = getMinMaxValues(globalData, dim);
    filterObj[dim] = [min, max];
    return filterObj;
  }, {});
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
 * @param {Array} filteredData - The filtered dataset
 */
function updateChart(filteredData) {
  const svg = d3.select(globalSelector).select("svg").select("g");
  d3.select(globalSelector).selectAll(".foreground").remove();
  createPaths(svg, filteredData);
}
