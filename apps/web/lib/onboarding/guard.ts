import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { Logger } from '~/lib/logger'
import { computeOnboardingState } from './state'
import type { OnboardingProfileFields, OnboardingState } from './types'

const logger = new Logger()

export const ONBOARDING_PATH = '/onboarding'

async function fetchOnboardingProfile(userId: string): Promise<OnboardingProfileFields | null> {
	const { data, error } = await supabaseServiceRole
		.from('profiles')
		.select('role, display_name, bio, onboarding_step, onboarding_completed_at')
		.eq('id', userId)
		.single()

	if (error || !data) {
		logger.error({
			eventType: 'ONBOARDING_PROFILE_FETCH_FAILED',
			userId,
			error: error?.message,
		})
		return null
	}

	return {
		role: data.role,
		displayName: data.display_name,
		bio: data.bio,
		onboardingStep: data.onboarding_step,
		onboardingCompletedAt: data.onboarding_completed_at,
	}
}

export async function getOnboardingStateForUser(userId: string): Promise<OnboardingState | null> {
	const profile = await fetchOnboardingProfile(userId)
	if (!profile) return null
	return computeOnboardingState(profile)
}

/**
 * Server Component guard: redirects incomplete users to `/onboarding`.
 * Call at the top of any protected page. Does not redirect when the current
 * request is already for `/onboarding`, to avoid a redirect loop.
 */
export async function requireCompletedOnboarding(currentPathname?: string): Promise<{
	userId: string
	state: OnboardingState
}> {
	const session = await getServerSession(nextAuthOption)
	if (!session?.user?.id) {
		redirect('/sign-in')
	}

	const state = await getOnboardingStateForUser(session.user.id)
	if (!state) {
		redirect('/sign-in')
	}

	if (!state.isComplete && currentPathname !== ONBOARDING_PATH) {
		redirect(ONBOARDING_PATH)
	}

	return { userId: session.user.id, state }
}

export type OnboardingGuardFailure = {
	success: false
	error: string
	code: 'ONBOARDING_REQUIRED'
}

/**
 * Server action / API route guard. Returns a structured failure instead of
 * redirecting, so callers can surface an actionable error to the client.
 */
export async function requireOnboardingCompleteForAction(
	userId: string,
): Promise<OnboardingGuardFailure | null> {
	const state = await getOnboardingStateForUser(userId)
	if (!state || !state.isComplete) {
		return {
			success: false,
			error: 'Please finish onboarding before continuing.',
			code: 'ONBOARDING_REQUIRED',
		}
	}
	return null
}
