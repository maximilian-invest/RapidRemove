/* RapidRemove Kunden-App – Service Worker für Web-Push (Scope /my-reviews). */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  event.waitUntil(self.registration.showNotification(data.title || "RapidRemove", {
    body: data.body || "",
    icon: "/assets/rapidremove-icon.png",
    badge: "/assets/push-badge.png",
    tag: data.tag || "rrc-" + Date.now(),
    renotify: true,
    timestamp: Date.now(),
    data: { url: data.url || "/my-reviews" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/my-reviews";
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (c.url.includes("/my-reviews")) { await c.focus(); return; }
    }
    await self.clients.openWindow(url);
  })());
});
