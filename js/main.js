//Celine Chen
//GEOG 574 - UW Madison
//Lab 1
//Oct 13, 2020

//code inspired by:
//https://github.com/uwcart/cartographic-perspectives/tree/master/time-series-prop-map-leaflet
//https://github.com/Christopher-Pierson/Unit-2 
//https://github.com/sgrandstrand/leaflet-lab/


$(document).ready(function () {
  //define variable that can be accessed later
  var cases;

  //define basemaps as layers
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

  var Jawg_Terrain = L.tileLayer(
    "https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token={accessToken}",
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

  //call data, define variable that can be accessed in functions related to data
  //call functions related to the data
  //error if fail
  $.ajax("data/time_series_covid19_confirmed_global.geojson")
    .done(function (data) {
      var info = processData(data);
      createPropSymbols(info.timestamps, data);
      createLegend(info.min, info.max);
      createSliderContainer(info.timestamps);
      createTitle();
      //console.log(info);
    })
    .fail(function () {
      alert("There has been a problem loading the data.");
    });

  //create map, define basemap layers
  var map = L.map("mapid", {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 10,
    layers: [Jawg_Dark, Jawg_Terrain],
  });

  var baseMaps = {
    Dark: Jawg_Dark,
    Terrain: Jawg_Terrain,
  };

  //add layer controls for basemaps
  L.control.layers(baseMaps, null, { position: "topleft" }).addTo(map);

  // function to create title
  function createTitle() {
    var Title = L.Control.extend({
      options: {
        position: "topright",
      },
      // create title container
      onAdd: function () {
        var container = L.DomUtil.create("div", "title-container");
        //add title text
        $(container).append("<h1><b>Confirmed Covid-19 Cases</h1>");
        return container;
      },
    });

    map.addControl(new Title());
  }
 
  function processData(data) {
    var timestamps = [];
    var min = Infinity;
    var max = -Infinity;

    for (var feature in data.features) {
      var properties = data.features[feature].properties;
      // console.log(properties);

      for (var attribute in properties) {
        //loop through to get values of cases, not the other columns
        if (
          attribute != "Province/State" &&
          attribute != "Country/Region" &&
          attribute != "Lat" &&
          attribute != "Long"
        ) {

          //push header years to timestamps variable
          if ($.inArray(attribute, timestamps) === -1) {
            timestamps.push(attribute);
          }
          //push min and max values to variables
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
    //return values
    return {
      timestamps: timestamps,
      min: min,
      max: max,
    };
  }

  //style circle hover
  function styleCircle(feature, layer) {
    layer.on({
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

  //define circle style
  var CasesMarker = {
    fillColor: "#708598",
    color: "#537898",
    weight: 1,
    fillOpacity: 0.6,
  };

  //create circle symbols
  function createPropSymbols(timestamps, data) {
    cases = L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, CasesMarker);
      },
      onEachFeature: styleCircle,
    }).addTo(map);

    //function to add cases layer to map
    function addCOVIDCases() {
      cases.addTo(map);
    }

    //function to remove cases layer to map
    function removeCOVIDCases() {
      map.removeLayer(cases);
    }

    //add toggle button event listener
    document
      .getElementById("toggleButton")
      .addEventListener("click", toggleCOVIDCases);

    //function to add or remove cases layer
    function toggleCOVIDCases() {
      if (map.hasLayer(cases)) {
        removeCOVIDCases();
      } else {
        addCOVIDCases();
      }
    }

    //call update prop symbols with timestamp values passed
    updatePropSymbols(timestamps[0]);
  } // end createPropSymbols()

  //update prop symbols with popup and adjust size
  function updatePropSymbols(timestamp) {
    cases.eachLayer(function (layer) {
      var props = layer.feature.properties;
      var radius = calcPropRadius(props[timestamp]);
      var popupContent =
        props["Province/State"] !== null
          ? "<b>" +
            String(props[timestamp]) +
            " cases in </b><br>" +
            "<i>" +
            props["Province/State"] +
            ", " +
            props["Country/Region"] +
            "</i> on </i>" +
            timestamp +
            "</i>"
          : "<b>" +
            String(props[timestamp]) +
            " cases in </b><br>" + 
            "<i>" +
            props["Country/Region"] +
            "</i> on </i>" +
            timestamp +
            "</i>";

      //open sidebar when circle is clicked
      layer.on("click", function () {
        sidebar.open("stats");
        document.getElementById("statscontent").innerHTML = popupContent;
      });
      layer.setRadius(radius);
      layer.bindPopup(popupContent, { offset: new L.Point(0, -radius) });
    });
  } // end updatePropSymbols

  //calculate size of circles
  function calcPropRadius(attributeValue) {
    if (attributeValue === 0) {
      return 1;
    } else {
      var minRadius = 0.1;
      //flannery compensation formula
      radius = 1.0083 * Math.pow(attributeValue / 50, 0.5715) * minRadius;
      return radius;
    } // end calcPropRadius
  }

  //create legend
  function createLegend(min, max) {
    if (min < 100) {
      min = 100000;
    }

    if (max > 7000000) {
      max = 5000000;
    }

    function roundNumber(inNumber) {
      return Math.round(inNumber / 10) * 10;
    }

    var legend = L.control({ position: "bottomright" });

    //define and add elements to legend
    legend.onAdd = function (map) {
      var legendContainer = L.DomUtil.create("div", "legend");
      var symbolsContainer = L.DomUtil.create("div", "symbolsContainer");
      var classes = [
        roundNumber(min),
        roundNumber((max - min) / 2),
        roundNumber(max),
      ];
      //console.log(classes);
      
      //define variables to be called
      var legendCircle;
      var lastRadius = 0;
      var currentRadius;
      var margin;

      //disable pan on legend
      $(legendContainer).mousedown(function () {
        map.dragging.disable();
      });

      $(document).mouseup(function () {
        map.dragging.enable();
      });

      //add legend title
      $(legendContainer).append(
        "<h2 id='legendTitle'>Covid-19 Cases By Country</h2>"
      );
      
      //create legend circle and overlay align
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

        //append legend values and format as number
        $(legendCircle).append(
          "<span class='legendValue'>" + classes[i].toLocaleString() + "<span>"
        );

        $(symbolsContainer).append(legendCircle);

        lastRadius = currentRadius;
      }

      $(legendContainer).append(symbolsContainer);

      return legendContainer;
    };

    legend.addTo(map);
  } // end createLegend()

  //create slider control with container
  function createSliderContainer(timestamps) {
    var SliderContainer = L.Control.extend({
      options: {
        position: "bottomleft",
      },
      // create slider container
      onAdd: function () {
        var sliderbox = L.DomUtil.create("div", "slider-container");

        //add range slider
        $(sliderbox).append('<input class="range-slider" type="range">');

        //add next and previous buttons
        $(sliderbox).append('<button class="step" id="previous" title="Previous">Previous</button>');
        $(sliderbox).append('<button class="step" id="next" title="Next">Next</button>');

        //disable dragging on slider
        $(sliderbox).mousedown(function () {
          map.dragging.disable();
        });

        $(document).mouseup(function () {
          map.dragging.enable();
        });

        return sliderbox;
      },
    });

    //add slidercontainer control to map and update timestamp legend
    map.addControl(new SliderContainer());
    createTemporalLegend(timestamps[0]);

    //range-slider attributes
    $(".range-slider")
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
    
    //add icons to buttons
    $('#next')
      .html('<i class="fas fa-caret-square-right"></i>')
      .on("dblclick", function() {
        return false;
      });
    $('#previous')
      .html('<i class="fas fa-caret-square-left"></i>')
      .on("dblclick", function() {
        return false;
      });

     //click listener for step through buttons
     $('.step').click(function(){

      //get starting index value
      var index = $('.range-slider').val();
      console.log(index);

      //step forward or backward a week depending on button
      //Note: I couldn't figure how to step forward a week (7) in the index. It returned as a string. But the previous step works as a number for some reason.
      if ($(this).attr('id') == 'next'){
        index++;
        
          // console.log(index);
          // console.log(typeof index);

          //if index is greater than timestamp length, return to start value
          index = index > (timestamps.length - 1) ? 0 : index;
      } else if ($(this).attr('id') == 'previous'){
          index-=7;

          // console.log(index);
          // console.log(typeof index);

          //if index is negative, return to last value
          index = index < 0 ? (timestamps.length - 1) : index;
      };

      //update slider and circle symbols with current index step
      $('.range-slider').val(index);
      updatePropSymbols(timestamps[index]);
      $(".temporal-legend").text("Date: " + timestamps[index]);
  });
  }

  //create time legend for slider
  function createTemporalLegend(startTimestamp) {
    var temporalLegend = L.control({ position: "bottomleft" });

    temporalLegend.onAdd = function (map) {
      var output = L.DomUtil.create("output", "temporal-legend");

      return output;
    };

    temporalLegend.addTo(map);
    $(".temporal-legend").text("Date: " + startTimestamp);
  } // end createTemporalLegend()

  // create the sidebar instance and add it to the map
  var sidebar = L.control
    .sidebar({
      container: "sidebar",
      autopan: true,
    })
    .addTo(map)
    .open("home");

  // add panels dynamically to the sidebar
  sidebar
    // add a tab to show the popup information
    //i had more goals for this pane, but i ran out of time. i would have liked to figure out how to show what ranking the country was for most COVID cases. i.e. the US ranked first for confirmed cases in March. i imagine i'd have to figure out how to sum up all the cases for the date selected and do some math. 
    .addPanel({
      id: "stats",
      tab: '<i class="fa fa-line-chart"></i>',
      title: "Statistics",
      pane:
        '<p> Select a country on the map to see the total number of confirmed cases on the date selected.</p> <div id="statscontent" style="margin: 15px;">',
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
