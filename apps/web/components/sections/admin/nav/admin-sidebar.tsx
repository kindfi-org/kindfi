'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { IoMenuOutline } from 'react-icons/io5'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/base/sheet'
import { useAdminCounts } from '~/hooks/admin/use-admin-counts'
import { cn } from '~/lib/utils'
import type { AdminDashboardStats } from '~/lib/validators/admin-dashboard-stats'
import { ADMIN_NAV_GROUPS, type AdminNavItem, isAdminNavItemActive } from './admin-nav-items'

function NavLink({
	item,
	isActive,
	stats,
}: {
	item: AdminNavItem
	isActive: boolean
	stats: AdminDashboardStats | null
}) {
	const count = stats && item.getCount ? item.getCount(stats) : 0

	return (
		<Link
			href={item.href}
			aria-current={isActive ? 'page' : undefined}
			className={cn(
				'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
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
				<item.Icon
					className={cn('h-4 w-4', isActive ? 'opacity-100' : 'opacity-70')}
					size={16}
					aria-hidden
				/>
			</span>
			<span className="min-w-0 truncate">{item.label}</span>
			{count > 0 ? (
				<Badge
					variant={isActive ? 'secondary' : 'outline'}
					className="ml-auto shrink-0 tabular-nums"
					aria-label={`${count} pending`}
				>
					{count > 99 ? '99+' : count}
				</Badge>
			) : null}
		</Link>
	)
}

function AdminNavList() {
	const pathname = usePathname()
	const { data } = useAdminCounts()
	const stats = data?.stats ?? null

	return (
		<nav aria-label="Admin navigation" className="space-y-1">
			{ADMIN_NAV_GROUPS.map((group) => (
				<div key={group.label ?? 'root'} className="space-y-1">
					{group.label ? (
						<p className="px-3 pb-1.5 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							{group.label}
						</p>
					) : null}
					<ul className="space-y-0.5">
						{group.items.map((item) => (
							<li key={item.href}>
								<NavLink
									item={item}
									isActive={isAdminNavItemActive(pathname, item.href)}
									stats={stats}
								/>
							</li>
						))}
					</ul>
				</div>
			))}
		</nav>
	)
}

/**
 * Admin ops navigation.
 *
 * Desktop: sticky sidebar. Mobile: a compact bar with a menu button that
 * opens the navigation in a sheet — the nav no longer stacks above the page
 * content on small screens.
 */
export function AdminSidebar() {
	const pathname = usePathname()
	const [mobileOpen, setMobileOpen] = useState(false)

	// Close the sheet after navigating.
	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the navigation signal
	useEffect(() => {
		setMobileOpen(false)
	}, [pathname])

	const activeItem = ADMIN_NAV_GROUPS.flatMap((group) => group.items).find((item) =>
		isAdminNavItemActive(pathname, item.href),
	)

	return (
		<>
			{/* Mobile: compact bar + sheet */}
			<div className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-card p-2 shadow-sm lg:hidden">
				<p className="truncate px-2 text-sm font-semibold">{activeItem?.label ?? 'Admin'}</p>
				<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
					<SheetTrigger asChild>
						<Button type="button" variant="outline" size="sm" aria-label="Open admin navigation">
							<IoMenuOutline className="mr-1.5 h-4 w-4" aria-hidden />
							Menu
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-72 overflow-y-auto p-4">
						<SheetHeader className="pb-2 text-left">
							<SheetTitle>Admin</SheetTitle>
						</SheetHeader>
						<AdminNavList />
					</SheetContent>
				</Sheet>
			</div>

			{/* Desktop: sticky sidebar */}
			<aside
				className="hidden w-full shrink-0 lg:sticky lg:top-6 lg:block lg:w-60 lg:self-start"
				aria-label="Admin navigation"
			>
				<div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
					<AdminNavList />
				</div>
			</aside>
		</>
	)
}
