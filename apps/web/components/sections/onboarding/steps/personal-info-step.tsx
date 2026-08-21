'use client'

import { useState } from 'react'
import { updateOnboardingPersonalInfoAction } from '~/app/actions/onboarding/update-personal-info'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { Textarea } from '~/components/base/textarea'
import { useI18n } from '~/lib/i18n'
import {
	BIO_MAX,
	BIO_MIN,
	DISPLAY_NAME_MAX,
	DISPLAY_NAME_MIN,
} from '~/lib/schemas/onboarding.schemas'

interface PersonalInfoStepProps {
	initialDisplayName: string
	initialBio: string
	onBack: () => void
	onComplete: (displayName: string, bio: string) => void
}

export function PersonalInfoStep({
	initialDisplayName,
	initialBio,
	onBack,
	onComplete,
}: PersonalInfoStepProps) {
	const { t } = useI18n()
	const [displayName, setDisplayName] = useState(initialDisplayName)
	const [bio, setBio] = useState(initialBio)
	const [isSaving, setIsSaving] = useState(false)
	const [errors, setErrors] = useState<Record<string, string[]>>({})
	const [formError, setFormError] = useState<string | null>(null)

	const validateLocal = () => {
		const nextErrors: Record<string, string[]> = {}
		const trimmedName = displayName.trim()
		const trimmedBio = bio.trim()

		if (trimmedName.length < DISPLAY_NAME_MIN || trimmedName.length > DISPLAY_NAME_MAX) {
			nextErrors.displayName = [t('onboarding.displayNameError')]
		}
		if (trimmedBio.length < BIO_MIN || trimmedBio.length > BIO_MAX) {
			nextErrors.bio = [t('onboarding.bioError')]
		}
		return nextErrors
	}

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		if (isSaving) return

		const localErrors = validateLocal()
		if (Object.keys(localErrors).length > 0) {
			setErrors(localErrors)
			return
		}

		setErrors({})
		setFormError(null)
		setIsSaving(true)
		try {
			const result = await updateOnboardingPersonalInfoAction({
				displayName: displayName.trim(),
				bio: bio.trim(),
			})
			if (!result.success) {
				setErrors(result.fieldErrors ?? {})
				setFormError(result.error)
				return
			}
			onComplete(displayName.trim(), bio.trim())
		} catch (_error) {
			setFormError(t('onboarding.saveRetry'))
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<section aria-labelledby="onboarding-personal-info-heading">
			<h1
				id="onboarding-personal-info-heading"
				className="text-center text-2xl font-bold sm:text-3xl"
			>
				{t('onboarding.personalInfoTitle')}
			</h1>
			<p className="mt-2 text-center text-base text-muted-foreground">
				{t('onboarding.personalInfoDescription')}
			</p>

			<form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
				<div className="space-y-2">
					<Label htmlFor="onboarding-display-name">{t('profile.displayName')}</Label>
					<Input
						id="onboarding-display-name"
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
						maxLength={DISPLAY_NAME_MAX}
						required
						aria-invalid={Boolean(errors.displayName)}
						aria-describedby={errors.displayName ? 'onboarding-display-name-error' : undefined}
						className="rounded-xl"
					/>
					{errors.displayName && (
						<p id="onboarding-display-name-error" role="alert" className="text-sm text-red-600">
							{errors.displayName[0]}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="onboarding-bio">{t('profile.bio')}</Label>
					<Textarea
						id="onboarding-bio"
						value={bio}
						onChange={(e) => setBio(e.target.value)}
						maxLength={BIO_MAX}
						rows={4}
						required
						placeholder={t('profile.bioPlaceholder')}
						aria-invalid={Boolean(errors.bio)}
						aria-describedby={errors.bio ? 'onboarding-bio-error' : undefined}
						className="resize-none rounded-xl"
					/>
					{errors.bio && (
						<p id="onboarding-bio-error" role="alert" className="text-sm text-red-600">
							{errors.bio[0]}
						</p>
					)}
				</div>

				{formError && (
					<p role="alert" className="text-sm text-red-600">
						{formError}
					</p>
				)}

				<div className="flex items-center justify-between gap-3 pt-2">
					<Button type="button" variant="ghost" onClick={onBack} disabled={isSaving}>
						{t('onboarding.back')}
					</Button>
					<Button
						type="submit"
						disabled={isSaving}
						className="gradient-btn rounded-full text-white"
					>
						{isSaving ? t('onboarding.saving') : t('onboarding.continue')}
					</Button>
				</div>
			</form>
		</section>
	)
}
