
const CACHE_NAME = 'pratix-finance-v1.3.0';
const VERSION_CACHE = 'version-cache-v2';

// OPTIMIZED: Essential files for better performance
const urlsToCache = [
  './',
  './index.html',
  './emi-calculator.html',
  './sip-calculator.html',
  './tax-calculator.html',
  './fd-calculator.html',
  './gst-calculator.html',
  './profit-loss-calculator.html',
  './construction-cost-calculator.html',
  './style.css',
  './script.js',
  './universal-nav.js',
  './emi-script.js',
  './sip-script.js',
  './tax-script.js',
  './fd-script.js',
  './gst-script.js',
  './profit-loss-script.js',
  './construction-cost-script.js',
  './logo.png',
  './favicon.png',
  './favicon.ico',
  './manifest.json',
  './version.json',
  './privacy.html',
  './terms.html'
].filter(url => url && typeof url === 'string' && url.length > 0);

// FIXED: Enhanced install event with error handling
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
      // Cache main resources
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Service Worker: Caching core files');
          return cache.addAll(urlsToCache.filter(url => url && typeof url === 'string'));
        })
        .catch((error) => {
          console.warn('Service Worker: Cache failed for some resources', error);
          // Continue with partial cache
          return Promise.resolve();
        }),
      
      // Initialize version cache
      caches.open(VERSION_CACHE)
        .then((cache) => {
          console.log('Service Worker: Version cache initialized');
          return cache.put('/version-info', new Response(JSON.stringify({
            version: '1.2.0',
            timestamp: Date.now()
          })));
        })
        .catch((error) => {
          console.warn('Service Worker: Version cache failed', error);
          return Promise.resolve();
        })
    ])
    .then(() => {
      console.log('Service Worker: Installed successfully');
      return self.skipWaiting();
    })
    .catch((error) => {
      console.error('Service Worker: Installation failed', error);
    })
  );
});

// FIXED: Enhanced activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const hasOldCache = cacheNames.some(cacheName => 
        cacheName !== CACHE_NAME && cacheName !== VERSION_CACHE
      );
      
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== VERSION_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        console.log('Service Worker: Activated successfully');
        
        // Notify clients about update only if there were old caches
        if (hasOldCache) {
          return self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              try {
                client.postMessage({
                  type: 'UPDATE_AVAILABLE',
                  message: 'New version installed',
                  version: '1.2.0'
                });
              } catch (error) {
                console.warn('Service Worker: Failed to notify client', error);
              }
            });
          });
        }
        
        return self.clients.claim();
      });
    })
    .catch((error) => {
      console.error('Service Worker: Activation failed', error);
    })
  );
});

// FIXED: Enhanced fetch event with better error handling
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and non-http requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Skip chrome-extension and other special requests
  if (event.request.url.includes('chrome-extension') || 
      event.request.url.includes('moz-extension')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }

        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache the new response
            caches.open(CACHE_NAME)
              .then((cache) => {
                try {
                  cache.put(event.request, responseToCache);
                } catch (error) {
                  console.warn('Service Worker: Failed to cache response', error);
                }
              })
              .catch((error) => {
                console.warn('Service Worker: Cache operation failed', error);
              });

            return response;
          })
          .catch((error) => {
            console.warn('Service Worker: Network fetch failed', error);
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html')
                .then(fallbackResponse => {
                  if (fallbackResponse) {
                    return fallbackResponse;
                  }
                  // Create a minimal offline response
                  return new Response(
                    '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
                    { headers: { 'Content-Type': 'text/html' } }
                  );
                });
            }
            
            throw error;
          });
      })
      .catch((error) => {
        console.error('Service Worker: Fetch event failed', error);
        
        // Return minimal error response
        return new Response(
          '<html><body><h1>Error</h1><p>Something went wrong.</p></body></html>',
          { 
            status: 500,
            headers: { 'Content-Type': 'text/html' } 
          }
        );
      })
  );
});

// FIXED: Enhanced message handling
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);

  try {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  } catch (error) {
    console.error('Service Worker: Message handling failed', error);
  }
});

// FIXED: Enhanced background sync
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      doBackgroundSync().catch((error) => {
        console.error('Service Worker: Background sync failed', error);
      })
    );
  }
});

function doBackgroundSync() {
  return Promise.resolve();
}

// FIXED: Enhanced push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);

  const defaultOptions = {
    body: 'New update available for PRATIX FINANCE',
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'pratix-finance-notification'
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/favicon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.png'
      }
    ]
  };

  let options = defaultOptions;
  
  try {
    if (event.data) {
      const data = event.data.json();
      options = { ...defaultOptions, ...data };
    }
  } catch (error) {
    console.warn('Service Worker: Failed to parse push data', error);
  }

  event.waitUntil(
    self.registration.showNotification('PRATIX FINANCE', options)
      .catch((error) => {
        console.error('Service Worker: Failed to show notification', error);
      })
  );
});

// FIXED: Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click', event);
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
        .catch((error) => {
          console.error('Service Worker: Failed to open window', error);
        })
    );
  }
});

console.log('Service Worker: Script loaded successfully');
