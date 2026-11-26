'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Progress } from '~/components/base/progress'
import { useI18n } from '~/lib/i18n'
import type { OnboardingStep, SelectableOnboardingRole } from '~/lib/onboarding/types'
import { resolveSafeCallbackUrl } from '~/lib/utils/safe-redirect'
import { ConfirmStep } from './steps/confirm-step'
import { PersonalInfoStep } from './steps/personal-info-step'
import { RoleStep } from './steps/role-step'

const STEP_ORDER: OnboardingStep[] = ['role', 'personal_info', 'confirm']

interface OnboardingFlowProps {
	initialStep: OnboardingStep
	initialRole: SelectableOnboardingRole | null
	initialDisplayName: string
	initialBio: string
	callbackUrl?: string
}

export function OnboardingFlow({
	initialStep,
	initialRole,
	initialDisplayName,
	initialBio,
	callbackUrl,
}: OnboardingFlowProps) {
	const { t } = useI18n()
	const router = useRouter()

	const [step, setStep] = useState<OnboardingStep>(
		initialStep === 'completed' ? 'confirm' : initialStep,
	)
	const [role, setRole] = useState<SelectableOnboardingRole | null>(initialRole)
	const [displayName, setDisplayName] = useState(initialDisplayName)
	const [bio, setBio] = useState(initialBio)

	const currentIndex = Math.max(STEP_ORDER.indexOf(step), 0)
	const progressValue = ((currentIndex + 1) / STEP_ORDER.length) * 100

	const handleRoleComplete = (selectedRole: SelectableOnboardingRole) => {
		setRole(selectedRole)
		setStep('personal_info')
	}

	const handlePersonalInfoComplete = (name: string, bioText: string) => {
		setDisplayName(name)
		setBio(bioText)
		setStep('confirm')
	}

	const handleFinished = () => {
		const fallback = role === 'creator' ? '/profile?section=campaigns' : '/profile'
		router.push(resolveSafeCallbackUrl(callbackUrl, fallback))
	}

	return (
		<div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-4 py-10 sm:py-16">
			<div className="mb-8" aria-live="polite">
				<div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
					<span>{t('onboarding.progressLabel')}</span>
					<span>
						{currentIndex + 1} / {STEP_ORDER.length}
					</span>
				</div>
				<Progress
					value={progressValue}
					aria-label={t('onboarding.progressLabel')}
					className="h-2"
				/>
			</div>

			{step === 'role' && <RoleStep initialRole={role} onComplete={handleRoleComplete} />}

			{step === 'personal_info' && (
				<PersonalInfoStep
					initialDisplayName={displayName}
					initialBio={bio}
					onBack={() => setStep('role')}
					onComplete={handlePersonalInfoComplete}
				/>
			)}

			{step === 'confirm' && role && (
				<ConfirmStep role={role} displayName={displayName} bio={bio} onFinish={handleFinished} />
			)}
		</div>
	)
}
