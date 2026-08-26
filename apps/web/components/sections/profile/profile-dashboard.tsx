'use client'

import type { Database } from '@services/supabase'
import { motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { ProductTourLauncher } from '~/components/product-tour/product-tour-launcher'
import { SectionContainer } from '~/components/shared/section-container'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { useEffectiveWalletAddress } from '~/hooks/wallet/use-effective-wallet-address'
import { useI18n } from '~/lib/i18n'
import { GovernanceCard } from './cards/governance-card'
import { KYCCard } from './cards/kyc-card'
import { SendAssetsCard } from './cards/send-assets/send-assets-card'
import { WalletCard } from './cards/wallet-card'
import { ProfileHeader } from './profile-header'
import { profileFadeUp } from './profile-motion'
import { ProfileSectionTabs } from './profile-section-tabs'
import { ProfileShell } from './profile-shell'

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
			onboarding_provider?: 'legacy_passkey' | 'pollar' | null
			pollar_wallet_address?: string | null
			external_wallet_address?: string | null
			product_tour_completed_at?: string | null
		} | null
	}
	smartAccountAddress?: string | null
	defaultTab?: 'overview' | 'settings'
	initialSection?: string
	kycCompleted?: boolean
}

export function ProfileDashboard({
	user,
	smartAccountAddress,
	defaultTab = 'overview',
	initialSection,
	kycCompleted = false,
}: ProfileDashboardProps) {
	const { t } = useI18n()
	const role: Role | null = user.profile?.role ?? null
	const displayName = useMemo(
		() => user.profile?.display_name || user.email?.split('@')[0] || 'You',
		[user.profile?.display_name, user.email],
	)
	const { address: externalWalletAddress, connect, disconnect, isConnected } = useWallet()
	const {
		address: effectiveWalletAddress,
		isReady: isWalletReady,
		isPollarUser,
		connectKit,
	} = useEffectiveWalletAddress({
		profilePollarAddress: user.profile?.pollar_wallet_address,
		profileExternalAddress: user.profile?.external_wallet_address,
	})
	const imageUrl = user.profile?.image_url ?? null
	const bio = user.profile?.bio ?? null

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
		} else if (normalizedStatus === 'In Review' || normalizedStatus === 'In Progress') {
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

	return (
		<ProfileShell>
			<SectionContainer maxWidth="6xl" className="py-8 sm:py-10 lg:py-12">
				<div className="space-y-6 lg:space-y-8">
					{(role === 'donor' || role === 'creator') && (
						<ProductTourLauncher
							role={role}
							productTourCompletedAt={user.profile?.product_tour_completed_at ?? null}
						/>
					)}

					<div data-tour-id="profile-header">
						<ProfileHeader
							displayName={displayName}
							email={user.email}
							imageUrl={imageUrl}
							bio={bio}
							role={role}
							createdAt={user.created_at}
						/>
					</div>

					<motion.div {...profileFadeUp(0.08)} className="grid gap-5 lg:grid-cols-5">
						<div className="lg:col-span-3" data-tour-id="wallet-card">
							<WalletCard
								smartAccountAddress={smartAccountAddress ?? null}
								externalWalletAddress={externalWalletAddress}
								isExternalConnected={isConnected}
								onboardingProvider={user.profile?.onboarding_provider ?? 'legacy_passkey'}
								pollarWalletAddress={
									user.profile?.pollar_wallet_address ??
									user.profile?.external_wallet_address ??
									null
								}
								onConnectExternal={connect}
								onDisconnectExternal={disconnect}
							/>
						</div>
						<div className="lg:col-span-2" data-tour-id="kyc-card">
							<KYCCard userId={user.id} shouldRefresh={kycCompleted} />
						</div>
					</motion.div>

					<motion.div {...profileFadeUp(0.09)} data-tour-id="send-assets-card">
						<SendAssetsCard walletAddress={effectiveWalletAddress} isWalletReady={isWalletReady} />
					</motion.div>

					<motion.div {...profileFadeUp(0.1)} data-tour-id="governance-card">
						<GovernanceCard />
					</motion.div>

					<div data-tour-id="profile-tabs">
						<ProfileSectionTabs
							user={user}
							displayName={displayName}
							effectiveWalletAddress={effectiveWalletAddress}
							isWalletReady={isWalletReady}
							isPollarUser={isPollarUser}
							onConnectKit={connectKit}
							initialSection={initialSection}
							defaultTab={defaultTab}
						/>
					</div>
				</div>
			</SectionContainer>
		</ProfileShell>
	)
}
