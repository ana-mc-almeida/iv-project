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
  // District
  const districtLinks = d3.selectAll('.district-content a');

  districtLinks.on('click', function(event) {
      event.preventDefault(); 

      d3.select(this).classed('selected', !d3.select(this).classed('selected'));
  });

  // Condition
  const conditionLinks = d3.selectAll('.condition-content a');

  conditionLinks.on('click', function(event) {
      event.preventDefault();

      d3.select(this).classed('selected', !d3.select(this).classed('selected'));
  });

  // Map
  const mapOptionLinks = d3.selectAll('.mapOption-content a');

  mapOptionLinks.on('click', function(event) {
      event.preventDefault();

      const isSelected = d3.select(this).classed('selected'); 

      mapOptionLinks.classed('selected', false);

      if (!isSelected) {
          d3.select(this).classed('selected', true);
      }
  });

  // RentOrBuy
  const rentOrBuyButtons = d3.selectAll('.rentOrBuy-button');

  buttons.on('click', function() {
      d3.select(this).classed('selected', !d3.select(this).classed('selected'));
  });

  // Years
  d3.select('#yearInput').on('input', function() {
    selectedYears = +this.value;
    console.log(selectedYears);
    updateYear(selectedYears); 
  });

});

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

function selectDistrict(district) {
  const data = globalData.slice();
  updateDistrict(data, district);
}

function selectType(type) {
  const data = globalData.slice();
  updateType(data, type);
}

function selectCondition(condition) {
  const data = globalData.slice();
  updateCondition(data, condition);
}
