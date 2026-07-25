'use client'

import type { Database } from '@services/supabase'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/base/tabs'
import { useHasMounted } from '~/hooks/use-has-mounted'
import { useI18n } from '~/lib/i18n'
import { isCreatorProfileRole } from '~/lib/profile/is-creator-profile-role'
import { cn } from '~/lib/utils'
import { AccountInfoCard } from './cards/account-info-card'
import { PersonalInfoCard } from './cards/personal-info-card'
import { profileFadeUp } from './profile-motion'
import { ProfileViewSkeleton } from './skeletons'

const CreatorProfile = dynamic(
	() =>
		import('./views/creator-profile').then((mod) => ({
			default: mod.CreatorProfile,
		})),
	{
		loading: () => <ProfileViewSkeleton />,
		ssr: false,
	},
)

const DonorProfile = dynamic(
	() =>
		import('./views/donor-profile').then((mod) => ({
			default: mod.DonorProfile,
		})),
	{
		loading: () => <ProfileViewSkeleton />,
		ssr: false,
	},
)

const FiatRampsSection = dynamic(
	() =>
		import('./cards/fiat-ramps-section').then((mod) => ({
			default: mod.FiatRampsSection,
		})),
	{
		loading: () => <ProfileViewSkeleton />,
		ssr: false,
	},
)

const ReferralSection = dynamic(
	() =>
		import('./referral-section').then((mod) => ({
			default: mod.ReferralSection,
		})),
	{
		loading: () => <ProfileViewSkeleton />,
		ssr: false,
	},
)

type Role = Database['public']['Enums']['user_role']

const TAB_TRIGGER_CLASS = cn(
	'rounded-full px-4 py-2 text-sm font-medium transition-all',
	'data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm',
	'data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-gray-800',
)

const PROFILE_TAB_ORDER = [
	'overview',
	'ramps',
	'gamification',
	'referrals',
	'donations',
	'campaigns',
	'foundations',
	'settings',
] as const

type ProfileTab = (typeof PROFILE_TAB_ORDER)[number]

interface ProfileSectionTabsProps {
	user: {
		id: string
		email: string
		created_at: string
		profile: {
			role: Role | null
			display_name: string | null
			bio: string | null
			image_url: string | null
			slug?: string | null
			onboarding_provider?: 'legacy_passkey' | 'pollar' | null
			pollar_wallet_address?: string | null
			external_wallet_address?: string | null
		} | null
	}
	displayName: string
	effectiveWalletAddress: string | null
	isWalletReady: boolean
	isPollarUser: boolean
	onConnectKit: () => void
	initialSection?: string
	defaultTab?: string
}

const isTabVisible = (tab: ProfileTab, role: Role | null, showCreatorProfile: boolean): boolean => {
	switch (tab) {
		case 'donations':
			return role === 'donor'
		case 'campaigns':
		case 'foundations':
			return showCreatorProfile
		default:
			return true
	}
}

const ProfileTabsSkeleton = () => (
	<div className="space-y-6" aria-hidden="true">
		<div className="overflow-x-auto pb-1">
			<div className="inline-flex h-auto w-max min-w-full gap-1 rounded-full border border-white/70 bg-white/60 p-1.5 shadow-sm backdrop-blur-sm sm:min-w-0">
				{PROFILE_TAB_ORDER.map((tab) => (
					<div key={tab} className="h-9 w-24 animate-pulse rounded-full bg-white/80" />
				))}
			</div>
		</div>
		<ProfileViewSkeleton />
	</div>
)

const ProfileSectionTabsInner = ({
	user,
	displayName,
	effectiveWalletAddress,
	isWalletReady,
	isPollarUser,
	onConnectKit,
	initialSection,
	defaultTab = 'overview',
}: ProfileSectionTabsProps) => {
	const { t } = useI18n()
	const router = useRouter()
	const searchParams = useSearchParams()
	const mounted = useHasMounted()

	const role: Role | null = user.profile?.role ?? null
	const showCreatorProfile = isCreatorProfileRole(role)

	const activeSection = useMemo(() => {
		const fromUrl = searchParams?.get('section') || initialSection || defaultTab
		const visible = isTabVisible(fromUrl as ProfileTab, role, showCreatorProfile)
		if (visible) {
			return fromUrl
		}
		return defaultTab
	}, [searchParams, initialSection, defaultTab, role, showCreatorProfile])

	const handleTabChange = (value: string) => {
		const params = new URLSearchParams(searchParams?.toString() || '')
		params.set('section', value)
		router.push(`/profile?${params.toString()}`, { scroll: false })
	}

	const tabLabels: Record<ProfileTab, string> = {
		overview: t('profile.tabOverview'),
		ramps: t('profile.tabRamps'),
		gamification: t('profile.tabGamification'),
		referrals: t('profile.tabReferrals'),
		donations: t('profile.tabDonations'),
		campaigns: t('profile.tabCampaigns'),
		foundations: t('profile.tabFoundations'),
		settings: t('profile.tabSettings'),
	}

	const renderSection = (section: string) => {
		const ProfileView = showCreatorProfile ? CreatorProfile : DonorProfile
		return (
			<Suspense fallback={<ProfileViewSkeleton />}>
				<ProfileView
					userId={user.id}
					displayName={displayName}
					showSection={
						section as
							| 'overview'
							| 'gamification'
							| 'referrals'
							| 'donations'
							| 'nfts'
							| 'campaigns'
							| 'foundations'
					}
				/>
			</Suspense>
		)
	}

	if (!mounted) {
		return <ProfileTabsSkeleton />
	}

	return (
		<Tabs value={activeSection} onValueChange={handleTabChange} className="space-y-6">
			<div className="overflow-x-auto pb-1">
				<TabsList className="inline-flex h-auto w-max min-w-full gap-1 rounded-full border border-white/70 bg-white/60 p-1.5 shadow-sm backdrop-blur-sm sm:min-w-0">
					{PROFILE_TAB_ORDER.map((tab) => {
						const visible = isTabVisible(tab, role, showCreatorProfile)
						return (
							<TabsTrigger
								key={tab}
								value={tab}
								className={cn(TAB_TRIGGER_CLASS, !visible && 'hidden')}
								disabled={!visible}
								aria-hidden={!visible}
								tabIndex={visible ? 0 : -1}
							>
								{tabLabels[tab]}
							</TabsTrigger>
						)
					})}
				</TabsList>
			</div>

			<TabsContent value="overview" className="mt-0">
				{renderSection('overview')}
			</TabsContent>
			<TabsContent value="ramps" className="mt-0">
				<FiatRampsSection
					userId={user.id}
					walletAddress={effectiveWalletAddress}
					isWalletReady={isWalletReady}
					isPollarUser={isPollarUser}
					onConnectKit={onConnectKit}
				/>
			</TabsContent>
			<TabsContent value="gamification" className="mt-0">
				{renderSection('gamification')}
			</TabsContent>
			<TabsContent value="referrals" className="mt-0">
				<ReferralSection
					profilePollarAddress={user.profile?.pollar_wallet_address}
					profileExternalAddress={user.profile?.external_wallet_address}
				/>
			</TabsContent>
			<TabsContent value="donations" className="mt-0">
				{role === 'donor' ? renderSection('donations') : null}
			</TabsContent>
			<TabsContent value="campaigns" className="mt-0">
				{showCreatorProfile ? renderSection('campaigns') : null}
			</TabsContent>
			<TabsContent value="foundations" className="mt-0">
				{showCreatorProfile ? renderSection('foundations') : null}
			</TabsContent>
			<TabsContent value="settings" className="mt-0">
				<div className="grid gap-6 lg:grid-cols-2">
					<PersonalInfoCard
						userId={user.id}
						displayName={user.profile?.display_name ?? ''}
						bio={user.profile?.bio ?? ''}
						imageUrl={user.profile?.image_url ?? ''}
						_email={user.email}
					/>
					<AccountInfoCard
						userEmail={user.email}
						createdAt={user.created_at}
						slug={user.profile?.slug ?? ''}
					/>
				</div>
			</TabsContent>
		</Tabs>
	)
}

export function ProfileSectionTabs(props: ProfileSectionTabsProps) {
	return (
		<motion.div {...profileFadeUp(0.12)}>
			<Suspense fallback={<ProfileTabsSkeleton />}>
				<ProfileSectionTabsInner {...props} />
			</Suspense>
		</motion.div>
	)
}
