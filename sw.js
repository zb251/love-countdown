// Service Worker — 离线缓存（v2）
var CACHE = 'love-v2';
var API_HOST = 'api.jsonblob.com';

// 不缓存的请求（API）
function isApi(url) {
  return url.indexOf(API_HOST) !== -1;
}

// 安装时预缓存核心文件
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll([
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
      ]).catch(function() {});
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

// 策略：API 走网络不缓存，HTML 网络优先，其他缓存优先
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;

  // API 请求：只走网络，不缓存
  if (isApi(url)) {
    e.respondWith(fetch(e.request));
    return;
  }

  // HTML：网络优先，失败回退缓存
  if (e.request.mode === 'navigate' || url.match(/\/(index\.html)?$/)) {
    e.respondWith(
      fetch(e.request).then(function(res) {
        var clone = res.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return res;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  // 静态资源：缓存优先，后台更新
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fetchPromise = fetch(e.request).then(function(res) {
        if (res.status === 200) {
          var clone = res.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return res;
      }).catch(function() {});
      return cached || fetchPromise;
    })
  );
});

// 检测到新版本时通知页面刷新
self.addEventListener('message', function(e) {
  if (e.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
