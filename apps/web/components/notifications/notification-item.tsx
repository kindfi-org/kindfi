'use client'

import { Button } from '~/components/base/button'
import { Card } from '~/components/base/card'
import { useNotifications } from '@packages/lib'
import { formatDistanceToNow } from 'date-fns'
import { Check } from 'lucide-react'
import { useCallback } from 'react'

interface NotificationItemProps {
	id: string
	message: string
	readAt: string | null
	createdAt: string
}

export function NotificationItem({
	id,
	message,
	readAt,
	createdAt,
}: NotificationItemProps) {
	const { markAsRead } = useNotifications()

	const handleMarkAsRead = useCallback(() => {
		markAsRead([id])
	}, [id, markAsRead])

	return (
		<Card className="p-4">
			<div className="flex items-start gap-4">
				<div className="flex-1 space-y-1">
					<p className="text-sm font-medium">{message}</p>
					<p className="text-xs text-muted-foreground">
						{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
					</p>
				</div>
				{!readAt && (
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
