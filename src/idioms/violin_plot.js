const domains = [
  { show: "AdsType", domain: ["Rent", "Sell"] },
  { show: "Condition", domain: ["New", "Renovated"] },
];
const toShow = ["Condition", "AdsType"];

const ticksNumber = 10;

/**
 * Função para calcular Kernel Density Estimation (KDE)
 * @param {Function} kernel - Função do kernel
 * @param {Array} xValues - Valores para aplicar KDE
 * @returns {Function} - Função para estimar densidade com base em amostra
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
 * @param {Number} bandwidth - Largura de banda para suavização
 * @returns {Function} - Função de kernel Gaussiano
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
 * @param {String} show - Atributo a ser mostrado no eixo Y
 */
function createViolinPlot(data, selector, show) {
  if (!toShow.includes(show)) {
    console.error(`Invalid show value. Must be one of: ${toShow.join(", ")}`);
    return;
  }

  if (!data) {
    console.log("No data to create violin plot");
    return;
  }

  const domain = domains.find((d) => d.show === show).domain;

  const margin = { top: 20, right: 30, bottom: 40, left: 70 };
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

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.Price)])
    .range([0, width]);

  const yScale = d3.scaleBand().domain(domain).range([0, height]).padding(0.5);
  const violinWidthScale = d3.scaleLinear().range([0, 100]);

  const kde = kernelDensityEstimator(kernelGaussian(200), xScale.ticks(50));
  const groupedData = d3.group(data, (d) => d[show]);

  let maxDensity = 0;
  const upValue = domain[0];

  domain.forEach((attribute) => {
    const dataAttribute = groupedData.get(attribute);

    if (!dataAttribute) {
      console.log(`No data for attribute ${attribute}`);
      return;
    }

    const prices = dataAttribute.map((d) => +d.Price);
    const density = kde(prices);

    const maxDensityEach = d3.max(density, (d) => d[1]);

    violinWidthScale.domain([0, maxDensityEach]);

    if (maxDensityEach > maxDensity) {
      maxDensity = maxDensityEach;
    }

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
            attribute !== upValue
              ? height / 2
              : height / 2 - violinWidthScale(d[1])
          )
          .y1((d) =>
            attribute !== upValue
              ? height / 2 + violinWidthScale(d[1])
              : height / 2
          )
          .curve(d3.curveBasis)
      )
      .style("fill", attribute === upValue ? "#1392FF" : "#A724FF")
      .style("stroke", "#4d4d4d");
  });

  svg
    .append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(xScale.ticks(ticksNumber))
    .enter()
    .append("line")
    .attr("x1", (d) => xScale(d))
    .attr("x2", (d) => xScale(d))
    .attr("y1", 0)
    .attr("y2", height)
    .style("stroke", "#808080")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "4,4");

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).ticks(ticksNumber).tickFormat(d3.format(".2s")))
    .selectAll("text")
    .style("fill", "#4B7AC4")
    .style("dy", "1.5em");

  svg
    .append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("fill", "#4B7AC4");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .attr("fill", "#4B7AC4")
    .text("Price Distribution")
    .style("font-size", "16px");
}

/**
 * Atualiza o Violin Plot existente com novos dados
 * @param {Array} data - O dataset atualizado
 * @param {String} selector - Seletor do elemento DOM para o gráfico
 * @param {String} show - Atributo a ser mostrado no eixo Y
 */
function updateViolinPlot(data, selector, show) {
  d3.select(selector).selectAll("svg").remove();
  createViolinPlot(data, selector, show);
}
