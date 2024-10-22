const domains = [
  { show: "AdsType", domain: ["Rent", "Sell"] },
  { show: "Condition", domain: ["New", "Renovated"] },
];
const toShow = ["Condition", "AdsType"];
let currentShow = "AdsType";

const ticksNumber = 10;

let stepDensity = null;

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
  currentShow = show;

  if (!data) {
    console.log("No data to create violin plot");
    return;
  }

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const domain = domains.find((d) => d.show === show).domain;

  const margin = { top: 60, right: 30, bottom: 60, left: 70 };
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

  // Criar escalas para o preço mensal e total
  const xScaleRent = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.Price / globalFilters.YEARS / 12)]) // Preço mensal corrigido
    .range([0, width]);

  const xScaleTotal = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.Price)]) // Preço total (anual)
    .range([0, width]);

  const yScale = d3.scaleBand().domain(domain).range([0, height]).padding(0.5);
  const violinWidthScale = d3.scaleLinear().range([0, 100]);

  const kde = kernelDensityEstimator(kernelGaussian(200), xScaleTotal.ticks(100));
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
    stepDensity = density[1][0] - density[0][0];

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
          .x((d) =>
            attribute === "Rent" ? xScaleRent(d[0] / globalFilters.YEARS / 12) : xScaleTotal(d[0])
          )
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
          .curve(d3.curveMonotoneX)
      )

      .style("fill", attribute === upValue ? "#88A6CE" : "#A2C6F6")
      .style("stroke", "#4d4d4d")

    // Adicionar pontos relevantes (onde a densidade não é zero)
    for(let i=0; i<density.length; i++){
      const d = density[i]
      const previusDensity = i === 0 ? [0,0] : density[i-1];
      const posteriorDensity = i === density.length - 1 ? density[density.length-1] : density[i+1];

      if (d[1] > 1e-10) { // Verifica se a densidade é maior que 0
        const xPos = xScaleTotal(d[0]);

        // Calcular a posição Y usando a curva do violin plot
        const yPos = attribute === upValue
          ? height / 2 - violinWidthScale(d[1])
          : height / 2 + violinWidthScale(d[1]);

        // Adicionar círculo na posição correspondente da curva
        const circle =svg.append("circle")
          .attr("cx", xPos)
          .attr("cy", yPos)
          .attr("r", 5)
          .attr("class", `violin-point ${attribute}-price-${d[0].toFixed(2)}`)
          .style("fill", "#FF0000")
          .style("opacity", 0)
          .on("mouseover", function (event) {
            circle.style("opacity", 0.5);

            const previusRange = previusDensity[0] + (d[0] -previusDensity[0]) / 2;
            const posteriorRange = d[0] + (posteriorDensity[0] - d[0]) / 2;
            const countAtDensity = dataAttribute.filter(price => price.Price >= previusRange && price.Price <= posteriorRange).length;
            const monthlyPrice = d[0] / globalFilters.YEARS / 12
            const tooltipContent = `
              <strong>Total Price:</strong> ${d[0].toFixed(2)}<br>
              <strong>Monthly Price:</strong> ${monthlyPrice.toFixed(2)}<br>
              <strong>Number of Houses:</strong> ${countAtDensity}
            `;

            tooltip.transition()
              .duration(200)
              .style("opacity", .9);


            tooltip.html(tooltipContent)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY + 10) + "px");
          })
          .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY + 10) + "px");
          })
          .on("mouseout", function () {
            circle.style("opacity", 0);

            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          });
      }
    }
  })


  // Grade para o preço mensal (parte de cima)
  svg
    .append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(xScaleRent.ticks(ticksNumber))
    .enter()
    .append("line")
    .attr("x1", (d) => xScaleRent(d))
    .attr("x2", (d) => xScaleRent(d))
    .attr("y1", 0)
    .attr("y2", height) // Agora as gridlines vão de cima a baixo
    .style("stroke", "#999999")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "4,4");

  // Grade para o preço total (parte de baixo)
  svg
    .append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(xScaleTotal.ticks(ticksNumber))
    .enter()
    .append("line")
    .attr("x1", (d) => xScaleTotal(d))
    .attr("x2", (d) => xScaleTotal(d))
    .attr("y1", 0) // Agora as gridlines vão de cima a baixo também
    .attr("y2", height)
    .style("stroke", "#333333")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "4,4");

  // Eixo X para preço total (parte de baixo)
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScaleTotal).ticks(ticksNumber).tickFormat(d3.format(".2s")))
    .selectAll("text")
    .style("fill", "#4B7AC4")
    .style("dy", "1.5em");

  // Eixo X para preço mensal (parte de cima)
  svg
    .append("g")
    .attr("transform", `translate(0,0)`) // Colocar o eixo no topo
    .call(d3.axisTop(xScaleRent).ticks(ticksNumber).tickFormat(d3.format(".2s"))) // Usar axisTop
    .selectAll("text")
    .style("fill", "#4B7AC4")
    .style("dy", "-1.5em"); // Colocar os textos acima do eixo

  // Eixo Y (categorias)
  svg
    .append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("fill", "#4B7AC4");

  // Título do gráfico
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2) // Ajustar o título para acomodar o eixo superior
    .attr("text-anchor", "middle")
    .attr("fill", "#4B7AC4")
    .text("Price Distribution")
    .style("font-size", "16px");

  // Rótulo para o eixo X superior (preço mensal)
  svg
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", -margin.top / 3) // Ajusta a posição do rótulo
    .attr("text-anchor", "middle")
    .style("fill", "#4B7AC4")
    .text("Monthly Price (€)")
    .style("font-size", "12px");

  // Rótulo para o eixo X inferior (preço total)
  svg
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", height + margin.bottom / 2) // Ajusta a posição do rótulo
    .attr("text-anchor", "middle")
    .style("fill", "#4B7AC4")
    .text("Total Price (€)")
    .style("font-size", "12px");
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

/**
 * Updates the visual indication of a house when hovered over in the violin plot.
 * A circle will be displayed at the corresponding price on the x-axis of the violin plot.
 * 
 * @param {Number} housePrice - The price of the house being hovered.
 * @param {Boolean} isHover - Indicates if the house is being hovered over.
 */
function updateViolinPlotHoverHouse(housePrice, isHover, AdsType, Condition) {
  // Reset the opacity of all points
  d3.selectAll(".violin-point")
    .style("opacity", 0);

  const domain = currentShow === "AdsType" ? AdsType : Condition;
    
  if (isHover) {
    // Find the closest point to the house price
    const points = d3.selectAll(".violin-point");
    let minDiff = Infinity;
    let closestPoint = null;
    
    points.each(function() {
      const className = d3.select(this).attr("class");
      const regex = new RegExp(`${domain}-price-(\\d+\\.?\\d*)`);
      const priceMatch = className.match(regex);
      console.log('priceMatch', priceMatch);

      if (priceMatch) {
        const pointPrice = parseFloat(priceMatch[1]);
        const diff = Math.abs(pointPrice - housePrice);
        if (diff < minDiff) {
          minDiff = diff;
          closestPoint = this;
        }
      }
    });

    let color = '#FF0000';

    if(minDiff > stepDensity){
      color = '#FFFF00';
    }
    
    if (closestPoint) {
      d3.select(closestPoint)
        .style("opacity", 0.5)
        .style("fill", color);
    }
  }
  else {
    // Reset the opacity of all points
    d3.selectAll(".violin-point")
      .style("opacity", 0);
  }
}
