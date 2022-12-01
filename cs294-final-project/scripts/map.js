// Geolocation banner
let map, infoWindow, service, zipCode;
const banner = new mdc.banner.MDCBanner(document.querySelector('.mdc-banner'));
banner.open();

// Initialize the map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 41.8781, lng: -87.6298 },
    zoom: 15,
  });
  infoWindow = new google.maps.InfoWindow();

  // Try and grab location if allowed
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map.setCenter(pos);
        map.setZoom(15);

        fetchZipCode(position.coords.latitude, position.coords.longitude);

        var request = {
          location: pos,
          radius: '1000',
          type: ['restaurant']
        };

        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, callback);
        banner.close();
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

// Utilize the Google Geolocation API to get zip code from current location
// Necessary to find the violation records using the City of Chicago API
function fetchZipCode(lat, lng) {
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCDVQ3UnrkvAXPmROTkI3hewNz_as_1o8c`)
    .then((response) => response.json())
    .then((data) => {
      const { status, results } = data;

      // Geocoder availability
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          for (let j = 0; j < results[0].address_components.length; j++) {
            if (results[0].address_components[j].types[0] == 'postal_code')
              zipCode = results[0].address_components[j].short_name;
          }
        }
      }
    }).catch((err) => {
      alert("The geocoder API is not available at the moment. Defaulting to 60657 zip code.");
      zipCode = "60657";
    });
}

// If unable to find location, handle error
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

// Callback once the map is loaded
function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      // Create new marker
      const result = results[i];
      const marker = new google.maps.Marker({
        position: result.geometry.location,
        map: map
      });

      // Info window to allow for users to access restaurant pages
      const info = new google.maps.InfoWindow({
        content: `
          <h1 class="mdc-typography--headline4">${result.name}</h1>
          <a class="mdc-button mdc-button--outlined" href="health_department.html">
            <span class="mdc-button__ripple"></span>
            <span class="mdc-button__label">Warnings</span>
          </a>
          <a class="mdc-button mdc-button--outlined" href="reviews.html">
            <span class="mdc-button__ripple"></span>
            <span class="mdc-button__label">Reviews</span>
          </a>
          <a class="mdc-button mdc-button--outlined" href="photos.html">
            <span class="mdc-button__ripple"></span>
            <span class="mdc-button__label">Photos</span>
          </a>
        `,
        ariaLabel: result.name,
      });

      // Listen for clicks
      marker.addListener("click", () => {
        info.open({
          anchor: marker,
          map,
        });
        document.cookie = `place=${result.place_id}&zip=${zipCode}&name=${result.name}`;
      });
    }
  }
}

window.initMap = initMap;
export { };
