/* Service worker: Web Push + Offline PWA (Phase 4) */

const CACHE_STATIC = "shortack-static-v1";
const CACHE_API = "shortack-api-v1";
const CACHE_PAGES = "shortack-pages-v1";

const SLOTS_API_PREFIX = "/api/bus/slots";

// --- Install: precache shell (static + main pages for offline fallback) ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) =>
      cache.addAll(["/manifest.json", "/icons/icon.svg", "/icons/icon-192.png", "/icons/icon-512.png"])
    ).then(() => caches.open(CACHE_PAGES).then((cache) => cache.addAll(["/", "/trips"]))).then(() => self.skipWaiting())
  );
});

// --- Activate: take control and prune old caches ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_STATIC && k !== CACHE_API && k !== CACHE_PAGES).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// --- Fetch: cache static assets, stale-while-revalidate for /api/bus/slots ---
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Stale-while-revalidate for slots API
  if (request.method === "GET" && url.pathname.startsWith(SLOTS_API_PREFIX)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_API));
    return;
  }

  // Cache static assets (Next.js static, manifest, icons)
  if (
    request.mode === "GET" &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname === "/manifest.json" ||
      url.pathname.startsWith("/icons/"))
  ) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // Navigation: network first, cache response, fallback to cached page for offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_PAGES).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.open(CACHE_PAGES).then((cache) =>
            cache.match(request).then((cached) => cached || cache.match("/trips").then((r) => r || cache.match("/")))
          )
        )
    );
    return;
  }
});

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          cache.put(request, clone);
        }
        return response;
      });
      if (cached) {
        fetchPromise.catch(() => {}); // revalidate in background, ignore errors
        return cached;
      }
      return fetchPromise;
    })
  );
}

function cacheFirst(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => cached || fetch(request).then((response) => {
      const clone = response.clone();
      cache.put(request, clone);
      return response;
    }))
  );
}

// --- Push (Phase 3) ---
self.addEventListener("push", (event) => {
  if (!event.data) {
    console.log("[sw] Push event received, no data");
    return;
  }
  let payload = { title: "Shortack", body: "", url: "/" };
  try {
    payload = event.data.json();
  } catch {
    payload.body = event.data.text();
  }
  console.log("[sw] Push received:", payload.title, payload.body?.slice(0, 80), "url:", payload.url);
  const options = {
    body: payload.body,
    data: { url: payload.url || "/" },
    actions: [{ action: "open", title: "Open" }],
  };
  event.waitUntil(
    self.registration.showNotification(payload.title || "Shortack", options).then(() => {
      console.log("[sw] Notification shown:", payload.title);
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  const url = event.notification.data?.url || "/";
  console.log("[sw] Notification click, opening:", url);
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      if (list.length) {
        const client = list.find((c) => c.url.startsWith(self.registration.scope));
        if (client) return client.navigate(url).then(() => client.focus());
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
