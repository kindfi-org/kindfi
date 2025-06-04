'use client'

import { useNotifications } from '@packages/lib'
import type { Database } from '@services/supabase'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { ScrollArea } from '~/components/base/scroll-area'
import { NotificationItem } from './notification-item'

type Notification = Database['public']['Tables']['notifications']['Row']

export function NotificationDropdown() {
	const { notifications, isLoading, hasMore, loadMore } = useNotifications()
	const { ref, inView } = useInView()

	useEffect(() => {
		if (inView && hasMore && !isLoading) {
			loadMore()
		}
	}, [inView, hasMore, isLoading, loadMore])

	return (
		<div className="w-96 rounded-lg border bg-background shadow-lg">
			<ScrollArea className="h-[32rem]">
				{notifications.length === 0 ? (
					<div className="p-4 text-center text-muted-foreground">
						No notifications
					</div>
				) : (
					<div className="divide-y">
						{notifications.map((notification: Notification) => (
							<NotificationItem key={notification.id} {...notification} />
						))}
						{hasMore && (
							<div ref={ref} className="flex justify-center p-4">
								{isLoading && (
									<p className="text-sm text-muted-foreground">Loading...</p>
								)}
							</div>
						)}
					</div>
				)}
			</ScrollArea>
		</div>
	)
}
