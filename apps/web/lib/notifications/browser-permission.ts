import { logger } from '~/lib/logger'

/**
 * Browser notification helpers.
 *
 * Reading the permission and registering the worker are safe to run on mount.
 * Only `requestNotificationPermission` can show a browser prompt, and it must be
 * called from an explicit user action (e.g. a button click).
 */

export const NOTIFICATION_WORKER_URL = '/notification-worker.js'

export type NotificationPermissionStatus = NotificationPermission | 'unsupported'

export interface NotificationPermissionResult {
	status: NotificationPermissionStatus
	/** Whether the browser was actually asked; false when the decision was already made. */
	prompted: boolean
	/** Set when the browser threw or rejected while prompting. */
	error?: unknown
}

export type NotificationApi = Pick<typeof Notification, 'permission' | 'requestPermission'>
export type ServiceWorkerRegistrar = Pick<ServiceWorkerContainer, 'register'>

const KNOWN_PERMISSIONS: readonly NotificationPermission[] = ['default', 'denied', 'granted']

function isNotificationPermission(value: unknown): value is NotificationPermission {
	return KNOWN_PERMISSIONS.includes(value as NotificationPermission)
}

export function resolveNotificationApi(): NotificationApi | null {
	if (typeof window === 'undefined' || !('Notification' in window)) return null
	return window.Notification
}

export function resolveServiceWorkerRegistrar(): ServiceWorkerRegistrar | null {
	if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null
	return navigator.serviceWorker
}

/** Reads the current permission without prompting the user. */
export function getNotificationPermission(
	api: NotificationApi | null = resolveNotificationApi(),
): NotificationPermissionStatus {
	if (!api) return 'unsupported'
	return isNotificationPermission(api.permission) ? api.permission : 'default'
}

/**
 * Older Safari only supports the callback form of `requestPermission` and
 * returns `undefined` instead of a promise, so accept whichever settles first.
 */
function promptForPermission(api: NotificationApi): Promise<NotificationPermission> {
	return new Promise((resolve, reject) => {
		try {
			const maybePromise = api.requestPermission(resolve) as
				| Promise<NotificationPermission>
				| undefined
			maybePromise?.then(resolve, reject)
		} catch (error) {
			reject(error)
		}
	})
}

/**
 * Asks the browser for notification permission. Call this only from a user
 * gesture. Never rejects: failures come back as `{ error }` with the
 * permission the browser reports afterwards.
 */
export async function requestNotificationPermission(
	api: NotificationApi | null = resolveNotificationApi(),
): Promise<NotificationPermissionResult> {
	const current = getNotificationPermission(api)

	// Browsers only prompt from `default`. Once the user has decided, asking
	// again is a no-op at best and gets the site's prompts throttled at worst.
	if (!api || current !== 'default') {
		return { status: current, prompted: false }
	}

	try {
		const permission = await promptForPermission(api)
		return {
			status: isNotificationPermission(permission) ? permission : getNotificationPermission(api),
			prompted: true,
		}
	} catch (error) {
		logger.warn('Notification permission request failed', error)
		return { status: getNotificationPermission(api), prompted: true, error }
	}
}

/**
 * Registers the notification service worker. This does not request
 * notification permission, so it is safe to run on every mount; repeat
 * registrations of the same script resolve to the existing registration.
 */
export async function registerNotificationServiceWorker(
	registrar: ServiceWorkerRegistrar | null = resolveServiceWorkerRegistrar(),
): Promise<ServiceWorkerRegistration | null> {
	if (!registrar) return null

	try {
		return await registrar.register(NOTIFICATION_WORKER_URL, { scope: '/' })
	} catch (error) {
		logger.error('Service worker registration failed:', error)
		return null
	}
}
