// Service worker do SC Explorer: o app abre sem sinal com a última versão guardada.
// Páginas: rede primeiro (cai no cache sem sinal). Arquivos do app e imagens: cache primeiro.
// Dados (Supabase) não passam por aqui: o app guarda a última cópia boa no próprio aparelho.
const VERSAO = 'sce-v1';
const BASE = ['/', '/manifest.webmanifest', '/icones/icone-192.png', '/img/mapa-base-escuro.webp', '/img/mapa-base-claro.webp'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const mesmo = url.origin === location.origin;
  const fonte = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!mesmo && !fonte) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const c = r.clone(); caches.open(VERSAO).then((k) => k.put('/', c)); return r; }).catch(() => caches.match('/')));
    return;
  }
  if (fonte || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/img/') || url.pathname.startsWith('/icones/')) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(VERSAO).then((k) => k.put(req, c)); } return r; })));
  }
});
