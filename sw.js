const CACHE="worldchef3d-v3";
const LOCAL=["./","./index.html","./style.css","./game.js","./manifest.webmanifest","./icon.svg"];
const CDN=["https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.js","https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/controls/OrbitControls.js"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(async cache=>{await cache.addAll(LOCAL);await Promise.allSettled(CDN.map(url=>cache.add(url)))}).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
    const copy=r.clone();
    caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
    return r;
  }).catch(()=>cached)));
});