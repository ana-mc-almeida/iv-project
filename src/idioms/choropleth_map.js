let path;
let rangeColorScale, rangeColors = ['#a8e6a3', '#66c266', '#339966', '#1f6033'];

/**
 * Creates a choropleth map within the specified selector.
 * @param {string} selector - The CSS selector for the element where the map will be created.
 */
function createChoroplethMap(selector) {
    const margin = { top: 140, right: 80, bottom: 10, left: 0 };
    const divElement = d3.select(selector).node();
    const width = divElement.clientWidth - margin.left - margin.right;
    const height = divElement.clientHeight - margin.top - margin.bottom;
  
    // Create the SVG element for the map
    const svg = d3
      .select(selector)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the projection for the map
    const projection = d3.geoMercator()
        .center([-8, 39]) // Adjust center for Portugal
        .scale(6000) // Scale the map appropriately
        .translate([width / 2, height / 2]);

    path = d3.geoPath().projection(projection);
    
    rangeColorScale = createRangeColorScale();

    svg.selectAll('path').remove();

    // Create the tooltip for displaying district information
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Create the map paths for each district
    svg
        .selectAll('path')
        .data(geo_data)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', (d) => rangeColorScale(mapType(d))) // Fill color based on data
        .attr('stroke', (d) => colorScale(d.properties.Zone)) // Stroke color based on Zone
        .attr('stroke-width', 1) // Set initial stroke width
        .each(function (d) {
            // Highlight selected districts based on global filters
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
            // Change color on mouse over
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
            tooltip.html(tooltipContent) // Set tooltip content
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
            })
            
        .on('mousemove', function (event) {
            // Update tooltip position on mouse move
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY) + "px");
        })
        .on('mouseout', function (event, d) {
            // Reset color on mouse out
            if (!d.clicked) {
                d3.select(this).attr('fill', (d) => rangeColorScale(mapType(d)));
            }

            tooltip.transition()
                .duration(500)
                .style("opacity", 0); // Hide tooltip
        })
        .on('click', function (event, d) {
            // Handle district selection on click
            selectDistrict(d.properties.District);
        });
    
    const colorDomain = rangeColorScale.domain();
    const colorRange = rangeColorScale.range();

    const legendWidth = 270;
    const legendInitialHeight = 450;
    const legendHeight = 20;
    
    // Add legend title
    svg.append("text")
        .attr("x", legendWidth + 30)
        .attr("y", legendInitialHeight - 10)
        .attr("font-weight", "bold")
        .text(mapTypeStr());

    // Create the legend for the map
    colorDomain.forEach((d, i) => {
        svg.append("rect")
            .attr("x", legendWidth)
            .attr("y", legendInitialHeight + i * legendHeight)
            .attr("width", 20) 
            .attr("height", legendHeight - 2)
            .style("fill", colorRange[i]);

        // Add text labels next to the legend rectangles
        svg.append("text")
            .attr("x", legendWidth + 30)
            .attr("y", legendInitialHeight + i * legendHeight + (legendHeight - 2) / 2)
            .attr("dy", "0.35em")
            .text(rangeLabels(i))
            .style("font-size", "14px")
    });

    // Style for the tooltip
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

/**
 * Returns the label for the legend based on the index.
 * @param {number} index - The index of the legend item.
 * @returns {string} - The label corresponding to the given index.
 */
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

/**
 * Returns the string representation of the current map type.
 * @returns {string} - The current map type as a string.
 */
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

/**
 * Maps the district data to its corresponding type based on the global filter.
 * @param {object} d - The district data.
 * @returns {number} - The mapped value based on the current map type.
 */
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

/**
 * Creates a color scale based on the current map type.
 * @returns {object} - The D3 color scale.
 */
function createRangeColorScale() {
    const quartileDomain = ['Q1', 'Q2', 'Q3', 'Q4'];
    return d3.scaleOrdinal().domain(quartileDomain).range(rangeColors);
}

/**
 * Updates the choropleth map by highlighting the selected district.
 * @param {string} district - The name of the district to highlight.
 */
function updateChoroplethMapSelectedDistrict(district) {
    d3.selectAll('path')
        .each(function (d) {
            if (d && d.properties && d.properties.District === district) {
                d.clicked = !d.clicked; // Toggle the clicked state
                if (d.clicked) {
                    d3.select(this).attr('fill', 'red') // Highlight clicked district
                    .attr('stroke-width', 6);
                } else {
                    d3.select(this).attr('fill', (d) => rangeColorScale(mapType(d))) // Reset color
                    .attr('stroke-width', 1);
                }
            }
        });
}

/**
 * Updates the visual indication of a district when hovered over.
 * @param {string} district - The name of the district being hovered.
 * @param {boolean} isHover - Indicates if the district is being hovered over.
 */
function updateChoroplethMapHoverDistrict(district, isHover) {
    d3.selectAll('path')
        .each(function (d) {
            if (d && d.properties && !d.clicked && d.properties.District === district) {
                // Change stroke width based on hover state
                if (isHover) {
                    d3.select(this).attr('stroke-width', 6);
                } else {
                    d3.select(this).attr('stroke-width', 1);
                }
            }
        });
}

/**
 * Updates the choropleth map by redrawing it in the specified selector.
 * @param {string} selector - The CSS selector for the element to update the map in.
 */
function updateChoroplethMap(selector) {
    d3.select(selector).selectAll("svg").remove(); // Remove existing SVG
    createChoroplethMap(selector); // Create the map again
}
