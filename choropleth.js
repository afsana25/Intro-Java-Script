// Initialize the map
var map = L.map('map').setView([40.7128, -74.0060], 10);

// Add a tile layer (you can choose a different provider)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load GeoJSON data for NYC boroughs
var nycBoroughsData;

// Define onEachFeature function
function onEachFeature(feature, layer) {
  layer.bindTooltip(`<strong>${feature.properties.boro_name}</strong><br> Poverty Rate: ${feature.properties.poverty_rate}%`).openTooltip();
}

// Define getColor function
function getColor(value) {
  // You can customize this based on your data distribution
  var colorScale = ['#ffffcc', '#c2e699', '#78c679', '#31a354', '#006837'];
  return value > 30 ? colorScale[4] :
         value > 20 ? colorScale[3] :
         value > 15 ? colorScale[2] :
         value > 10 ? colorScale[1] :
                      colorScale[0];
}

// Load your GeoJSON data here
fetch('nyc-boroughs.geojson')
  .then(response => response.json())
  .then(data => {
    nycBoroughsData = data;

    // Load poverty rate data for NYC boroughs
    fetch('Poverty-rate-boroughs.json')  // Replace with the actual path to your data file
      .then(response => response.json())
      .then(povertyData => {
        // Merge poverty rate data with GeoJSON features
        nycBoroughsData.features.forEach(borough => {
          const boroughName = borough.properties; // Assuming 'boro_name' is the property in GeoJSON that identifies boroughs
          const povertyRate = povertyData[boroughName] || 0; // Default to 0 if data is missing

          // Add the poverty rate to the GeoJSON properties
          borough.properties.poverty_rate = povertyRate;
        });

        // Add the GeoJSON layer to the map
        var geojsonLayer = L.geoJSON(nycBoroughsData, {
          style: style,
          onEachFeature: onEachFeature
        }).addTo(map);

        // Fit the map to the bounds of the GeoJSON layer
        map.fitBounds(geojsonLayer.getBounds());

        // Add tooltips and legend
        addMapFeatures(geojsonLayer);
      })
      .catch(error => console.error('Error loading poverty rate data:', error));
  })
  .catch(error => console.error('Error loading GeoJSON data:', error));

// Style function for the GeoJSON layer
function style(feature) {
  var value = feature.properties.poverty_rate;
  return {
    fillColor: getColor(value),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

// Function to add tooltips and legend
function addMapFeatures(geojsonLayer) {
  // Add Legend
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 15, 20, 30],
        labels = [];

    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(map);
}
