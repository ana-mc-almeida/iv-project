/**
 * Updates all charts based on the filtered data.
 * @param {Array} data - The dataset to update the charts with.
 */
function updateAllCharts() {
  updateParallelCoordinates(filtered_data);
  updateViolinPlot(violin_data, ".violinPlot", showViolinPlot);
}

/**
 * Updates the map to display data based on the area.
 */
function updateMap(option) {
  if (globalFilters.MAP_TYPE == option) {
    globalFilters.MAP_TYPE = "none";
  } else {
    globalFilters.MAP_TYPE = option;
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

    updateMap(globalFilters.MAP_TYPE);
  };

  selectedMapOption.appendChild(tag);

  if (globalFilters.MAP_TYPE == "none") {
    selectedMapOption.textContent = "🔍 What to see on the map?";
  }
}

/**
 * Updates the district filter based on user selection.
 * If the district already exists in the filter, it removes it; otherwise, it adds it.
 * @param {String} district - The district to update the filter with.
 */
function updateDistrict(district) {
  const exists = globalFilters.DISTRICT.includes(district);
  if (!exists) {
    globalFilters.DISTRICT.push(district);
  } else {
    // Remove if exists
    globalFilters.DISTRICT = globalFilters.DISTRICT.filter(
      (d) => d !== district
    );
  }

  updateSelectedDistrictsContainer();

  filterDataset();

  updateAllCharts();
}

/**
 * Updates the displayed selected districts in the UI.
 * If a district is selected, it creates a tag for it; otherwise, it clears the selection.
 */
function updateSelectedDistrictsContainer() {
  const selectedDistrictsContainer =
    document.getElementById("selectedDistricts");

  selectedDistrictsContainer.innerHTML = "";

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

      updateDistrict(district);
    };
    selectedDistrictsContainer.appendChild(tag);
  });

  if (globalFilters.DISTRICT.length === 0) {
    selectedDistrictsContainer.textContent = "District";
  }
}

/**
 * Updates the property type filter based on user selection.
 * If the type already exists in the filter, it removes it; otherwise, it adds it.
 * @param {String} type - The property type to update the filter with.
 */
function updateType(type) {
  if (!globalFilters.TYPE.includes(type)) {
    globalFilters.TYPE.push(type);
  } else {
    // Remove if exists
    globalFilters.TYPE = globalFilters.TYPE.filter((d) => d !== type);
  }

  filterDataset();

  updateAllCharts();
}

/**
 * Updates the condition filter based on user selection.
 * If the condition already exists in the filter, it removes it; otherwise, it adds it.
 * @param {String} condition - The condition to update the filter with.
 */
function updateCondition(condition) {
  if (!globalFilters.CONDITION.includes(condition)) {
    globalFilters.CONDITION.push(condition);
  } else {
    // Remove if exists
    globalFilters.CONDITION = globalFilters.CONDITION.filter(
      (d) => d !== condition
    );
  }
  updateSelectedConditionsContainer();

  filterDataset();

  updateAllCharts();
}

/**
 * Updates the displayed selected condition in the UI.
 * If a condition is selected, it creates a tag for it; otherwise, it clears the selection.
 */
function updateSelectedConditionsContainer() {
  const selectedConditionsContainer =
    document.getElementById("selectedConditions");

  selectedConditionsContainer.innerHTML = "";

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

      updateCondition(condition);
    };

    selectedConditionsContainer.appendChild(tag);
  });

  if (globalFilters.CONDITION.length === 0) {
    selectedConditionsContainer.textContent = "Condition";
  }
}

/**
 * Updates the years filter based on user input.
 * @param {Number} years - The number of years to set in the globalFilters.
 */
function updateYear(years) {
  globalFilters.YEARS = years;
}
