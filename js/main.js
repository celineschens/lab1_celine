$(document).ready(function () {
  var cases;

  var map = L.map("mapid", {
    center: [20, 0],
    zoom: 2,
    minZoom: 1,
  });

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
  ).addTo(map);

  var s_light_style = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
  };

  /*   function onEachFeature(feature,layer) {
    //no property named popupcontent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties){
      //loop to add feature property names and values to html string
      for (var property in feature.properties){
        popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>"
      }
      layer.bindPopup(popupContent)
      console.log(success);
    }
  } */

  $.ajax("data/time_series_covid19_confirmed_global.geojson")
    .done(function (data) {
      var info = processData(data);
      createPropSymbols(info.timestamps, data);
      createLegend(info.min, info.max);
      createSlider(info.timestamps);
      //cases.push(data);

      //console.log(info);
    })
    .fail(function () {
      alert("There has been a problem loading the data.");
    });

  function processData(data) {
    var timestamps = [];
    var min = Infinity;
    var max = -Infinity;

    for (var feature in data.features) {
      var properties = data.features[feature].properties;
      // console.log(properties);

      for (var attribute in properties) {
        //if (attribute.match(/^\d/)) {
        if (
          attribute != "Province/State" &&
          attribute != "Country/Region" &&
          attribute != "Lat" &&
          attribute != "Long"
        ) {
          if ($.inArray(attribute, timestamps) === -1) {
            timestamps.push(attribute);
          }

          if (properties[attribute] < min) {
            min = properties[attribute];
          }

          if (properties[attribute] > max) {
            max = properties[attribute];
          }
          console.log(min);
        }
      }
    }
    return {
      timestamps: timestamps,
      min: min,
      max: max,
    };
  }

  function createPropSymbols(timestamps, data) {
    cases = L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          fillColor: "#708598",
          color: "#537898",
          weight: 1,
          fillOpacity: 0.6,
        }).on({
          mouseover: function (e) {
            this.openPopup();
            this.setStyle({ color: "yellow" });
          },
          mouseout: function (e) {
            this.closePopup();
            this.setStyle({ color: "#537898" });
          },
        });
      },
    }).addTo(map);

    updatePropSymbols(timestamps[0]);
  } // end createPropSymbols()

  function updatePropSymbols(timestamp) {
    cases.eachLayer(function (layer) {
      var props = layer.feature.properties;
      var radius = calcPropRadius(props[timestamp]);
      var popupContent =
        props["Province/State"] !== null
          ? "<b>" +
            String(props[timestamp]) +
            " cases</b><br>" +
            "<i>" +
            props["Province/State"] +
            ", " +
            props["Country/Region"] +
            "</i> in </i>" +
            timestamp +
            "</i>"
          : "<b>" +
            String(props[timestamp]) +
            " cases</b><br>" +
            "<i>" +
            props["Country/Region"] +
            "</i> in </i>" +
            timestamp +
            "</i>";
      //console.log(props);
      layer.setRadius(radius);
      layer.bindPopup(popupContent, { offset: new L.Point(0, -radius) });
    });
  } // end updatePropSymbols

  function calcPropRadius(attributeValue) {
    var scaleFactor = 5,
      area = attributeValue * scaleFactor;

    return Math.sqrt(area / Math.PI);
  } // end calcPropRadius

  function createLegend(min, max) {
    if (min < 5) {
      min = 5;
    }

    function roundNumber(inNumber) {
      return Math.round(inNumber / 10) * 10;
    }

    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function (map) {
      var legendContainer = L.DomUtil.create("div", "legend");
      var symbolsContainer = L.DomUtil.create("div", "symbolsContainer");
      var classes = [
        roundNumber(min),
        roundNumber((max - min) / 2),
        roundNumber(max),
      ];
      var legendCircle;
      var lastRadius = 0;
      var currentRadius;
      var margin;

      L.DomEvent.addListener(legendContainer, "mousedown", function (e) {
        L.DomEvent.stopPropagation(e);
      });

      $(legendContainer).append(
        "<h2 id='legendTitle'>Covid-19 Cases By Country</h2>"
      );

      for (var i = 0; i <= classes.length - 1; i++) {
        legendCircle = L.DomUtil.create("div", "legendCircle");

        currentRadius = calcPropRadius(classes[i]);

        margin = -currentRadius - lastRadius - 2;

        $(legendCircle).attr(
          "style",
          "width: " +
            currentRadius * 2 +
            "px; height: " +
            currentRadius * 2 +
            "px; margin-left: " +
            margin +
            "px"
        );

        $(legendCircle).append(
          "<span class='legendValue'>" + classes[i] + "<span>"
        );

        $(symbolsContainer).append(legendCircle);

        lastRadius = currentRadius;
      }

      //$(legendContainer).append(symbolsContainer);

      return legendContainer;
    };

    legend.addTo(map);
  } // end createLegend()

  function createSlider(timestamps) {
    var sliderControl = L.control({ position: "bottomleft" });

    sliderControl.onAdd = function (map) {
      var slider = L.DomUtil.create("input", "range-slider");

      $(slider)
        .attr({
          type: "range",
          max: timestamps.length - 1,
          min: 0,
          step: 1,
          value: 0,
        })
        .on("input change", function () {
          updatePropSymbols(timestamps[$(this).val()]);
          $(".temporal-legend").text(timestamps[this.value]);
        });

      $(slider).mousedown(function () {
        map.dragging.disable();
      });

      $(document).mouseup(function () {
        map.dragging.enable();
      });

      return slider;
    };

    sliderControl.addTo(map);
    createTemporalLegend(timestamps[0]);
  } // end createSliderUI()

  function createTemporalLegend(startTimestamp) {
    var temporalLegend = L.control({ position: "bottomleft" });

    temporalLegend.onAdd = function (map) {
      var output = L.DomUtil.create("output", "temporal-legend");

      return output;
    };

    temporalLegend.addTo(map);
    $(".temporal-legend").text(startTimestamp);
  } // end createTemporalLegend()
});
