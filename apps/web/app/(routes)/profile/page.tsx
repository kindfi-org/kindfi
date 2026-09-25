import { isSmartAccountEnabled } from '@packages/lib/smart-account'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { ProfileDashboardV2 } from '~/components/sections/profile/dashboard/profile-dashboard-v2'
import { ProfileDashboard } from '~/components/sections/profile/profile-dashboard'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { getCanonicalKycStatusForUser } from '~/lib/kyc/session-service'
import { requireCompletedOnboarding } from '~/lib/onboarding/guard'
import { resolveSmartAccountAddress } from '~/lib/utils/wallet-address'

/** Set NEXT_PUBLIC_DASHBOARD_V2=true in .env to enable the new dashboard layout. */
const DASHBOARD_V2_ENABLED = process.env.NEXT_PUBLIC_DASHBOARD_V2 === 'true'

export const metadata: Metadata = {
	title: 'My Profile | KindFi',
	description:
		'Manage your KindFi profile, view your donation history, and track your social impact contributions.',
	robots: {
		index: false,
		follow: false,
	},
}

interface ProfilePageProps {
	searchParams: Promise<{
		kyc?: string
		verificationSessionId?: string
		section?: string
	}>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
	const session = await getServerSession(nextAuthOption)
	if (!session?.user) {
		redirect('/sign-in')
	}

	await requireCompletedOnboarding('/profile')

	const params = await searchParams
	const kycCallback = params.kyc === 'completed' && Boolean(params.verificationSessionId)
	const kycCompleted = (await getCanonicalKycStatusForUser(session.user.id)) === 'approved'

	const supabase = await createSupabaseServerClient()
	const { data: profileData, error } = await supabase
		.from('profiles')
		.select(
			'role, display_name, bio, image_url, slug, created_at, onboarding_provider, pollar_wallet_address, external_wallet_address, product_tour_completed_at',
		)
		.eq('id', session.user.id)
		.single()

	if (error || !profileData) {
		logger.error('⚠️ ProfilePage profile fetch error:', error)
		redirect('/sign-in')
	}

	const userPayload = {
		id: session.user.id,
		email: session.user.email || '',
		created_at: profileData.created_at,
		profile: profileData,
	}
	const smartAccountAddress = isSmartAccountEnabled()
		? resolveSmartAccountAddress(session.device?.address || session.user.device?.address)
		: null

	if (DASHBOARD_V2_ENABLED) {
		return (
			<ProfileDashboardV2
				user={userPayload}
				smartAccountAddress={smartAccountAddress}
				kycCompleted={kycCompleted}
				kycCallback={kycCallback}
				initialSection={params.section}
			/>
		)
	}

	return (
		<ProfileDashboard
			user={userPayload}
			smartAccountAddress={smartAccountAddress}
			kycCompleted={kycCompleted}
			kycCallback={kycCallback}
			initialSection={params.section}
		/>
	)
}
