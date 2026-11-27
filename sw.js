// Service worker : met le quiz en cache pour qu'il marche sans connexion.
// Change la version à chaque mise à jour des fichiers pour forcer le rafraîchissement.
const CACHE = "foot-quizz-1.0";
const FILES = [
  "./",
  "index.html",
  "style.css",
  "questions.js",
  "questions-plus.js",
  "questions-extra.js",
  "questions-multi.js",
  "questions-cr7.js",
  "clubs.js",
  "geo-map.js",
  "games-data.js",
  "cards.js",
  "items.js",
  "trophies.js",
  "sounds.js",
  "legend.js",
  "app.js",
  "manifest.webmanifest",
  "icons/apple-touch-icon-v3.png",
  "icons/tete-fete.png",
  "icons/icon-192-v3.png",
  "icons/icon-512-v3.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord (pour avoir les nouvelles questions), cache si hors ligne
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("version.json")) return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
