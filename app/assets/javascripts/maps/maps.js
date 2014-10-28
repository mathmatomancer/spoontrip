console.log('loaded map js file');

var MapSettings = {
    map: null,
    starting_coordinates: null,
    path: []
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
    });
    drawing_manager.setMap(MapSettings.map);
}