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
        })
        .on('mouseout', function (event, d) {
            if (!d.clicked) { // Só retorna à cor original se não estiver clicado
                d3.select(this).attr('fill', 'black');
            }
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
}
