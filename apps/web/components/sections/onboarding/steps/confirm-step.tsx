'use client'

import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'
import type { SelectableOnboardingRole } from '~/lib/onboarding/types'

interface ConfirmStepProps {
	role: SelectableOnboardingRole
	displayName: string
	bio: string
	onFinish: () => void
}

export function ConfirmStep({ role, displayName, bio, onFinish }: ConfirmStepProps) {
	const { t } = useI18n()
	const [isFinishing, setIsFinishing] = useState(false)

	const handleFinish = () => {
		setIsFinishing(true)
		onFinish()
	}

	return (
		<section aria-labelledby="onboarding-confirm-heading" className="text-center">
			<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
				<CheckCircle2 className="h-8 w-8" aria-hidden="true" />
			</div>
			<h1 id="onboarding-confirm-heading" className="text-2xl font-bold sm:text-3xl">
				{t('onboarding.confirmTitle')}
			</h1>
			<p className="mt-2 text-base text-muted-foreground">
				{role === 'creator'
					? t('onboarding.confirmDescriptionCreator')
					: t('onboarding.confirmDescriptionDonor')}
			</p>

			<div className="mx-auto mt-6 max-w-sm rounded-lg border border-border bg-card p-5 text-left">
				<dl className="space-y-2 text-sm">
					<div className="flex justify-between gap-4">
						<dt className="text-muted-foreground">{t('profile.roleCreator')}</dt>
						<dd className="font-medium">
							{role === 'creator' ? t('profile.roleCreator') : t('profile.roleDonor')}
						</dd>
					</div>
					<div className="flex justify-between gap-4">
						<dt className="text-muted-foreground">{t('profile.displayName')}</dt>
						<dd className="font-medium">{displayName}</dd>
					</div>
					<div className="flex flex-col gap-1">
						<dt className="text-muted-foreground">{t('profile.bio')}</dt>
						<dd className="text-sm">{bio}</dd>
					</div>
				</dl>
			</div>

			<p className="mx-auto mt-6 max-w-md text-xs text-muted-foreground">
				{t('onboarding.confirmComplianceNote')}
			</p>

			<Button
				type="button"
				onClick={handleFinish}
				disabled={isFinishing}
				className="gradient-btn mt-8 w-full rounded-full text-white sm:w-auto"
			>
				{isFinishing ? t('onboarding.saving') : t('onboarding.goToDashboard')}
			</Button>
		</section>
	)
}
