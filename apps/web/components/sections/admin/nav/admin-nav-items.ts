import type { ComponentType } from 'react'
import {
	IoBarChartOutline,
	IoBusinessOutline,
	IoEarthOutline,
	IoFlagOutline,
	IoFolderOutline,
	IoGiftOutline,
	IoHomeOutline,
	IoPeopleOutline,
	IoSettingsOutline,
	IoShieldCheckmarkOutline,
	IoStatsChartOutline,
} from 'react-icons/io5'
import type { AdminDashboardStats } from '~/lib/validators/admin-dashboard-stats'

export interface AdminNavItem {
	href: string
	label: string
	Icon: ComponentType<{ size?: number; className?: string }>
	/** Derives the pending-work badge count for this destination. */
	getCount?: (stats: AdminDashboardStats) => number
}

export interface AdminNavGroup {
	label: string | null
	items: AdminNavItem[]
}

/**
 * Operations-oriented navigation: work surfaces first, analytics and
 * configuration last. Badge counts surface pending work per destination.
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
	{
		label: null,
		items: [{ href: '/admin', label: 'Overview & Queue', Icon: IoHomeOutline }],
	},
	{
		label: 'Operations',
		items: [
			{
				href: '/admin/projects',
				label: 'Projects',
				Icon: IoFolderOutline,
				getCount: (stats) => stats.projects.by_status.review ?? 0,
			},
			{
				href: '/admin/escrows',
				label: 'Escrows',
				Icon: IoShieldCheckmarkOutline,
				getCount: (stats) => stats.escrows.by_state.DISPUTED ?? 0,
			},
			{
				href: '/admin/milestone-reviews',
				label: 'Milestone Reviews',
				Icon: IoFlagOutline,
				getCount: (stats) => stats.milestone_reviews.pending,
			},
			{
				href: '/admin/users',
				label: 'Users & KYC',
				Icon: IoPeopleOutline,
				getCount: (stats) => stats.kyc.pending,
			},
			{ href: '/admin/foundations', label: 'Foundations', Icon: IoBusinessOutline },
		],
	},
	{
		label: 'Platform',
		items: [
			{ href: '/admin/governance', label: 'Governance', Icon: IoBarChartOutline },
			{ href: '/admin/gamification', label: 'Gamification', Icon: IoGiftOutline },
			{ href: '/admin/compliance', label: 'Compliance', Icon: IoEarthOutline },
			{ href: '/admin/kyc', label: 'KYC enforcement', Icon: IoShieldCheckmarkOutline },
			{ href: '/admin/analytics', label: 'Analytics', Icon: IoStatsChartOutline },
		],
	},
	{
		label: 'Config',
		items: [{ href: '/admin/settings', label: 'Settings', Icon: IoSettingsOutline }],
	},
]

export function isAdminNavItemActive(pathname: string | null, href: string): boolean {
	if (!pathname) return false
	if (href === '/admin') return pathname === '/admin'
	return pathname === href || pathname.startsWith(`${href}/`)
}
