/// <reference lib="webworker" />

import type { Database } from '@services/supabase'

type Notification = {
	title: string
	message: string
	action_url?: string
	metadata?: Record<string, unknown>
}

const CACHE_NAME = 'notification-cache-v1'

// Type assertion for service worker context
const sw = self as unknown as ServiceWorkerGlobalScope

sw.addEventListener('push', ((event: PushEvent) => {
	if (!event.data) return

	try {
		const data = event.data.json() as Notification
		const options: NotificationOptions = {
			body: data.message,
			icon: '/favicon.ico',
			badge: '/favicon.ico',
			data: {
				...data.metadata,
				action_url: data.action_url,
			},
			tag: data.metadata?.notificationId as string,
			requireInteraction: true,
		}

		event.waitUntil(sw.registration.showNotification(data.title, options))
	} catch (error) {
		console.error('Error handling push event:', error)
		// Log the error to the server
		event.waitUntil(
			fetch('/api/notifications/log', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					type: 'push_error',
					error: error instanceof Error ? error.message : String(error),
					data: event.data?.text(),
				}),
			}).catch(console.error),
		)
	}
}) as EventListener)

sw.addEventListener('notificationclick', ((event: NotificationEvent) => {
	event.notification.close()

	const notificationData = event.notification.data as { action_url?: string }

	if (event.action === 'open' && notificationData?.action_url) {
		event.waitUntil(
			sw.clients
				.matchAll({ type: 'window' })
				.then((clientList: readonly WindowClient[]) => {
					// Check if there's already a window/tab open with the target URL
					const url = new URL(
						notificationData.action_url || '',
						sw.location.origin,
					).href
					const existingClient = clientList.find((client) => client.url === url)

					if (existingClient) {
						// Focus the existing window/tab
						return existingClient.focus()
					}

					// Open a new window/tab
					return sw.clients.openWindow(url)
				}),
		)
	}
}) as EventListener)

sw.addEventListener('install', ((event: ExtendableEvent) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll([
				'/favicon.ico',
				'/notification-worker.js',
				// Add other assets to cache
			])
		}),
	)
}) as EventListener)

sw.addEventListener('activate', ((event: ExtendableEvent) => {
	event.waitUntil(
		Promise.all([
			// Clean up old caches
			caches
				.keys()
				.then((cacheNames) => {
					return Promise.all(
						cacheNames
							.filter((name) => name !== CACHE_NAME)
							.map((name) => caches.delete(name)),
					)
				}),
			// Take control of all clients
			sw.clients.claim(),
		]),
	)
}) as EventListener)

// Handle background sync
sw.addEventListener('sync', ((event: ExtendableEvent & { tag: string }) => {
	if (event.tag === 'sync-notifications') {
		event.waitUntil(
			fetch('/api/notifications/sync', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			}).catch(console.error),
		)
	}
}) as EventListener)
