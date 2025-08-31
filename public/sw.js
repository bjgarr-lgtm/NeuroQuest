
const CACHE = 'adhd-quest-vslice-v1';
const ASSETS = [
  '/', '/index.html', '/styles.css', '/app.js',
  '/assets/img/logo.svg', '/assets/img/sticker1.svg', '/assets/img/sticker2.svg', '/assets/img/sticker3.svg',
  '/assets/img/fox.svg','/assets/img/odin.svg','/assets/img/molotov.svg','/assets/img/bambi.svg','/assets/img/ben.svg'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k!==CACHE).map(k => caches.delete(k)))));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
