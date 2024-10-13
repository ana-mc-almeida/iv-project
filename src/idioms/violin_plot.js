const domains = [
  { show: "AdsType", domain: ["Rent", "Sell"] },
  { show: "Condition", domain: ["New", "Renovated"] },
];
const toShow = ["Condition", "AdsType"];

/**
 * Função para calcular Kernel Density Estimation (KDE)
 */
function kernelDensityEstimator(kernel, xValues) {
  return function (sample) {
    return xValues.map(function (x) {
      return [
        x,
        d3.mean(sample, function (v) {
          return kernel(x - v);
        }),
      ];
    });
  };
}

/**
 * Kernel gaussiano para a KDE
 */
function kernelGaussian(bandwidth) {
  return function (x) {
    return (
      Math.exp(-0.5 * (x / bandwidth) ** 2) /
      (bandwidth * Math.sqrt(2 * Math.PI))
    );
  };
}

/**
 * Cria um Violin Plot Horizontal com distribuições simétricas sobre o mesmo eixo
 * @param {Array} data - O dataset
 * @param {String} selector - Seletor do elemento DOM para o gráfico
 */
function createHorizontalViolinPlot(data, selector, show) {
  if (!toShow.includes(show)) {
    console.error(`Invalid show value. Must be one of: ${toShow.join(", ")}`);
    return;
  }

  if (!data) {
    console.log("No data to create violin plot");
    return;
  }

  const domain = domains.find((d) => d.show === show).domain;

  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const divElement = d3.select(selector).node();
  const width = divElement.clientWidth - margin.left - margin.right;
  const height = divElement.clientHeight - margin.top - margin.bottom;

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Escala para o eixo x (Price)
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.Price)])
    .range([0, width]);

  const yScale = d3.scaleBand().domain(domain).range([0, height]).padding(0.5);

  // Escala para a largura do violino
  const violinWidthScale = d3.scaleLinear().range([0, 100]); // Controle de largura do violino

  // Kernel Density Estimation
  const kde = kernelDensityEstimator(kernelGaussian(200), xScale.ticks(50));

  const groupedData = d3.group(data, (d) => d[show]);

  let maxDensity = 0;

  const upValue = domain[0];
  // Para cada grupo (Sell e Rent), cria os violinos
  domain.forEach((attribute) => {
    const prices = groupedData.get(attribute).map((d) => +d.Price);

    // Calcula a densidade para cada grupo
    const density = kde(prices);

    const maxDensityEach = d3.max(density, (d) => d[1]);

    violinWidthScale.domain([0, maxDensityEach]);

    if (maxDensityEach > maxDensity) {
      maxDensity = maxDensityEach;
    }

    // Cria as formas de área (violin plot) sobre o mesmo eixo x
    svg
      .append("g")
      .append("path")
      .datum(density)
      .attr("class", "violin")
      .attr(
        "d",
        d3
          .area()
          .x((d) => xScale(d[0]))
          .y0((d) =>
            attribute === upValue
              ? height / 2
              : height / 2 - violinWidthScale(d[1])
          ) // Sell embaixo, Rent em cima
          .y1((d) =>
            attribute === upValue
              ? height / 2 + violinWidthScale(d[1])
              : height / 2
          ) // Rent em cima, Sell embaixo
          .curve(d3.curveBasis)
      )
      .style("fill", attribute === upValue ? "#1392FF" : "#A724FF")
      .style("stroke", "#fff");
  });

  // Adicionar linhas verticais (gridlines) nos ticks do eixo x
  svg
    .append("g")
    .attr("class", "grid") // Classe para estilização futura, se necessário
    .selectAll("line")
    .data(xScale.ticks(10)) // Usa os mesmos ticks do eixo x
    .enter()
    .append("line")
    .attr("x1", (d) => xScale(d)) // Posição inicial no eixo x
    .attr("x2", (d) => xScale(d)) // Posição final no eixo x
    .attr("y1", 0) // Começa do topo do gráfico
    .attr("y2", height) // Vai até o fim da altura do gráfico
    .style("stroke", "#cccccc") // Cor das linhas, pode ser ajustada
    .style("stroke-width", 1) // Largura das linhas
    .style("stroke-dasharray", "4,4"); // Linha tracejada para ficar mais sutil

  // Adiciona o eixo x (Price)
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`) // Aumente o valor para mover o eixo mais abaixo
    .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".2s")))
    .selectAll("text")
    .style("fill", "white")
    .style("dy", "1.5em"); // Mantém os valores abaixo do eixo

  // Adiciona o eixo y (Rent e Sell)
  svg
    .append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("fill", "white");

  // Adiciona título
  // svg
  //   .append("text")
  //   .attr("x", width / 2)
  //   .attr("y", -10)
  //   .attr("text-anchor", "middle")
  //   .attr("fill", "white")
  //   .text("Distribuição de Preços: Venda (embaixo) vs Aluguel (em cima)")
  //   .style("font-size", "16px");
}

function updateViolinPlot(data, selector, show) {
  d3.select(selector).selectAll("svg").remove();
  createHorizontalViolinPlot(data, selector, show);
}
