import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { OnboardingFlow } from '~/components/sections/onboarding/onboarding-flow'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { computeOnboardingState } from '~/lib/onboarding/state'
import { resolveSafeCallbackUrl } from '~/lib/utils/safe-redirect'

export const metadata: Metadata = {
	title: 'Welcome to KindFi',
	description: 'Finish setting up your KindFi account.',
	robots: { index: false, follow: false },
}

interface OnboardingPageProps {
	searchParams: Promise<{ callbackUrl?: string }>
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
	const session = await getServerSession(nextAuthOption)
	if (!session?.user?.id) {
		const { callbackUrl } = await searchParams
		const safeCallback = resolveSafeCallbackUrl(callbackUrl, '/onboarding')
		redirect(`/sign-in?callbackUrl=${encodeURIComponent(safeCallback)}`)
	}

	const { data: profile, error } = await supabaseServiceRole
		.from('profiles')
		.select('role, display_name, bio, onboarding_step, onboarding_completed_at')
		.eq('id', session.user.id)
		.single()

	if (error || !profile) {
		redirect('/sign-in')
	}

	const state = computeOnboardingState({
		role: profile.role,
		displayName: profile.display_name,
		bio: profile.bio,
		onboardingStep: profile.onboarding_step,
		onboardingCompletedAt: profile.onboarding_completed_at,
	})

	const { callbackUrl } = await searchParams

	if (state.isComplete) {
		redirect(resolveSafeCallbackUrl(callbackUrl, '/profile'))
	}

	return (
		<OnboardingFlow
			initialStep={state.step}
			initialRole={profile.role === 'donor' || profile.role === 'creator' ? profile.role : null}
			initialDisplayName={profile.display_name ?? ''}
			initialBio={profile.bio ?? ''}
			callbackUrl={callbackUrl}
		/>
	)
}
