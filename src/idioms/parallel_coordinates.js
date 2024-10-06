const dimensions = ["Area", "Rooms", "Bathrooms", "Price"];

let width, height;

let globalData = null;

function createParallelCoordinates(data, selector) {
  globalData = data;

  const margin = { top: 30, right: 30, bottom: 10, left: 30 };
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

  const yScales = createYScales(data, height);
  const xScale = createXScale(data, width);

  const foreground = createPaths(svg, data, xScale, yScales);

  addAxes(svg, yScales, xScale);

  addSliderInteractivity(data, yScales, foreground, selector);
}

function createYScales(data, height) {
  const yScales = {};
  dimensions.forEach((dim) => {
    yScales[dim] = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d[dim]))
      .range([height, 0]);
  });
  return yScales;
}

function createXScale(data, width) {
  return d3.scalePoint().range([0, width]).padding(0.1).domain(dimensions);
}

function createPaths(svg, data, xScale, yScales) {
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
    .style("stroke", "steelblue")
    .style("stroke-width", "1.5px")
    .on("mouseover", function () {
      d3.select(this).style("stroke", "orange").style("stroke-width", "3px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .style("stroke", "steelblue")
        .style("stroke-width", "1.5px");
    });
}

function addAxes(svg, yScales, xScale) {
  svg
    .selectAll(".dimension")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "dimension")
    .attr("transform", (d) => `translate(${xScale(d)})`)
    .each(function (dim) {
      d3.select(this).call(d3.axisLeft(yScales[dim]));
    })
    .append("text")
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text((d) => d)
    .style("font-size", "16px");
}

function addSliderInteractivity(data, yScales, foreground, selector) {
  const sliders = {
    Rooms: { min: "#minRooms", max: "#maxRooms" },
    Bathrooms: { min: "#minBathrooms", max: "#maxBathrooms" },
    Area: { min: "#minArea", max: "#maxArea" },
    Price: { min: "#minPrice", max: "#maxPrice" },
  };

  setInitialSliderValues(data, sliders);

  d3.selectAll("input[type='range']").on("input", function () {
    const filters = getSliderFilters(sliders);
    const filteredData = applyFilters(data, filters);
    updateChart(filteredData, selector, yScales, foreground);
  });
}

function setInitialSliderValues(data, sliders) {
  Object.keys(sliders).forEach((key) => {
    const { min, max, step } = getMinMaxStep(data, key);
    d3.select(sliders[key].min)
      .property("min", min)
      .property("max", max)
      .property("step", step)
      .property("value", min);
    d3.select(sliders[key].max)
      .property("min", min)
      .property("max", max)
      .property("step", step)
      .property("value", max);
  });
}

function getMinMaxStep(data, key) {
  const min = d3.min(data, (d) => +d[key]);
  const max = d3.max(data, (d) => +d[key]);
  const step = Math.max((max - min) / 100, 1);
  return { min, max, step };
}

function getSliderFilters(sliders) {
  return Object.keys(sliders).reduce((filters, key) => {
    filters[key] = [
      +d3.select(sliders[key].min).property("value"),
      +d3.select(sliders[key].max).property("value"),
    ];
    return filters;
  }, {});
}

function applyFilters(data, filters) {
  return data.filter((d) => {
    return Object.keys(filters).every((key) => {
      const [min, max] = filters[key];
      return d[key] >= min && d[key] <= max;
    });
  });
}

function updateChart(filteredData, selector, yScales, foreground) {
  const svg = d3.select(selector).select("svg").select("g");

  d3.select(selector).selectAll(".foreground").remove();

  createPaths(
    svg,
    filteredData,
    createXScale(globalData, width),
    createYScales(globalData, height)
  );
}
