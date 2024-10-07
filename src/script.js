// Global variable to hold the dataset
var globalData;

// Variable to hold the selected year value
let selectedYears = 0;

/**
 * Initializes the application by loading the dataset.
 * It processes the dataset by converting specific values to numbers.
 */
function init() {
  d3.json("./data/final_dataset.json", function (d) {
    // Converts CSV values into numbers
    return {
      Area: +d["Area"],
      Rooms: +d["Rooms"],
      Bathrooms: +d["Bathrooms"],
      // If AdsType is 'Rent', then Price is multiplied by 50
      Price: d["AdsType"] === "Rent" ? +d["Price"] * 50 : +d["Price"],
      District: d["District"],
      AdsType: d["AdsType"],
      Condition: d["Condition"],
    };
  }).then(function (data) {
    globalData = data;
    console.log(globalData);
  });
}

// Event listener for DOMContentLoaded to set up the UI interactions
document.addEventListener("DOMContentLoaded", function() {
  // District Links
  const districtLinks = d3.selectAll('.district-content a');
  
  // Toggle district selection on click
  districtLinks.on('click', function(event) {
      event.preventDefault(); 
      d3.select(this).classed('selected', !d3.select(this).classed('selected'));
  });

  // Condition Links
  const conditionLinks = d3.selectAll('.condition-content a');
  
  // Toggle condition selection on click
  conditionLinks.on('click', function(event) {
      event.preventDefault();
      d3.select(this).classed('selected', !d3.select(this).classed('selected'));
  });

  // Map Options
  const mapOptionLinks = d3.selectAll('.mapOption-content a');
  
  // Toggle map option selection on click
  mapOptionLinks.on('click', function(event) {
      event.preventDefault();
      const isSelected = d3.select(this).classed('selected'); 
      mapOptionLinks.classed('selected', false); // Deselect all options
      if (!isSelected) {
          d3.select(this).classed('selected', true); // Select the clicked option
      }
  });

  // Rent or Buy Buttons
  const rentOrBuyButtons = d3.selectAll('.rentOrBuy-button');

  // Toggle selection on rent/buy buttons
  rentOrBuyButtons.on('click', function() {
      d3.select(this).classed('selected', !d3.select(this).classed('selected'));
  });

  // Years Input
  d3.select('#yearInput').on('input', function() {
    selectedYears = +this.value; // Get the selected years from input
    console.log(selectedYears);
    updateYear(selectedYears); // Update the year filter
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
  const data = globalData.slice(); // Clone global data to avoid mutating the original
  updateDistrict(data, district);
}

/**
 * Selects a property type for filtering the dataset.
 * @param {String} type - The property type to be filtered.
 */
function selectType(type) {
  const data = globalData.slice(); // Clone global data to avoid mutating the original
  updateType(data, type);
}

/**
 * Selects a condition for filtering the dataset.
 * @param {String} condition - The condition to be filtered.
 */
function selectCondition(condition) {
  const data = globalData.slice(); // Clone global data to avoid mutating the original
  updateCondition(data, condition);
}
