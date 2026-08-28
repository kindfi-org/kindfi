'use client'

import {
	BarChart3,
	Gift,
	Heart,
	LayoutDashboard,
	Menu,
	Settings,
	Shield,
	Vote,
	Wallet,
	X,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Button } from '~/components/base/button'
import { useDashboardContext } from '~/hooks/profile/use-dashboard-context'
import { useI18n } from '~/lib/i18n'
import { isCreatorProfileRole } from '~/lib/profile/is-creator-profile-role'
import { cn } from '~/lib/utils'

export const DASHBOARD_SECTIONS = [
	'overview',
	'wallets',
	'campaigns',
	'donations',
	'rewards',
	'governance',
	'kyc',
	'settings',
] as const

export type DashboardSection = (typeof DASHBOARD_SECTIONS)[number]

/** Legacy tab-param → new section mapping for backwards compat bookmarks */
const LEGACY_SECTION_MAP: Record<string, DashboardSection> = {
	ramps: 'wallets',
	gamification: 'rewards',
	referrals: 'rewards',
	nfts: 'rewards',
	foundations: 'campaigns',
}

export function normalizeSectionParam(raw: string | null | undefined): DashboardSection {
	if (!raw) return 'overview'
	if (DASHBOARD_SECTIONS.includes(raw as DashboardSection)) return raw as DashboardSection
	return LEGACY_SECTION_MAP[raw] ?? 'overview'
}

interface NavItem {
	id: DashboardSection
	labelKey: string
	icon: typeof LayoutDashboard
	roleFilter?: (isCreator: boolean, role: string | null) => boolean
}

const NAV_ITEMS: NavItem[] = [
	{ id: 'overview', labelKey: 'profile.navOverview', icon: LayoutDashboard },
	{ id: 'wallets', labelKey: 'profile.navWallets', icon: Wallet },
	{
		id: 'campaigns',
		labelKey: 'profile.navCampaigns',
		icon: BarChart3,
		roleFilter: (isCreator) => isCreator,
	},
	{
		id: 'donations',
		labelKey: 'profile.navDonations',
		icon: Heart,
		roleFilter: (_isCreator, role) => role === 'donor',
	},
	{ id: 'rewards', labelKey: 'profile.navRewards', icon: Gift },
	{ id: 'governance', labelKey: 'profile.navGovernance', icon: Vote },
	{ id: 'kyc', labelKey: 'profile.navKyc', icon: Shield },
	{ id: 'settings', labelKey: 'profile.navSettings', icon: Settings },
]

interface DashboardNavProps {
	activeSection: DashboardSection
}

export function DashboardNav({ activeSection }: DashboardNavProps) {
	const { t } = useI18n()
	const { role } = useDashboardContext()
	const router = useRouter()
	const searchParams = useSearchParams()
	const [mobileOpen, setMobileOpen] = useState(false)

	const isCreator = isCreatorProfileRole(role)

	const visibleItems = NAV_ITEMS.filter((item) =>
		item.roleFilter ? item.roleFilter(isCreator, role) : true,
	)

	const navigate = useCallback(
		(section: DashboardSection) => {
			const params = new URLSearchParams(searchParams?.toString() || '')
			params.set('section', section)
			router.push(`/profile?${params.toString()}`, { scroll: false })
			setMobileOpen(false)
			// Move focus to main content for keyboard users
			requestAnimationFrame(() => {
				const main = document.getElementById('dashboard-main')
				main?.focus()
			})
		},
		[router, searchParams],
	)

	const activeLabelKey =
		visibleItems.find((i) => i.id === activeSection)?.labelKey ?? 'profile.navOverview'

	return (
		<>
			{/* Desktop sidebar */}
			<nav
				aria-label={t('profile.navAriaLabel')}
				className="hidden lg:flex lg:w-52 lg:shrink-0 lg:flex-col lg:gap-1"
			>
				{visibleItems.map((item) => (
					<NavButton
						key={item.id}
						item={item}
						active={activeSection === item.id}
						label={t(item.labelKey as Parameters<typeof t>[0])}
						onClick={() => navigate(item.id)}
					/>
				))}
			</nav>

			{/* Mobile top bar toggle */}
			<div className="flex items-center justify-between lg:hidden">
				<span className="text-sm font-semibold text-gray-700">
					{t(activeLabelKey as Parameters<typeof t>[0])}
				</span>
				<Button
					variant="ghost"
					size="sm"
					aria-label={mobileOpen ? t('profile.navClose') : t('profile.navOpen')}
					aria-expanded={mobileOpen}
					onClick={() => setMobileOpen((v) => !v)}
					className="rounded-full"
				>
					{mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
				</Button>
			</div>

			{/* Mobile drawer */}
			{mobileOpen ? (
				<nav
					aria-label={t('profile.navAriaLabel')}
					className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-white/90 p-2 shadow-md lg:hidden"
				>
					{visibleItems.map((item) => (
						<NavButton
							key={item.id}
							item={item}
							active={activeSection === item.id}
							label={t(item.labelKey as Parameters<typeof t>[0])}
							onClick={() => navigate(item.id)}
						/>
					))}
				</nav>
			) : null}
		</>
	)
}

function NavButton({
	item,
	active,
	label,
	onClick,
}: {
	item: NavItem
	active: boolean
	label: string
	onClick: () => void
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-current={active ? 'page' : undefined}
			className={cn(
				'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1',
				active
					? 'bg-emerald-50 text-emerald-800 shadow-sm'
					: 'text-slate-600 hover:bg-slate-100 hover:text-gray-900',
			)}
		>
			<item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
			{label}
		</button>
	)
}
