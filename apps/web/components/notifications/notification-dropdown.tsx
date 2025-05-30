'use client'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import { Bell } from 'lucide-react'
import { useNotifications } from '~/hooks/use-notifications'
import { cn } from '~/lib/utils'
import { Button } from '../base/button'
import { NotificationList } from './notification-list'

interface NotificationDropdownProps {
	className?: string
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
	const { unreadCount } = useNotifications()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn('relative', className)}
				>
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
							{unreadCount > 99 ? '99+' : unreadCount}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<NotificationList />
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
