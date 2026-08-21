'use client'

import { Heart, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { selectOnboardingRoleAction } from '~/app/actions/onboarding/select-role'
import { useI18n } from '~/lib/i18n'
import type { SelectableOnboardingRole } from '~/lib/onboarding/types'

interface RoleStepProps {
	initialRole: SelectableOnboardingRole | null
	onComplete: (role: SelectableOnboardingRole) => void
}

export function RoleStep({ initialRole, onComplete }: RoleStepProps) {
	const { t, tArray } = useI18n()
	const [selected, setSelected] = useState<SelectableOnboardingRole | null>(initialRole)
	const [isSaving, setIsSaving] = useState(false)

	const handleSelect = async (role: SelectableOnboardingRole) => {
		if (isSaving) return
		setSelected(role)
		setIsSaving(true)
		try {
			const result = await selectOnboardingRoleAction({ role })
			if (!result.success) {
				throw new Error(result.error)
			}
			onComplete(role)
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t('onboarding.roleSaveError'))
			setSelected(initialRole)
		} finally {
			setIsSaving(false)
		}
	}

	const donorHighlights = tArray('onboarding.roleDonorHighlights')
	const creatorHighlights = tArray('onboarding.roleCreatorHighlights')

	return (
		<section aria-labelledby="onboarding-role-heading">
			<h1 id="onboarding-role-heading" className="text-center text-2xl font-bold sm:text-3xl">
				{t('onboarding.roleTitle')}
			</h1>
			<p className="mt-2 text-center text-base text-muted-foreground">
				{t('onboarding.roleDescription')}
			</p>

			<div className="mt-8 grid gap-4 sm:grid-cols-2">
				<button
					type="button"
					aria-pressed={selected === 'donor'}
					disabled={isSaving}
					onClick={() => handleSelect('donor')}
					className={`group relative rounded-lg border-2 p-6 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000124] ${
						selected === 'donor'
							? 'border-[#000124] bg-[#000124]/5 shadow-lg'
							: 'border-border bg-card hover:border-[#000124]/50'
					} ${isSaving ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
				>
					<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#000124]/10 text-[#000124]">
						<Heart className="h-6 w-6" aria-hidden="true" />
					</div>
					<h2 className="mb-2 text-lg font-bold">{t('profile.roleDonor')}</h2>
					<p className="mb-3 text-sm text-muted-foreground">{t('onboarding.roleDonorSummary')}</p>
					<ul className="space-y-1 text-xs text-muted-foreground">
						{donorHighlights.map((item) => (
							<li key={item} className="flex items-start gap-1.5">
								<span aria-hidden="true">•</span>
								<span>{item}</span>
							</li>
						))}
					</ul>
				</button>

				<button
					type="button"
					aria-pressed={selected === 'creator'}
					disabled={isSaving}
					onClick={() => handleSelect('creator')}
					className={`group relative rounded-lg border-2 p-6 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000124] ${
						selected === 'creator'
							? 'border-[#000124] bg-[#000124]/5 shadow-lg'
							: 'border-border bg-card hover:border-[#000124]/50'
					} ${isSaving ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
				>
					<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#000124]/10 text-[#000124]">
						<Lightbulb className="h-6 w-6" aria-hidden="true" />
					</div>
					<h2 className="mb-2 text-lg font-bold">{t('profile.roleCreator')}</h2>
					<p className="mb-3 text-sm text-muted-foreground">{t('onboarding.roleCreatorSummary')}</p>
					<ul className="space-y-1 text-xs text-muted-foreground">
						{creatorHighlights.map((item) => (
							<li key={item} className="flex items-start gap-1.5">
								<span aria-hidden="true">•</span>
								<span>{item}</span>
							</li>
						))}
					</ul>
				</button>
			</div>

			<p className="mt-6 text-center text-xs text-muted-foreground">
				{t('onboarding.roleSeparateSteps')}
			</p>

			{isSaving && (
				<div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-[#000124] border-t-transparent" />
					<span>{t('onboarding.roleSaving')}</span>
				</div>
			)}
		</section>
	)
}
