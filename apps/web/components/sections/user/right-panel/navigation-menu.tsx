'use client'

import { ChevronRight, Heart, Settings, Wallet } from 'lucide-react'
import Link from 'next/link'
import type { DashboardMode, NavigationItem } from '~/lib/types'

const userNavigation: NavigationItem[] = [
	{
		icon: Wallet,
		label: 'My Wallet',
		href: '/wallet',
		description: 'Access your wallet and transactions',
	},
	{
		icon: Heart,
		label: 'Supported Projects',
		href: '/supported-projects',
		description: 'View your supported projects',
	},
	{
		icon: Settings,
		label: 'Settings',
		href: '/settings',
		description: 'Manage your account settings',
	},
]

const creatorNavigation: NavigationItem[] = [
	{
		icon: Wallet,
		label: 'Creator Dashboard',
		href: '/creator-dashboard',
		description: 'View your creator dashboard',
	},
	{
		icon: Heart,
		label: 'My Projects',
		href: '/my-projects',
		description: 'Manage your created projects',
	},
	{
		icon: Settings,
		label: 'Creator Settings',
		href: '/creator-settings',
		description: 'Manage creator settings',
	},
]

interface NavigationMenuProps {
	mode: DashboardMode
}

export function NavigationMenu({ mode }: NavigationMenuProps) {
	const items = mode === 'user' ? userNavigation : creatorNavigation
	const menuLabel = mode === 'user' ? 'User navigation' : 'Creator navigation'

	return (
		<nav className="space-y-1" aria-label={menuLabel}>
			{items.map((item) => (
				<Link
					key={item.href}
					href={item.href}
					className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
					aria-label={item.description}
					legacyBehavior
				>
					<div className="flex items-center gap-3">
						{item.icon && (
							<item.icon
								className="w-5 h-5 text-muted-foreground"
								aria-hidden="true"
							/>
						)}
						<span className="text-sm font-medium">{item.label}</span>
					</div>
					<ChevronRight
						className="w-4 h-4 text-muted-foreground"
						aria-hidden="true"
					/>
				</Link>
			))}
		</nav>
	)
}
