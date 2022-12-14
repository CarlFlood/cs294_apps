// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
let map, infoWindow, service, zipCode;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 41.8781, lng: -87.6298 },
    zoom: 15,
  });
  infoWindow = new google.maps.InfoWindow();

  const locationButton = document.createElement("button");

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        fetchZipCode(position.coords.latitude, position.coords.longitude);

        map.setCenter(pos);
        map.setZoom(15);

        var request = {
          location: pos,
          radius: '1000',
          type: ['restaurant']
        };

        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, callback);
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function fetchZipCode(lat, lng) {
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCDVQ3UnrkvAXPmROTkI3hewNz_as_1o8c`)
    .then((response) => response.json())
    .then((data) => {
      const { status, results } = data;

      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          for (let j = 0; j < results[0].address_components.length; j++) {
            if (results[0].address_components[j].types[0] == 'postal_code')
              zipCode = results[0].address_components[j].short_name;
          }
        }
      }
    });
}

function handleLocationError(
  browserHasGeolocation,
  infoWindow,
  pos
) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      const marker = new google.maps.Marker({
        position: results[i].geometry.location,
        map: map
      });

      const info = new google.maps.InfoWindow({
        content: `
          <h1>${results[i].name}</h1>
          <a class="mdc-button mdc-button--outlined" href="health_department.html?place=${results[i].place_id}&zip=${zipCode}&name=${results[i].name}">
            <span class="mdc-button__ripple"></span>
            <span class="mdc-button__label">Warnings</span>
          </a>
          <button class="mdc-button mdc-button--outlined">
            <span class="mdc-button__ripple"></span>
            <span class="mdc-button__label">Reviews</span>
          </button>
          <button class="mdc-button mdc-button--outlined">
            <span class="mdc-button__ripple"></span>
            <span class="mdc-button__label">Photos</span>
          </button>
        `,
        ariaLabel: results[i].name,
      });

      marker.addListener("click", () => {
        info.open({
          anchor: marker,
          map,
        });
      });
    }
  }
}

window.initMap = initMap;
export { };
