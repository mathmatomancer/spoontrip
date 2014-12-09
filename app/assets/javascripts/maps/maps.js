var SPOONTRIP = {};
var MapSettings = {};

(function($) {
  MapSettings = {
    map: null,
    directions: null,
    starting_coordinates: null,
    path: [],
    argument_string: '',
    markers: [],
    infoWindow: undefined
  };

  SPOONTRIP = {
    mapStart: function () {
      MapSettings.map = new google.maps.Map(document.getElementById("google-map"), {
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,

      });
      mapCenter(); // fills in coordinates
      drawing_manager = new google.maps.drawing.DrawingManager({
        drawingControlOptions: {
          drawingModes: [google.maps.drawing.OverlayType.POLYLINE]
        },
        polylineOptions: {
          editable: true
        }
      });
      google.maps.event.addListener(drawing_manager, 'polylinecomplete', function (line) {
        MapSettings.path = line.getPath().getArray();
        $('#fetch-data').show();
      });
      drawing_manager.setMap(MapSettings.map);
      $('#fetch-data').hide();

      MapSettings.directions = new google.maps.DirectionsService();
      MapSettings.display = new google.maps.DirectionsRenderer();
      MapSettings.display.setMap(MapSettings.map)
    }
  };

  function mapCenter() {
    navigator.geolocation.getCurrentPosition(getCoords);
  }

  function getCoords(position) {
    MapSettings.starting_coordinates = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    MapSettings.map.setCenter(MapSettings.starting_coordinates)
  }

  function showInfoWindow(marker) {
    if (typeof MapSettings.infoWindow != 'undefined') {
      MapSettings.infoWindow.close();
    }
    MapSettings.infoWindow = new google.maps.InfoWindow({content: marker.content});
    MapSettings.infoWindow.open(MapSettings.map, marker);
  }

  function getInfoWindowHtml(data) {
    return '' +
      '<div class="info-window">' +
      '<a href="' + data.urbanspoon_url + '">' + data.title + '</a>' +
      ((data.total_votes >= 10) ? '<br />' + data.votes_percent + '% like it' : '') +
      '<br />' +
      ((data.price) ? data.price + '/4 ' : '') +
      ((data.cuisines.length > 0) ? data.cuisines[0].title : '') +
      '<br />' +
      data.phone +
      '<br />' +
      data.address.street + ', ' + data.address.city + ', ' + data.address.state +
      '</div>';
  }

  function setMarker(data) {
    var marker = new google.maps.Marker({
      map: MapSettings.map,
      content: getInfoWindowHtml(data),
      position: new google.maps.LatLng(data.lat, data.lon),
      title: data.title
    });
    MapSettings.markers[data.id] = marker;

    google.maps.event.addListener(marker, 'click', function () {
      showInfoWindow(marker)
    });

    return marker;
  }

  function getRestaurants() {
    MapSettings.path.forEach(appendArgument);
    var url = 'http://qaus1.dev.spoon/api/v2/spoon_trips?' + MapSettings.argument_string;
    $.ajax({url: url}).done(function (data) {
      var response = data;
      response.forEach(function (datapoint) {
        setMarker(datapoint);
      });
    });
  }

  function getDirections(e) {
    e.preventDefault();
    var form = $(this);
    var origin = $('#origin', form).val();
    var dest = $('#destination', form).val();
    MapSettings.directions.route({origin: origin, destination: dest, travelMode: google.maps.TravelMode.DRIVING}, processDirections)
  }

  function processDirections(data, status) {
    showResults(data, status);
    grabPoints(data);
    getRestaurants();
  }

  function grabPoints(data) {

    // data is a DirectionsResult, has routes w/legs and such. assume 1 route, 1 leg, grab points

    var steps = data.routes[0].legs[0].steps;
    MapSettings.test_points = steps;
    steps.forEach(function(element, index, array) {
        MapSettings.path[index] = element.start_location;
    });
    MapSettings.path[steps.length] = steps[steps.length - 1].end_location;
  }

  function showResults(data, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      MapSettings.display.setDirections(data);
    }
  }

  function appendArgument(element, index, array) {
    MapSettings.argument_string = MapSettings.argument_string + "path[]=" + element.lat() + ',' + element.lng() + '&';
  }

  $(document).on('click', '#fetch-data', getRestaurants);

  $(document).on('submit', '#directions form', getDirections);
})(jQuery);
