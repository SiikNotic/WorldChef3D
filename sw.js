const CACHE="worldchef3d-v4";
const LOCAL=["./","./index.html","./style.css","./game.js","./manifest.webmanifest","./icon.svg"];
const CDN=["https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.js","https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/controls/OrbitControls.js"];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(async cache=>{
        await cache.addAll(LOCAL);
        await Promise.allSettled(CDN.map(url=>cache.add(url)));
      })
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;

  const url=new URL(event.request.url);
  const appAsset=
    url.origin===self.location.origin &&
    (url.pathname.endsWith("/") ||
     url.pathname.endsWith(".html") ||
     url.pathname.endsWith(".js") ||
     url.pathname.endsWith(".css") ||
     url.pathname.endsWith(".webmanifest") ||
     url.pathname.endsWith(".svg"));

  if(appAsset){
    event.respondWith(
      fetch(event.request)
        .then(response=>{
          if(response.ok){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
          }
          return response;
        })
        .catch(()=>caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached=>cached||fetch(event.request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
        return response;
      }).catch(()=>cached))
  );
});