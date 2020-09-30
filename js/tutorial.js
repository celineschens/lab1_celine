var mymap = L.map("mapid").setView([-104.99404, 39.75621], 1);

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken:
      "pk.eyJ1IjoiY2VsaW5lY2hlbiIsImEiOiJjazVqejNtbTIwOHB6M3BvN21yYjVubGQxIn0.VD74-y4auYwGAVbmRpG2Ng",
  }
).addTo(mymap);

var marker = L.marker([51.5, -0.09]).addTo(mymap);

var circle = L.circle([51.508, -0.11], {
  color: "red",
  fillColor: "#f03",
  fillOpacity: 0.5,
  radius: 500,
}).addTo(mymap);

var polygon = L.polygon([
  [51.509, -0.08],
  [51.503, -0.06],
  [51.51, -0.047],
]).addTo(mymap);

marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

var popup = L.popup()
  .setLatLng([51.5, -0.09])
  .setContent("I am a standalone popup.")
  .openOn(mymap);

function onMapClick(e) {
  alert("You clicked the map at " + e.latlng);
}

mymap.on("click", onMapClick);


//geojson tutorial

var myLines = [{
  "type": "LineString",
  "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
  "type": "LineString",
  "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];



var states = [{
  "type": "Feature",
  "properties": {"party": "Republican"},
  "geometry": {
      "type": "Polygon",
      "coordinates": [[
          [-104.05, 48.99],
          [-97.22,  48.98],
          [-96.58,  45.94],
          [-104.03, 45.94],
          [-104.05, 48.99]
      ]]
  }
}, {
  "type": "Feature",
  "properties": {"party": "Democrat"},
  "geometry": {
      "type": "Polygon",
      "coordinates": [[
          [-109.05, 41.00],
          [-102.06, 40.99],
          [-102.03, 36.99],
          [-109.04, 36.99],
          [-109.05, 41.00]
      ]]
  }
}];

L.geoJSON(states, {
  style: function(feature) {
      switch (feature.properties.party) {
          case 'Republican': return {color: "#ff0000"};
          case 'Democrat':   return {color: "#0000ff"};
      }
  }
}).addTo(mymap);

function onEachFeature(feature, layer) {
  // does this feature have a property named popupContent?
  if (feature.properties && feature.properties.popupContent) {
      layer.bindPopup(feature.properties.popupContent);
  }
}

var geojsonFeature = {
  "type": "Feature",
  "properties": {
      "name": "Coors Field",
      "amenity": "Baseball Stadium",
      "popupContent": "This is where the Rockies play!"
  },
  "geometry": {
      "type": "Point",
      "coordinates": [-104.99404, 39.75621]
  }
};

var geojsonMarkerOptions = {
  radius: 8,
  fillColor: "#ff7800",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8
};

L.geoJSON(geojsonFeature, {
  pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, geojsonMarkerOptions);
  }
}).addTo(mymap);


L.geoJSON(geojsonFeature, {
  onEachFeature: onEachFeature
}).addTo(mymap);

var someFeatures = [{
  "type": "Feature",
  "properties": {
      "name": "Coors Field",
      "show_on_map": true
  },
  "geometry": {
      "type": "Point",
      "coordinates": [-104.99404, 39.75621]
  }
}, {
  "type": "Feature",
  "properties": {
      "name": "Busch Field",
      "show_on_map": true
  },
  "geometry": {
      "type": "Point",
      "coordinates": [-104.98404, 39.74621]
  }
}];

L.geoJSON(someFeatures, {
  filter: function(feature, layer) {
      return feature.properties.show_on_map;
  }
}).addTo(mymap);