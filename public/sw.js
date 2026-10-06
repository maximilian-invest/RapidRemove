/* RapidRemove Admin – Service Worker für Web-Push.
   Uber-Stil: kurzer Titel (was passiert ist), Body (wer · Details), App-Icon, monochromes
   Badge (Android-Statusleiste), jede Meldung mit eigenem Tag → nichts wird überschrieben.
   Tap öffnet das Admin-Panel direkt beim jeweiligen Auftrag. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  const title = data.title || "RapidRemove";
  const url = data.url || "/admin";
  // App-Symbol-Zähler = offene Aktionen (iOS 16.4+/Android, nur App am Home-Bildschirm).
  try { if (typeof data.badge === "number" && self.navigator && self.navigator.setAppBadge) (data.badge > 0 ? self.navigator.setAppBadge(data.badge) : self.navigator.clearAppBadge()); } catch (e) {}
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || "",
    icon: "/assets/app-icon-512.png",
    badge: "/assets/push-badge.png",
    image: data.image || undefined,
    tag: data.tag || "rr-" + Date.now(),
    renotify: true,
    timestamp: Date.now(),
    vibrate: [60, 40, 60],
    actions: [{ action: "open", title: "Öffnen" }],
    data: { url },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin";
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (c.url.includes("/admin")) {
        await c.focus();
        if ("navigate" in c) { try { await c.navigate(url); } catch (e) {} }
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
