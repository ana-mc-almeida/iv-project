// Global controllerFilters object to hold the state of the various controllerFilters applied to the dataset
const controllerFilters = {
  MAP_TYPE: "none",
  DISTRICT: [],
  TYPE: ["Rent", "Sell"],
  CONDITION: [],
  YEARS: 0,
};

var inicialData;
var filteredData;

/**
 * Init the dataset.
 * @param {Array} data - The inicial dataset.
 */
function initControllers(data) {
  inicialData = data.slice(); // Clone global data to avoid mutating the original
  filteredData = data.slice();
}

/**
 * Updates all charts based on the filtered data.
 * @param {Array} data - The dataset to update the charts with.
 */
function updateAllCharts(data) {
  updateChart(data);
  console.log("update");
}

/**
 * Updates the map to display data based on the area.
 */
function updateMapToArea() {
  controllerFilters.MAP_TYPE = "area";
  console.log(controllerFilters.MAP_TYPE);
}

/**
 * Updates the map to display data based on the price per square meter.
 */
function updateMapToPricePerSquareMeter() {
  controllerFilters.MAP_TYPE = "price_per_square_meter";
  console.log(controllerFilters.MAP_TYPE);
}

/**
 * Updates the map to display the number of availability.
 */
function updateMapToNumberOfAvailability() {
  controllerFilters.MAP_TYPE = "number_of_availability";
  console.log(controllerFilters.MAP_TYPE);
}

/**
 * Updates the district filter based on user selection.
 * If the district already exists in the filter, it removes it; otherwise, it adds it.
 * @param {String} district - The district to update the filter with.
 */
function updateDistrict(district) {
  const exists = controllerFilters.DISTRICT.includes(district);
  if (!exists) {
    controllerFilters.DISTRICT.push(district);
  } else {
    // Remove if exists
    controllerFilters.DISTRICT = controllerFilters.DISTRICT.filter(
      (d) => d !== district
    );
  }

  filteredData = filterDataset();

  updateAllCharts(filteredData);
  console.log("distritos:" + controllerFilters.DISTRICT);
  console.log(filteredData);
}

/**
 * Updates the property type filter based on user selection.
 * If the type already exists in the filter, it removes it; otherwise, it adds it.
 * @param {String} type - The property type to update the filter with.
 */
function updateType(type) {
  if (!controllerFilters.TYPE.includes(type)) {
    controllerFilters.TYPE.push(type);
  } else {
    // Remove if exists
    controllerFilters.TYPE = controllerFilters.TYPE.filter((d) => d !== type);
  }

  filteredData = filterDataset();

  updateAllCharts(filteredData);
  console.log(controllerFilters.TYPE);
  console.log(filteredData);
}

/**
 * Updates the condition filter based on user selection.
 * If the condition already exists in the filter, it removes it; otherwise, it adds it.
 * @param {String} condition - The condition to update the filter with.
 */
function updateCondition(condition) {
  if (!controllerFilters.CONDITION.includes(condition)) {
    controllerFilters.CONDITION.push(condition);
  } else {
    // Remove if exists
    controllerFilters.CONDITION = controllerFilters.CONDITION.filter(
      (d) => d !== condition
    );
  }

  filteredData = filterDataset();

  updateAllCharts(filteredData);
  console.log(controllerFilters.CONDITION);
  console.log(filteredData);
}

/**
 * Updates the years filter based on user input.
 * @param {Number} years - The number of years to set in the controllerFilters.
 */
function updateYear(years) {
  controllerFilters.YEARS = years;
  console.log(controllerFilters.YEARS);
}

/**
 * controllerFilters the dataset by the selected districts.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected districts.
 */
function filterDatasetByDistricts(data) {
  if (controllerFilters.DISTRICT.length === 0) {
    return data;
  }
  return data.filter((d) => controllerFilters.DISTRICT.includes(d.District));
}

/**
 * controllerFilters the dataset by the selected ads types.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected ads types.
 */
function filterDatasetByType(data) {
  if (controllerFilters.TYPE.length === 0) {
    return data;
  }
  return data.filter((d) => controllerFilters.TYPE.includes(d.AdsType));
}

/**
 * controllerFilters the dataset by the selected conditions.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected conditions.
 */
function filterDatasetByConditions(data) {
  if (controllerFilters.CONDITION.length === 0) {
    return data;
  }

  if (controllerFilters.CONDITION.includes("Others")) {
    return data.filter(
      (d) =>
        controllerFilters.CONDITION.includes(d.Condition) ||
        (d.Condition !== "New" &&
          d.Condition !== "Renovated" &&
          d.Condition !== "Used")
    );
  }
  return data.filter((d) => controllerFilters.CONDITION.includes(d.Condition));
}

/**
 * filters the dataset by the selected information.
 * @returns {Array} - Filtered dataset based on the selected information.
 */
function filterDataset() {
  var data = inicialData.slice();

  data = filterDatasetByDistricts(data);
  data = filterDatasetByType(data);
  data = filterDatasetByConditions(data);
  return data;
}

/**
 * Recreates the chart with all the axes and paths
 * @param {Array} data - The dataset
 */
function recreateChart(data) {
  d3.select(globalSelector).selectAll("svg").remove();
  createParallelCoordinates(data, globalSelector);
}
