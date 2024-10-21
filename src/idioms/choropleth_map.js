let path;
let rangeColorScale, rangeColors = ['#a8e6a3', '#66c266', '#339966', '#1f6033'];

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
    
    rangeColorScale = createRangeColorScale();

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
        .attr('fill', (d) => rangeColorScale(mapType(d)))
        .attr('stroke', (d) => colorScale(d.properties.Zone)) // Mapeia a cor do stroke para a zona
        .attr('stroke-width', 1) // Você pode ajustar a largura do stroke
        .each(function (d) {
            if (globalFilters.DISTRICT.includes(d.properties.District)) {
                d.clicked = true;
                d3.select(this).attr('fill', 'red')
                .attr('stroke-width', 6);
            } else {
                d.clicked = false;
                d3.select(this).attr('fill', (d) => rangeColorScale(mapType(d)))
                .attr('stroke-width', 1);
            }
        })
        .on('mouseover', function (event, d) {
            if (!d.clicked) {
                d3.select(this).attr('fill', 'orange');
            }
            const tooltipContent = `
            <strong>District:</strong> ${d.properties.District}<br>
            <strong>Area Mean:</strong> ${d.properties.AreaMean}<br>
            <strong>Price Mean:</strong> ${d.properties.PriceMean}<br>
            <strong>Number of Availability:</strong> ${d.properties.Count}
            `;
        
            // Show the tooltip with a transition
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(tooltipContent) // Set the combined HTML
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
            })
            
        .on('mousemove', function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY) + "px");
        })
        .on('mouseout', function (event, d) {
            if (!d.clicked) {
                d3.select(this).attr('fill', (d) => rangeColorScale(mapType(d)));
            }

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on('click', function (event, d) {
            selectDistrict(d.properties.District);
        });
    
    const colorDomain = rangeColorScale.domain();
    const colorRange = rangeColorScale.range();

    const legendWidth = 270;
    const legendInitialHeight = 450;
    const legendHeight = 20;
    
    svg.append("text")
        .attr("x", legendWidth + 30)
        .attr("y", legendInitialHeight - 10)
        .attr("font-weight", "bold")
        .text(mapTypeStr());

    colorDomain.forEach((d, i) => {
        svg.append("rect")
            .attr("x", legendWidth)
            .attr("y", legendInitialHeight + i * legendHeight)
            .attr("width", 20) 
            .attr("height", legendHeight - 2)
            .style("fill", colorRange[i]);

        // Adicione texto à direita dos retângulos
        svg.append("text")
            .attr("x", legendWidth + 30)
            .attr("y", legendInitialHeight + i * legendHeight + (legendHeight - 2) / 2)
            .attr("dy", "0.35em")
            .text(rangeLabels(i))
            .style("font-size", "14px")
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

    createLegend(selector);
}

function rangeLabels(index) {
    const labels = [
        'Minimum',
        'Average',
        'High',
        'Maximum'
    ];

    const numberOfAvailabilityLabels = [
        'Low',
        'Medium',
        'High',
        'Maximum'
    ];

    if (globalFilters.MAP_TYPE === "Area" || globalFilters.MAP_TYPE === "PricePerSquareMeter") {
        return labels[index];
    } else if (globalFilters.MAP_TYPE === "NumberOfAvailability") {
        return numberOfAvailabilityLabels[index];
    } else {
        return labels[index];
    }
}

function mapTypeStr() {
    if (globalFilters.MAP_TYPE === "Area") {
        return "Area";
    } else if (globalFilters.MAP_TYPE === "PricePerSquareMeter") {
        return "Price";
    } else if (globalFilters.MAP_TYPE === "NumberOfAvailability") {
        return "Availability";
    } else {
        return "Area";
    }
}

function mapType(d) {
    if (globalFilters.MAP_TYPE === "Area") {
        return d.properties.AreaQuartile;
    } else if (globalFilters.MAP_TYPE === "PricePerSquareMeter") {
        return d.properties.PriceQuartile;
    } else if (globalFilters.MAP_TYPE === "NumberOfAvailability") {
        return d.properties.NumberOfAvailabilityQuartile;
    } else {
        return d.properties.AreaQuartile;
    }
}

function createRangeColorScale() {
    if (globalFilters.MAP_TYPE === "Area") {
        return d3.scaleOrdinal(rangeColors).domain(geo_data.map((d) => d.properties.AreaQuartile));
    } else if (globalFilters.MAP_TYPE === "PricePerSquareMeter") {
        return d3.scaleOrdinal(rangeColors).domain(geo_data.map((d) => d.properties.PriceQuartile));
    } else if (globalFilters.MAP_TYPE === "NumberOfAvailability") {
        return d3.scaleOrdinal(rangeColors).domain(geo_data.map((d) => d.properties.NumberOfAvailabilityQuartile));
    } else {
        return d3.scaleOrdinal(rangeColors).domain(geo_data.map((d) => d.properties.AreaQuartile));
    }
}

function updateChoroplethMapSelectedDistrict(district) {
    d3.selectAll('path')
        .each(function (d) {
            if (d && d.properties && d.properties.District === district) {
                d.clicked = !d.clicked;
                if (d.clicked) {
                    d3.select(this).attr('fill', 'red')
                    .attr('stroke-width', 6);
                } else {
                    d3.select(this).attr('fill', (d) => rangeColorScale(mapType(d)))
                    .attr('stroke-width', 1);
                }
            }
        });
}

function updateChoroplethMapHoverDistrict(district, isHover) {
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

function updateChoroplethMap(selector){
    d3.select(selector).selectAll("svg").remove();
    createChoroplethMap(selector);
}
