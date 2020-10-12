$(document).ready(function () {
  var cases;

  var map = L.map("mapid", {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 10,
  });

  var Jawg_Dark = L.tileLayer(
    "https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token={accessToken}",
    {
      attribution:
        '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: 0,
      maxZoom: 22,
      subdomains: "abcd",
      accessToken:
        "Xw25n79i7BUNCjsYEUDCO3N251UUuXW1cJlUZ8cfNapPY8SgpJ6uiuHmVdELwkg0",
    }
  );
  Jawg_Dark.addTo(map);

  // create title and container for title
function createTitle(){
  var Title = L.Control.extend({
      options: {
          position: 'topright'
      },

      onAdd: function () {
          // create the control container with a particular class name
          var container = L.DomUtil.create('div', 'title-container');

          //add temporal legend div to container
          $(container).append('<h1><b>Confirmed Covid-19 Cases</h1>');


          return container;
      }
  });

  map.addControl(new Title());

};
  $.getJSON("data/countries.geojson")
    .then(function (data) {
      var countryLayer = L.geoJson(data, {
        onEachFeature: styleCountry,
        fillOpacity: 0,
        color: "#b2b2b2",
        weight: 0.5,
      });
      countryLayer.addTo(map);
    })
    .fail(function (err) {
      console.log(err.responseText);
    });

  $.ajax("data/time_series_covid19_confirmed_global.geojson")
    .done(function (data) {
      var info = processData(data);
      createPropSymbols(info.timestamps, data);
      createLegend(info.min, info.max);
      createSlider(info.timestamps);
      createTitle();
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
          //console.log(timestamps);
        }
      }
    }
    return {
      timestamps: timestamps,
      min: min,
      max: max,
    };
  }

 /*  function styleCountry(feature, layer) {
    layer.on ({
      mouseover: function (e) {
        this.openPopup();
        this.setStyle({ color: "red" });
      },
      mouseout: function (e) {
        this.closePopup();
        this.setStyle({ color: "#b2b2b2" });
      },
    })
  } */
  
  function stylePoly(feature, layer) {
    layer.on ({
      mouseover: function (e) {
        this.openPopup();
        this.setStyle({ color: "yellow" });
      },
      mouseout: function (e) {
        this.closePopup();
        this.setStyle({ color: "#537898" });
      },
    });
  }

  var CasesMarker = {
    fillColor: "#708598",
    color: "#537898",
    weight: 1,
    fillOpacity: 0.6,
  }

  function createPropSymbols(timestamps, data) {
    cases = L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, CasesMarker)
      },
      onEachFeature: stylePoly,
    }).addTo(map);
    console.log(timestamps);
    function addCOVIDCases () {
      cases.addTo(map);
    }

    function removeCOVIDCases () {
      map.removeLayer(cases);
    }

    document.getElementById("toggleButton").addEventListener ("click", toggleCOVIDCases)

    function toggleCOVIDCases() {
      if(map.hasLayer(cases)){
        removeCOVIDCases();
      } else {
        addCOVIDCases();
      }
    }
    
    updatePropSymbols(timestamps[0]);
  } // end createPropSymbols()

  function updatePropSymbols(timestamp) {
    cases.eachLayer(function (layer) {
      var props = layer.feature.properties;
      var radius = calcPropRadius(props[timestamp]);
      var popupContent =
        props["Province/State"] !== null
          ? "<b>" +
            String(props[timestamp]) + " cases in </b><br>" + "<i>" + props["Province/State"] +
            ", " + props["Country/Region"] + "</i> on </i>" + timestamp + "</i>" 
            : "<b>" + String(props[timestamp]) + " cases</b><br>" + "<i>" + props["Country/Region"] + "</i> on </i>" + timestamp + "</i>";
      
        layer.on('click', function(){
        sidebar.open('stats');
        document.getElementById('statscontent').innerHTML = popupContent
      });
      layer.setRadius(radius);
      layer.bindPopup(popupContent, { offset: new L.Point(0, -radius) });
    });
  } // end updatePropSymbols



  function calcPropRadius(attributeValue) {
    var scaleFactor = 0.01,
      area = attributeValue * scaleFactor;

    return Math.sqrt(area / Math.PI);
  } // end calcPropRadius

  function createLegend(min, max) {
    if (min < 50) {
      min = 50;
    }

    if ((max > 7000000)) {
      (max = 5000000);
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
      console.log(classes);
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
          "style", "width: " + currentRadius * 2 + "px; height: " + currentRadius * 2 + "px; margin-left: " + margin + "px"
        );

        $(legendCircle).append(
          "<span class='legendValue'>" + classes[i] + "<span>"
        );

        $(symbolsContainer).append(legendCircle);

        lastRadius = currentRadius;
      }

      $(legendContainer).append(symbolsContainer);

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

    // create the sidebar instance and add it to the map
    var sidebar = L.control.sidebar({ 
      container: "sidebar",
      autopan: true,
      })
      .addTo(map)
      .open("home");

  // add panels dynamically to the sidebar
  sidebar
    // add a tab with a click callback, initially disabled
    .addPanel({
      id: "stats",
      tab: '<i class="fa fa-line-chart"></i>',
      title: "Statistics",
      pane: '<p> Select a country on the map to see the total number of cases and deaths as of 9/27/2020.</p> <div id="statscontent" style="margin: 15px;">',
    });

  // be notified when a panel is opened
  sidebar.on("content", function (ev) {
    switch (ev.id) {
      case "autopan":
        sidebar.options.autopan = true;
        break;
      default:
        sidebar.options.autopan = false;
    }
  });

});
