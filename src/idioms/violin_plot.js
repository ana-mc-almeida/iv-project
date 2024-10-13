domain = ["Rent", "Sell"];

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
function createHorizontalViolinPlot(data, selector) {
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const divElement = d3.select(selector).node();
  const width = divElement.clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

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

  // Filtra dados por "AdsType"
  const groupedData = d3.group(data, (d) => d.AdsType);

  // Para cada grupo (Sell e Rent), cria os violinos
  domain.forEach((AdsType) => {
    const prices = groupedData.get(AdsType).map((d) => +d.Price);

    // Calcula a densidade para cada grupo
    const density = kde(prices);
    violinWidthScale.domain([0, d3.max(density, (d) => d[1])]);

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
            AdsType === "Sell"
              ? height / 2
              : height / 2 - violinWidthScale(d[1])
          ) // Sell embaixo, Rent em cima
          .y1((d) =>
            AdsType === "Sell"
              ? height / 2 + violinWidthScale(d[1])
              : height / 2
          ) // Rent em cima, Sell embaixo
          .curve(d3.curveCatmullRom)
      )
      .style("fill", AdsType === "Sell" ? "#1392FF" : "#A724FF")
      .style("stroke", "#fff");
  });

  // Adiciona o eixo x (Price)
  svg
    .append("g")
    .attr("transform", `translate(0,${height / 2 + 30})`) // Mover o eixo x para baixo da linha central (ajustar valor conforme necessário)
    .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".2s")))
    .selectAll("text")
    .style("fill", "white")
    .style("dy", "1.5em"); // Mover o texto dos ticks para baixo do eixo

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
