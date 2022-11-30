// Asset list
const staticDevCoffee = "dev-final-app-v1"
const assets = [
  "/cs294-final-project/scripts/health.js",
  "/cs294-final-project/scripts/map.js",
  "/cs294-final-project/scripts/photos.js",
  "/cs294-final-project/scripts/reviews.js",
  "/cs294-final-project/style/map.css",
  "/cs294-final-project/style/style.css",
  "/cs294-final-project/health_department.html",
  "/cs294-final-project/index.html",
  "/cs294-final-project/photos.html",
  "/cs294-final-project/reviews.html",
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