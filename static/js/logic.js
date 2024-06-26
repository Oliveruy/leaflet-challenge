document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    const map = L.map('map').setView([20, 0], 2);
  
    // Add a tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  
    // Layer groups for earthquakes and tectonic plates
    const earthquakes = new L.LayerGroup();
    const tectonicPlates = new L.LayerGroup(); // Define tectonicPlates layer group
  
    // Fetch the earthquake data
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";
    d3.json(url).then(data => {
      const getColor = (depth) => {
        return depth > 90 ? '#800026' :
               depth > 70 ? '#BD0026' :
               depth > 50 ? '#E31A1C' :
               depth > 30 ? '#FC4E2A' :
               depth > 10 ? '#FD8D3C' :
                            '#FEB24C';
      };
  
      const getRadius = (magnitude) => {
        return magnitude ? magnitude * 4 : 1;
      };
  
      L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng, {
            radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });
        },
        onEachFeature: function(feature, layer) {
          layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p><p>${new Date(feature.properties.time)}</p>`);
        }
      }).addTo(earthquakes);
  
      earthquakes.addTo(map);

      // Fetch the tectonic plate data
      const tectonicPlateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
      d3.json(tectonicPlateUrl).then(data => {
        // Create layer for tectonic plates
        L.geoJSON(data, {
          style: {
            color: "orange",
            weight: 2
          }
        }).addTo(tectonicPlates);
        tectonicPlates.addTo(map); // Add tectonic plates layer to the map
      });
  
      // Add a legend
      const legend = L.control({position: 'bottomright'});
  
      legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'legend');
        const depths = [-10, 10, 30, 50, 70, 90];
  
        div.innerHTML = '<h4>Earthquake Depth</h4>';
        for (let i = 0; i < depths.length; i++) {
          div.innerHTML +=
            '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
        }
        return div;
      };
  
      legend.addTo(map);
          // Tectonic plates legend
    const plateLegend = L.control({ position: 'topright' });

    plateLegend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML = '<h4>Tectonic Plates</h4><i style="background: orange; width: 18px; height: 18px; display: inline-block;"></i> Tectonic Plates';
        return div;
    };

    // Append the tectonic plates legend to the top right legend div
    plateLegend.addTo(map);
    plateLegend.getContainer().classList.add('legend-top-right'); 

    });
});
