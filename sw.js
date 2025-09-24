// Pinehurst QC PWA Service Worker
const CACHE_NAME = 'pinehurst-qc-v1.0.0';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache).catch(err => {
                    console.log('Service Worker: Cache add failed for some resources', err);
                    // Cache essential files individually to avoid failure
                    return Promise.all([
                        cache.add('./').catch(() => console.log('Failed to cache ./')),
                        cache.add('./index.html').catch(() => console.log('Failed to cache index.html')),
                        cache.add('./styles.css').catch(() => console.log('Failed to cache styles.css')),
                        cache.add('./app.js').catch(() => console.log('Failed to cache app.js')),
                        cache.add('./manifest.json').catch(() => console.log('Failed to cache manifest.json'))
                    ]);
                });
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }

                // If not in cache, fetch from network
                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request).then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone response since it's a stream
                    const responseToCache = response.clone();

                    // Add to cache for future use
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch(() => {
                    // If network fetch fails and not in cache, return offline page or error
                    console.log('Service Worker: Network fetch failed, returning offline fallback');
                    
                    // For navigation requests, return the main page
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                    
                    // For other requests, you could return a generic offline response
                    return new Response('Offline - content not available', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// Background sync for data upload (when online)
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered');
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            syncInspectionData()
        );
    }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New notification from Pinehurst QC',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('Pinehurst QC', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

// Helper function to sync inspection data
async function syncInspectionData() {
    try {
        // This would sync with your actual server
        console.log('Service Worker: Syncing inspection data...');
        
        // Get data from IndexedDB or localStorage
        // Send to server API
        // Mark as synced
        
        console.log('Service Worker: Data sync completed');
        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Data sync failed:', error);
        return Promise.reject(error);
    }
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'REQUEST_SYNC') {
        // Trigger background sync
        self.registration.sync.register('background-sync').catch(err => {
            console.log('Background sync registration failed:', err);
        });
    }
});

// Periodic background sync (for future use with proper API)
self.addEventListener('periodicsync', (event) => {
    console.log('Service Worker: Periodic sync triggered');
    
    if (event.tag === 'inspection-sync') {
        event.waitUntil(
            syncInspectionData()
        );
    }
});

// Update app cache when new version available
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'UPDATE_CACHE') {
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return cache.addAll(urlsToCache);
            })
        );
    }
});

console.log('Service Worker: Script loaded');
