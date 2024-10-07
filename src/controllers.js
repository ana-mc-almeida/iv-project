function initializeControllers() {
    console.log("Initializing controllers...");
    const controllersDiv = d3.select("#controllers")
                            .attr("class", "controllers");

    controllersDiv.html("");

    // WHAT TO SEE IN THE MAP --------------------------------------------------
    // Initialize dropdown row
    controllersDiv.append("div")
        .attr("class", "control-row");

    // Initialize options
    const mapOptions = ["House Price", "House Size"];
    const mapSelect = controllersDiv.append("select")
                        .attr("id", "mapSelect");

    // Add initial option
    mapSelect.append("option")
        .attr("value", "")
        .text("What to see in the map")
        .attr("disabled", true)    // disable this option
        .attr("selected", true);   // selected as initial option

    // Add selectable options
    mapSelect.selectAll("option.option")
        .data(mapOptions)
        .enter()
        .append("option")
        .attr("class", "option")
        .text(d => d)
        .attr("value", d => d);

    // DISTRICT ----------------------------------------------------------------
    // Initialize dropdown row
    controllersDiv.append("div")
        .attr("class", "control-row");

    // Initialize options
    const districts = ["Aveiro", "Beja", "Braga", "Bragança",
                    "Castelo Branco", "Coimbra", "Évora", "Faro",
                    "Guarda", "Leiria", "Lisboa", "Portalegre",
                    "Porto", "Santarém", "Setúbal", "Viana do Castelo", 
                    "Vila Real", "Viseu"];
    const districtSelect = controllersDiv.append("select")
        .attr("id", "districtSelect")
        .attr("multiple", true);    // enable multiple selection

    // Add initial option
    districtSelect.append("option")
        .attr("value", "")
        .text("District")
        .attr("disabled", true)     // disable this option
        .attr("selected", true);    // selected as initial option

    // Add selectable options
    districtSelect.selectAll("option.districtOption")
        .data(districts)
        .enter()
        .append("option")
        .attr("class", "districtOption")  // Class for styling if needed
        .text(d => d)  // Set the displayed text to the district name
        .attr("value", d => d);  // Set the option's value as the district name

    // RENT OR BUY -------------------------------------------------------------
    controllersDiv.append("div").attr("class", "control-row")
        .append("label").text("Rent or Buy:");

    const rentOrBuyOptions = ["Rent", "Buy"];
    const rentOrBuySelect = controllersDiv.append("select").attr("id", "rentOrBuySelect");
    rentOrBuySelect.selectAll("option")
        .data(rentOrBuyOptions)
        .enter()
        .append("option")
        .text(d => d);

    // CONDITION ---------------------------------------------------------------
    controllersDiv.append("div").attr("class", "control-row")
        .append("label").text("Condition:");

    const conditionOptions = ["New", "Used", "Renewed", "Others"];
    const conditionSelect = controllersDiv.append("select")
        .attr("id", "conditionSelect")
        .attr("multiple", true);
    conditionSelect.selectAll("option")
        .data(conditionOptions)
        .enter()
        .append("option")
        .text(d => d);

    // NUM OF YEARS ------------------------------------------------------------
    controllersDiv.append("div").attr("class", "control-row")
        .append("label").text("Num of years:");

    const yearsContainer = controllersDiv.append("div").attr("id", "yearsContainer");
    
    // Subtraction Button
    yearsContainer.append("button").text("-").attr("id", "decreaseYears").on("click", function() {
        const currentYears = parseInt(yearsInput.property("value"), 10);
        if (currentYears > 1) {    // Ensure years are at least 1
            yearsInput.property("value", currentYears - 1);
            console.log("Updated number of years:", currentYears - 1);
        }
    });

    // Num of year input
    const yearsInput = yearsContainer.append("input")
        .attr("id", "yearsInput")
        .attr("type", "text")        // type="text" to hind arrows
        .attr("value", 1)            // default value
        .style("width", "50px")      // set input width
        .on("input", function() {    // listen input
            let value = yearsInput.property("value");
            value = value.replace(/[^0-9]/g, '');    // only allow numbers
            if (parseInt(value) > 120) {             // max of number=120
                value = 120;
            }
            yearsInput.property("value", value);     // update value
            if (value === "" || parseInt(value, 10) < 1) {
                yearsInput.property("value", 1);     // min of number=1
            }
        });

    // Addition Button
    yearsContainer.append("button").text("+").attr("id", "increaseYears").on("click", function() {
        const currentYears = parseInt(yearsInput.property("value"), 10);
        yearsInput.property("value", currentYears + 1);
        console.log("Updated number of years:", currentYears + 1);
    });

    // EVENT LISTENERS ---------------------------------------------------------
    // Only bind events once here
    bindDataToControllers(); // Call this function to bind data to controllers
}

function bindDataToControllers() {
    // Bind events here to ensure they're set only once
    d3.select("#mapSelect").on("change", function() {
        updateDataDisplay(); // Call the update data function directly here
    });

    d3.select("#districtSelect").on("change", function() {
        updateDataDisplay(); // Call the update data function directly here
    });

    d3.select("#rentOrBuySelect").on("change", function() {
        updateDataDisplay(); // Call the update data function directly here
    });

    d3.select("#conditionSelect").on("change", function() {
        updateDataDisplay(); // Call the update data function directly here
    });

    d3.select("#yearsInput").on("input", function() {
        updateDataDisplay(); // Call the update data function directly here
    });
}
