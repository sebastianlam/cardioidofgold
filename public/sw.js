// Service Worker for The Contemplative Head PWA
const CACHE_NAME = 'contemplative-head-v1.2.0';
const STATIC_CACHE_NAME = 'contemplative-head-static-v1.2.0';

// Resources to cache for offline functionality
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/three.min.js',
  '/js/GLTFLoader.js', 
  '/js/OrbitControls.js',
  '/js/tween.umd.js',
  '/js/post-processing.js',
  '/js/particle-systems.js',
  '/js/advanced-ui.js',
  '/js/audio-system.js',
  '/js/performance.js',
  '/js/app.js',
  '/favicon.ico',
  '/manifest.json'
];

// Large assets that are cached separately
const DYNAMIC_RESOURCES = [
  '/faceSculpting.glb'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      }),
      
      // Cache dynamic resources
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Pre-caching large assets');
        return cache.addAll(DYNAMIC_RESOURCES);
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
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
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Handle static resources
  if (STATIC_RESOURCES.some(resource => url.pathname.endsWith(resource.split('/').pop()))) {
    event.respondWith(handleStaticResource(request));
    return;
  }
  
  // Handle large assets (3D models, textures)
  if (url.pathname.endsWith('.glb') || url.pathname.endsWith('.gltf') || 
      url.pathname.endsWith('.jpg') || url.pathname.endsWith('.png')) {
    event.respondWith(handleLargeAsset(request));
    return;
  }
  
  // Handle external resources (fonts, CDN assets)
  if (url.origin !== location.origin) {
    event.respondWith(handleExternalResource(request));
    return;
  }
  
  // Default: cache first, fallback to network
  event.respondWith(handleDefaultRequest(request));
});

// Handle navigation requests (cache first with network fallback)
async function handleNavigationRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cached = await cache.match('/index.html');
    
    if (cached) {
      // Serve cached version immediately
      const networkResponse = fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(() => cached);
      
      return cached;
    }
    
    return fetch(request);
  } catch (error) {
    console.error('Navigation request failed:', error);
    return new Response('Application offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Handle static resources (cache first)
async function handleStaticResource(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Static resource request failed:', error);
    throw error;
  }
}

// Handle large assets with progress tracking
async function handleLargeAsset(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('Serving cached large asset:', request.url);
      return cached;
    }
    
    console.log('Fetching large asset:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses
      cache.put(request, response.clone());
      
      // Notify clients of download progress if possible
      try {
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'ASSET_CACHED',
            url: request.url,
            size: response.headers.get('content-length')
          });
        });
      } catch (e) {
        // Ignore client messaging errors
      }
    }
    
    return response;
  } catch (error) {
    console.error('Large asset request failed:', error);
    
    // Return offline fallback if available
    const cache = await caches.open(CACHE_NAME);
    const fallback = await cache.match('/offline-fallback.html');
    return fallback || new Response('Asset unavailable offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Handle external resources (network first with cache fallback)
async function handleExternalResource(request) {
  try {
    const response = await fetch(request, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('External resource failed, trying cache:', request.url);
    
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return a fallback for critical external resources
    if (request.url.includes('font')) {
      return new Response('', { status: 204 });
    }
    
    throw error;
  }
}

// Default request handler
async function handleDefaultRequest(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Default request failed:', error);
    throw error;
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      cacheUrls(data.urls);
      break;
      
    case 'CLEAR_CACHE':
      clearCache(data.cacheName);
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ size });
      });
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Cache specific URLs on demand
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'URLS_CACHED',
        urls: urls
      });
    });
  } catch (error) {
    console.error('Failed to cache URLs:', error);
  }
}

// Clear specific cache
async function clearCache(cacheName) {
  try {
    const deleted = await caches.delete(cacheName || CACHE_NAME);
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_CLEARED',
        cacheName: cacheName,
        success: deleted
      });
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

// Get total cache size
async function getCacheSize() {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Failed to calculate cache size:', error);
    return 0;
  }
}

// Background sync for when connectivity is restored
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Refresh critical resources when back online
    const cache = await caches.open(STATIC_CACHE_NAME);
    
    const updates = STATIC_RESOURCES.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.log('Failed to update:', url);
      }
    });
    
    await Promise.allSettled(updates);
    
    // Notify clients that resources are updated
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'RESOURCES_UPDATED'
      });
    });
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Performance monitoring
self.addEventListener('fetch', (event) => {
  // Log performance metrics for optimization
  const start = performance.now();
  
  event.respondWith(
    handleRequest(event.request).then(response => {
      const end = performance.now();
      const duration = end - start;
      
      // Log slow requests for optimization
      if (duration > 1000) {
        console.log(`Slow request: ${event.request.url} took ${duration}ms`);
      }
      
      return response;
    })
  );
});

// Route requests to appropriate handlers
async function handleRequest(request) {
  // This delegates to the existing handlers above
  if (request.mode === 'navigate') {
    return handleNavigationRequest(request);
  }
  
  return handleDefaultRequest(request);
} 