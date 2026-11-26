import type { Database } from '@services/supabase'

export type ProfileRole = Database['public']['Enums']['user_role']
export type SelectableOnboardingRole = Extract<ProfileRole, 'donor' | 'creator'>

export type OnboardingStep = 'role' | 'personal_info' | 'confirm' | 'completed'

export interface OnboardingProfileFields {
	role: ProfileRole | null
	displayName: string | null
	bio: string | null
	onboardingStep: string | null
	onboardingCompletedAt: string | null
}

export interface OnboardingState {
	isComplete: boolean
	step: OnboardingStep
	hasRole: boolean
	hasPersonalInfo: boolean
}
