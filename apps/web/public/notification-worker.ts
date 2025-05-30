interface NotificationData {
	id: string
	title: string
	message: string
	metadata: Record<string, unknown>
}

const CACHE_NAME = 'notifications-cache-v1'
const NOTIFICATION_ICON = '/icons/notification-icon.png'

self.addEventListener('install', (event: ExtendableMessageEvent) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll([NOTIFICATION_ICON, '/offline.html'])
		}),
	)
})

self.addEventListener('activate', (event: ExtendableMessageEvent) => {
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

self.addEventListener('push', (event: PushEvent) => {
	if (!event.data) return

	try {
		const notification = event.data.json() as NotificationData

		const options: NotificationOptions = {
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

self.addEventListener('notificationclick', (event: NotificationEvent) => {
	event.notification.close()

	if (event.action === 'open') {
		const urlToOpen =
			(event.notification.data as NotificationData)?.url || '/notifications'

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

self.addEventListener('sync', (event: SyncEvent) => {
	if (event.tag === 'sync-notifications') {
		event.waitUntil(syncNotifications())
	}
})

async function syncNotifications(): Promise<void> {
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

		const notifications = (await response.json()) as NotificationData[]

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
