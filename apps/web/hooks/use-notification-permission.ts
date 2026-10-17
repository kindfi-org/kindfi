import { useCallback, useEffect, useRef, useState } from 'react'
import {
	getNotificationPermission,
	type NotificationPermissionResult,
	type NotificationPermissionStatus,
	requestNotificationPermission,
} from '~/lib/notifications/browser-permission'

/**
 * Tracks browser notification permission and exposes an opt-in action.
 *
 * Mounting only reads the permission; the browser prompt is shown solely when
 * `requestPermission` is called, which should be wired to a user action.
 */
export function useNotificationPermission() {
	// `null` until mounted: the permission is unknown during server rendering.
	const [status, setStatus] = useState<NotificationPermissionStatus | null>(null)
	const [isRequesting, setIsRequesting] = useState(false)
	const pendingRequestRef = useRef<Promise<NotificationPermissionResult> | null>(null)

	useEffect(() => {
		setStatus(getNotificationPermission())
	}, [])

	const requestPermission = useCallback(() => {
		// Share one in-flight request so a double click can't stack prompts.
		if (!pendingRequestRef.current) {
			setIsRequesting(true)
			pendingRequestRef.current = requestNotificationPermission()
				.then((result) => {
					setStatus(result.status)
					return result
				})
				.finally(() => {
					pendingRequestRef.current = null
					setIsRequesting(false)
				})
		}

		return pendingRequestRef.current
	}, [])

	return { status, isRequesting, requestPermission }
}
