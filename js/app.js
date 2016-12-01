mapboxgl.accessToken = 'pk.eyJ1IjoiamdlMSIsImEiOiJjaXY5bzgzZWowMGt0MzNxaXh3ZXFlOTh5In0.puOMnKiOo9xY39nFwzgYrw';

//var coordinates = document.getElementById('coordinates');
// This adds the map to your page
var map = new mapboxgl.Map({
  // container id specified in the HTML
  container: 'map',
  // style URL
  style: 'mapbox://styles/mapbox/streets-v9',
  // initial position in [long, lat] format
  //center: [-77.034084, 38.909671],
  center: [-91.171, 30.407],
  // initial zoom
  zoom: 10
});

map.addControl(new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
}));

var geojson = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [0, 0]
        }
    }]
};

var savedgeojson = {
  "type": "FeatureCollection",
  "features": []
};

var selectedPlaces = {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [0, 0]
      },
      "properties": {
        "name": "name",
        "address": "address",
        "phoneFormatted": "(xxx)xxx-xxxx"
      }
    }]
};

map.on('load', function(e) {
  //Add the places data as a source
  map.addSource('places', {
      type: 'geojson',
      data: selectedPlaces
  });

  //Add a layer to the map with styling rules to render the source
  map.addLayer({
      id: 'locations',
      type: 'symbol',
      source: 'places',
      layout: {
          'icon-image': 'amusement-park-15',
          'icon-size':1.5,
          'icon-allow-overlap': true,
          'visibility': 'visible'
      }
  });
  // Add a single point to the map
  map.addSource('point', {
      "type": "geojson",
      "data": geojson
  });
  map.addLayer({
      "id": "point",
      "type": "circle",
      "source": "point",
      "paint": {
          "circle-radius": 10,
          "circle-color": "#3887be",
          'circle-opacity': 0.5
      }
  });

  $.getJSON("selectedPlaces.geojson", function(data) {

      selectedPlaces = data;
      //console.log(data);

      // Initialize the list
      buildLocationList(selectedPlaces);
      map.getSource('places').setData(selectedPlaces);
  });
});


$("#showMarkers").click(function(e) {
   //map.getSource('places').setData(selectedPlaces);

   var layerid = 'locations';
   var visibility = map.getLayoutProperty(layerid, 'visibility');
   if (visibility === 'none') {
       map.setLayoutProperty(layerid, 'visibility', 'visible');
   }
});

$("#hideMarkers").click(function(e) {
    //map.getSource('places').setData(selectedPlaces);
    var layerid = 'locations';
    var visibility = map.getLayoutProperty(layerid, 'visibility');
    console.log(visibility);

    if (visibility === 'visible') {
        map.setLayoutProperty(layerid, 'visibility', 'none');
    }
});


map.on('mousemove', function (e) {
  // var coords = e.lngLat;
  // coordinates.style.display = 'block';
  // coordinates.innerHTML = 'Longitude: ' + coords.lng + '<br />Latitude: ' + coords.lat;
});

$("#clear").click(function(e){
  geojson.features[0].geometry.coordinates = [0, 0];
  map.getSource('point').setData(geojson);
});

var savedId = 0;
$("#save").click(function(e){

   var placetag = $("#placetag").val();

   var feature = {
       "type": "Feature",
       "geometry": {
           "type": "Point",
           "coordinates": [0, 0]
       },
       "properties": {
         "ID": savedId,
         "name": placetag
       }
   };
   savedId++;

   if(coords == {}) return;
   feature.geometry.coordinates = [coords.lng, coords.lat];
   savedgeojson.features.push(feature);

   var listings = document.getElementById('yourlistings');
   var listing = listings.appendChild(document.createElement('div'));
   listing.className = 'item';
   listing.id = 'yourlisting-' + savedId;

   // Create a new link with the class 'title' for each store
   // and fill it with the store address
   var link = listing.appendChild(document.createElement('a'));
   link.href = '#';
   link.className = 'title';
   link.dataPosition = savedId-1;
   link.innerHTML = "Saved Place " + feature.properties.ID + ": " + placetag;
   link.onclick = function(e){
     //console.log('click to flyto saved location');
     var dataPosition = $(this)[0].dataPosition;
     var feature=savedgeojson.features[dataPosition];
     map.flyTo({
         center: feature.geometry.coordinates
     });
   }

   var add = listing.appendChild(document.createElement('a'));
   add.href = 'javascript:void(0)';
   add.className = 'smalllink';
   add.dataPosition = savedId-1;
   add.innerHTML = "add to selection";
   add.onclick = function(e){
     //console.log('click to add to selection');
     var dataPosition = $(this)[0].dataPosition;
     var feature=savedgeojson.features[dataPosition];

     // Select the listing container in the HTML
     var listings = document.getElementById('listings');
     var insertPosition = selectedPlaces.features.length;
     //console.log('insertPosition:', insertPosition);
     addListing(listings, feature, insertPosition);

     selectedPlaces.features.push(feature);
     map.getSource('places').setData(selectedPlaces);
   };

   var str = JSON.stringify(savedgeojson);

   //Save the file contents as a DataURI
   var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(str);

   //Write it as the href for the link
   var downloadjson = document.getElementById('downloadjson');
   downloadjson.href = dataUri;
   downloadjson.style.display = "inline-block";

});

var coords = {};
map.on('click', function(e){

  var zoom = map.getZoom();
  //console.log('zoom:', zoom);
  //console.log(e.lngLat);
  coords = e.lngLat;

  var Meters_per_pixel = 156543.03392 * Math.cos(coords.lat * Math.PI / 180) / Math.pow(2, zoom);
  var pixels = (Radius*1000) / Meters_per_pixel;
  //console.log('pixels for Radius:',pixels);

  geojson.features[0].geometry.coordinates = [coords.lng, coords.lat];
  map.getSource('point').setData(geojson);

  //map.setPaintProperty('point', 'circle-color', '#3bb2d0');
  map.setPaintProperty('point', 'circle-radius', pixels);

  Website.Homepage.searchPhotos('', 1, coords.lat, coords.lng, 1);
});


var slider = document.getElementById('slider');
var sliderValue = document.getElementById('slider-value');
var Radius = 5; //5km
slider.addEventListener('input', function(e) {

    Radius = parseInt(e.target.value, 10) / 2;

    // Value indicator
    sliderValue.textContent = Radius + 'km';
});


function buildLocationList(data) {

    // Select the listing container in the HTML
    var listings = document.getElementById('listings');


    // Iterate through the list of data
    for (i = 0; i < data.features.length; i++) {
        var currentFeature = data.features[i];
        addListing(listings, currentFeature, i);
    };

}


function addListing(listings, currentFeature, insertPosition) {


    // Shorten data.feature.properties to just `prop` so we're not
    // writing this long form over and over again.
    var prop = currentFeature.properties;
    // inside the listing contatiner, append a div
    // with the class 'item' for each store

    var listing = listings.appendChild(document.createElement('div'));
    listing.className = 'item';
    listing.id = 'listing-' + insertPosition;

    // Create a new link with the class 'title' for each store
    // and fill it with the store address
    var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';
    link.dataPosition = insertPosition;
    link.innerHTML = prop.name;
    link.onclick = function(e) {
        //console.log('click to fly to selection');
        //console.log($(this)[0].dataPosition);
        var dataPosition = $(this)[0].dataPosition;
        var feature = selectedPlaces.features[dataPosition];
        //console.log(feature.geometry.coordinates);
        map.flyTo({
            center: feature.geometry.coordinates
        });
    };


        // Create a new div with the class 'details' for each store
        // and fill it with the city and phone number
        var details = listing.appendChild(document.createElement('div'));

        if (prop.address) {
          details.innerHTML = prop.address;
        }
        else {
          var lonlat = currentFeature.geometry.coordinates;
          details.innerHTML = 'lonlat: '+lonlat;
        }
        if (prop.phoneFormatted) {
            details.innerHTML += ' &middot; ' + prop.phoneFormatted;
        }

}
