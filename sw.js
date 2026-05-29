// Service Worker — 离线缓存核心资源
var CACHE = 'love-countdown-v1';
var CORE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/js/countdown.js',
  '/js/music.js',
  '/js/ambiance.js',
  '/js/mailbox.js',
  '/js/visitor.js',
  '/js/photos.js'
];

// 安装时预缓存核心文件
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(CORE).catch(function() {
        // 个别文件加载失败不阻塞安装
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if (key !== CACHE) return caches.delete(key);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// 网络优先，失败时回退缓存
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(response) {
      // 只缓存成功的 GET 响应
      if (response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(e.request).then(function(cached) {
        return cached || new Response('离线中…', { status: 503 });
      });
    })
  );
});
