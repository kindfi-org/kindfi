'use client'

import { formatDistanceToNow } from 'date-fns'
import { Bell } from 'lucide-react'
import { useState } from 'react'
import { useNotifications } from '../../hooks/use-notifications'
import type { Notification } from '../../lib/types/notification'
import { cn } from '../../lib/utils'
import { Button } from '../base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../base/dropdown-menu'
import { ScrollArea } from '../base/scroll-area'

export function NotificationBell() {
	const [isOpen, setIsOpen] = useState(false)
	const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
		useNotifications()

	const handleNotificationClick = (id: string) => {
		markAsRead(id)
		setIsOpen(false)
	}

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative"
					aria-label="Notifications"
				>
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
							{unreadCount}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-80"
				onCloseAutoFocus={(e: Event) => e.preventDefault()}
			>
				<div className="flex items-center justify-between px-4 py-2">
					<h4 className="text-sm font-medium">Notifications</h4>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="h-8 text-xs"
							onClick={() => markAllAsRead()}
						>
							Mark all as read
						</Button>
					)}
				</div>
				<DropdownMenuSeparator />
				<ScrollArea className="h-[300px]">
					{isLoading ? (
						<div className="flex items-center justify-center p-4">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						</div>
					) : notifications.length === 0 ? (
						<div className="p-4 text-center text-sm text-muted-foreground">
							No notifications
						</div>
					) : (
						notifications.map((notification: Notification) => (
							<DropdownMenuItem
								key={notification.id}
								className={cn(
									'flex cursor-pointer flex-col items-start gap-1 p-4',
									!notification.is_read && 'bg-muted/50',
								)}
								onClick={() => handleNotificationClick(notification.id)}
							>
								<div className="flex w-full items-start justify-between gap-2">
									<span className="text-sm font-medium">
										{notification.title}
									</span>
									<span className="text-xs text-muted-foreground">
										{formatDistanceToNow(new Date(notification.created_at), {
											addSuffix: true,
										})}
									</span>
								</div>
								<p className="text-sm text-muted-foreground">
									{notification.message}
								</p>
							</DropdownMenuItem>
						))
					)}
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
