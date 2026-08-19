const VERSION='luke-pwa-v0.10.0';
const STATIC_CACHE=`${VERSION}-static`;
const OFFLINE_CACHE=`${VERSION}-offline`;
const OFFLINE_URL='/offline.html';
const PRECACHE=[OFFLINE_URL,'/manifest.webmanifest','/icons/pwa-192.png','/icons/pwa-512.png','/icons/pwa-maskable-512.png','/icons/apple-touch-icon.png'];

self.addEventListener('install',event=>{event.waitUntil(caches.open(OFFLINE_CACHE).then(cache=>cache.addAll(PRECACHE)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('luke-pwa-')&&!k.startsWith(VERSION)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});

function isSensitive(url){return url.pathname.startsWith('/v1/')||url.pathname.startsWith('/api/')||url.pathname.includes('/auth/')||url.pathname.includes('/checkout')||url.pathname.includes('/payment')||url.pathname.includes('/orders/')}
function runtimeStatic(request){return['style','script','image','font'].includes(request.destination)}

self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  const url=new URL(request.url);if(url.origin!==self.location.origin||isSensitive(url))return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).catch(()=>caches.match(OFFLINE_URL)));
    return;
  }
  if(runtimeStatic(request)){
    event.respondWith(caches.open(STATIC_CACHE).then(async cache=>{
      const hit=await cache.match(request);const network=fetch(request).then(response=>{if(response.ok&&response.type==='basic')cache.put(request,response.clone());return response}).catch(()=>null);
      return hit||await network||Response.error();
    }));
  }
});
