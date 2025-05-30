'use client'

import type { Notification } from '@packages/lib'
import { createContext, useContext, useEffect, useState } from 'react'
import { useNotifications } from '../hooks/use-notifications'

interface NotificationContextType {
	notifications: Notification[]
	unreadCount: number
	isLoading: boolean
	error: Error | null
	hasMore: boolean
	loadMore: () => void
	markAsRead: (notificationIds: string[]) => Promise<void>
	markAllAsRead: () => Promise<void>
	refresh: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined,
)

export function NotificationProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const {
		notifications,
		unreadCount,
		isLoading,
		error,
		hasMore,
		loadMore,
		markAsRead,
		markAllAsRead,
		refresh,
	} = useNotifications()

	const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] =
		useState(false)

	useEffect(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/notification-worker.js')
				.then((registration) => {
					console.log('Service Worker registered:', registration)
					setIsServiceWorkerRegistered(true)
				})
				.catch((error) => {
					console.error('Service Worker registration failed:', error)
				})
		}
	}, [])

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				isLoading,
				error,
				hasMore,
				loadMore,
				markAsRead,
				markAllAsRead,
				refresh,
			}}
		>
			{children}
		</NotificationContext.Provider>
	)
}

export function useNotificationContext() {
	const context = useContext(NotificationContext)
	if (context === undefined) {
		throw new Error(
			'useNotificationContext must be used within a NotificationProvider',
		)
	}
	return context
}
