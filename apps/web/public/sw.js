/* Service worker for Web Push (Phase 3) */
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
