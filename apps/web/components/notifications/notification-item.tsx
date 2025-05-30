'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatNotificationDate } from '@/lib/utils'
import { useNotificationContext } from '@/providers/notification-provider'
import type { Database } from '@kindfi/lib/types/supabase'
import { Check } from 'lucide-react'

type Notification = Database['public']['Tables']['notifications']['Row']

interface NotificationItemProps {
	notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
	const { markAsRead } = useNotificationContext()

	return (
		<div
			className={cn(
				'flex items-start gap-4 p-4 transition-colors hover:bg-muted/50',
				!notification.read_at && 'bg-muted/25',
			)}
		>
			<div className="flex-1 space-y-1">
				<p className="text-sm font-medium">{notification.message}</p>
				<p className="text-xs text-muted-foreground">
					{formatNotificationDate(notification.created_at)}
				</p>
			</div>
			{!notification.read_at && (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={() => markAsRead([notification.id])}
				>
					<Check className="h-4 w-4" />
					<span className="sr-only">Mark as read</span>
				</Button>
			)}
		</div>
	)
}
