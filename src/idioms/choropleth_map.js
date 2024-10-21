let path;
let rangeColors = ['#a8e6a3', '#66c266', '#339966', '#1f6033'];

// Adicionar propriedade `clicked` para controlar o estado de clique
geo_data.forEach(d => {
    d.clicked = false; // Inicialmente, nenhum distrito está clicado
});

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

    path = d3.geoPath().projection(projection);

    svg.selectAll('path').remove();

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
        .attr('fill', 'white')
        .attr('stroke', (d) => colorScale(d.properties.Zone)) // Mapeia a cor do stroke para a zona
        .attr('stroke-width', 1) // Você pode ajustar a largura do stroke
        .each(function (d) {
            if (globalFilters.DISTRICT.includes(d.properties.District)) {
                d.clicked = true;
                d3.select(this).attr('fill', 'red')
                .attr('stroke-width', 6);
            } else {
                d.clicked = false;
                d3.select(this).attr('fill', 'white')
                .attr('stroke-width', 1);
            }
        })
        .on('mouseover', function (event, d) {
            if (!d.clicked) {
                d3.select(this).attr('fill', 'orange');
            }
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
            if (!d.clicked) {
                d3.select(this).attr('fill', 'white');
            }

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on('click', function (event, d) {
            selectDistrict(d.properties.District);
        });

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

function updateChoroplethMapSelectedDistrict(district) {
    console.log(district);
    d3.selectAll('path')
        .each(function (d) {
            if (d && d.properties && d.properties.District === district) {
                d.clicked = !d.clicked;
                if (d.clicked) {
                    d3.select(this).attr('fill', 'red')
                    .attr('stroke-width', 6);
                } else {
                    d3.select(this).attr('fill', 'white')
                    .attr('stroke-width', 1);
                }
            }
        });
}

function updateChoroplethMapHoverDistrict(district, isHover) {
    console.log(district);
    d3.selectAll('path')
        .each(function (d) {
            if (d && d.properties && !d.clicked && d.properties.District === district) {
                if (isHover) {
                    d3.select(this).attr('stroke-width', 6);
                } else {
                    d3.select(this).attr('stroke-width', 1);
                }
            }
        });
}

// type
function updateChoroplethMap(selector){
    d3.select(selector).selectAll("svg").remove();
    createChoroplethMap(selector);
}
