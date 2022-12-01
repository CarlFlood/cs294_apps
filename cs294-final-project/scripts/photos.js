// Get query parameters from URL
const query = document.cookie;
const params = query.split('&').reduce((accumulator, singleQueryParam) => {
  const [key, value] = singleQueryParam.split('=');
  accumulator[key] = decodeURIComponent(value);
  return accumulator;
}, {});

// Database
const db = new Dexie("PhotosDatabase");
db.version(4).stores({
  photos: '++id,photo,place_id',
});

// Render all photos onto page
let photos = [];
let updateImage = "";
async function renderPhotos() {
  // Reset photos list content
  const photosList = document.querySelector("#photos");
  photosList.innerHTML = "";

  photos.forEach((photo) => {
    const itemRipple = document.createElement("span");
    itemRipple.classList.add("mdc-list-item__ripple");

    const photoImage = document.createElement("img");
    photoImage.src = photo.photo;
    photoImage.style.margin = "5px";

    const itemTemplate = document.createElement("li");
    itemTemplate.classList.add("mdc-list-item");
    itemTemplate.classList.add("mdc-list-item--disabled");
    itemTemplate.tabIndex = 0;
    itemTemplate.appendChild(itemRipple);
    itemTemplate.appendChild(photoImage);

    photosList.appendChild(itemTemplate);
  });
}

// Get photos from database
const getPhotos = async () => {
  photos = await db.photos.where({ place_id: params.place }).reverse().toArray();
}
getPhotos().then(() => renderPhotos());

// Add Photo Dialog
const dialog = new mdc.dialog.MDCDialog(document.querySelector('.mdc-dialog'));
document.querySelector("#openAddModal").addEventListener("click", () => {
  dialog.open();
});

// Save the photo
document.querySelector("#saveNewPhoto").addEventListener("click", () => {
  db.photos.add({ photo: updateImage, place_id: params.place })
    .then(() => {
      getPhotos().then(() => renderPhotos());
    })
    .catch(err => {
      alert("An error occured while inserting a photo: " + err);
    });
})

// Image to png URL for storage
function encodeImageFileAsURL(element) {
  var file = element.files[0];
  var reader = new FileReader();
  reader.onloadend = function() {
    updateImage = reader.result;
    document.querySelector("#showImageNewDialog").src = reader.result;
    document.querySelector("#showImage").src = reader.result;
  }
  reader.readAsDataURL(file);
}

// Begin capturing video
const width = 320; // We will scale the photo width to this
let height = 0; // This will be computed based on the input stream

// |streaming| indicates whether or not we're currently streaming
// video from the camera. Obviously, we start at false.

let streaming = false;

// The various HTML elements we need to configure or control. These
// will be set by the startup() function.

let video = null;
let canvas = null;
let photo = null;
let startbutton = null;
let updatePhoto = null;

// Startup video for camera
function startup() {
  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  photo = document.getElementById("showImageNewDialog");
  updatePhoto = document.getElementById("showImage");
  startbutton = document.getElementById("startbutton");

  // Grab all devices
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => {
      console.error(`An error occurred: ${err}`);
    });

  // Video start
  video.addEventListener(
    "canplay",
    (ev) => {
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width);

        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.

        if (isNaN(height)) {
          height = width / (4 / 3);
        }

        video.setAttribute("width", width);
        video.setAttribute("height", height);
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
        streaming = true;
      }
    },
    false
  );

  // Grab picture from camera
  startbutton.addEventListener(
    "click",
    (ev) => {
      takepicture();
      ev.preventDefault();
    },
    false
  );

  clearphoto();
}

// Fill the photo with an indication that none has been
// captured.
function clearphoto() {
  const context = canvas.getContext("2d");
  context.fillStyle = "#AAA";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
}

// Capture a photo by fetching the current contents of the video
// and drawing it into a canvas, then converting that to a PNG
// format data URL. By drawing it on an offscreen canvas and then
// drawing that to the screen, we can change its size and/or apply
// other changes before drawing it.
function takepicture() {
  const context = canvas.getContext("2d");
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
    updateImage = data;
  } else {
    clearphoto();
  }
}

// Set up our event listener to run the startup process
// once loading is complete.
window.addEventListener("load", startup, false);