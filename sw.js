const cacheName = 'cache-v1';
const staticAssets = [
    './',
    './images/icon-512x512.png',
    './images/icon-192x192.png',
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

self.addEventListener('fetch', e =>{
    e.respondWith(fetch(e.request).catch(() => {
        caches.match(e.request)}));
});

