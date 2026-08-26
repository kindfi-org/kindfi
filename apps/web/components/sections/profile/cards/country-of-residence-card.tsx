'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getDeclaredCountryAction } from '~/app/actions/profile/get-declared-country'
import { updateDeclaredCountryAction } from '~/app/actions/profile/update-declared-country'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { getCountryCodeOptions } from '~/lib/compliance/countries'
import { useI18n } from '~/lib/i18n'
import { ProfileSurfaceCard } from '../profile-surface-card'

/**
 * Minimal collection point for the mandatory country-of-residence field
 * required by issue #1009. The full onboarding flow from issue #1006 (which
 * would normally require this during signup) is not merged on this branch,
 * so this profile-settings card is the interim way to satisfy "prevent
 * completing onboarding without selecting a country" until that flow lands.
 */
export function CountryOfResidenceCard({ userId }: { userId: string }) {
	const { t } = useI18n()
	const [countryCode, setCountryCode] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const options = getCountryCodeOptions()

	useEffect(() => {
		let cancelled = false
		getDeclaredCountryAction().then((result) => {
			if (cancelled) return
			if (result.success) setCountryCode(result.countryCode)
			setIsLoading(false)
		})
		return () => {
			cancelled = true
		}
	}, [])

	async function handleChange(value: string) {
		setIsSaving(true)
		const previous = countryCode
		setCountryCode(value)
		try {
			const result = await updateDeclaredCountryAction({ countryCode: value })
			if (!result.success) {
				setCountryCode(previous)
				toast.error(result.error || t('profile.countryOfResidenceUpdateFailed'))
				return
			}
			toast.success(t('profile.countryOfResidenceUpdated'))
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<ProfileSurfaceCard className="h-full" data-user-id={userId}>
			<div className="mb-6 border-b border-slate-100 pb-5">
				<h3 className="text-lg font-semibold text-gray-900">{t('profile.countryOfResidence')}</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					{t('profile.countryOfResidenceDescription')}
				</p>
			</div>
			<div className="space-y-2">
				<Label htmlFor="declared_country">{t('profile.countryOfResidence')}</Label>
				<Select
					value={countryCode ?? undefined}
					onValueChange={handleChange}
					disabled={isLoading || isSaving}
				>
					<SelectTrigger id="declared_country" className="rounded-xl">
						<SelectValue placeholder={t('profile.selectCountryPlaceholder')} />
					</SelectTrigger>
					<SelectContent className="max-h-64">
						{options.map((option) => (
							<SelectItem key={option.code} value={option.code}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{!countryCode && !isLoading ? (
					<p className="text-xs text-amber-600">{t('profile.countryOfResidenceRequired')}</p>
				) : null}
			</div>
		</ProfileSurfaceCard>
	)
}
