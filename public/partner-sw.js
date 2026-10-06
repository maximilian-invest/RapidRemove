/* RapidRemove Partner – Service Worker für Web-Push (Scope /partner).
   Neue Bewertungen, Kunde hat Software bezahlt (→ starten), Kunde hat abgelehnt. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  // App-Symbol-Zähler = offene Aktionen (iOS 16.4+/Android, nur App am Home-Bildschirm).
  try { if (typeof data.badge === "number" && self.navigator && self.navigator.setAppBadge) (data.badge > 0 ? self.navigator.setAppBadge(data.badge) : self.navigator.clearAppBadge()); } catch (e) {}
  event.waitUntil(self.registration.showNotification(data.title || "RapidRemove Partner", {
    body: data.body || "",
    icon: "/assets/app-icon-512.png",
    badge: "/assets/push-badge.png",
    tag: data.tag || "rrp-" + Date.now(),
    renotify: true,
    timestamp: Date.now(),
    vibrate: [60, 40, 60],
    actions: [{ action: "open", title: "Open" }],
    data: { url: data.url || "/partner" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/partner";
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (c.url.includes("/partner")) { await c.focus(); return; }
    }
    await self.clients.openWindow(url);
  })());
});
