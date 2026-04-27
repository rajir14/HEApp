// Service Worker — Home Expense Tracker
// Caches the app shell so it loads fast and works offline (view only)

const CACHE_NAME = 'home-expense-v1';

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json'
];

// Install: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, cache fallback (for Firebase calls, always network)
self.addEventListener('fetch', event => {
  // Always use network for Firebase API calls
  if (event.request.url.includes('firebaseio.com') ||
      event.request.url.includes('googleapis.com')) {
    return; // Let browser handle Firebase requests normally
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache fresh responses
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request)) // Fallback to cache if offline
  );
});
