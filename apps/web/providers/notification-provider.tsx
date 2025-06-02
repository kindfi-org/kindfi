'use client'

import { useNotifications } from '@packages/lib/hooks'
import { createContext, useContext } from 'react'

const NotificationContext = createContext<ReturnType<
	typeof useNotifications
> | null>(null)

export function NotificationProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const notificationState = useNotifications()

	return (
		<NotificationContext.Provider value={notificationState}>
			{children}
		</NotificationContext.Provider>
	)
}

export function useNotificationContext() {
	const context = useContext(NotificationContext)
	if (!context) {
		throw new Error(
			'useNotificationContext must be used within a NotificationProvider',
		)
	}
	return context
}
