'use client'

import { useNotifications } from '@packages/lib'
import type { Notification } from '@packages/lib/src/types/notification'
import { formatDistanceToNow } from 'date-fns'
import { Check } from 'lucide-react'
import { useCallback } from 'react'
import { Button } from '~/components/base/button'
import { Card } from '~/components/base/card'

export function NotificationItem({
	id,
	message,
	read_at,
	created_at,
}: Notification) {
	const { markAsRead } = useNotifications()

	const handleMarkAsRead = useCallback(async () => {
		try {
			await markAsRead([id])
		} catch (error) {
			console.error('Failed to mark notification as read', error)
			// Optionally show user notification here
		}
	}, [id, markAsRead])

	return (
		<Card className="p-4">
			<div className="flex items-start gap-4">
				<div className="flex-1 space-y-1">
					<p className="text-sm font-medium">{message}</p>
					<p className="text-xs text-muted-foreground">
						{formatDistanceToNow(new Date(created_at), { addSuffix: true })}
					</p>
				</div>
				{!read_at && (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={handleMarkAsRead}
					>
						<Check className="h-4 w-4" />
					</Button>
				)}
			</div>
		</Card>
	)
}
