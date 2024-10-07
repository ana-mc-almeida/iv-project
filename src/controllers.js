// Global filters object to hold the state of the various filters applied to the dataset
const filters = {
    MAP_TYPE: 'none',
    DISTRICT: [],
    TYPE: [],
    CONDITION: [],
    YEARS: 0
};

/**
 * Updates all charts based on the filtered data.
 * @param {Array} data - The dataset to update the charts with.
 */
function updateAllCharts(data) {
    // TODO: go to idioms update
}

/**
 * Updates the map to display data based on the area.
 */
function updateMapToArea() {
    filters.MAP_TYPE = 'area';
    console.log(filters.MAP_TYPE);
}

/**
 * Updates the map to display data based on the price per square meter.
 */
function updateMapToPricePerSquareMeter() {
    filters.MAP_TYPE = 'price_per_square_meter';
    console.log(filters.MAP_TYPE);
}

/**
 * Updates the map to display the number of availability.
 */
function updateMapToNumberOfAvailability() {
    filters.MAP_TYPE = 'number_of_availability';
    console.log(filters.MAP_TYPE);
}   

/**
 * Updates the district filter based on user selection.
 * If the district already exists in the filter, it removes it; otherwise, it adds it.
 * @param {Array} data - The dataset to filter by district.
 * @param {String} district - The district to update the filter with.
 */
function updateDistrict(data, district) {
    const exists = filters.DISTRICT.includes(district);
    if (!exists) {
        filters.DISTRICT.push(district); 
    } else {
        // Remove if exists
        filters.DISTRICT = filters.DISTRICT.filter(d => d !== district);
    }

    const filteredData = filterDatasetByDistricts(data); 
    updateAllCharts(filteredData);
    console.log("distritos:" + filters.DISTRICT);
    console.log(filteredData);
}

/**
 * Updates the property type filter based on user selection.
 * If the type already exists in the filter, it removes it; otherwise, it adds it.
 * @param {Array} data - The dataset to filter by property type.
 * @param {String} type - The property type to update the filter with.
 */
function updateType(data, type) {
    if (!filters.TYPE.includes(type)) {
        filters.TYPE.push(type); 
    } else {
        // Remove if exists
        filters.TYPE = filters.TYPE.filter(d => d !== type);
    }

    const filteredData = filterDatasetByType(data); 
    updateAllCharts(filteredData);
    console.log(filters.TYPE);
    console.log(filteredData);
}

/**
 * Updates the condition filter based on user selection.
 * If the condition already exists in the filter, it removes it; otherwise, it adds it.
 * @param {Array} data - The dataset to filter by condition.
 * @param {String} condition - The condition to update the filter with.
 */
function updateCondition(data, condition) {
    if (!filters.CONDITION.includes(condition)) {
        filters.CONDITION.push(condition); 
    } else {
        // Remove if exists
        filters.CONDITION = filters.CONDITION.filter(d => d !== condition);
    }

    const filteredData = filterDatasetByConditions(data); 
    updateAllCharts(filteredData);
    console.log(filters.CONDITION);
    console.log(filteredData);
}

/**
 * Updates the years filter based on user input.
 * @param {Number} years - The number of years to set in the filters.
 */
function updateYear(years) {
    filters.YEARS = years;
    console.log(filters.YEARS);
}

/**
 * Filters the dataset by the selected districts.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected districts.
 */
function filterDatasetByDistricts(data) {
    if (filters.DISTRICT.length === 0) {
        return data; 
    }
    return data.filter(d => filters.DISTRICT.includes(d.District));
}

/**
 * Filters the dataset by the selected ads types.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected ads types.
 */
function filterDatasetByType(data) {
    if (filters.TYPE.length === 0) {
        return data; 
    }
    return data.filter(d => filters.TYPE.includes(d.AdsType));
}

/**
 * Filters the dataset by the selected conditions.
 * @param {Array} data - The dataset to filter.
 * @returns {Array} - Filtered dataset based on the selected conditions.
 */
function filterDatasetByConditions(data) {
    if (filters.CONDITION.length === 0) {
        return data; 
    }

    if (filters.CONDITION.includes('Others')) {
        return data.filter(d => filters.CONDITION.includes(d.Condition) || 
            (d.Condition !== 'New' && d.Condition !== 'Renovated' && d.Condition !== 'Used'));
    }
    return data.filter(d => filters.CONDITION.includes(d.Condition));
}
