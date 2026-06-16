// AVS Formation service worker — minimal, enables PWA installability.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
// A fetch handler must exist for the app to be installable. Pass-through (network).
self.addEventListener("fetch", () => {});
