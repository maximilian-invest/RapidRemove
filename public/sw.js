/* RapidRemove Admin – Service Worker für Web-Push.
   Zeigt eingehende Push-Benachrichtigungen an und öffnet beim Tap das
   Admin-Panel direkt bei der jeweiligen Bestellung. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  const title = data.title || "RapidRemove";
  const url = data.url || "/admin";
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || "",
    icon: "/assets/rapidremove-icon.png",
    badge: "/assets/rapidremove-icon.png",
    tag: "rr-order",
    renotify: true,
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
