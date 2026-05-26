'use client'

import type { Database } from '@services/supabase'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { startTransition, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import { SectionContainer } from '~/components/shared/section-container'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'
import { AccountInfoCard } from './cards/account-info-card'
import { GovernanceCard } from './cards/governance-card'
import { KYCCard } from './cards/kyc-card'
import { PersonalInfoCard } from './cards/personal-info-card'
import { WalletCard } from './cards/wallet-card'
import { RoleSelectionModal } from './modals/role-selection-modal'
import { profileFadeUp } from './profile-motion'
import { ProfileHeader } from './profile-header'
import { ProfileShell } from './profile-shell'
import { CreatorProfile } from './views/creator-profile'
import { DonorProfile } from './views/donor-profile'

type Role = Database['public']['Enums']['user_role']

interface ProfileDashboardProps {
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
		} | null
	}
	smartAccountAddress?: string | null
	defaultTab?: 'overview' | 'settings'
	kycCompleted?: boolean
}

const TAB_TRIGGER_CLASS = cn(
	'rounded-full px-4 py-2 text-sm font-medium transition-all',
	'data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm',
	'data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-gray-800',
)

export function ProfileDashboard({
	user,
	smartAccountAddress,
	defaultTab = 'overview',
	kycCompleted = false,
}: ProfileDashboardProps) {
	const { t } = useI18n()
	const router = useRouter()
	const role: Role | null = user.profile?.role ?? null
	const displayName = useMemo(
		() => user.profile?.display_name || user.email?.split('@')[0] || 'You',
		[user.profile?.display_name, user.email],
	)
	const {
		address: externalWalletAddress,
		connect,
		disconnect,
		isConnected,
	} = useWallet()
	const imageUrl = user.profile?.image_url ?? null
	const bio = user.profile?.bio ?? null
	const [showRoleModal, setShowRoleModal] = useState(false)
	const searchParams = useSearchParams()
	const activeSection = searchParams?.get('section') || defaultTab

	useEffect(() => {
		if (role === 'pending' || role === null) {
			startTransition(() => setShowRoleModal(true))
		}
	}, [role])

	const handleRoleSelected = () => {
		localStorage.setItem('kindfi_role_chosen', 'true')
		setShowRoleModal(false)
	}

	useEffect(() => {
		if (!kycCompleted) return

		const urlParams = new URLSearchParams(window.location.search)
		const status = urlParams.get('status')
		const sessionId = urlParams.get('verificationSessionId')

		if (!status || !sessionId) {
			toast.info(t('profile.kycCallbackChecking'))
			return
		}

		const normalizedStatus = status.replace(/\+/g, ' ')
		if (normalizedStatus === 'Approved') {
			toast.success(t('profile.kycCallbackApproved'))
		} else if (normalizedStatus === 'Declined') {
			toast.error(t('profile.kycCallbackDeclined'))
		} else if (
			normalizedStatus === 'In Review' ||
			normalizedStatus === 'In Progress'
		) {
			toast.info(t('profile.kycCallbackReview'))
		} else {
			toast.info(t('profile.kycCallbackChecking'))
		}

		fetch('/api/kyc/didit/callback', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				verificationSessionId: sessionId,
				status: normalizedStatus,
			}),
		})
			.then(async (res) => {
				if (res.ok) {
					const result = await res.json()
					if (result.status === 'approved' || result.status === 'verified') {
						toast.success(t('profile.kycUpdatedApproved'))
					} else if (result.status === 'rejected') {
						toast.error(t('profile.kycUpdatedDeclined'))
					} else if (result.status === 'pending') {
						toast.info(t('profile.kycUpdatedReview'))
					}
					window.history.replaceState({}, '', '/profile')
					window.location.reload()
				} else {
					toast.error(t('profile.kycUpdateFailed'))
				}
			})
			.catch(() => {
				toast.error(t('profile.kycUpdateFailed'))
			})
	}, [kycCompleted, t])

	const handleTabChange = (value: string) => {
		const params = new URLSearchParams(searchParams?.toString() || '')
		params.set('section', value)
		router.push(`/profile?${params.toString()}`, { scroll: false })
	}

	const openSettings = () => handleTabChange('settings')

	const renderSection = (section: string) => {
		const ProfileView = role === 'creator' ? CreatorProfile : DonorProfile
		return (
			<ProfileView
				userId={user.id}
				displayName={displayName}
				showSection={
					section as
						| 'overview'
						| 'gamification'
						| 'donations'
						| 'nfts'
						| 'campaigns'
						| 'foundations'
				}
			/>
		)
	}

	return (
		<ProfileShell>
			<SectionContainer maxWidth="6xl" className="py-8 sm:py-10 lg:py-12">
				<div className="space-y-6 lg:space-y-8">
					<ProfileHeader
						displayName={displayName}
						email={user.email}
						imageUrl={imageUrl}
						bio={bio}
						role={role}
						createdAt={user.created_at}
						onOpenSettings={openSettings}
					/>

					<motion.div
						{...profileFadeUp(0.08)}
						className="grid gap-5 lg:grid-cols-5"
					>
						<div className="lg:col-span-3">
							<WalletCard
								smartAccountAddress={smartAccountAddress ?? null}
								externalWalletAddress={externalWalletAddress}
								isExternalConnected={isConnected}
								onConnectExternal={connect}
								onDisconnectExternal={disconnect}
							/>
						</div>
						<div className="lg:col-span-2">
							<KYCCard userId={user.id} shouldRefresh={kycCompleted} />
						</div>
					</motion.div>

					<motion.div {...profileFadeUp(0.1)}>
						<GovernanceCard />
					</motion.div>

					<motion.div {...profileFadeUp(0.12)}>
						<Tabs
							value={activeSection}
							onValueChange={handleTabChange}
							className="space-y-6"
						>
							<div className="overflow-x-auto pb-1">
								<TabsList className="inline-flex h-auto w-max min-w-full gap-1 rounded-full border border-white/70 bg-white/60 p-1.5 shadow-sm backdrop-blur-sm sm:min-w-0">
									<TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
										{t('profile.tabOverview')}
									</TabsTrigger>
									<TabsTrigger
										value="gamification"
										className={TAB_TRIGGER_CLASS}
									>
										{t('profile.tabGamification')}
									</TabsTrigger>
									{role === 'donor' ? (
										<TabsTrigger value="donations" className={TAB_TRIGGER_CLASS}>
											{t('profile.tabDonations')}
										</TabsTrigger>
									) : null}
									{role === 'creator' ? (
										<>
											<TabsTrigger value="campaigns" className={TAB_TRIGGER_CLASS}>
												{t('profile.tabCampaigns')}
											</TabsTrigger>
											<TabsTrigger
												value="foundations"
												className={TAB_TRIGGER_CLASS}
											>
												{t('profile.tabFoundations')}
											</TabsTrigger>
										</>
									) : null}
									<TabsTrigger value="settings" className={TAB_TRIGGER_CLASS}>
										{t('profile.tabSettings')}
									</TabsTrigger>
								</TabsList>
							</div>

							<TabsContent value="overview" className="mt-0">
								{renderSection('overview')}
							</TabsContent>
							<TabsContent value="gamification" className="mt-0">
								{renderSection('gamification')}
							</TabsContent>
							{role === 'donor' ? (
								<TabsContent value="donations" className="mt-0">
									{renderSection('donations')}
								</TabsContent>
							) : null}
							{role === 'creator' ? (
								<>
									<TabsContent value="campaigns" className="mt-0">
										{renderSection('campaigns')}
									</TabsContent>
									<TabsContent value="foundations" className="mt-0">
										{renderSection('foundations')}
									</TabsContent>
								</>
							) : null}
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
					</motion.div>
				</div>

				<RoleSelectionModal
					open={showRoleModal}
					onOpenChange={setShowRoleModal}
					userId={user.id}
					currentRole={role}
					onRoleSelected={handleRoleSelected}
				/>
			</SectionContainer>
		</ProfileShell>
	)
}
