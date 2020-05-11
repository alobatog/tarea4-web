const cacheName = 'cache-v1';
const staticAssets = [
    './',
    './index.html',
    './index.js',
    './firebase.js',
    './style.css',
    './manifest.webmanifest'
];
//!request['url'].includes('googleapis.com/identitytoolkit')
self.addEventListener('install', async e => {
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
    return self.skipWaiting();
});

self.addEventListener('activate', e =>{
    self.clients.claim();
});

self.addEventListener('fetch', async e =>{
    const request = e.request;
    const url = new URL(request.url);
    if(request['method']==='GET'){
        if(url.origin === location.origin) {
            e.respondWith(cacheFirst(request));
        } else{
            e.respondWith(networkAndCache(request));
        }
    }
});

async function cacheFirst(request) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    return cached || fetch(request)
}

async function networkAndCache(request){
    const cache = await caches.open(cacheName);
    try{
        const newCache = await fetch(request);
        await cache.put(request, newCache.clone());
        return newCache;
    } catch (e){
        const cached = await cache.match(request);
        return cached;
    }
}