const dimensions = ["Rooms", "Bathrooms", "Area", "Price"];

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

let width, height, colorScale, yScales, xScale;

let globalData = null;
let globalSelector = null;

// Objeto para armazenar os filtros de brush (mínimos e máximos de cada eixo)
let filters;

// Inicializando o objeto de filtros com `null` para cada dimensão
// dimensions.forEach((dim) => {
//   filters[dim] = null;
// });

function createParallelCoordinates(data, selector) {
  globalData = data;
  globalSelector = selector;

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

  yScales = createYScales(data, height);
  xScale = createXScale(data, width);

  colorScale = d3
    .scaleOrdinal(customColors)
    .domain(d3.map(data, (d) => d.District));

  const foreground = createPaths(svg, data, xScale, yScales, colorScale);

  addAxes(svg, yScales, xScale);
  filters = getSliderFilters(data, selector);

  // addSliderInteractivity(data, yScales, foreground, selector);
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

function createPaths(svg, data, xScale, yScales, colorScale) {
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

// Função para adicionar e configurar os brushes nos eixos
function addAxes(svg, yScales, xScale) {
  svg
    .selectAll(".dimension")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "dimension")
    .attr("transform", (d) => `translate(${xScale(d)})`)
    .each(function (dim) {
      // Adiciona o eixo Y
      d3.select(this).call(d3.axisLeft(yScales[dim]));

      // Adiciona o brush ao eixo Y
      d3.select(this)
        .append("g")
        .attr("class", "brush")
        .call(
          d3
            .brushY()
            .extent([
              [-10, 0], // Define a área de brush
              [10, height],
            ])
            .on("brush", (event) => brushed(event, dim)) // Função chamada enquanto o brush é movido
            .on("end", (event) => brushEnded(event, dim)) // Função chamada quando o brush termina
        );
    })
    .append("text")
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text((d) => d)
    .style("font-size", "16px");
}

// Função chamada quando o brush é movido
function brushed(event, dim) {
  console.log("brushed");
  const selection = event.selection;

  if (selection) {
    // Convertendo a seleção de pixels para valores reais (mínimo e máximo) no eixo da dimensão
    const [yMax, yMin] = selection.map((d) => yScales[dim].invert(d));

    // Atualizar o filtro do brush para esta dimensão
    filters[dim] = [yMin, yMax];
  }
  const filteredData = applyFilters(globalData, filters);
  console.log("filteredDataB", filteredData);
  updateChart(filteredData);
}

// Função chamada quando o brush termina
function brushEnded(event, dim) {
  // Se o brush for limpo (sem seleção), remover o filtro para esta dimensão
  if (!event.selection) {
    filters[dim] = null;
  }

  // Agora, aplica os filtros aos dados e atualiza o gráfico
  const filteredData = applyFilters(globalData, filters);
  console.log("filteredDataB1", filteredData);
  updateChart(filteredData);
}

// function addSliderInteractivity(data, yScales, foreground, selector) {
//   const sliders = {
//     Rooms: { min: "#minRooms", max: "#maxRooms" },
//     Bathrooms: { min: "#minBathrooms", max: "#maxBathrooms" },
//     Area: { min: "#minArea", max: "#maxArea" },
//     Price: { min: "#minPrice", max: "#maxPrice" },
//   };

//   setInitialSliderValues(data, sliders);

//   d3.selectAll("input[type='range']").on("input", function () {
//     const filters = getSliderFilters(sliders);
//     const filteredData = applyFilters(data, filters);
//     updateChart(filteredData, selector, yScales, foreground);
//   });
// }

// function setInitialSliderValues(data, sliders) {
//   Object.keys(sliders).forEach((key) => {
//     const { min, max, step } = getMinMaxStep(data, key);
//     d3.select(sliders[key].min)
//       .property("min", min)
//       .property("max", max)
//       .property("step", step)
//       .property("value", min);
//     d3.select(sliders[key].max)
//       .property("min", min)
//       .property("max", max)
//       .property("step", step)
//       .property("value", max);
//   });
// }

function getMinMaxStep(data, key) {
  const min = d3.min(data, (d) => +d[key]);
  const max = d3.max(data, (d) => +d[key]);
  const step = Math.max((max - min) / 100, 1);
  console.log("min", min, "max", max, "step", step);
  return { min, max, step };
}

function getSliderFilters() {
  const filterss = {};
  dimensions.forEach((dim) => {
    const { min, max } = getMinMaxStep(globalData, dim);
    console.log("min", min, "max", max);
    filterss[dim] = [min, max];
  });
  return filterss;
}

function applyFilters(data, filters) {
  console.log("filters", filters);
  return data.filter((d) => {
    return Object.keys(filters).every((key) => {
      const [min, max] = filters[key];
      return d[key] >= min && d[key] <= max;
    });
  });
}

function updateChart(filteredData) {
  console.log("filteredDataUC", filteredData);
  const svg = d3.select(globalSelector).select("svg").select("g");

  d3.select(globalSelector).selectAll(".foreground").remove();

  createPaths(
    svg,
    filteredData,
    xScale,
    yScales,
    colorScale // Pass colorScale to update paths
  );
}
