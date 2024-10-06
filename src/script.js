function init() {
  d3.json("./data/final_dataset.json", function (d) {
    // Converte os valores do CSV em números
    return {
      Area: +d["Area"],
      Rooms: +d["Rooms"],
      Bathrooms: +d["Bathrooms"],
      // if AdsType is 'Rent' then Price is * 40
      Price: d["AdsType"] === "Rent" ? +d["Price"] * 50 : +d["Price"],
    };
  }).then(function (data) {
    console.log(data);
    createParallelCoordinates(data, ".parallelCoordinates");
  });
}
