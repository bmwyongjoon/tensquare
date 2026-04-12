// 버전 번호 — 코드 수정할 때마다 올려주면 자동 업데이트
const VERSION = 'v6';
const CACHE_NAME = 'tensquare-' + VERSION;

const FILES_TO_CACHE = [
  './index.html',
  './manifest.json'
];

// 설치: 파일 캐시
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 활성화: 이전 버전 캐시 전부 삭제
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// 요청: 네트워크 우선, 실패 시 캐시 사용
// (캐시 우선이면 업데이트가 반영 안 될 수 있음)
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        // 네트워크 성공 시 캐시 업데이트
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, responseClone);
        });
        return response;
      })
      .catch(function() {
        // 네트워크 실패 시 캐시에서 가져오기 (오프라인 대응)
        return caches.match(e.request);
      })
  );
});
