// WorldChef3D service worker.
// VERSION must match the ?v= query used in index.html for game.js/style.css
// and the SW registration URL. Bump it on every release so old caches purge.
const VERSION="95";
const CACHE="worldchef3d-v"+VERSION;
const LOCAL=[
  "./",
  "./index.html",
  "./style.css?v="+VERSION,
  "./game.js?v="+VERSION,
  "./manifest.webmanifest",
  "./icon.svg",
  "./vendor/three.module.js",
  "./vendor/OrbitControls.js"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>Promise.allSettled(LOCAL.map(url=>cache.add(url).catch(()=>null))))
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
    // App shell: network first so updates land immediately, cache as fallback offline.
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
