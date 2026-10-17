import { describe, expect, mock, test } from 'bun:test'
import {
	getNotificationPermission,
	NOTIFICATION_WORKER_URL,
	type NotificationApi,
	registerNotificationServiceWorker,
	requestNotificationPermission,
	type ServiceWorkerRegistrar,
} from '~/lib/notifications/browser-permission'

type PromptBehaviour = (
	callback?: NotificationPermissionCallback,
) => Promise<NotificationPermission> | undefined

function createNotificationApi(
	permission: NotificationPermission,
	behaviour: PromptBehaviour = async () => 'granted',
) {
	const api = {
		permission,
		requestPermission: mock((callback?: NotificationPermissionCallback) => behaviour(callback)),
	}
	return api as typeof api & NotificationApi
}

/** Prompt that answers with `outcome` and updates `permission` like a real browser. */
function answersWith(outcome: NotificationPermission) {
	const api = createNotificationApi('default', async () => {
		api.permission = outcome
		return outcome
	})
	return api
}

function createRegistrar() {
	const registration = { scope: '/' } as ServiceWorkerRegistration
	const registrar = {
		register: mock(async () => registration),
	}
	return { registrar: registrar as typeof registrar & ServiceWorkerRegistrar, registration }
}

/**
 * What a fresh page load does: the root provider registers the worker and the
 * opt-in card reads the current permission.
 */
async function simulateMount(api: NotificationApi | null, registrar: ServiceWorkerRegistrar) {
	await registerNotificationServiceWorker(registrar)
	return getNotificationPermission(api)
}

describe('page load (no user action)', () => {
	test('a fresh mount registers the worker without prompting', async () => {
		const api = createNotificationApi('default')
		const { registrar } = createRegistrar()

		const status = await simulateMount(api, registrar)

		expect(status).toBe('default')
		expect(registrar.register).toHaveBeenCalledTimes(1)
		expect(registrar.register).toHaveBeenCalledWith(NOTIFICATION_WORKER_URL, { scope: '/' })
		expect(api.requestPermission).not.toHaveBeenCalled()
	})

	test('a Strict Mode remount still never prompts', async () => {
		const api = createNotificationApi('default')
		const { registrar } = createRegistrar()

		await simulateMount(api, registrar)
		await simulateMount(api, registrar)

		expect(registrar.register).toHaveBeenCalledTimes(2)
		expect(api.requestPermission).not.toHaveBeenCalled()
	})

	test('worker registration failures are contained', async () => {
		const registrar = {
			register: mock(async () => {
				throw new Error('SecurityError')
			}),
		} as unknown as ServiceWorkerRegistrar

		await expect(registerNotificationServiceWorker(registrar)).resolves.toBeNull()
	})

	test('missing service worker support is a no-op', async () => {
		await expect(registerNotificationServiceWorker(null)).resolves.toBeNull()
	})
})

describe('getNotificationPermission', () => {
	test('reports unsupported when the Notification API is missing', () => {
		expect(getNotificationPermission(null)).toBe('unsupported')
	})

	test.each(['default', 'denied', 'granted'] as const)('reads %s without prompting', (permission) => {
		const api = createNotificationApi(permission)

		expect(getNotificationPermission(api)).toBe(permission)
		expect(api.requestPermission).not.toHaveBeenCalled()
	})

	test('treats an unknown permission value as default', () => {
		const api = createNotificationApi('default')
		;(api as { permission: string }).permission = 'prompt'

		expect(getNotificationPermission(api)).toBe('default')
	})
})

describe('requestNotificationPermission (user action)', () => {
	test('prompts once and returns granted', async () => {
		const api = answersWith('granted')

		const result = await requestNotificationPermission(api)

		expect(result).toEqual({ status: 'granted', prompted: true })
		expect(api.requestPermission).toHaveBeenCalledTimes(1)
	})

	test('returns denied when the user blocks the prompt', async () => {
		const api = answersWith('denied')

		await expect(requestNotificationPermission(api)).resolves.toEqual({
			status: 'denied',
			prompted: true,
		})
	})

	test('returns default when the user dismisses the prompt', async () => {
		const api = answersWith('default')

		await expect(requestNotificationPermission(api)).resolves.toEqual({
			status: 'default',
			prompted: true,
		})
	})

	test.each(['granted', 'denied'] as const)(
		'does not prompt again once permission is %s',
		async (permission) => {
			const api = createNotificationApi(permission)

			const result = await requestNotificationPermission(api)

			expect(result).toEqual({ status: permission, prompted: false })
			expect(api.requestPermission).not.toHaveBeenCalled()
		},
	)

	test('a second action after a decision does not re-prompt', async () => {
		const api = answersWith('denied')

		await requestNotificationPermission(api)
		const second = await requestNotificationPermission(api)

		expect(second).toEqual({ status: 'denied', prompted: false })
		expect(api.requestPermission).toHaveBeenCalledTimes(1)
	})

	test('reports unsupported browsers without throwing', async () => {
		await expect(requestNotificationPermission(null)).resolves.toEqual({
			status: 'unsupported',
			prompted: false,
		})
	})

	test('turns a rejected request into a result instead of an unhandled rejection', async () => {
		const failure = new Error('Permission request was blocked')
		const api = createNotificationApi('default', () => Promise.reject(failure))

		const result = await requestNotificationPermission(api)

		expect(result).toEqual({ status: 'default', prompted: true, error: failure })
	})

	test('turns a synchronous throw into a result', async () => {
		const failure = new TypeError('Illegal invocation')
		const api = createNotificationApi('default', () => {
			throw failure
		})

		const result = await requestNotificationPermission(api)

		expect(result.error).toBe(failure)
		expect(result.status).toBe('default')
	})

	test('supports the legacy callback-only API', async () => {
		const api = createNotificationApi('default', (callback) => {
			queueMicrotask(() => callback?.('granted'))
			return undefined
		})

		await expect(requestNotificationPermission(api)).resolves.toEqual({
			status: 'granted',
			prompted: true,
		})
	})

	test('falls back to the live permission when the browser returns an unexpected value', async () => {
		const api = createNotificationApi('default', async () => {
			api.permission = 'denied'
			return 'prompt' as NotificationPermission
		})

		await expect(requestNotificationPermission(api)).resolves.toEqual({
			status: 'denied',
			prompted: true,
		})
	})
})
