// Service Worker for handling push notifications
self.addEventListener('push', (event) => {
	if (!event.data) return

	try {
		const data = event.data.json()
		const options = {
			body: data.body,
			icon: '/icons/notification-icon.png',
			badge: '/icons/notification-badge.png',
			data: data.data || {},
			actions: data.actions || [],
			requireInteraction: true,
			tag: data.tag || 'default',
			renotify: data.renotify || false,
			silent: data.silent || false,
			timestamp: data.timestamp || Date.now(),
			vibrate: data.vibrate || [200, 100, 200],
		}

		event.waitUntil(self.registration.showNotification(data.title, options))
	} catch (error) {
		console.error('Error handling push event:', error)
	}
})

self.addEventListener('notificationclick', (event) => {
	event.notification.close()

	if (event.action) {
		// Handle custom actions
		const data = event.notification.data
		if (data?.actions?.[event.action]?.url) {
			event.waitUntil(clients.openWindow(data.actions[event.action].url))
		}
	} else {
		// Default click behavior
		const data = event.notification.data
		if (data?.url) {
			event.waitUntil(clients.openWindow(data.url))
		}
	}
})

self.addEventListener('notificationclose', (event) => {
	const data = event.notification.data
	if (data?.onClose) {
		// Handle notification close event
		console.log('Notification closed:', data)
	}
})

// Handle periodic sync
self.addEventListener('periodicsync', (event) => {
	if (event.tag === 'sync-notifications') {
		event.waitUntil(syncNotifications())
	}
})

async function syncNotifications() {
	try {
		const response = await fetch('/api/notifications/sync', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			throw new Error('Failed to sync notifications')
		}

		const data = await response.json()
		console.log('Notifications synced:', data)
	} catch (error) {
		console.error('Error syncing notifications:', error)
	}
}

// Handle background sync
self.addEventListener('sync', (event) => {
	if (event.tag === 'sync-notifications') {
		event.waitUntil(syncNotifications())
	}
})

// Handle service worker installation
self.addEventListener('install', (event) => {
	event.waitUntil(
		Promise.all([
			// Cache static assets
			caches
				.open('notification-assets-v1')
				.then((cache) => {
					return cache.addAll([
						// '/icons/notification-icon.png',
						// '/icons/notification-badge.png',
					])
				}),
			// Skip waiting to activate immediately
			self.skipWaiting(),
		]),
	)
})

// Handle service worker activation
self.addEventListener('activate', (event) => {
	event.waitUntil(
		Promise.all([
			// Clean up old caches
			caches
				.keys()
				.then((cacheNames) => {
					return Promise.all(
						cacheNames
							.filter((cacheName) => {
								return (
									cacheName.startsWith('notification-assets-') &&
									cacheName !== 'notification-assets-v1'
								)
							})
							.map((cacheName) => {
								return caches.delete(cacheName)
							}),
					)
				}),
			// Claim clients to ensure the service worker is in control
			self.clients.claim(),
		]),
	)
})

// Handle fetch events
self.addEventListener('fetch', (event) => {
	// Only handle requests to our API endpoints
	if (event.request.url.includes('/api/notifications/')) {
		event.respondWith(
			fetch(event.request).catch((error) => {
				console.error('Fetch failed:', error)
				// Return a fallback response or error
				return new Response('Network error occurred', {
					status: 503,
					statusText: 'Service Unavailable',
				})
			}),
		)
	}
})
