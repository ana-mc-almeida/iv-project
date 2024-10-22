/**
 * Updates all charts based on the filtered data.
 * @param {String} district - The district to update the choropleth map with; "none" if no specific district is selected.
 */
function updateAllCharts(district) {
  updateParallelCoordinates(filtered_data);
  updateViolinPlot(violin_data, ".violinPlot", showViolinPlot);
  
  if (district != "none") {
    updateChoroplethMapSelectedDistrict(district);
  } else {
    updateChoroplethMap(".choroplethMap");
  }
}

/**
 * Updates the map type based on user selection.
 * If the selected option is the same as the current map type, it resets to "none".
 * @param {String} option - The map option to update.
 */
function updateMap(option) {
  if (globalFilters.MAP_TYPE == option) {
    globalFilters.MAP_TYPE = "none"; // Reset to none if the same option is selected
  } else {
    globalFilters.MAP_TYPE = option; // Update to the selected map option
  }

  const selectedMapOption = document.getElementById("selectedMapOption");

  selectedMapOption.innerHTML = "";

  let tag = document.createElement("span");
  tag.textContent = globalFilters.MAP_TYPE;
  tag.className = "tag";
  tag.onclick = function () {
    d3.selectAll(".mapOption-content a")
      .filter(function () {
        return d3.select(this).text() === globalFilters.MAP_TYPE;
      })
      .classed("selected", false);

    updateMap(globalFilters.MAP_TYPE); // Update the map with the selected option
  };

  selectedMapOption.appendChild(tag);

  if (globalFilters.MAP_TYPE == "none") {
    selectedMapOption.textContent = "🔍 What to see on the map?"; // Placeholder text when no option is selected
  }

  updateAllCharts("none"); // Update all charts after changing the map type
}

/**
 * Updates the district filter based on user selection.
 * If the district already exists in the filter, it removes it; otherwise, it adds it.
 * @param {String} district - The district to update the filter with.
 * @param {boolean} isBrushEvent - Indicates if the update is triggered by a brush event.
 */
function updateDistrict(district, isBrushEvent) {
  const exists = globalFilters.DISTRICT.includes(district);
  if (!exists) {
    globalFilters.DISTRICT.push(district); // Add district if not already present
  } else {
    // Remove if exists
    globalFilters.DISTRICT = globalFilters.DISTRICT.filter(
      (d) => d !== district
    );
  }

  updateSelectedDistrictsContainer(); // Update UI with selected districts

  filterDataset(isBrushEvent); // Apply filters to the dataset

  updateAllCharts(district); // Update all charts based on the filtered data
}

/**
 * Updates the displayed selected districts in the UI.
 * If a district is selected, it creates a tag for it; otherwise, it clears the selection.
 */
function updateSelectedDistrictsContainer() {
  const selectedDistrictsContainer =
    document.getElementById("selectedDistricts");

  selectedDistrictsContainer.innerHTML = ""; // Clear current selections

  globalFilters.DISTRICT.forEach((district) => {
    let tag = document.createElement("span");
    tag.textContent = district;
    tag.className = "tag";
    tag.onclick = function () {
      d3.selectAll(".district-content a")
        .filter(function () {
          return d3.select(this).text() === district;
        })
        .classed("selected", false);

      updateDistrict(district); // Update district filter on tag click
    };
    selectedDistrictsContainer.appendChild(tag);
  });

  if (globalFilters.DISTRICT.length === 0) {
    selectedDistrictsContainer.textContent = "District"; // Placeholder text when no districts are selected
  }
}

/**
 * Updates the property type filter based on user selection.
 * If the type already exists in the filter, it removes it; otherwise, it adds it.
 * @param {String} type - The property type to update the filter with.
 */
function updateType(type) {
  if (!globalFilters.TYPE.includes(type)) {
    globalFilters.TYPE.push(type); // Add type if not already present
  } else {
    // Remove if exists
    globalFilters.TYPE = globalFilters.TYPE.filter((d) => d !== type);
  }

  filterDataset(false); // Apply filters to the dataset

  updateAllCharts("none"); // Update all charts based on the filtered data
}

/**
 * Updates the condition filter based on user selection.
 * If the condition already exists in the filter, it removes it; otherwise, it adds it.
 * @param {String} condition - The condition to update the filter with.
 */
function updateCondition(condition) {
  if (!globalFilters.CONDITION.includes(condition)) {
    globalFilters.CONDITION.push(condition); // Add condition if not already present
  } else {
    // Remove if exists
    globalFilters.CONDITION = globalFilters.CONDITION.filter(
      (d) => d !== condition
    );
  }
  updateSelectedConditionsContainer(); // Update UI with selected conditions

  filterDataset(false); // Apply filters to the dataset

  updateAllCharts("none"); // Update all charts based on the filtered data
}

/**
 * Updates the displayed selected condition in the UI.
 * If a condition is selected, it creates a tag for it; otherwise, it clears the selection.
 */
function updateSelectedConditionsContainer() {
  const selectedConditionsContainer =
    document.getElementById("selectedConditions");

  selectedConditionsContainer.innerHTML = ""; // Clear current selections

  globalFilters.CONDITION.forEach((condition) => {
    let tag = document.createElement("span");
    tag.textContent = condition;
    tag.className = "tag";

    tag.onclick = function () {
      d3.selectAll(".condition-content a")
        .filter(function () {
          return d3.select(this).text() === condition;
        })
        .classed("selected", false);

      updateCondition(condition); // Update condition filter on tag click
    };

    selectedConditionsContainer.appendChild(tag);
  });

  if (globalFilters.CONDITION.length === 0) {
    selectedConditionsContainer.textContent = "Condition"; // Placeholder text when no conditions are selected
  }
}

/**
 * Updates the years filter based on user input.
 * @param {Number} years - The number of years to set in the globalFilters.
 */
function updateYear(years) {
  globalFilters.YEARS = years; // Update the years filter
}
