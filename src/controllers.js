let selectedMapOption = '';
let selectedDistricts = [];
let selectedType = '';
let selectedConditions = [];
let selectedYears = 0;

// Initialize the controllers
function initializeControllers() {
    console.log("Initializing controllers...");

    // WHAT TO SEE IN THE MAP --------------------------------------------------
    const searchButtons = d3.selectAll('.search-content a')
        .on('click', function(event) {
            event.preventDefault();    // prevent link redirection
            selectedMapOption = d3.select(this).text();
            console.log("Selected Map Option:", selectedMapOption);
            updateDataDisplay();    // update data display
        });

    // DISTRICT ----------------------------------------------------------------
    const districtLinks = d3.selectAll('.dropdown-content a')
        .on('click', function(event) {
            event.preventDefault();    // prevent link redirection
            const district = d3.select(this).text();
            if (!selectedDistricts.includes(district)) {
                selectedDistricts.push(district);
            } else {
                selectedDistricts = selectedDistricts.filter(d => d !== district);    // deselect
            }
            console.log("Selected Districts:", selectedDistricts);
            updateDataDisplay();    // update data display
        });

    // RENT OR BUY -------------------------------------------------------------
    const typeButtons = d3.selectAll('.button-container .button-type')
        .on('click', function() {
            selectedType = d3.select(this).text();
            console.log("Selected Type:", selectedType);
            updateDataDisplay();    // update data display
        });

    // CONDITION ---------------------------------------------------------------
    const conditionLinks = d3.selectAll('.dropdown-condition-content a')
        .on('click', function(event) {
            event.preventDefault();    // prevent link redirection
            const condition = d3.select(this).text();
            if (!selectedConditions.includes(condition)) {
                selectedConditions.push(condition);
            } else {
                selectedConditions = selectedConditions.filter(c => c !== condition);    // deselect
            }
            console.log("Selected Conditions:", selectedConditions);
            updateDataDisplay();    // update data display
        });

    // NUM OF YEARS ------------------------------------------------------------
    d3.select('#yearInput').on('input', function() {
        selectedYears = +this.value;
        console.log("Selected Number of Years:", selectedYears);
        updateDataDisplay();    // update data display
    });
}

// Update data display
function updateDataDisplay() {
    const displayData = {
        mapOption: selectedMapOption,
        districts: selectedDistricts,
        type: selectedType,
        conditions: selectedConditions,
        years: selectedYears
    };
    console.log("Current Selections:", displayData);
    
    // Update the displayed selected data
    d3.select('#selectedData').text(JSON.stringify(displayData, null, 2));
}

// Make sure to initialize the controller after the document loads
document.addEventListener("DOMContentLoaded", initializeControllers);










// function selectMapOption(mapOption) {
//     // Update the map option
//     selectedMapOption = mapOption;
//     console.log("Selected map option:", selectedMapOption);
// }

// function selectDistrict(district) {
//     alert("Você selecionou: " + district);
    
//     updateDataDisplay();
//     // const selectedDistrict = Array.from(d3.select("#districtSelect").node().selectedOptions)
//     //                                 .map(option => option.value);

//     // // Add selectable options
//     // districtSelect.selectAll("option.districtOption")
//     //     .data(districts)
//     //     .enter()
//     //     .append("option")
//     //     .attr("class", "districtOption")  // Class for styling if needed
//     //     .text(d => d)  // Set the displayed text to the district name
//     //     .attr("value", d => d);  // Set the option's value as the district name

//     // const filteredProperties = dataset.filter(item => item.district === district);

//     // // Exibir os resultados
//     // if (filteredProperties.length > 0) {
//     //     console.log("Propriedades no distrito " + district + ":");
//     //     filteredProperties.forEach(property => {
//     //         console.log(property.name);
//     //     });
//     // } else {
//     //     console.log("Nenhuma propriedade encontrada no distrito " + district + ".");
//     // }
    
// }

// function initializeControllers() {
//     console.log("Initializing controllers...");
//     const controllersDiv = d3.select("#controllers")
//                             .attr("class", "controllers");

//     controllersDiv.html("");

//     // WHAT TO SEE IN THE MAP --------------------------------------------------
//     // Initialize dropdown row
//     controllersDiv.append("div")
//         .attr("class", "control-row");

//     // Initialize options
//     const mapOptions = ["House Price", "House Size"];
//     const mapSelect = controllersDiv.append("select")
//                         .attr("id", "mapSelect");

//     // Add initial option
//     mapSelect.append("option")
//         .attr("value", "")
//         .text("What to see in the map")
//         .attr("disabled", true)    // disable this option
//         .attr("selected", true);   // selected as initial option

//     // Add selectable options
//     mapSelect.selectAll("option.option")
//         .data(mapOptions)
//         .enter()
//         .append("option")
//         .attr("class", "option")
//         .text(d => d)
//         .attr("value", d => d);

//     // DISTRICT ----------------------------------------------------------------
//     // Initialize dropdown row
//     controllersDiv.append("div")
//         .attr("class", "control-row");

//     // Initialize options
//     const districts = ["Aveiro", "Beja", "Braga", "Bragança",
//                     "Castelo Branco", "Coimbra", "Évora", "Faro",
//                     "Guarda", "Leiria", "Lisboa", "Portalegre",
//                     "Porto", "Santarém", "Setúbal", "Viana do Castelo", 
//                     "Vila Real", "Viseu"];
//     const districtSelect = controllersDiv.append("select")
//         .attr("id", "districtSelect")
//         .attr("multiple", true);    // enable multiple selection

//     // Add initial option
//     districtSelect.append("option")
//         .attr("value", "")
//         .text("District")
//         .attr("disabled", true)     // disable this option
//         .attr("selected", true);    // selected as initial option

//     // Add selectable options
//     districtSelect.selectAll("option.districtOption")
//         .data(districts)
//         .enter()
//         .append("option")
//         .attr("class", "districtOption")  // Class for styling if needed
//         .text(d => d)  // Set the displayed text to the district name
//         .attr("value", d => d);  // Set the option's value as the district name
    
//     // // Add change event listener to update data display
//     // districtSelect.on("change", function() {
//     //     const selectedDistricts = Array.from(this.selectedOptions).map(option => option.value);
//     //     console.log("Selected Districts:", selectedDistricts);
//     //     updateDataDisplay();    // Call the function to update the display
//     // });

//     // RENT OR BUY -------------------------------------------------------------
//     // Initialize dropdown row
//     controllersDiv.append("div").attr("class", "control-row")
//         .append("label").text("Rent or Buy:");

//     const rentOrBuyOptions = ["Rent", "Buy"];
//     const rentOrBuySelect = controllersDiv.append("select").attr("id", "rentOrBuySelect");
//     rentOrBuySelect.selectAll("option")
//         .data(rentOrBuyOptions)
//         .enter()
//         .append("option")
//         .text(d => d)
//         .attr("value", d => d);

//     // CONDITION ---------------------------------------------------------------
//     // Initialize dropdown row
//     controllersDiv.append("div")
//         .attr("class", "control-row");

//     // Initialize options
//     const conditionOptions = ["New", "Used", "Renovated", "Others"];
//     const conditionSelect = controllersDiv.append("select")
//         .attr("id", "conditionSelect")
//         .attr("multiple", true);
    
//     // Add initial option
//     conditionSelect.append("option")
//     .attr("value", "")
//     .text("Condition")
//     .attr("disabled", true)     // disable this option
//     .attr("selected", true);    // selected as initial option

//     conditionSelect.selectAll("option")
//         .data(conditionOptions)
//         .enter()
//         .append("option")
//         .text(d => d);

//     // NUM OF YEARS ------------------------------------------------------------
//     // Initialize dropdown row
//     controllersDiv.append("div").attr("class", "control-row")
//         .append("label").text("Num of years:");

//     const yearsContainer = controllersDiv.append("div").attr("id", "yearsContainer");
    
//     // Subtraction Button
//     yearsContainer.append("button").text("-").attr("id", "decreaseYears").on("click", function() {
//         const currentYears = parseInt(yearsInput.property("value"), 10);
//         if (currentYears > 1) {    // Ensure years are at least 1
//             yearsInput.property("value", currentYears - 1);
//             console.log("Updated number of years:", currentYears - 1);
//         }
//     });

//     // Num of year input
//     const yearsInput = yearsContainer.append("input")
//         .attr("id", "yearsInput")
//         .attr("type", "text")        // type="text" to hind arrows
//         .attr("value", 1)            // default value
//         .style("width", "50px")      // set input width
//         .on("input", function() {    // listen input
//             let value = yearsInput.property("value");
//             value = value.replace(/[^0-9]/g, '');    // only allow numbers
//             if (parseInt(value) > 120) {             // max of number=120
//                 value = 120;
//             }
//             yearsInput.property("value", value);     // update value
//             if (value === "" || parseInt(value, 10) < 1) {
//                 yearsInput.property("value", 1);     // min of number=1
//             }
//         });

//     // Addition Button
//     yearsContainer.append("button").text("+").attr("id", "increaseYears").on("click", function() {
//         const currentYears = parseInt(yearsInput.property("value"), 10);
//         yearsInput.property("value", currentYears + 1);
//         console.log("Updated number of years:", currentYears + 1);
//     });

//     // EVENT LISTENERS ---------------------------------------------------------
//     // Only bind events once here
//     bindDataToControllers(); // Call this function to bind data to controllers
// }

// function bindDataToControllers() {
//     // Bind events here to ensure they're set only once
//     d3.select("#mapSelect").on("change", function() {
//         updateDataDisplay(); // Call the update data function directly here
//     });

//     d3.select("#districtSelect").on("change", function() {
//         updateDataDisplay(); // Call the update data function directly here
//     });

//     d3.select("#rentOrBuySelect").on("change", function() {
//         updateDataDisplay(); // Call the update data function directly here
//     });

//     d3.select("#conditionSelect").on("change", function() {
//         updateDataDisplay(); // Call the update data function directly here
//     });

//     d3.select("#yearsInput").on("input", function() {
//         updateDataDisplay(); // Call the update data function directly here
//     });
// }
