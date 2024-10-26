// Global variable to hold the dataset
var inicial_data; // Initial data from the dataset
var global_data; // Global data to apply filters
var filtered_data; // Filtered data to update the charts
var violin_data; // Data to create the violin plot
var geo_data;
var initial_geo_data;
var colorScale;
var quartile_value;
var initial_quartile_value;

// Variable to hold the selected year value
let selectedYears = 50;

let showViolinPlot = "AdsType";
const customColors = ["#FFFF7F", "#FF7F7F", "#59B259"];    // centro, norte, sul

/**
 * Initializes the application by loading the dataset.
 * It processes the dataset by converting specific values to numbers.
 */
function init() {
  d3.json("./data/final_dataset.json").then(function (data) {
    inicial_data = data.slice();
    calculateData(data);
    colorScale = createColorScale();
    createParallelCoordinates(".parallelCoordinates");
    createViolinPlot(violin_data, ".violinPlot", showViolinPlot);

    d3.json('./data/final_portugal_district.geojson').then(function (geoData) {
      geo_data = geoData.features.slice();
      initial_geo_data = geoData.features.slice();
      createChoroplethMap(".choroplethMap");
    });
  });
  
  d3.json('./data/quartiles_values.json').then(function (quartile_data) {
    quartile_value = quartile_data.slice();
    initial_quartile_value = quartile_data.slice();
  });
}

/**
 * Process the data by converting specific values to numbers.
 * @param {Array} data - The dataset to process.
 * @returns {Array} - The processed dataset.
 */
function processData(data) {
  return data.map(function (d) {
    return {
      Area: +d["Area"],
      Rooms: +d["Rooms"],
      Bathrooms: +d["Bathrooms"],
      Price:
        d["AdsType"] === "Rent" ? +d["Price"] * selectedYears : +d["Price"],
      District: d["District"],
      AdsType: d["AdsType"],
      Condition: d["Condition"],
      Zone: d["Zone"],
      PricePerSquareMeter: d["PricePerSquareMeter"],
    };
  });
}

/**
 * Filters the dataset based on the global filters.
 * @param {Array} data - The dataset to filter.
 */
function calculateData(data) {
  global_data = processData(data);
  filterDataset(false);
  violin_data = filtered_data;
}

// Event listener for DOMContentLoaded to set up the UI interactions
document.addEventListener("DOMContentLoaded", function () {
  // District Links
  const districtLinks = d3.selectAll(".district-content a");

  // Toggle district selection on click
  districtLinks.on("click", function (event) {
    event.preventDefault();
    d3.select(this).classed("selected", !d3.select(this).classed("selected"));
  });

  // Condition Links
  const conditionLinks = d3.selectAll(".condition-content a");

  // Toggle condition selection on click
  conditionLinks.on("click", function (event) {
    event.preventDefault();
    d3.select(this).classed("selected", !d3.select(this).classed("selected"));
  });

  // Map Options
  const mapOptionLinks = d3.selectAll(".mapOption-content a");

  // Toggle map option selection on click
  mapOptionLinks.on("click", function (event) {
    event.preventDefault();
    const isSelected = d3.select(this).classed("selected");
    mapOptionLinks.classed("selected", false); // Deselect all options
    if (!isSelected) {
      d3.select(this).classed("selected", true); // Select the clicked option
    }
  });

  // Rent or Buy Buttons
  const rentOrBuyButtons = d3.selectAll(".rentOrBuy-button");
  rentOrBuyButtons.classed("selected", true);

  // Toggle selection on rent/buy buttons
  rentOrBuyButtons.on("click", function () {
    const selectedButtons = rentOrBuyButtons.filter(".selected");
    if (selectedButtons.size() === 1 && d3.select(this).classed("selected")) {
      return;
    }
    d3.select(this).classed("selected", !d3.select(this).classed("selected"));
  });

  // Years Input
  d3.select("#yearInput").on("input", function () {
    selectedYears = +this.value; // Get the selected years from input

    if (selectedYears <= 0) {
      selectedYears = 1;
    } else if (selectedYears > 99) {
      selectedYears = 99;
    }
    document.getElementById("yearInput").value = selectedYears;

    updateYear(selectedYears); // Update the year filter

    calculateData(inicial_data);
    recreateParallelCoordinates();
    updateViolinPlot(violin_data, ".violinPlot", showViolinPlot);
  });

  // violinPlotButtons
  const violinPlotButtons = d3.selectAll(".violinPlot-input");

  // Toggle selection on rent/buy buttons
  violinPlotButtons.on("click", function () {
    violinPlotButtons.classed("selected", false);
    d3.select(this).classed("selected", true);
  });

  if (globalFilters.DISTRICT.length === 0) {
    document.getElementById("selectedDistricts").textContent = "District";
  }

  if (globalFilters.CONDITION.length === 0) {
    document.getElementById("selectedConditions").textContent = "Condition";
  }

  if (globalFilters.MAP_TYPE == "none") {
    document.getElementById("selectedMapOption").textContent =
      "🔍 What to see on the map?";
  }
});

/**
 * Selects the type of map to display based on user selection.
 * @param {String} typeOfMap - The type of map to be displayed.
 */
function selectMap(typeOfMap) {
  updateMap(typeOfMap);
}

/**
 * Selects a district for filtering the dataset.
 * @param {String} district - The district to be filtered.
 */
function selectDistrict(district) {
  updateDistrict(district, false);
}

/**
 * Selects a ads type for filtering the dataset.
 * @param {String} type - The ads type to be filtered.
 */
function selectType(type) {
  updateType(type);
}

/**
 * Selects a condition for filtering the dataset.
 * @param {String} condition - The condition to be filtered.
 */
function selectCondition(condition) {
  updateCondition(condition);
}

/**
 * Selects a violin plot compare for show.
 * @param {String} show - The compare selected.
 */
function selectViolinPlot(show) {
  showViolinPlot = show;
  filterDataset(false);
  updateViolinPlot(violin_data, ".violinPlot", showViolinPlot);
}

/**
 * Creates color scale based on Zone
 * @returns {d3.ScaleOrdinal} - Color scale for Zone
 */
function createColorScale() {
  return d3.scaleOrdinal(customColors).domain(global_data.map((d) => d.Zone));
}
