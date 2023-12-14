let geojsonData;

var map = L.map('map').setView([40.7128, -74.0060], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        function getColor(provertyRate) {
            return provertyRate > 25 ? '#800026' :
                   provertyRate > 20 ? '#BD0026' :
                   provertyRate > 15 ? '#E31A1C' :
                   provertyRate > 10 ? '#FC4E2A' :
                   provertyRate > 5  ? '#FD8D3C' :
                                      '#FEB24C';
        }

        function style(feature) {
            return {
                fillColor: getColor(feature.properties.ProvertyRate),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

      
        fetch('./nyc-boroughs.geojson')
            .then(response => response.json())
            .then(data => {
                L.geoJson(data, {
                    style: style,
                    onEachFeature: onEachFeature
                }).addTo(map);
            });

        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 5, 10, 15, 20, 25],
                labels = [],
                from, to;

            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                    '<i style="background:' + getColor(from + 1) + '"></i> ' +
                    from + (to ? '&ndash;' + to + '%' : '+%'));
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(map);



        // Function for highlighting feature on hover
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// Function to reset the highlight
function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

// Function to zoom to feature
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Function to handle each feature
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });

    // if (feature.properties && feature.properties.boro_name) {
    //     layer.bindTooltip(feature.properties.boro_name + ' with' + feature.properties.ProvertyRate + '% Poverty Rate'
        
    //     +' and Median household income is' + feature.properties.MedianHouseIncome
    //     , {
    //     offset: L.point(0, -20), // Offset the tooltip to prevent overlap
    //     direction: 'top' // Show the tooltip above the feature
    // });

    if (feature.properties) {
        // Construct the tooltip text
        var tooltipText = feature.properties.boro_name;
    
        // Add Poverty Rate to the tooltip if available
        if (feature.properties.ProvertyRate !== undefined) {
            tooltipText += ', with ' + feature.properties.ProvertyRate + '% proverty Rate';
        }
    
        // Add Median Household Income to the tooltip if available
        if (feature.properties.MedianHouseholdIncome !== undefined) {
            // Format the MedianHouseIncome as a currency string
            var formattedIncome = '$' + feature.properties.MedianHouseholdIncome.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            tooltipText += ' , and median household income ' + formattedIncome + '.';
        }
    
        // Bind the tooltip to the layer
        layer.bindTooltip(tooltipText, {
            offset: L.point(0, -20), // Offset the tooltip to prevent overlap
            direction: 'top' // Show the tooltip above the feature
        });
    }
    
    

    }


// Adding the GeoJSON layer to the map
var geojson = L.geoJson(geojsonData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);



