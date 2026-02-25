/* Service worker for Web Push (Phase 3) */
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = { title: "Shortack", body: "", url: "/" };
  try {
    payload = event.data.json();
  } catch {
    payload.body = event.data.text();
  }
  const options = {
    body: payload.body,
    data: { url: payload.url || "/" },
    actions: [{ action: "open", title: "Open" }],
  };
  event.waitUntil(
    self.registration.showNotification(payload.title || "Shortack", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
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
