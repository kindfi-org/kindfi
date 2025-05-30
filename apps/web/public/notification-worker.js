const CACHE_NAME = 'notifications-cache-v1'
const NOTIFICATION_ICON = '/icons/notification-icon.png'

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll([NOTIFICATION_ICON, '/offline.html'])
		}),
	)
})

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name)),
			)
		}),
	)
})

self.addEventListener('push', (event) => {
	if (!event.data) return

	try {
		const notification = event.data.json()

		const options = {
			body: notification.message,
			icon: NOTIFICATION_ICON,
			badge: NOTIFICATION_ICON,
			data: notification.metadata,
			actions: [
				{
					action: 'open',
					title: 'Open',
				},
				{
					action: 'dismiss',
					title: 'Dismiss',
				},
			],
			tag: notification.id,
			renotify: true,
			requireInteraction: true,
		}

		event.waitUntil(
			self.registration.showNotification(notification.title, options),
		)
	} catch (error) {
		console.error('Error handling push notification:', error)
	}
})

self.addEventListener('notificationclick', (event) => {
	event.notification.close()

	if (event.action === 'open') {
		const urlToOpen = event.notification.data?.url || '/notifications'

		event.waitUntil(
			clients.matchAll({ type: 'window' }).then((clientList) => {
				for (const client of clientList) {
					if (client.url === urlToOpen && 'focus' in client) {
						return client.focus()
					}
				}
				return clients.openWindow(urlToOpen)
			}),
		)
	}
})

self.addEventListener('sync', (event) => {
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

		const notifications = await response.json()

		for (const notification of notifications) {
			await self.registration.showNotification(notification.title, {
				body: notification.message,
				icon: NOTIFICATION_ICON,
				badge: NOTIFICATION_ICON,
				data: notification.metadata,
				tag: notification.id,
			})
		}
	} catch (error) {
		console.error('Error syncing notifications:', error)
	}
}
