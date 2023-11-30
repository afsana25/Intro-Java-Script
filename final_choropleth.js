const csvPath = 'C:\html\NYC_Proverty.csv';
const geojsonPath = 'C:\html\nyc-boroughs.geojson';

const map = L.map('map').setView([40.7128, -74.0060], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let povertyData = {};

// Fetch CSV data
Papa.parse(csvPath, {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: (result) => {
        povertyData = result.data.reduce((acc, row) => {
            acc[row.Borough] = row.PovertyRate;
            return acc;
        }, {});

        // Fetch GeoJSON data
        fetch(geojsonPath)
            .then(response => response.json())
            .then(data => {
                L.geoJSON(data, {
                    style: (feature) => ({
                        fillColor: getColor(povertyData[feature.properties.borough]),
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.7,
                    }),
                    onEachFeature: (feature, layer) => {
                        layer.bindPopup(`Borough: ${feature.properties.borough}<br> Poverty Rate: ${povertyData[feature.properties.borough]}%`);
                    },
                }).addTo(map);
            });
    },
});

function getColor(povertyRate) {
    return povertyRate > 30 ? '#800026' :
           povertyRate > 20 ? '#BD0026' :
           povertyRate > 10 ? '#E31A1C' :
                              '#FFEDA0';
}
