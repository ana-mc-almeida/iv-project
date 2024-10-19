function createChoroplethMap(selector) {
    const margin = { top: 140, right: 80, bottom: 10, left: 0 };
    const divElement = d3.select(selector).node();
    const width = divElement.clientWidth - margin.left - margin.right;
    const height = divElement.clientHeight - margin.top - margin.bottom;
  
    // Crie o SVG
    const svg = d3
      .select(selector)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const projection = d3.geoMercator()
        .center([-8, 39]) // Ajuste o centro para Portugal
        .scale(6000) // Ajuste a escala conforme necessário
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    svg.selectAll('path').remove();
    
    // Adicionar propriedade `clicked` para controlar o estado de clique
    geo_data.forEach(d => {
        d.clicked = false; // Inicialmente, nenhum distrito está clicado
    });

    // Criação do tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg
        .selectAll('path')
        .data(geo_data)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', 'black')
        .attr('stroke', (d) => colorScale(d.properties.Zone)) // Mapeia a cor do stroke para a zona
        .attr('stroke-width', 1) // Você pode ajustar a largura do stroke
        .on('mouseover', function (event, d) {
            if (!d.clicked) { // Só muda para laranja se não estiver clicado
                d3.select(this).attr('fill', 'orange');
            }

            // Exibir o tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.properties.District)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY) + "px");
        })
        .on('mousemove', function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY) + "px");
        })
        .on('mouseout', function (event, d) {
            if (!d.clicked) { // Só retorna à cor original se não estiver clicado
                d3.select(this).attr('fill', 'black');
            }

            // Ocultar o tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on('click', function (event, d) {
            // Altera o estado clicado
            d.clicked = !d.clicked; // Alterna entre clicado e não clicado

            // Altera a cor dependendo do estado de clique
            if (d.clicked) {
                d3.select(this).attr('fill', 'red');
            } else {
                d3.select(this).attr('fill', 'rgb(101, 153, 203)');
            }
        });

    // Estilizando o tooltip
    d3.select("body").append("style").text(`
        .tooltip {
            position: absolute;
            text-align: center;
            width: auto;
            padding: 5px;
            font: 12px sans-serif;
            background: lightsteelblue;
            border: 0px;
            border-radius: 8px;
            pointer-events: none;
        }
    `);
}
