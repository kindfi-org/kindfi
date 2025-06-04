/// <reference lib="webworker" />
/// <reference lib="es2015" />

function getConfig() {
	const options = self.registration?.options || {}
	return {
		CACHE_NAME: options.CACHE_NAME || 'notifications-cache-v1',
		NOTIFICATION_ICON:
			options.NOTIFICATION_ICON || '/icons/notification-icon.png',
	}
}

// Install event
self.addEventListener('install', (event) => {
	const { CACHE_NAME, NOTIFICATION_ICON } = getConfig()
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll([NOTIFICATION_ICON, '/offline.html'])
		}),
	)
})

// Activate event
self.addEventListener('activate', (event) => {
	const { CACHE_NAME } = getConfig()
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

function isPushMessageData(obj) {
	return !!obj && typeof obj.text === 'function'
}

function isString(obj) {
	return typeof obj === 'string'
}

// Push event
self.addEventListener('push', (event) => {
	const { NOTIFICATION_ICON } = getConfig()
	try {
		event.waitUntil(
			(async () => {
				if (!event.data) return
				let raw
				if (isString(event.data)) {
					raw = event.data
				} else if (isPushMessageData(event.data)) {
					raw = await event.data.text()
				} else {
					raw = ''
				}
				let notification = null
				try {
					const parsed = JSON.parse(raw)
					if (
						parsed &&
						typeof parsed.id === 'string' &&
						typeof parsed.title === 'string' &&
						typeof parsed.message === 'string' &&
						parsed.metadata &&
						typeof parsed.metadata === 'object'
					) {
						notification = parsed
					}
				} catch (err) {
					console.error('Invalid notification JSON:', err)
				}
				if (!notification) return

				await self.registration.showNotification(notification.title, {
					body: notification.message,
					icon: NOTIFICATION_ICON,
					badge: NOTIFICATION_ICON,
					data: notification,
					tag: notification.id,
					requireInteraction: true,
				})
			})(),
		)
	} catch (error) {
		console.error('Error handling push notification:', error)
	}
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
	event.notification.close()
	const urlToOpen = event.notification.data?.url || '/notifications'
	event.waitUntil(
		self.clients.matchAll({ type: 'window' }).then((clientList) => {
			for (const client of clientList) {
				if (client.url === urlToOpen) {
					return client.focus()
				}
			}
			return self.clients.openWindow(urlToOpen)
		}),
	)
})

// Sync event
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

		const data = await response.json()
		if (!Array.isArray(data)) {
			throw new Error('Invalid notifications response')
		}

		for (const notification of data) {
			if (
				notification &&
				typeof notification.id === 'string' &&
				typeof notification.title === 'string' &&
				typeof notification.message === 'string' &&
				notification.metadata &&
				typeof notification.metadata === 'object'
			) {
				await self.registration.showNotification(notification.title, {
					body: notification.message,
					icon: NOTIFICATION_ICON,
					badge: NOTIFICATION_ICON,
					data: notification,
					tag: notification.id,
				})
			}
		}
	} catch (error) {
		console.error('Error syncing notifications:', error)
	}
}
