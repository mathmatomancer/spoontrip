console.log('loaded map js file');

var SPOONTRIP = {};

(function($) {
  var MapSettings = {
    map: null,
    starting_coordinates: null,
    path: [],
    argument_string: '',
    markers: [],
    infoWindow: undefined
  };

  SPOONTRIP = {
    mapStart: function () {
      MapSettings.map = new google.maps.Map(document.getElementById("google-map"), {
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,

      });
      mapCenter(); // fills in coordinates
      drawing_manager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYLINE,
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
    }
  }

  function mapCenter() {
    //if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getCoords)
    //} else {
    //    MapSettings.starting_coordinates = new google.maps.LatLng(47.6,-122.0);
    // }
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
    jQuery.ajax({url: url}).done(function (data) {
      var response = data;
      response.forEach(function (datapoint) {
        setMarker(datapoint);
      });
    });
  }

  function appendArgument(element, index, array) {
    MapSettings.argument_string = MapSettings.argument_string + "path[]=" + element.lat() + ',' + element.lng() + '&';
  }

  $(document).on('click', '#fetch-data', getRestaurants);
})(jQuery);