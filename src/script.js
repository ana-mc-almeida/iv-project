var globalData;
let selectedYears = 0;

function init() {
  d3.json("./data/final_dataset.json", function (d) {
    // Converte os valores do CSV em números
    return {
      Area: +d["Area"],
      Rooms: +d["Rooms"],
      Bathrooms: +d["Bathrooms"],
      // if AdsType is 'Rent' then Price is * 40
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

document.addEventListener("DOMContentLoaded", function() {
  const dropdownLinks = d3.selectAll('.dropdown-content a');

  dropdownLinks.on('click', function(event) {
      event.preventDefault(); 

      d3.select(this).classed('selected', !d3.select(this).classed('selected'));
  });

  const dropdownConditionLinks = d3.selectAll('.dropdown-condition-content a');

  dropdownConditionLinks.on('click', function(event) {
      event.preventDefault();

      d3.select(this).classed('selected', !d3.select(this).classed('selected'));
  });

  const searchLinks = d3.selectAll('.search-content a');

  searchLinks.on('click', function(event) {
      event.preventDefault();

      searchLinks.classed('selected', false);

      d3.select(this).classed('selected', true);
  });

  const buttons = d3.selectAll('.button-type');

  buttons.on('click', function() {
      d3.select(this).classed('selected', !d3.select(this).classed('selected'));
  });

  d3.select('#yearInput').on('input', function() {
    selectedYears = +this.value;
    console.log(selectedYears);
    updateYear(selectedYears); 
  });

});

function selectMap(typeOfMap){
  d3.selectAll("button").attr("disabled", true);

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

function selectDistrict(district){
  const data = globalData.slice();
  updateDistrict(data, district);
}

function selectType(type){
  const data = globalData.slice();
  updateType(data, type);
}

function selectCondition(condition){
  const data = globalData.slice();
  updateCondition(data, condition);
}
