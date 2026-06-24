const CACHE = "food-diary-v8";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (e)=>{
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Сначала пытаемся получить свежую версию из сети (чтобы обновления
// сразу подхватывались), и только если сети нет — берём из кэша.
self.addEventListener("fetch", (e)=>{
  e.respondWith(
    fetch(e.request)
      .then(resp=>{
        const copy = resp.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, copy)).catch(()=>{});
        return resp;
      })
      .catch(()=> caches.match(e.request))
  );
});
