'use client'

import type { Notification } from '@packages/lib'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Button } from '../../components/ui/button'
import { ScrollArea } from '../../components/ui/scroll-area'
import { useNotificationContext } from '../../providers/notification-provider'
import { NotificationItem } from './notification-item'

export function NotificationList() {
	const { notifications, isLoading, error, hasMore, loadMore, markAllAsRead } =
		useNotificationContext()

	const { ref, inView } = useInView({
		threshold: 0,
	})

	// Load more when the last item comes into view
	useEffect(() => {
		if (inView && hasMore && !isLoading) {
			loadMore()
		}
	}, [inView, hasMore, isLoading, loadMore])

	if (error) {
		return (
			<div className="p-4 text-center text-red-500">
				Error loading notifications: {error.message}
			</div>
		)
	}

	return (
		<div className="flex flex-col h-full">
			<div className="flex justify-between items-center p-4 border-b">
				<h2 className="text-lg font-semibold">Notifications</h2>
				{notifications.length > 0 && (
					<Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
						Mark all as read
					</Button>
				)}
			</div>
			<ScrollArea className="flex-1">
				{notifications.length === 0 ? (
					<div className="p-4 text-center text-muted-foreground">
						No notifications
					</div>
				) : (
					<div className="divide-y">
						{notifications.map((notification) => (
							<NotificationItem
								key={notification.id}
								notification={notification}
							/>
						))}
						{hasMore && (
							<div ref={ref} className="flex justify-center p-4">
								{isLoading && (
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								)}
							</div>
						)}
					</div>
				)}
			</ScrollArea>
		</div>
	)
}
