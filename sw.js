const CACHE="worldchef3d-v2";
const ASSETS=["./","./index.html","./style.css","./game.js","./manifest.webmanifest","./icon.svg","https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.js","https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/controls/OrbitControls.js"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
    const copy=r.clone(); if(e.request.url.startsWith(self.location.origin)) caches.open(CACHE).then(c=>c.put(e.request,copy)); return r;
  }).catch(()=>cached)));
});