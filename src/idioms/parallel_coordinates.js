const dimensions = ["Area", "Rooms", "Bathrooms", "Price"];

var globalData = null;

// Função principal para criar o gráfico de coordenadas paralelas
function createParallelCoordinates(data, selector) {
  globalData = data;
  const margin = { top: 30, right: 30, bottom: 10, left: 30 };

  // Obter o tamanho do div onde o gráfico será inserido
  const divElement = d3.select(selector).node();
  const width = divElement.clientWidth - margin.left - margin.right;
  const height = divElement.clientHeight - margin.top - margin.bottom;

  // Criar o SVG com base nas dimensões do div
  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", divElement.clientWidth) // Usar o tamanho completo do div para o SVG
    .attr("height", divElement.clientHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const yScales = {};
  dimensions.forEach((dim) => {
    yScales[dim] = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d[dim]))
      .range([height, 0]);
  });

  const xScale = d3
    .scalePoint()
    .range([0, width])
    .padding(0.1)
    .domain(dimensions);

  const path = (d) => {
    // console.log(d);
    console.log("path");
    return d3.line()(dimensions.map((p) => [xScale(p), yScales[p](+d[p])]));
  };

  const foreground = svg
    .append("g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "none") // Sem preenchimento para as linhas
    .style("stroke", "steelblue") // Cor inicial das linhas
    .style("stroke-width", "1.5px") // Espessura inicial das linhas
    .on("mouseover", function (event, d) {
      d3.select(this)
        .style("stroke", "orange") // Cor de destaque ao passar o rato
        .style("stroke-width", "3px"); // Aumentar a espessura da linha
    })
    .on("mouseout", function (event, d) {
      d3.select(this)
        .style("stroke", "steelblue") // Restaurar a cor original
        .style("stroke-width", "1.5px"); // Restaurar a espessura original
    });

  const axis = svg
    .selectAll(".dimension")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "dimension")
    .attr("transform", (d) => `translate(${xScale(d)})`)
    .each(function (d) {
      d3.select(this).call(d3.axisLeft(yScales[d]));
    })
    .append("text")
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text((d) => d)
    .style("font-size", "16px");

  // Adicionar interatividade nos sliders
  addSliderInteractivity(data, yScales, path, foreground, selector);

  //   d3.selectAll("input[type=range]").on("", updateChart(data));
  //   d3.selectAll("input[type=range]").on("input", () =>
  //     updateChart(data, selector)
  //   );
}

// Função para adicionar interatividade com sliders
function addSliderInteractivity(data, yScales, path, foreground, selector) {
  const sliders = {
    Rooms: { min: "#minRooms", max: "#maxRooms" },
    Bathrooms: { min: "#minBathrooms", max: "#maxBathrooms" },
    Area: { min: "#minArea", max: "#maxArea" },
    Price: { min: "#minPrice", max: "#maxPrice" },
  };

  // Definir os valores iniciais dos sliders
  Object.keys(sliders).forEach((key) => {
    console.log(key);

    const min = data.reduce((prev, curr) => {
      // Garantir que o valor de curr[key] seja numérico e válido
      const currentValue = +curr[key]; // Converte para número
      if (isNaN(currentValue)) return prev; // Ignora valores não numéricos

      // Inicializa prev na primeira iteração
      if (prev === null || isNaN(prev)) return currentValue;

      return prev < currentValue ? prev : currentValue;
    }, null);

    // Calcula o valor máximo
    const max = data.reduce((prev, curr) => {
      const currentValue = +curr[key]; // Converte para número
      if (isNaN(currentValue)) return prev; // Ignora valores não numéricos

      // Inicializa prev na primeira iteração
      if (prev === null || isNaN(prev)) return currentValue;

      return prev > currentValue ? prev : currentValue;
    }, null);

    let step = (max - min) / 100;
    step = step < 1 ? 1 : step;

    console.log("min", min);
    console.log("max", max);
    console.log("step", step);

    // console.log(d3.select(sliders[key].min));

    d3.select(sliders[key].min)
      .property("min", min)
      .property("max", max)
      .property("step", step)
      .property("value", min);

    // Selecionar e configurar o slider máximo
    d3.select(sliders[key].max)
      .attr("min", min)
      .attr("max", max)
      .attr("step", step)
      .property("value", max);
  });

  d3.selectAll("input[type='range']").on("input", function () {
    console.log("input");
    const filters = {
      Rooms: [
        +d3.select(sliders.Rooms.min).property("value"),
        +d3.select(sliders.Rooms.max).property("value"),
      ],
      Bathrooms: [
        +d3.select(sliders.Bathrooms.min).property("value"),
        +d3.select(sliders.Bathrooms.max).property("value"),
      ],
      Area: [
        +d3.select(sliders.Area.min).property("value"),
        +d3.select(sliders.Area.max).property("value"),
      ],
      Price: [
        +d3.select(sliders.Price.min).property("value"),
        +d3.select(sliders.Price.max).property("value"),
      ],
    };

    console.log(Object.keys(data[0]));

    // Logging the filter values
    console.log("Filters: ", filters);

    const filteredData = data.filter((d) => {
      // Logging the current data item being checked
      // console.log("Checking data: ", d);

      // // check if fails any of the filters
      // if (
      //   !(
      //     d["Rooms"] >= filters.Rooms[0] &&
      //     d["Rooms"] <= filters.Rooms[1] &&
      //     d["Bathrooms"] >= filters.Bathrooms[0] &&
      //     d["Bathrooms"] <= filters.Bathrooms[1] &&
      //     d["Area"] >= filters.Area[0] &&
      //     d["Area"] <= filters.Area[1] &&
      //     d["Price"] >= filters.Price[0] &&
      //     d["Price"] <= filters.Price[1]
      //   )
      // ) {
      //   // console.log("Data failed filter: ", d);

      //   // check which filter failed
      //   if (d["Rooms"] < filters.Rooms[0] || d["Rooms"] > filters.Rooms[1]) {
      //     console.log("Rooms failed");
      //   }
      //   if (
      //     d["Bathrooms"] < filters.Bathrooms[0] ||
      //     d["Bathrooms"] > filters.Bathrooms[1]
      //   ) {
      //     console.log("Bathrooms failed");
      //   }
      //   if (d["Area"] < filters.Area[0] || d["Area"] > filters.Area[1]) {
      //     console.log("Area failed");
      //   }
      //   if (d["Price"] < filters.Price[0] || d["Price"] > filters.Price[1]) {
      //     console.log("Price failed");
      //   }
      // }

      return (
        d["Rooms"] >= filters.Rooms[0] &&
        d["Rooms"] <= filters.Rooms[1] &&
        d["Bathrooms"] >= filters.Bathrooms[0] &&
        d["Bathrooms"] <= filters.Bathrooms[1] &&
        d["Area"] >= filters.Area[0] &&
        d["Area"] <= filters.Area[1] &&
        d["Price"] >= filters.Price[0] &&
        d["Price"] <= filters.Price[1]
      );
    });

    updateChart(filteredData, selector, path);
  });
}

function updateChart(filteredData, selector, path) {
  console.log("updateChart");
  console.log("filteredData", filteredData);

  const margin = { top: 30, right: 30, bottom: 10, left: 30 };

  // Obter o tamanho do div onde o gráfico será inserido
  const divElement = d3.select(selector).node();
  const width = divElement.clientWidth - margin.left - margin.right;
  const height = divElement.clientHeight - margin.top - margin.bottom;

  // Delete all selector children
  d3.select(selector).selectAll(".foreground").remove();

  const svg = d3.select(selector).select("svg").select("g");

  const foreground = svg
    .append("g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(filteredData)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "none") // Sem preenchimento para as linhas
    .style("stroke", "steelblue") // Cor inicial das linhas
    .style("stroke-width", "1.5px") // Espessura inicial das linhas
    .on("mouseover", function (event, d) {
      d3.select(this)
        .style("stroke", "orange") // Cor de destaque ao passar o rato
        .style("stroke-width", "3px"); // Aumentar a espessura da linha
    })
    .on("mouseout", function (event, d) {
      d3.select(this)
        .style("stroke", "steelblue") // Restaurar a cor original
        .style("stroke-width", "1.5px"); // Restaurar a espessura original
    });
}
