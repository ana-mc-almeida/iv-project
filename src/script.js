function init() {
  d3.csv("./data/final_dataset.csv").then(function (data) {
    // TODO
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

});