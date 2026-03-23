const CACHE = 'langcard-v12';
const FILES = ['./lang-study.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.endsWith('.html') || e.request.mode === 'navigate') {
    // HTML: network-first（常に最新を取得、オフライン時のみキャッシュ）
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // その他（画像等）: cache-first
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
