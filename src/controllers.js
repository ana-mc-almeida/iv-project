const filters = {
    MAP_TYPE: 'none',
    DISTRICT: [],
    TYPE: [],
    CONDITION: [],
    YEARS: 0
};

function updateAllCharts(data) {
    // TODO: go to idioms update
}

function updateMapToArea() {
    filters.MAP_TYPE = 'area';
    console.log(filters.MAP_TYPE);
}

function updateMapToPricePerSquareMeter() {
    filters.MAP_TYPE = 'price_per_square_meter';
    console.log(filters.MAP_TYPE);
}

function updateMapToNumberOfAvailability() {
    filters.MAP_TYPE = 'number_of_availability';
    console.log(filters.MAP_TYPE);
}   

function updateDistrict(data, district) {

    const exists = filters.DISTRICT.includes(district);
    if (!exists) {
        filters.DISTRICT.push(district); 
    } else {
        // remove if exists
        filters.DISTRICT = filters.DISTRICT.filter(d => d !== district);
    }

    const filteredData = filterDatasetByDistricts(data); 

    updateAllCharts(filteredData);
    console.log("distritos:" + filters.DISTRICT);
    console.log(filteredData);
}

function updateType(data, type) {

    if (!filters.TYPE.includes(type)) {
        filters.TYPE.push(type); 
    } else {
        // remove if exists
        filters.TYPE = filters.TYPE.filter(d => d !== type);
    }

    const filteredData = filterDatasetByType(data); 

    updateAllCharts(filteredData);
    console.log(filters.TYPE);
    console.log(filteredData);
}

function updateCondition(data, condition) {

    if (!filters.CONDITION.includes(condition)) {
        filters.CONDITION.push(condition); 
    } else {
        // remove if exists
        filters.CONDITION = filters.CONDITION.filter(d => d !== condition);
    }

    const filteredData = filterDatasetByConditions(data); 

    updateAllCharts(filteredData);
    console.log(filters.CONDITION);
    console.log(filteredData);
}

function updateYear(years) {
    filters.YEARS = years;
    console.log(filters.YEARS);
}

function filterDatasetByDistricts(data) {
    if (filters.DISTRICT.length === 0) {
        return data; 
    }
    return data.filter(d => filters.DISTRICT.includes(d.District));
}

function filterDatasetByType(data) {
    if (filters.TYPE.length === 0) {
        return data; 
    }
    return data.filter(d => filters.TYPE.includes(d.AdsType));
}

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
