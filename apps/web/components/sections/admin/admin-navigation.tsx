'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	IoBusinessOutline,
	IoChevronForwardOutline,
	IoFolderOutline,
	IoGiftOutline,
	IoHomeOutline,
	IoPeopleOutline,
	IoSettingsOutline,
	IoShieldCheckmarkOutline,
	IoStatsChartOutline,
} from 'react-icons/io5'
import { cn } from '~/lib/utils'

type NavItem = {
	href: string
	label: string
	Icon: React.ComponentType<{ size?: number; className?: string }>
}

const overviewItem: NavItem = {
	href: '/admin',
	label: 'Overview',
	Icon: IoHomeOutline,
}

const entityItems: NavItem[] = [
	{ href: '/admin/projects', label: 'Projects', Icon: IoFolderOutline },
	{ href: '/admin/foundations', label: 'Foundations', Icon: IoBusinessOutline },
	{ href: '/admin/users', label: 'Users', Icon: IoPeopleOutline },
	{ href: '/admin/escrows', label: 'Escrows', Icon: IoShieldCheckmarkOutline },
	{ href: '/admin/gamification', label: 'Gamification', Icon: IoGiftOutline },
]

const insightsItems: NavItem[] = [
	{ href: '/admin/analytics', label: 'Analytics', Icon: IoStatsChartOutline },
]

const configItems: NavItem[] = [
	{ href: '/admin/settings', label: 'Settings', Icon: IoSettingsOutline },
]

function NavLink({
	href,
	label,
	Icon,
	isActive,
}: NavItem & { isActive: boolean }) {
	return (
		<Link
			href={href}
			aria-current={isActive ? 'page' : undefined}
			className={cn(
				'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 touch-action-manipulation',
				isActive
					? 'bg-green-800 text-white shadow-sm'
					: 'text-muted-foreground hover:bg-muted hover:text-foreground',
			)}
		>
			<span
				className={cn(
					'flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors',
					isActive ? 'bg-white/20' : 'bg-muted/80 group-hover:bg-muted',
				)}
			>
				<Icon
					className={cn('h-4 w-4', isActive ? 'opacity-100' : 'opacity-70')}
					size={16}
					aria-hidden
				/>
			</span>
			<span className="truncate min-w-0">{label}</span>
			<IoChevronForwardOutline
				className={cn(
					'ml-auto h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-50',
					isActive && 'opacity-30',
				)}
				aria-hidden
			/>
		</Link>
	)
}

function NavGroup({
	label,
	items,
	pathname,
}: {
	label: string
	items: NavItem[]
	pathname: string | null
}) {
	return (
		<div className="space-y-1">
			<p className="px-3 pb-1.5 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground first:pt-0">
				{label}
			</p>
			<ul className="space-y-0.5">
				{items.map((item) => {
					const isActive =
						pathname === item.href ||
						(item.href !== '/admin' && pathname?.startsWith(item.href))
					return (
						<li key={item.href}>
							<NavLink {...item} isActive={!!isActive} />
						</li>
					)
				})}
			</ul>
		</div>
	)
}

export function AdminNavigation() {
	const pathname = usePathname()

	const isOverviewActive = pathname === '/admin'

	return (
		<nav className="space-y-0" aria-label="Admin navigation">
			<div className="pb-4">
				<Link
					href="/admin"
					className="flex items-center gap-3 rounded-lg px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-800/15 text-green-800">
						<IoHomeOutline className="h-5 w-5" aria-hidden />
					</span>
					<div className="min-w-0">
						<p className="font-semibold text-foreground">Admin</p>
						<p className="text-xs text-muted-foreground">Dashboard</p>
					</div>
				</Link>
			</div>
			<div className="space-y-0 border-t border-border/60 pt-2">
				<div className="space-y-1">
					<ul className="space-y-0.5">
						<li>
							<NavLink {...overviewItem} isActive={isOverviewActive} />
						</li>
					</ul>
				</div>
				<NavGroup label="Entities" items={entityItems} pathname={pathname} />
				<NavGroup label="Insights" items={insightsItems} pathname={pathname} />
				<NavGroup label="Config" items={configItems} pathname={pathname} />
			</div>
		</nav>
	)
}
