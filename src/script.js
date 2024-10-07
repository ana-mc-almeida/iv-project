function init() {
  console.log("Initializing...");

  // Load the CSV dataset
  d3.csv("./data/final_dataset.csv").then(function (data) {
    console.log("Data loaded:", data);

    // Initialize controllers (dropdowns, buttons, etc.)
    initializeControllers();

    // Bind the dataset to the controllers or map visualizations
    bindDataToControllers(data);

    // Initially display all data
    displayData(data);

  }).catch(function(error) {
    console.error("Error loading the CSV data:", error);
  });
}

// Function to bind the data to the controllers or visualization
function bindDataToControllers(data) {
  // Listen to changes in the map selection dropdown (for example, "Price" or "Area")
  d3.select("#mapSelect").on("change", function() {
    updateDataDisplay(data);  // Update data display when selection changes
  });

  // Listen to changes in the district selection dropdown
  d3.select("#districtSelect").on("change", function() {
    updateDataDisplay(data);  // Update data display when selection changes
  });

  // Listen to changes in the rent or buy dropdown
  d3.select("#rentOrBuySelect").on("change", function() {
    updateDataDisplay(data);  // Update data display when selection changes
  });

  // Listen to changes in the condition dropdown
  d3.select("#conditionSelect").on("change", function() {
    updateDataDisplay(data);  // Update data display when selection changes
  });

  // Listen to changes in the years input (if applicable)
  d3.select("#yearsInput").on("input", function() {
    updateDataDisplay(data);  // Update data display when the number of years changes
  });
}

// Function to update the data display based on selected filters
function updateDataDisplay(data) {
  // Get the current filter selections
  const selectedMapOption = d3.select("#mapSelect").property("value");
  const selectedDistricts = Array.from(d3.select("#districtSelect").property("selectedOptions"), option => option.value);
  const selectedRentOrBuy = d3.select("#rentOrBuySelect").property("value");
  const selectedConditions = Array.from(d3.select("#conditionSelect").property("selectedOptions"), option => option.value);

  console.log("Selected Districts:", selectedDistricts);
  console.log("Selected Rent or Buy:", selectedRentOrBuy);
  console.log("Selected Conditions:", selectedConditions);

  // Filter the data based on the current selections
  const filteredData = data.filter(d => {
    return (selectedMapOption ? d[selectedMapOption] : true) &&    // E.g., Price or Area filtering
          (selectedDistricts.length > 0 ? selectedDistricts.includes(d.District.trim()) : true) &&
          (selectedRentOrBuy ? d.AdsType === selectedRentOrBuy : true) &&
          (selectedConditions.length > 0 ? selectedConditions.includes(d.Condition) : true);
  });

  console.log("Filtered Data:", filteredData);

  // Display the filtered data
  displayData(filteredData);
}

// Function to display the filtered data
function displayData(filteredData) {
  // Select the data display div
  const selectedDataContainer = d3.select("#selectedData");

  // Clear any previous data
  selectedDataContainer.html("");

  // If no data matches the filters, show a message
  if (filteredData.length === 0) {
    selectedDataContainer.text("No data matches your selection.");
    return;
  }

  // Display the filtered data in a formatted way
  filteredData.forEach(d => {
    selectedDataContainer.append("div").text(`District: ${d.District}, Price: ${d.Price}, Area: ${d.Area}, Rooms: ${d.Rooms}, Condition: ${d.Condition}, AdsType: ${d.AdsType}, PricePerSquareMeter: ${d.PricePerSquareMeter}`);
  });
}

// Call the init function when the page is loaded
init();
