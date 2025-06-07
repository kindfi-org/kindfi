/// <reference lib="webworker" />

import type { Notification } from '../lib/types/notification';

const sw = self as unknown as ServiceWorkerGlobalScope;

interface SyncEvent extends ExtendableEvent {
	tag: string;
	notificationId?: string;
	status?: 'delivered' | 'failed';
	error?: string;
}

interface NotificationData {
	action_url?: string;
	notificationId?: string;
}

sw.addEventListener('push', (event: PushEvent) => {
	if (!event.data) {
		console.warn('Push event received without data');
		return;
	}

	try {
		const data = event.data.json();
		
		// Validate required fields
		if (!data.title || typeof data.title !== 'string') {
			throw new Error('Invalid notification title');
		}
		if (!data.message || typeof data.message !== 'string') {
			throw new Error('Invalid notification message');
		}
		if (!data.metadata || typeof data.metadata !== 'object') {
			throw new Error('Invalid notification metadata');
		}

		// Validate optional fields if present
		if (data.icon && typeof data.icon !== 'string') {
			throw new Error('Invalid notification icon');
		}
		if (data.badge && typeof data.badge !== 'string') {
			throw new Error('Invalid notification badge');
		}
		if (data.actions && !Array.isArray(data.actions)) {
			throw new Error('Invalid notification actions');
		}

		const options = {
			body: data.message,
			icon: data.icon || '/icons/notification-icon.png',
			badge: data.badge || '/icons/notification-badge.png',
			data: data.metadata,
			requireInteraction: true,
			actions: data.actions || []
		};

		event.waitUntil(
			sw.registration.showNotification(data.title, options)
				.catch(error => {
					console.error('Failed to show notification:', error);
					// Optionally report the error to your logging service
				})
		);
	} catch (error) {
		console.error('Failed to process push notification:', error);
		// Optionally report the error to your logging service
	}
});

sw.addEventListener('notificationclick', (event: NotificationEvent) => {
	event.notification.close();

	try {
		const notificationData = event.notification.data as NotificationData;
		const url = new URL(notificationData?.action_url || '/', sw.location.origin);
		
		event.waitUntil(
			sw.clients.matchAll({
				type: 'window',
				includeUncontrolled: true
			}).then((windowClients) => {
				// Check if there is already a window/tab open with the target URL
				for (const client of windowClients) {
					if (client.url === url.toString() && 'focus' in client) {
						return client.focus();
					}
				}
				// If no window/tab is already open, open a new one
				return sw.clients.openWindow(url.toString());
			})
		);
	} catch (error) {
		console.error('Error handling notification click:', error);
		// Fallback to opening the home page if URL construction fails
		event.waitUntil(sw.clients.openWindow('/'));
	}
});

sw.addEventListener('sync', ((event: ExtendableEvent) => {
	const syncEvent = event as unknown as SyncEvent;
	if (syncEvent.tag === 'notification-sync') {
		syncEvent.waitUntil(
			(async () => {
				try {
					const response = await fetch('/api/notifications/sync', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							notificationId: syncEvent.notificationId,
							status: syncEvent.status,
							error: syncEvent.error,
							timestamp: Date.now()
						})
					});

					if (!response.ok) {
						throw new Error(`Sync failed: ${response.statusText}`);
					}
				} catch (error) {
					console.error('Background sync failed:', error);
					// You might want to retry the sync later
					if ('sync' in sw.registration) {
						syncEvent.waitUntil(
							(sw.registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } })
								.sync.register('notification-sync')
						);
					}
				}
			})()
		);
	}
}) as EventListener);
