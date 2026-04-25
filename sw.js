// LVP Service Worker — atualização automática
const CACHE_NAME = 'lvp-v5';
const ASSETS = ['./', './index.html'];

// Instala e cacheia os arquivos principais
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  // Força o novo SW a ativar imediatamente sem esperar o app fechar
  self.skipWaiting();
});

// Ativa e apaga caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  // Toma controle de todas as abas abertas imediatamente
  self.clients.claim();
});

// Network first: tenta buscar versão nova da rede,
// só usa cache se estiver offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Atualiza o cache com a versão mais recente
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
