/**
 * Updates all charts based on the filtered data.
 * @param {Array} data - The dataset to update the charts with.
 */
function updateAllCharts() {
  updateChart(filtered_data);
  updateViolinPlot(violin_data, ".violinPlot", showViolinPlot);
}

/**
 * Updates the map to display data based on the area.
 */
function updateMapToArea() {
  globalFilters.MAP_TYPE = "area";
  console.log(globalFilters.MAP_TYPE);
}

/**
 * Recreates the chart with all the axes and paths
 */
function recreateChart() {
  d3.select(parallelCoordinatesSelector).selectAll("svg").remove();
  createParallelCoordinates(parallelCoordinatesSelector);
}

/**
 * Updates the map to display data based on the price per square meter.
 */
function updateMapToPricePerSquareMeter() {
  globalFilters.MAP_TYPE = "price_per_square_meter";
  console.log(globalFilters.MAP_TYPE);
}

/**
 * Updates the map to display the number of availability.
 */
function updateMapToNumberOfAvailability() {
  globalFilters.MAP_TYPE = "number_of_availability";
  console.log(globalFilters.MAP_TYPE);
}

/**
 * Updates the district filter based on user selection.
 * If the district already exists in the filter, it removes it; otherwise, it adds it.
 * @param {String} district - The district to update the filter with.
 */
function updateDistrict(district) {
  const exists = globalFilters.DISTRICT.includes(district);
  if (!exists) {
    globalFilters.DISTRICT.push(district);
  } else {
    // Remove if exists
    globalFilters.DISTRICT = globalFilters.DISTRICT.filter(
      (d) => d !== district
    );
  }

  filterDataset();

  updateAllCharts();
  console.log("distritos:" + globalFilters.DISTRICT);
  console.log(filtered_data);
}

/**
 * Updates the property type filter based on user selection.
 * If the type already exists in the filter, it removes it; otherwise, it adds it.
 * @param {String} type - The property type to update the filter with.
 */
function updateType(type) {
  if (!globalFilters.TYPE.includes(type)) {
    globalFilters.TYPE.push(type);
  } else {
    // Remove if exists
    globalFilters.TYPE = globalFilters.TYPE.filter((d) => d !== type);
  }

  filterDataset();

  updateAllCharts();
  console.log(globalFilters.TYPE);
  console.log(filtered_data);
}

/**
 * Updates the condition filter based on user selection.
 * If the condition already exists in the filter, it removes it; otherwise, it adds it.
 * @param {String} condition - The condition to update the filter with.
 */
function updateCondition(condition) {
  if (!globalFilters.CONDITION.includes(condition)) {
    globalFilters.CONDITION.push(condition);
  } else {
    // Remove if exists
    globalFilters.CONDITION = globalFilters.CONDITION.filter(
      (d) => d !== condition
    );
  }

  filterDataset();

  updateAllCharts();
  console.log(globalFilters.CONDITION);
  console.log(filtered_data);
}

/**
 * Updates the years filter based on user input.
 * @param {Number} years - The number of years to set in the globalFilters.
 */
function updateYear(years) {
  globalFilters.YEARS = years;
  console.log(globalFilters.YEARS);
}

function selectViolinPlot(show) {
  showViolinPlot = show;
  filterDataset();
  updateViolinPlot(violin_data, ".violinPlot", showViolinPlot);
}
