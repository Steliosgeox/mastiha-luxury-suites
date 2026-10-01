/* Service worker for the Mastiha admin portal (/admin): shows push notifications for new
   guest messages and opens the conversation when one is tapped. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    // The open portal already chimes and highlights the conversation.
    if (windows.some(client => client.focused && new URL(client.url).pathname.startsWith("/admin"))) return;
    await self.registration.showNotification(data.title || "Mastiha", {
      body: data.body || "",
      tag: data.conversationId || "mastiha",
      renotify: true,
      icon: "/apple-icon.png",
      badge: "/apple-icon.png",
      data: { url: data.url || "/admin" },
    });
  })());
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/admin", self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const portal = windows.find(client => new URL(client.url).pathname.startsWith("/admin"));
    if (portal) {
      await portal.focus();
      await portal.navigate(url);
      return;
    }
    await self.clients.openWindow(url);
  })());
});
