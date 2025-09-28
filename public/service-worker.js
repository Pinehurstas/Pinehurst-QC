self.addEventListener('install', (event) => {
  self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  self.clients.claim()
})
// Minimal passthrough fetch — add caching later
self.addEventListener('fetch', () => {})
