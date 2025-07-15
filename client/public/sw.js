// Service Worker for Push Notifications
const CACHE_NAME = 'siraha-bazaar-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/notification-icon.png',
  '/icons/delivery-icon.png',
  '/icons/order-icon.png',
  '/icons/location-icon.png',
  '/icons/delivered-icon.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Professional push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const { title, body, icon, badge, actions, requireInteraction, data: notificationData, type } = data;

  // Professional notification options based on type
  const getNotificationOptions = (type) => {
    const baseOptions = {
      body,
      icon: icon || '/favicon.ico',
      badge: badge || '/favicon.ico',
      data: notificationData,
      tag: `siraha-${type || 'general'}-${Date.now()}`,
      timestamp: Date.now(),
      silent: false
    };

    switch (type) {
      case 'delivery_assignment':
        return {
          ...baseOptions,
          requireInteraction: true,
          vibrate: [300, 200, 300, 200, 300],
          actions: [
            { action: 'accept', title: '✅ Accept', icon: '/favicon.ico' },
            { action: 'view', title: '👁️ View Details', icon: '/favicon.ico' }
          ]
        };
      
      case 'order_update':
        return {
          ...baseOptions,
          requireInteraction: false,
          vibrate: [200, 100, 200],
          actions: [
            { action: 'track', title: '📍 Track Order', icon: '/favicon.ico' }
          ]
        };
      
      case 'approval':
        return {
          ...baseOptions,
          requireInteraction: true,
          vibrate: [500, 200, 500],
          actions: [
            { action: 'view', title: '🎉 View Dashboard', icon: '/favicon.ico' }
          ]
        };
      
      default:
        return {
          ...baseOptions,
          requireInteraction: false,
          vibrate: [200, 100, 200],
          actions: actions || []
        };
    }
  };

  const options = getNotificationOptions(notificationData?.type);

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { action } = event;
  const { orderId, deliveryId, type } = event.notification.data || {};

  let url = '/';

  // Handle different notification actions
  if (action === 'track' && orderId) {
    url = `/order-tracking/${orderId}`;
  } else if (action === 'view_map' && deliveryId) {
    url = `/delivery-tracking/${deliveryId}`;
  } else if (action === 'accept' && orderId) {
    url = `/delivery-partner/orders/${orderId}`;
  } else if (action === 'rate' && orderId) {
    url = `/orders/${orderId}/review`;
  } else if (action === 'view_order' && orderId) {
    url = `/orders/${orderId}`;
  } else if (type === 'delivery_assignment') {
    url = '/delivery-partner/dashboard';
  } else if (type === 'order_update' && orderId) {
    url = `/order-tracking/${orderId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing tab if available
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Background sync for offline delivery updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'delivery-location-sync') {
    event.waitUntil(syncDeliveryLocation());
  }
});

async function syncDeliveryLocation() {
  try {
    // Get stored location updates from IndexedDB
    const db = await openDB();
    const updates = await getStoredLocationUpdates(db);
    
    for (const update of updates) {
      try {
        await fetch('/api/tracking/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
        });
        
        // Remove synced update
        await removeLocationUpdate(db, update.id);
      } catch (error) {
        console.error('Failed to sync location update:', error);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SirahaBazaarDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('locationUpdates')) {
        const store = db.createObjectStore('locationUpdates', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

function getStoredLocationUpdates(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['locationUpdates'], 'readonly');
    const store = transaction.objectStore('locationUpdates');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeLocationUpdate(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['locationUpdates'], 'readwrite');
    const store = transaction.objectStore('locationUpdates');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}