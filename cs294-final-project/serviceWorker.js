// Asset list
const staticDevCoffee = "dev-final-app-v8"
const assets = [
  "./images/icon-192x192.png",
  "./images/icon-256x256.png",
  "./images/icon-512x512.png",
  "./images/icon-384x384.png",
  "./scripts/health.js",
  "./scripts/map.js",
  "./scripts/photos.js",
  "./scripts/reviews.js",
  "./style/map.css",
  "./style/style.css",
  "./health_department.html",
  "./index.html",
  "./photos.html",
  "./reviews.html",
  "https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css",
  "https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://unpkg.com/dexie/dist/dexie.js",
  "https://polyfill.io/v3/polyfill.min.js?features=default"
]

// Install
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticDevCoffee).then(cache => {
      cache.addAll(assets)
    })
  )
})

// Fetch
self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})