'use client'

import { Button } from '~/components/base/button'
import { ScrollArea } from '~/components/base/scroll-area'
import { useNotificationContext } from '~/providers/notification-provider'
import { NotificationItem } from './notification-item'

export function NotificationDropdown() {
	const { notifications, isLoading, error, hasMore, loadMore } =
		useNotificationContext()

	return (
		<div className="w-96 rounded-lg border bg-background shadow-lg">
			<ScrollArea className="h-[32rem]">
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
							<div className="flex justify-center p-4">
								<Button
									variant="ghost"
									size="sm"
									onClick={loadMore}
									disabled={isLoading}
								>
									{isLoading ? 'Loading...' : 'Load more'}
								</Button>
							</div>
						)}
					</div>
				)}
			</ScrollArea>
		</div>
	)
}
