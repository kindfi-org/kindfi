'use client'

import type { Database } from '@services/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { ProductTourLauncher } from '~/components/product-tour/product-tour-launcher'
import { DashboardProvider } from '~/hooks/profile/use-dashboard-context'
import { useI18n } from '~/lib/i18n'
import { isCreatorProfileRole } from '~/lib/profile/is-creator-profile-role'
import { ProfileHeader } from '../profile-header'
import { type DashboardSection, normalizeSectionParam } from './dashboard-nav'
import { DashboardShell } from './dashboard-shell'
import { CampaignsSection } from './sections/campaigns-section'
import { DonationsSection } from './sections/donations-section'
import { GovernanceSection } from './sections/governance-section'
import { KycSection } from './sections/kyc-section'
import { OverviewSection } from './sections/overview-section'
import { RewardsSection } from './sections/rewards-section'
import { SettingsSection } from './sections/settings-section'
import { WalletsSection } from './sections/wallets-section'

type Role = Database['public']['Enums']['user_role']

interface ProfileDashboardV2Props {
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
	kycCompleted?: boolean
	initialSection?: string
}

function ProfileDashboardV2Inner({
	user,
	smartAccountAddress = null,
	kycCompleted = false,
	initialSection,
}: ProfileDashboardV2Props) {
	const { t } = useI18n()
	const searchParams = useSearchParams()

	const activeSection: DashboardSection = useMemo(
		() => normalizeSectionParam(searchParams?.get('section') || initialSection),
		[searchParams, initialSection],
	)

	const role = user.profile?.role ?? null
	const isCreator = isCreatorProfileRole(role)

	const displayName = useMemo(
		() => user.profile?.display_name || user.email?.split('@')[0] || 'You',
		[user.profile?.display_name, user.email],
	)

	// KYC callback toast
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

	const renderSection = () => {
		switch (activeSection) {
			case 'wallets':
				return <WalletsSection />
			case 'campaigns':
				// Creators and admins can access campaigns/foundations
				return isCreator ? <CampaignsSection /> : <OverviewSection />
			case 'donations':
				return role === 'donor' ? <DonationsSection /> : <OverviewSection />
			case 'rewards':
				return <RewardsSection />
			case 'governance':
				return <GovernanceSection />
			case 'kyc':
				return <KycSection />
			case 'settings':
				return <SettingsSection />
			default:
				return <OverviewSection />
		}
	}

	const header = (
		<>
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
					imageUrl={user.profile?.image_url ?? null}
					bio={user.profile?.bio ?? null}
					role={role}
					createdAt={user.created_at}
				/>
			</div>
		</>
	)

	return (
		<DashboardShell activeSection={activeSection} header={header}>
			{renderSection()}
		</DashboardShell>
	)
}

export function ProfileDashboardV2(props: ProfileDashboardV2Props) {
	return (
		<DashboardProvider
			user={props.user}
			smartAccountAddress={props.smartAccountAddress}
			kycCompleted={props.kycCompleted}
		>
			<Suspense fallback={null}>
				<ProfileDashboardV2Inner {...props} />
			</Suspense>
		</DashboardProvider>
	)
}
