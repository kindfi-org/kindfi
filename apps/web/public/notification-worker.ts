/// <reference lib="webworker" />


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

interface PushNotificationData {
	title: string;
	message: string;
	metadata: object;
	icon?: string;
	badge?: string;
	actions?: Array<{ action: string; title: string; icon?: string }>;
}

interface SyncManager {
	register(tag: string): Promise<void>;
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
	sync?: SyncManager;
}

function validatePushData(data: unknown): PushNotificationData {
	if (!data || typeof data !== 'object') {
		throw new Error('Invalid notification data');
	}
	
	const notification = data as Record<string, unknown>;
	
	// Validate required fields
	if (!notification.title || typeof notification.title !== 'string') {
		throw new Error('Invalid notification title');
	}
	if (!notification.message || typeof notification.message !== 'string') {
		throw new Error('Invalid notification message');
	}
	if (!notification.metadata || typeof notification.metadata !== 'object') {
		throw new Error('Invalid notification metadata');
	}
	
	// Validate optional fields
	if (notification.icon !== undefined && typeof notification.icon !== 'string') {
		throw new Error('Invalid notification icon');
	}
	if (notification.badge !== undefined && typeof notification.badge !== 'string') {
		throw new Error('Invalid notification badge');
	}
	if (notification.actions !== undefined) {
		if (!Array.isArray(notification.actions)) {
			throw new Error('Invalid notification actions');
		}
		// Validate each action
		notification.actions.forEach((action, index) => {
			if (!action || typeof action !== 'object') {
				throw new Error(`Invalid action at index ${index}`);
			}
			if (!action.action || typeof action.action !== 'string') {
				throw new Error(`Invalid action name at index ${index}`);
			}
			if (!action.title || typeof action.title !== 'string') {
				throw new Error(`Invalid action title at index ${index}`);
			}
			if (action.icon !== undefined && typeof action.icon !== 'string') {
				throw new Error(`Invalid action icon at index ${index}`);
			}
		});
	}
	
	// Create a properly typed object
	const validatedData: PushNotificationData = {
		title: notification.title as string,
		message: notification.message as string,
		metadata: notification.metadata as object,
		icon: notification.icon as string | undefined,
		badge: notification.badge as string | undefined,
		actions: notification.actions as Array<{ action: string; title: string; icon?: string }> | undefined
	};
	
	return validatedData;
}

sw.addEventListener('push', (event: PushEvent) => {
	if (!event.data) {
		console.warn('Push event received without data');
		return;
	}

	try {
		const rawData = event.data.json();
		const data = validatePushData(rawData);
		
		const options: NotificationOptions = {
			body: data.message,
			icon: data.icon,
			badge: data.badge,
			data: data.metadata,
			requireInteraction: true,
			tag: 'notification',
			// Add actions if they exist
			...(data.actions && { actions: data.actions })
		};

		event.waitUntil(
			sw.registration.showNotification(data.title, options)
		);
	} catch (error) {
		console.error('Error handling push notification:', error);
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

async function handleSync(syncEvent: SyncEvent): Promise<void> {
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
		// Retry the sync later if supported
		const reg = sw.registration as ServiceWorkerRegistrationWithSync;
		if (reg.sync) {
			try {
				await reg.sync.register('notification-sync');
			} catch (retryError) {
				console.error('Failed to register sync retry:', retryError);
			}
		}
	}
}

sw.addEventListener('sync', ((event: ExtendableEvent) => {
	const syncEvent = event as unknown as SyncEvent;
	if (syncEvent.tag === 'notification-sync') {
		event.waitUntil(handleSync(syncEvent));
	}
}) as EventListener);
