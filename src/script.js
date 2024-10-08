// Global variable to hold the dataset
var global_data;
var inicial_data;

// Variable to hold the selected year value
let selectedYears = 50;

/**
 * Initializes the application by loading the dataset.
 * It processes the dataset by converting specific values to numbers.
 */
function init() {
  d3.json("./data/final_dataset.json").then(function (data) {
    inicial_data = data;
    global_data = processData(inicial_data);
    initControllers(global_data);
    createParallelCoordinates(global_data, ".parallelCoordinates");
  });
}

function processData(data) {
  console.log("selectedYears", selectedYears);
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
    };
  });
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

  // Toggle selection on rent/buy buttons
  rentOrBuyButtons.on("click", function () {
    d3.select(this).classed("selected", !d3.select(this).classed("selected"));
  });

  // Years Input
  d3.select("#yearInput").on("input", function () {
    selectedYears = +this.value; // Get the selected years from input
    console.log(selectedYears);

    if (selectedYears <= 0) {
      selectedYears = 1;
    } else if (selectedYears > 99) {
      selectedYears = 99;
    }
    document.getElementById("yearInput").value = selectedYears;

    updateYear(selectedYears); // Update the year filter

    global_data = processData(inicial_data);
    recreateChart(global_data);
  });
});

/**
 * Selects the type of map to display based on user selection.
 * @param {String} typeOfMap - The type of map to be displayed.
 */
function selectMap(typeOfMap) {
  switch (typeOfMap) {
    case "Area":
      updateMapToArea();
      break;

    case "Price Per Square Meter":
      updateMapToPricePerSquareMeter();
      break;

    case "Number of availability":
      updateMapToNumberOfAvailability();
      break;

    default:
      break;
  }
}

/**
 * Selects a district for filtering the dataset.
 * @param {String} district - The district to be filtered.
 */
function selectDistrict(district) {
  updateDistrict(district);
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
