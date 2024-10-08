// Global globalFilters object to hold the state of the various globalFilters applied to the dataset
const globalFilters = {
  MAP_TYPE: "none",
  DISTRICT: [],
  TYPE: ["Rent", "Sell"],
  CONDITION: [],
  YEARS: 0,
};

/**
 * globalFilters the dataset by the selected districts.
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
 * globalFilters the dataset by the selected ads types.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected ads types.
 */
function filterDatasetByType(data) {
  if (globalFilters.TYPE.length === 0) {
    return data;
  }
  return data.filter((d) => globalFilters.TYPE.includes(d.AdsType));
}

/**
 * globalFilters the dataset by the selected conditions.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected conditions.
 */
function filterDatasetByConditions(data) {
  if (globalFilters.CONDITION.length === 0) {
    return data;
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
 * globalFilters the dataset by the selected rooms.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected rooms.
 */
function filterDatasetByRooms(data) {
  if (!globalFilters.Rooms) {
    return data;
  }

  return data.filter(
    (d) =>
      d.Rooms >= globalFilters.Rooms[0] && d.Rooms <= globalFilters.Rooms[1]
  );
}

/**
 * globalFilters the dataset by the selected bathrooms.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected bathrooms.
 */
function filterDatasetByBathrooms(data) {
  if (!globalFilters.Bathrooms) {
    return data;
  }

  return data.filter(
    (d) =>
      d.Bathrooms >= globalFilters.Bathrooms[0] &&
      d.Bathrooms <= globalFilters.Bathrooms[1]
  );
}

/**
 * globalFilters the dataset by the selected price.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected price.
 */
function filterDatasetByPrice(data) {
  if (!globalFilters.Price) {
    return data;
  }

  return data.filter(
    (d) =>
      d.Price >= globalFilters.Price[0] && d.Price <= globalFilters.Price[1]
  );
}

/**
 * globalFilters the dataset by the selected area.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected area.
 */
function filterDatasetByArea(data) {
  if (!globalFilters.Area) {
    return data;
  }

  return data.filter(
    (d) => d.Area >= globalFilters.Area[0] && d.Area <= globalFilters.Area[1]
  );
}

/**
 * filters the dataset by the selected information.
 * @returns {Array} - Filtered dataset based on the selected information.
 */
function filterDataset() {
  var data = global_data.slice();

  data = filterDatasetByDistricts(data);
  data = filterDatasetByType(data);
  data = filterDatasetByConditions(data);
  data = filterDatasetByRooms(data);
  data = filterDatasetByBathrooms(data);
  data = filterDatasetByPrice(data);
  data = filterDatasetByArea(data);

  return data;
}
