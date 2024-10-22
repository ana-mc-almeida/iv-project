// Global globalFilters object to hold the state of the various globalFilters applied to the dataset
const globalFilters = {
  MAP_TYPE: "none",
  DISTRICT: [],
  TYPE: ["Rent", "Sell"],
  CONDITION: [],
  YEARS: 50,
};

/**
 * Filters the dataset by the selected districts.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected districts.
 */
function filterDatasetByDistricts(data) {
  if (globalFilters.DISTRICT.length === 0) {
    return data;
  }
  return data.filter((d) => globalFilters.DISTRICT.includes(d.District));
}

/**
 * Filters the dataset by the selected ads types.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected ads types.
 */
function filterDatasetByType(data) {
  if (globalFilters.TYPE.length === 0) {
    return null; // No types selected, return null
  }
  return data.filter((d) => globalFilters.TYPE.includes(d.AdsType));
}

/**
 * Filters the dataset by the selected conditions.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected conditions.
 */
function filterDatasetByConditions(data) {
  if (globalFilters.CONDITION.length === 0) {
    return data; // If no conditions are selected, return original data
  }

  if (globalFilters.CONDITION.includes("Others")) {
    return data.filter(
      (d) =>
        globalFilters.CONDITION.includes(d.Condition) ||
        (d.Condition !== "New" &&
          d.Condition !== "Renovated" &&
          d.Condition !== "Used")
    );
  }
  return data.filter((d) => globalFilters.CONDITION.includes(d.Condition));
}

/**
 * Filters the dataset by the selected number of rooms.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected rooms.
 */
function filterDatasetByRooms(data) {
  if (!globalFilters.Rooms) {
    return data; // If no room filter is applied, return original data
  }

  return data.filter(
    (d) =>
      d.Rooms >= globalFilters.Rooms[0] && d.Rooms <= globalFilters.Rooms[1]
  );
}

/**
 * Filters the dataset by the selected number of bathrooms.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected bathrooms.
 */
function filterDatasetByBathrooms(data) {
  if (!globalFilters.Bathrooms) {
    return data; // If no bathroom filter is applied, return original data
  }

  return data.filter(
    (d) =>
      d.Bathrooms >= globalFilters.Bathrooms[0] &&
      d.Bathrooms <= globalFilters.Bathrooms[1]
  );
}

/**
 * Filters the dataset by the selected price range.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected price.
 */
function filterDatasetByPrice(data) {
  if (!globalFilters.Price) {
    return data; // If no price filter is applied, return original data
  }

  return data.filter(
    (d) =>
      d.Price >= globalFilters.Price[0] && d.Price <= globalFilters.Price[1]
  );
}

/**
 * Filters the dataset by the selected area range.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected area.
 */
function filterDatasetByArea(data) {
  if (!globalFilters.Area) {
    return data; // If no area filter is applied, return original data
  }

  return data.filter(
    (d) => d.Area >= globalFilters.Area[0] && d.Area <= globalFilters.Area[1]
  );
}

/**
 * Applies all the filters to the dataset based on the globalFilters state.
 * @param {boolean} isBrushEvent - Indicates if the filter is triggered by a brush event.
 * @returns {Array} - Filtered dataset based on the applied filters.
 */
function filterDataset(isBrushEvent) {
  var data = global_data.slice();
  
  data = filterDatasetByRooms(data);
  data = filterDatasetByBathrooms(data);
  data = filterDatasetByPrice(data);
  data_without_district = filterDatasetByArea(data);

  data = filterDatasetByDistricts(data_without_district);

  if (showViolinPlot == "AdsType") {
    data = filterDatasetByConditions(data);
    violin_data = data; // Store filtered data for the violin plot
    data = filterDatasetByType(data);
  } else {
    data = filterDatasetByType(data);
    violin_data = data; // Store filtered data for the violin plot
    data = filterDatasetByConditions(data);
  }
  
  if (initial_geo_data !== undefined && isBrushEvent) {
    filtered_choroplethMap(data_without_district);
  }

  filtered_data = data; // Store the final filtered data
}

/**
 * Updates the properties of the choropleth map based on the filtered data.
 * @param {Array} data - The dataset to be processed.
 */
function filtered_choroplethMap(data){
  const counts = countDistricts(data);
  const area = meanAreaByDistrict(data);
  const price = meanPricePerSquareMeterByDistrict(data);

  const countValues = Object.values(counts);
  const areaValues = Object.values(area);
  const priceValues = Object.values(price);

  const countQuartiles = getQuartiles(countValues);
  const areaQuartiles = getQuartiles(areaValues);
  const priceQuartiles = getQuartiles(priceValues);

  // Duplicar o geo_data para edição
  geo_data = initial_geo_data.slice();
  geo_data.forEach(feature => {
    const district = feature['properties']['District'];

    if (!district) return;  

    const countValue = parseInt(counts[district] || 0);
    const areaValue = parseFloat(area[district] || 0)
    const priceValue = parseFloat(price[district] || 0);

    feature['properties']['Count'] = countValue;
    feature['properties']['AreaMean'] = areaValue;
    feature['properties']['PriceMean'] = priceValue;

    //feature['properties']['NumberOfAvailabilityQuartile'] = assignQuartile(countValue, countQuartiles);
    feature['properties']['AreaQuartile'] = assignQuartile(areaValue, areaQuartiles);
    //feature['properties']['PriceQuartile'] = assignQuartile(priceValue, priceQuartiles);

  });

  quartile_value = initial_quartile_value.slice();
  quartile_value[0]['District Count Limits'] = countQuartiles;
  quartile_value[0]['Area Limits'] = areaQuartiles;
  quartile_value[0]['Price Per Sq Meter Limits'] = priceQuartiles;
}

/**
 * Counts the number of listings per district in the dataset.
 * @param {Array} data - The dataset to count listings.
 * @returns {Object} - An object with district names as keys and listing counts as values.
 */
function countDistricts(data) {
  const districtCounts = {};
  data.forEach(item => {
      const district = item.District;
      if (!districtCounts[district]) {
          districtCounts[district] = 0;
      }
      districtCounts[district] += 1;
  });

  return districtCounts;
}

/**
 * Calculates the mean area for each district in the dataset.
 * @param {Array} data - The dataset to calculate mean area.
 * @returns {Object} - An object with district names as keys and mean areas as values.
 */
function meanAreaByDistrict(data) {
  const districtAreas = {};
  const districtCounts = {};

  data.forEach(item => {
      const district = item.District;
      const area = item.Area;
      if (!districtAreas[district]) {
          districtAreas[district] = 0;
          districtCounts[district] = 0;
      }
      districtAreas[district] += area;
      districtCounts[district] += 1;
  });

  const meanArea = {};
  for (let district in districtAreas) {
      meanArea[district] = (districtAreas[district] / districtCounts[district]).toFixed(1);
  }
  return meanArea;
}

/**
 * Calculates the mean price per square meter for each district in the dataset.
 * @param {Array} data - The dataset to calculate mean price per square meter.
 * @returns {Object} - An object with district names as keys and mean prices per square meter as values.
 */
function meanPricePerSquareMeterByDistrict(data) {
  const districtPrices = {};
  const districtCounts = {};

  data.forEach(item => {
      const district = item.District;
      const pricePerSquareMeter = item.PricePerSquareMeter;

      if (!districtPrices[district]) {
          districtPrices[district] = 0;
          districtCounts[district] = 0;
      }
      districtPrices[district] += pricePerSquareMeter;
      districtCounts[district] += 1;
  });

  const meanPricePerSquareMeter = {};
  for (let district in districtPrices) {
      meanPricePerSquareMeter[district] = (districtPrices[district] / districtCounts[district]).toFixed(1);
  }
  return meanPricePerSquareMeter;
}

/**
 * Calculates the quartiles for a given array of numbers.
 * @param {Array} arr - The array of numbers to calculate quartiles.
 * @returns {Array} - An array containing the quartile values.
 */
function getQuartiles(arr) {
  arr.sort((a, b) => a - b); // Sort in ascending order
  const q1 = percentile(arr, 25);
  const q2 = percentile(arr, 50); // Median
  const q3 = percentile(arr, 75);
  const q4 = percentile(arr, 100);
  return [q1, q2, q3 , q4];
}

/**
 * Calculates the percentile value for a given array of numbers.
 * @param {Array} arr - The array of numbers to calculate the percentile.
 * @param {number} p - The desired percentile (0-100).
 * @returns {number} - The percentile value.
 */
function percentile(arr, p) {
  const index = (p / 100) * (arr.length - 1);
  if (Math.floor(index) === index) {
      return arr[index]; // Return exact value if index is whole number
  }
  const lower = arr[Math.floor(index)];
  const upper = arr[Math.ceil(index)];
  return lower + (upper - lower) * (index - Math.floor(index)); // Interpolating between two values
}

/**
 * Assigns a quartile category based on the value and the quartiles.
 * @param {number} value - The value to categorize.
 * @param {Array} quartiles - The array containing quartile values.
 * @returns {string} - The quartile category (Q1, Q2, Q3, Q4).
 */
function assignQuartile(value, quartiles) {
  const [q1, q2, q3, q4] = quartiles;

  // Use parseFloat para garantir que estamos trabalhando com números
  if (parseFloat(value) <= parseFloat(q1)) {
      return "Q1"; // Primeiro quartil
  } else if (parseFloat(value) <= parseFloat(q2)) {
      return "Q2"; // Segundo quartil
  } else if (parseFloat(value) <= parseFloat(q3)) {
      return "Q3"; // Terceiro quartil
  } else {
      return "Q4"; // Quarto quartil
  }
}

