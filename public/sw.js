/* ─────────────────────────────────────────────────────────────
   Osiris PWA — Service Worker
   Estrategias:
   • Estáticos (/_next/static, /images, fonts): Cache-First
   • Páginas HTML: Network-First con fallback offline
   • API /api/*: Network-First, si falla → fallback JSON vacío
   • POST /api/corte: Background Sync (cola offline)
───────────────────────────────────────────────────────────── */

const CACHE_NAME = 'osiris-v1';
const SYNC_TAG = 'osiris-sync-corte';
const OFFLINE_PAGE = '/offline';

const PRECACHE = [
  '/',
  '/offline',
  '/historial',
  '/inventario',
  '/images/icon.png',
];

// ── INSTALL: pre-cachear shell ──────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) =>
      c.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })))
        .catch(() => {}) // Si alguna falla, no bloquear install
    )
  );
  self.skipWaiting();
});

// ── ACTIVATE: limpiar caches viejos ────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH ────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Solo interceptar mismo origen
  if (url.origin !== self.location.origin) return;

  // No interceptar POST/PUT/DELETE de API (eso lo maneja Background Sync)
  if (request.method !== 'GET') return;

  // Estáticos Next.js + imágenes → Cache-First
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/images') ||
    url.pathname.startsWith('/fonts') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2|woff)$/)
  ) {
    e.respondWith(cacheFirst(request));
    return;
  }

  // API → Network-First con fallback vacío
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirstAPI(request));
    return;
  }

  // Páginas HTML → Network-First con fallback /offline
  e.respondWith(networkFirstPage(request));
});

// ── BACKGROUND SYNC ─────────────────────────────────────────
self.addEventListener('sync', (e) => {
  if (e.tag === SYNC_TAG) {
    e.waitUntil(flushQueue());
  }
});

// ── Estrategias ──────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    return new Response('', { status: 408 });
  }
}

async function networkFirstPage(request) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_PAGE);
    return offline || new Response('<h1>Sin conexión</h1>', { headers: { 'Content-Type': 'text/html' } });
  }
}

async function networkFirstAPI(request) {
  try {
    return await fetch(request);
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'offline', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ── Cola offline para POST /api/corte ────────────────────────
const DB_NAME = 'osiris-sync';
const STORE = 'queue';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { autoIncrement: true });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function flushQueue() {
  const db = await openDB();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  const all = await new Promise((res) => {
    const req = store.getAll();
    req.onsuccess = () => res(req.result);
  });
  const keys = await new Promise((res) => {
    const req = store.getAllKeys();
    req.onsuccess = () => res(req.result);
  });

  for (let i = 0; i < all.length; i++) {
    const { url, method, body, headers } = all[i];
    try {
      const res = await fetch(url, { method, body, headers });
      if (res.ok) store.delete(keys[i]);
    } catch {
      // Dejar en cola para el próximo sync
    }
  }
}

// Exponer función para que el cliente encole requests offline
self.addEventListener('message', async (e) => {
  if (e.data?.type === 'QUEUE_REQUEST') {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).add(e.data.payload);
  }
});
