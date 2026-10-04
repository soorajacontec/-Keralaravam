// Keralaravam service worker: app shell cache-first, Google Fonts stale-while-revalidate
const CACHE = 'keralaravam-v49';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png',
  './vendor/lame.min.js', './audio/adantha-k1.mp3', './audio/anchadantha-k1.mp3', './audio/anchadantha-k2.mp3', './audio/anchadantha-k3.mp3', './audio/anchadantha-k4.mp3', './audio/adantha-k2.mp3', './audio/adantha-k3.mp3', './audio/adantha-k4.mp3', './audio/chempada-1.mp3', './audio/chempada-2.mp3', './audio/chempada-3.mp3', './audio/chempada-4.mp3', './audio/keli-k1.mp3', './audio/keli-k2.mp3', './audio/keli-k3.mp3', './audio/keli-k4.mp3', './audio/panchari-k1.mp3', './audio/panchari-k2.mp3', './audio/panchari-k3.mp3', './audio/panchari-k4.mp3', './audio/panchavadyam-k1.mp3', './audio/panchavadyam-k2.mp3', './audio/panchavadyam-k3.mp3', './audio/panchavadyam-k4.mp3', './audio/pandi-k1.mp3', './audio/pandi-k2.mp3', './audio/pandi-k3.mp3', './audio/pandi-k4.mp3', './audio/sopanam-k1.mp3', './audio/sopanam-k2.mp3', './audio/sopanam-k3.mp3', './audio/sopanam-k4.mp3', './audio/thayambaka-k1.mp3', './audio/thayambaka-k2.mp3', './audio/thayambaka-k3.mp3', './audio/thayambaka-k4.mp3'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }

  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }

  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
