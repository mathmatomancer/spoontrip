console.log('loaded map js file');

var MapSettings = {
    map: null,
    starting_coordinates: null,
    path: [],
    argument_string: '',
    markers: []
};

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

function mapStart() {
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
    google.maps.event.addListener(drawing_manager, 'polylinecomplete', function(line) {
        MapSettings.path = line.getPath().getArray();
        $('#fetch-data').show();
    });
    drawing_manager.setMap(MapSettings.map);
    $('#fetch-data').hide();
}

function getRestaurants() {
    MapSettings.path.forEach(appendArgument);
    var url = 'https://qaus1.dev.spoon/api/v2/spoon_trips?' + MapSettings.argument_string;
    jQuery.ajax({url: url}).done(function (data) {
        var response = data;
        response.forEach(function (datapoint) {
            marker = new google.maps.Marker({
                map: MapSettings.map,
                position: new google.maps.LatLng(datapoint.lat, datapoint.lon),
                title: datapoint.title
            });
            MapSettings.markers.push(marker);
        });
    });
}

function appendArgument(element, index, array) {
    MapSettings.argument_string = MapSettings.argument_string + "path[]=" + element.lat() + ',' + element.lng() + '&';
}

$(document).on('click', '#fetch-data', getRestaurants);