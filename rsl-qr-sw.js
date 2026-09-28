// Service worker minimal : permet d'installer l'app RSL Scan.
// Il ne met rien en cache : le scan a toujours besoin d'internet.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
