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
                d3.select(this).attr('fill', '#B22222 ')
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
                d3.select(this).attr('fill', '#f2c42e');
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
            updateDistrict(d.properties.District, false);
        });
    
    createLegend(svg);

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
}

/**
 * Creates a legend for the choropleth map.
 * @param {object} svg - The SVG element where the legend will be added.
 */
function createLegend (svg) {
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
        let isClicked = false; // Flag to track whether the item has been clicked

        svg.append("rect")
            .attr("x", legendWidth)
            .attr("y", legendInitialHeight + i * legendHeight)
            .attr("width", 20) 
            .attr("height", legendHeight - 2)
            .style("fill", colorRange[i])
            .style('stroke', colorRange[i]) // Add an initial stroke (optional)
            .style('stroke-width', 1) // Set initial stroke width
            .on('mouseover', function () {
                if (!isClicked) { // Only change stroke if not clicked
                    d3.select(this)
                        .style('stroke-width', 3); // Increase stroke width on hover
                }
            })
            .on('mouseout', function () {
                if (!isClicked) { // Only change stroke if not clicked
                    d3.select(this)
                        .style('stroke-width', 1); // Reset stroke width when not hove#B22222 
                }
            })
            .on('click', function () {
                isClicked = !isClicked; // Toggle click state

                if (isClicked) {
                    d3.select(this)
                        .style('stroke-width', 6); // Set stroke width to 6 when clicked
                    highlightDistrictsByQuartile(d);
                } else {
                    d3.select(this)
                        .style('stroke-width', 1); // Reset to normal if unclicked
                    unhighlightDistrictsByQuartile(d);
                }
            });

        // Add text labels next to the legend rectangles
        svg.append("text")
            .attr("x", legendWidth + 30)
            .attr("y", legendInitialHeight + i * legendHeight + (legendHeight - 2) / 2)
            .attr("dy", "0.35em")
            .text(rangeLabels(i))
            .style("font-size", "14px");
    });

}

/**
 * Highlights the districts that belong to the clicked quartile.
 * @param {string} quartile - The quartile associated with the legend item clicked.
 */
function highlightDistrictsByQuartile(quartile) {
    d3.selectAll('path')
        .data(geo_data)
        .each(function (d) {
            if (d && d.properties && mapType(d) === quartile) {
                if (!d.clicked) {
                    updateDistrict(d.properties.District, false);
                }
                d.clicked = true; // Set clicked state
                d3.select(this).attr('fill', '#B22222 ') // Highlight district
                    .attr('stroke-width', 6);
            }
        });
}

/**
 * Unhighlights the districts that belong to the unclicked quartile.
 * @param {string} quartile - The quartile associated with the legend item unclicked.
 */
function unhighlightDistrictsByQuartile(quartile) {
    d3.selectAll('path')
        .data(geo_data)
        .each(function (d) {
            if (d && d.properties && mapType(d) === quartile) {
                if (d.clicked) {
                    updateDistrict(d.properties.District, false);
                }
                d.clicked = false; // Reset clicked state
                d3.select(this).attr('fill', (d) => rangeColorScale(mapType(d))) // Reset color
                    .attr('stroke-width', 1);
            }
        });
}

/**
 * Returns the label for the legend based on the index.
 * @param {number} index - The index of the legend item.
 * @returns {string} - The label corresponding to the given index.
 */
function rangeLabels(index) {

    const priceLimitsArray = Object.keys(quartile_value[0]).map(key => quartile_value[0][key]);
    const numberOfAvailabilityArray = priceLimitsArray[0];
    const areaArray = priceLimitsArray[1];
    const priceArray = priceLimitsArray[2];

    const areaLabels = [
        '0.0 - ' + parseFloat(areaArray[0]).toFixed(1),
        parseFloat(areaArray[0]).toFixed(1) + ' - ' + parseFloat(areaArray[1]).toFixed(1),
        parseFloat(areaArray[1]).toFixed(1) + ' - ' + parseFloat(areaArray[2]).toFixed(1),
        parseFloat(areaArray[2]).toFixed(1) + ' - ' + parseFloat(areaArray[3]).toFixed(1),
        parseFloat(areaArray[3]).toFixed(1) + ' - ' + parseFloat(areaArray[4]).toFixed(1)
    ];

    const priceLabels = [
        '0.0 - ' + parseFloat(priceArray[0]).toFixed(1),
        parseFloat(priceArray[0]).toFixed(1) + ' - ' + parseFloat(priceArray[1]).toFixed(1),
        parseFloat(priceArray[1]).toFixed(1) + ' - ' + parseFloat(priceArray[2]).toFixed(1),
        parseFloat(priceArray[2]).toFixed(1) + ' - ' + parseFloat(priceArray[3]).toFixed(1),
        parseFloat(priceArray[3]).toFixed(1) + ' - ' + parseFloat(priceArray[4]).toFixed(1)
    ];

    const numberOfAvailabilityLabels = [
        '0 - ' + numberOfAvailabilityArray[0],
        numberOfAvailabilityArray[0] + ' - ' + numberOfAvailabilityArray[1],
        numberOfAvailabilityArray[1] + ' - ' + numberOfAvailabilityArray[2],
        numberOfAvailabilityArray[2] + ' - ' + numberOfAvailabilityArray[3],
        numberOfAvailabilityArray[3] + ' - ' + numberOfAvailabilityArray[4]
    ];

    if (globalFilters.MAP_TYPE === "Area") {
        return areaLabels[index];
    } else if (globalFilters.MAP_TYPE === "PricePerSquareMeter") {
        return priceLabels[index];
    } else if (globalFilters.MAP_TYPE === "NumberOfAvailability") {
        return numberOfAvailabilityLabels[index];
    } else {
        return areaLabels[index];
    }
}

/**
 * Returns the string representation of the current map type.
 * @returns {string} - The current map type as a string.
 */
function mapTypeStr() {
    if (globalFilters.MAP_TYPE === "Area") {
        return "Area(m²)";
    } else if (globalFilters.MAP_TYPE === "PricePerSquareMeter") {
        return "Price(€)";
    } else if (globalFilters.MAP_TYPE === "NumberOfAvailability") {
        return "Availability";
    } else {
        return "Area(m²)";
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
                    d3.select(this).attr('fill', '#B22222 ') // Highlight clicked district
                    .attr('stroke-width', 6);
                } else {
                    d3.select(this).attr('fill', (d) => rangeColorScale(mapType(d))) // Reset color
                    .attr('stroke-width', 1);
                }
            }
        });
}

/**
 * Updates the visual indication of a district when hove#B22222  over.
 * @param {string} district - The name of the district being hove#B22222 .
 * @param {boolean} isHover - Indicates if the district is being hove#B22222  over.
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
 * Updates the choropleth map by #B22222 rawing it in the specified selector.
 * @param {string} selector - The CSS selector for the element to update the map in.
 */
function updateChoroplethMap(selector) {
    d3.select(selector).selectAll("svg").remove(); // Remove existing SVG
    createChoroplethMap(selector); // Create the map again
}
