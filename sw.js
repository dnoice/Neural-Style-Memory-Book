/*
╔══════════════════════════════════════════════════════════════╗
║                        NEURAL STYLE MEMORY BOOK                          ║
║              Service Worker - PWA & Offline Functionality                ║
╠═══════════════════════════════════════════════════════════════╣
║ File: sw.js (Service Worker)                                             ║
║ Purpose: Progressive Web App capabilities with intelligent caching       ║
║ Version: 1.2.0                                                           ║
║ Author: Neural Style Memory Book Team                                    ║
║ Created: 2024                                                            ║
║                                                                          ║
║ Features:                                                                ║
║ • Intelligent multi-tier caching strategy                                ║
║ • Offline-first functionality for core app features                      ║
║ • Background sync for processing queue                                   ║
║ • Push notifications for completed processing                            ║
║ • Cache management with automatic cleanup                                ║
║ • Network-first strategy for dynamic content                             ║
║ • Stale-while-revalidate for images                                      ║
║ • Cache-first for static assets and AI models                            ║
║ • Graceful offline fallbacks                                             ║
║                                                                          ║
║ Caching Strategy:                                                        ║
║ • Static assets: Cache-first, 7-day expiration                           ║
║ • AI models: Cache-first, 30-day expiration                              ║
║ • Images: Stale-while-revalidate, 7-day expiration                       ║
║ • API calls: Network-first with cache fallback                           ║
║ • HTML pages: Network-first, 24-hour cache                               ║
║                                                                          ║
║ Cache Sizes:                                                             ║
║ • Static cache: 100 entries max                                          ║
║ • Model cache: 20 entries max                                            ║
║ • Image cache: 200 entries max                                           ║
║ • Dynamic cache: 50 entries max                                          ║
║                                                                          ║
║ Browser Support: Service Workers (Chrome 40+, Firefox 44+, Safari 11.1+) ║
║ Fallback: Application works without service worker (degraded experience) ║
╚═══════════════════════════════════════════════════════════════╝
*/

/* Neural Style Memory Book - Service Worker */
/* PWA functionality with intelligent caching and offline support */

const CACHE_NAME = 'neural-style-memory-book-v1.2.0';
const STATIC_CACHE = 'neural-static-v1.2.0';
const DYNAMIC_CACHE = 'neural-dynamic-v1.2.0';
const MODEL_CACHE = 'neural-models-v1.2.0';
const IMAGE_CACHE = 'neural-images-v1.2.0';

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/variables.css',
    '/css/styles.css',
    '/css/queries.css',
    '/js/script.js',
    '/manifest.json',
    // External CDN resources (cached for offline use)
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js'
];

// Model files for intelligent caching
const MODEL_URLS = [
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js'
];

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
    NETWORK_ONLY: 'network-only',
    CACHE_ONLY: 'cache-only'
};

// Route configurations
const ROUTE_CONFIG = {
    static: {
        pattern: /\.(css|js|png|jpg|jpeg|svg|woff2?|ttf|eot)$/,
        strategy: CACHE_STRATEGIES.CACHE_FIRST,
        cacheName: STATIC_CACHE,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxEntries: 100
    },
    models: {
        pattern: /tensorflow|blazeface|mobilenet/,
        strategy: CACHE_STRATEGIES.CACHE_FIRST,
        cacheName: MODEL_CACHE,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 20
    },
    images: {
        pattern: /\.(jpg|jpeg|png|webp|gif)$/,
        strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
        cacheName: IMAGE_CACHE,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxEntries: 200
    },
    api: {
        pattern: /\/api\//,
        strategy: CACHE_STRATEGIES.NETWORK_FIRST,
        cacheName: DYNAMIC_CACHE,
        maxAge: 5 * 60 * 1000, // 5 minutes
        maxEntries: 50
    },
    html: {
        pattern: /\.html$|\/$/,
        strategy: CACHE_STRATEGIES.NETWORK_FIRST,
        cacheName: DYNAMIC_CACHE,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        maxEntries: 20
    }
};

// === SERVICE WORKER LIFECYCLE ===

self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        (async () => {
            try {
                // Cache static assets
                const staticCache = await caches.open(STATIC_CACHE);
                await staticCache.addAll(STATIC_ASSETS);
                
                // Cache AI models separately for better management
                const modelCache = await caches.open(MODEL_CACHE);
                await Promise.allSettled(
                    MODEL_URLS.map(url => 
                        fetch(url)
                            .then(response => response.ok ? modelCache.put(url, response) : null)
                            .catch(err => console.warn(`Model cache failed for ${url}:`, err))
                    )
                );
                
                console.log('✅ Service Worker installed successfully');
                
                // Skip waiting to activate immediately
                self.skipWaiting();
                
            } catch (error) {
                console.error('❌ Service Worker installation failed:', error);
            }
        })()
    );
});

self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        (async () => {
            try {
                // Clean up old caches
                await cleanupOldCaches();
                
                // Claim all clients immediately
                await self.clients.claim();
                
                // Initialize background sync if supported
                if ('sync' in self.registration) {
                    console.log('✅ Background sync available');
                }
                
                // Initialize periodic background sync if supported
                if ('periodicSync' in self.registration) {
                    console.log('✅ Periodic background sync available');
                }
                
                console.log('✅ Service Worker activated successfully');
                
            } catch (error) {
                console.error('❌ Service Worker activation failed:', error);
            }
        })()
    );
});

// === FETCH HANDLING ===

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Find matching route configuration
    const routeConfig = findMatchingRoute(url, request);
    
    if (routeConfig) {
        event.respondWith(handleRequest(request, routeConfig));
    }
});

// === CACHE STRATEGIES ===

async function handleRequest(request, config) {
    const { strategy, cacheName, maxAge, maxEntries } = config;
    
    try {
        switch (strategy) {
            case CACHE_STRATEGIES.CACHE_FIRST:
                return await cacheFirst(request, cacheName, maxAge);
                
            case CACHE_STRATEGIES.NETWORK_FIRST:
                return await networkFirst(request, cacheName, maxAge);
                
            case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
                return await staleWhileRevalidate(request, cacheName, maxAge);
                
            case CACHE_STRATEGIES.NETWORK_ONLY:
                return await fetch(request);
                
            case CACHE_STRATEGIES.CACHE_ONLY:
                return await cacheOnly(request, cacheName);
                
            default:
                return await fetch(request);
        }
    } catch (error) {
        console.error('❌ Request handling failed:', error);
        return await handleOfflineFallback(request);
    } finally {
        // Cleanup cache if needed
        await cleanupCache(cacheName, maxEntries);
    }
}

async function cacheFirst(request, cacheName, maxAge) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Check if cache is still valid
        const cacheTime = new Date(cachedResponse.headers.get('sw-cache-time') || 0);
        const isExpired = Date.now() - cacheTime.getTime() > maxAge;
        
        if (!isExpired) {
            return cachedResponse;
        }
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            await cacheResponse(cache, request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        if (cachedResponse) {
            console.warn('⚠️ Network failed, serving stale cache:', request.url);
            return cachedResponse;
        }
        throw error;
    }
}

async function networkFirst(request, cacheName, maxAge) {
    const cache = await caches.open(cacheName);
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            await cacheResponse(cache, request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.warn('⚠️ Network failed, trying cache:', request.url);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

async function staleWhileRevalidate(request, cacheName, maxAge) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Always try to update cache in background
    const networkPromise = fetch(request)
        .then(response => {
            if (response.ok) {
                cacheResponse(cache, request, response.clone());
            }
            return response;
        })
        .catch(error => {
            console.warn('⚠️ Background fetch failed:', error);
        });
    
    // Return cached version immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Wait for network if no cache
    return await networkPromise;
}

async function cacheOnly(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (!cachedResponse) {
        throw new Error('No cached response available');
    }
    
    return cachedResponse;
}

// === UTILITY FUNCTIONS ===

function findMatchingRoute(url, request) {
    // Check each route configuration
    for (const [name, config] of Object.entries(ROUTE_CONFIG)) {
        if (config.pattern.test(url.pathname) || config.pattern.test(url.href)) {
            return config;
        }
    }
    
    // Default to network-first for unmatched routes
    return {
        strategy: CACHE_STRATEGIES.NETWORK_FIRST,
        cacheName: DYNAMIC_CACHE,
        maxAge: 5 * 60 * 1000, // 5 minutes
        maxEntries: 50
    };
}

async function cacheResponse(cache, request, response) {
    // Add timestamp for cache validation
    const responseToCache = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
            ...response.headers,
            'sw-cache-time': new Date().toISOString()
        }
    });
    
    await cache.put(request, responseToCache);
}

async function cleanupCache(cacheName, maxEntries) {
    if (!maxEntries) return;
    
    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        if (keys.length > maxEntries) {
            // Remove oldest entries (simple FIFO)
            const keysToDelete = keys.slice(0, keys.length - maxEntries);
            await Promise.all(keysToDelete.map(key => cache.delete(key)));
            console.log(`🧹 Cleaned up ${keysToDelete.length} entries from ${cacheName}`);
        }
    } catch (error) {
        console.error(`❌ Cache cleanup failed for ${cacheName}:`, error);
    }
}

async function cleanupOldCaches() {
    try {
        const cacheNames = await caches.keys();
        const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, MODEL_CACHE, IMAGE_CACHE];
        
        const deletionPromises = cacheNames
            .filter(cacheName => !validCaches.includes(cacheName))
            .map(cacheName => {
                console.log(`🗑️ Deleting old cache: ${cacheName}`);
                return caches.delete(cacheName);
            });
        
        await Promise.all(deletionPromises);
        console.log('✅ Old caches cleaned up');
    } catch (error) {
        console.error('❌ Cache cleanup failed:', error);
    }
}

async function handleOfflineFallback(request) {
    const url = new URL(request.url);
    
    // For HTML requests, try to serve a cached page or offline page
    if (request.destination === 'document') {
        const cache = await caches.open(STATIC_CACHE);
        const cachedPage = await cache.match('/') || await cache.match('/index.html');
        
        if (cachedPage) {
            return cachedPage;
        }
        
        // Return a basic offline page
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Neural Style Memory Book - Offline</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                        text-align: center; 
                        padding: 2rem;
                        background: linear-gradient(135deg, #0f0f23 0%, #1e1b4b 100%);
                        color: white;
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }
                    h1 { color: #6366f1; margin-bottom: 1rem; }
                    p { margin-bottom: 2rem; opacity: 0.8; }
                    button {
                        background: #6366f1;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        font-size: 1rem;
                    }
                    button:hover { background: #5855eb; }
                </style>
            </head>
            <body>
                <h1>🧠 Neural Style Memory Book</h1>
                <p>You're currently offline. Please check your internet connection.</p>
                <button onclick="window.location.reload()">Try Again</button>
            </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
    }
    
    // For image requests, return a placeholder
    if (request.destination === 'image') {
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#1e1e3f"/><text x="200" y="150" text-anchor="middle" fill="#6366f1" font-family="Arial" font-size="16">Image Unavailable Offline</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
    
    // For other requests, throw error
    throw new Error('Offline and no cached response available');
}

// === BACKGROUND SYNC ===

self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'background-photo-processing') {
        event.waitUntil(processQueuedPhotos());
    } else if (event.tag === 'background-export') {
        event.waitUntil(processQueuedExports());
    }
});

async function processQueuedPhotos() {
    try {
        // Get queued photos from IndexedDB
        const queuedPhotos = await getQueuedPhotos();
        
        for (const photo of queuedPhotos) {
            await processPhotoInBackground(photo);
        }
        
        console.log('✅ Background photo processing completed');
    } catch (error) {
        console.error('❌ Background photo processing failed:', error);
    }
}

async function processQueuedExports() {
    try {
        // Get queued exports from IndexedDB
        const queuedExports = await getQueuedExports();
        
        for (const exportJob of queuedExports) {
            await processExportInBackground(exportJob);
        }
        
        console.log('✅ Background export processing completed');
    } catch (error) {
        console.error('❌ Background export processing failed:', error);
    }
}

// === PUSH NOTIFICATIONS ===

self.addEventListener('push', (event) => {
    console.log('📱 Push notification received');
    
    const options = {
        body: 'Your styled photos are ready!',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'neural-style-notification',
        data: {
            url: '/'
        },
        actions: [
            {
                action: 'view',
                title: 'View Album'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Neural Style Memory Book', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    }
});

// === MESSAGE HANDLING ===

self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_CACHE_USAGE':
            event.ports[0].postMessage(getCacheUsage());
            break;
            
        case 'CLEAR_CACHE':
            clearSpecificCache(data.cacheName)
                .then(() => event.ports[0].postMessage({ success: true }))
                .catch(error => event.ports[0].postMessage({ error: error.message }));
            break;
            
        case 'PREFETCH_MODELS':
            prefetchModels(data.models)
                .then(() => event.ports[0].postMessage({ success: true }))
                .catch(error => event.ports[0].postMessage({ error: error.message }));
            break;
    }
});

async function getCacheUsage() {
    try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage,
                quota: estimate.quota,
                percentage: Math.round((estimate.usage / estimate.quota) * 100)
            };
        }
    } catch (error) {
        console.error('❌ Failed to get cache usage:', error);
    }
    return null;
}

async function clearSpecificCache(cacheName) {
    try {
        await caches.delete(cacheName);
        console.log(`✅ Cache cleared: ${cacheName}`);
    } catch (error) {
        console.error(`❌ Failed to clear cache ${cacheName}:`, error);
        throw error;
    }
}

async function prefetchModels(modelUrls) {
    try {
        const cache = await caches.open(MODEL_CACHE);
        
        const fetchPromises = modelUrls.map(async url => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                    console.log(`✅ Prefetched model: ${url}`);
                }
            } catch (error) {
                console.warn(`⚠️ Failed to prefetch model ${url}:`, error);
            }
        });
        
        await Promise.allSettled(fetchPromises);
        console.log('✅ Model prefetching completed');
    } catch (error) {
        console.error('❌ Model prefetching failed:', error);
        throw error;
    }
}

// === INDEXEDDB HELPERS ===

async function getQueuedPhotos() {
    // Placeholder for IndexedDB integration
    return [];
}

async function getQueuedExports() {
    // Placeholder for IndexedDB integration  
    return [];
}

async function processPhotoInBackground(photo) {
    // Placeholder for background photo processing
    console.log('Processing photo in background:', photo);
}

async function processExportInBackground(exportJob) {
    // Placeholder for background export processing
    console.log('Processing export in background:', exportJob);
}

console.log('🧠 Neural Style Memory Book Service Worker loaded');
