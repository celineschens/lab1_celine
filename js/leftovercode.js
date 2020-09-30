$.ajax("data/megacities.geojson").done(function(data) {
      dataType: "json",
      success: function (data) {
        L.geoJson(data, {
          pointToLayer: function (feature, latlng) {
            return new L.CircleMarker(latlng, {
              radius: 5,
              color: "#FF0000",
            });
          },
          onEachFeature: onEachFeature,
        }).addTo(mymap);
  


        function handleError(jqXHR, textStatus, error){
          console.log(error);
        }

function createPropSymbols(timestamps, data) {
  //create an L.markerclustergroup layer
var markerClusterGroup = new L.markerClusterGroup();

cities = L.geoJson(data, {
  //loop through features to create markers and add to MarkerClustergroup
  onEachFeature: function(feature,layer) {
    var popupContent = "<b>" + String(feature[timestamps]) + " million people</b><br>" +
      "<i>" + feature.Name +
      "</i> in </i>" + timestamps + "</i>";
      layer.bindPopup(popupContent)
    },
  pointToLayer: function(feature, latlng) {
    return L.marker(latlng, s_light_style);
  }
});

markerClusterGroup.addLayer(cities)
mymap.addLayer(markerClusterGroup);
};