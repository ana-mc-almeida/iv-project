let path;
let rangeColorScale, rangeColors = ['#B3D3F3', '#8CC0F3', '#65ADF3', '#3E9AF3'];

/**
 * Creates a choropleth map within the specified selector.
 * @param {string} selector - The CSS selector for the element where the map will be created.
 */
function createChoroplethMap(selector) {
    const margin = { top: 80, right: 80, bottom: 10, left: 0 };
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

    // Create the map paths for each district with a transition
    const paths = svg
        .selectAll('path')
        .data(geo_data)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', (d) => rangeColorScale(mapType(d))) // Fill color based on data
        .attr('stroke', (d) => colorScale(d.properties.Zone)) // Stroke color based on Zone
        .attr('stroke-width', 1) // Set initial stroke width
        .style("opacity", 0) // Set initial opacity to 0 for animation
        .each(function (d) {
            // Highlight selected districts based on global filters
            if (globalFilters.DISTRICT.includes(d.properties.District)) {
                d.clicked = true;
                d3.select(this).attr('fill', '#8282FA')
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
                d3.select(this).attr('fill', '#D2D2FA');
            }
            const tooltipContent = `
            <strong>District:</strong> ${d.properties.District}<br>
            <strong>Mean Area:</strong> ${Math.round(d.properties.AreaMean)} m²<br>
            <strong>Mean Price:</strong> ${Math.round(d.properties.PriceMean)} €/m²<br>
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

    // Animate the paths to fade in
    paths.transition()
        .duration(1500) // Duration of the fade-in animation
        .style("opacity", 1); // Change opacity to 1
    
    createLegend(svg);
}


/**
 * Creates a legend for the choropleth map.
 * @param {object} svg - The SVG element where the legend will be added.
 */
function createLegend(svg) {
    const colorDomain = rangeColorScale.domain();
    const colorRange = rangeColorScale.range();
    const legendWidth = 270; // Width for the legend
    const legendInitialHeight = 500; // Initial height for the legend
    const legendHeight = 20; // Height for each legend item
    const initialXPosition = legendWidth + 100; // Set initial x position for animation

    // Add legend title
    svg.append("text")
        .attr("x", legendWidth + 30)
        .attr("y", legendInitialHeight - 10)
        .attr("font-weight", "bold")
        .text(mapTypeStr())
        .style("fill", "#4B7AC4");

    // Create the legend for the map
    colorDomain.forEach((d, i) => {
        let isClicked = false; // Flag to track whether the item has been clicked

        // Create rectangles with initial x position off-screen
        const rect = svg.append("rect")
            .attr("x", initialXPosition) // Start position for animation
            .attr("y", legendInitialHeight + i * legendHeight)
            .attr("width", 20)
            .attr("height", legendHeight - 2)
            .style("fill", colorRange[i])
            .style('stroke', colorRange[i])
            .style('stroke-width', 1);

        // Animate the rectangle's x position
        rect.transition()
            .duration(1000) // Duration of the animation
            .attr("x", legendWidth); // Final x position

        // Mouse events
        rect
            .on('mouseover', function () {
                if (!isClicked) { // Only change stroke if not clicked
                    d3.select(this)
                        .style('stroke-width', 3); // Increase stroke width on hover
                }
            })
            .on('mouseout', function () {
                if (!isClicked) { // Only change stroke if not clicked
                    d3.select(this)
                        .style('stroke-width', 1); // Reset stroke width when not hovered
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

        // Add text labels with initial x position off-screen
        const text = svg.append("text")
            .attr("x", initialXPosition + 30) // Start position for animation
            .attr("y", legendInitialHeight + i * legendHeight + (legendHeight - 2) / 2)
            .attr("dy", "0.35em")
            .text(rangeLabels(i))
            .style("fill", "#4B7AC4")
            .style("font-size", "14px");

        // Animate the text's x position
        text.transition()
            .duration(1500) // Duration of the animation
            .attr("x", legendWidth + 30); // Final x position
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
                d3.select(this).attr('fill', '#8282FA ') // Highlight district
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
        '0 - ' + parseInt(areaArray[0]),
        parseInt(areaArray[0]+1) + ' - ' + parseInt(areaArray[1]),
        parseInt(areaArray[1]+1) + ' - ' + parseInt(areaArray[2]),
        parseInt(areaArray[2]+1) + ' - ' + parseInt(areaArray[3]),
        parseInt(areaArray[3]+1) + ' - ' + parseInt(areaArray[4])
    ];

    const priceLabels = [
        '0 - ' + parseInt(priceArray[0]),
        parseInt(priceArray[0]+1) + ' - ' + parseInt(priceArray[1]),
        parseInt(priceArray[1]+1) + ' - ' + parseInt(priceArray[2]),
        parseInt(priceArray[2]+1) + ' - ' + parseInt(priceArray[3]),
        parseInt(priceArray[3]+1) + ' - ' + parseInt(priceArray[4])
    ];

    const numberOfAvailabilityLabels = [
        '0 - ' + parseInt(numberOfAvailabilityArray[0]),
        parseInt(numberOfAvailabilityArray[0]+1) + ' - ' + parseInt(numberOfAvailabilityArray[1]),
        parseInt(numberOfAvailabilityArray[1]+1) + ' - ' + parseInt(numberOfAvailabilityArray[2]),
        parseInt(numberOfAvailabilityArray[2]+1) + ' - ' + parseInt(numberOfAvailabilityArray[3]),
        parseInt(numberOfAvailabilityArray[3]+1) + ' - ' + parseInt(numberOfAvailabilityArray[4])
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
        return "Area (m²)";
    } else if (globalFilters.MAP_TYPE === "PricePerSquareMeter") {
        return "Price (€)";
    } else if (globalFilters.MAP_TYPE === "NumberOfAvailability") {
        return "Availability";
    } else {
        return "Area (m²)";
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
                    d3.select(this).attr('fill', '#8282FA ') // Highlight clicked district
                    .attr('stroke-width', 6);
                } else {
                    d3.select(this).attr('fill', (d) => rangeColorScale(mapType(d))) // Reset color
                    .attr('stroke-width', 1);
                }
            }
        });
}

/**
 * Updates the visual indication of a district when hove#8282FA  over.
 * @param {string} district - The name of the district being hove#8282FA .
 * @param {boolean} isHover - Indicates if the district is being hove#8282FA  over.
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
 * Updates the choropleth map by #8282FA rawing it in the specified selector.
 * @param {string} selector - The CSS selector for the element to update the map in.
 */
function updateChoroplethMap(selector) {
    d3.select(selector).selectAll("svg").remove(); // Remove existing SVG
    createChoroplethMap(selector); // Create the map again
}
