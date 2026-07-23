const CACHE = "horizon-meteo-v28";
const SHELL = ["./", "./index.html", "./density-preview.html", "./styles.css", "./app-bundle.js", "./data/ai-models-france.js", "./weathernext2-loader.js", "./d3.min.js", "./icon.svg", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png", "./manifest.webmanifest"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const needsFreshNetwork = event.request.mode === "navigate"
    || url.pathname.endsWith("/data/ai-models-france.js");

  if (needsFreshNetwork) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then(response => {
          if (!response.ok) return response;
          const copy = response.clone();
          return caches.open(CACHE)
            .then(cache => cache.put(event.request, copy))
            .catch(() => {})
            .then(() => response);
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
