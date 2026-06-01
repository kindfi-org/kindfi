'use client'

import { useWaitlist } from '~/hooks/contexts/use-waitlist.context'
import { useI18n } from '~/lib/i18n'
import { ROLE_OPTIONS } from '../constants'

export function WaitlistReviewSummary() {
	const { t } = useI18n()
	const { formData } = useWaitlist()

	const roleLabel = ROLE_OPTIONS.find((role) => role.value === formData.role)

	return (
		<div className="rounded-xl border border-slate-200 bg-[#fafbfc] p-4">
			<p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
				{t('waitlist.reviewTitle')}
			</p>
			<dl className="space-y-3 text-sm">
				<div className="flex items-start justify-between gap-4">
					<dt className="text-muted-foreground">{t('waitlist.fields.name')}</dt>
					<dd className="text-right font-medium text-slate-900">
						{formData.name}
					</dd>
				</div>
				{formData.email ? (
					<div className="flex items-start justify-between gap-4">
						<dt className="text-muted-foreground">
							{t('waitlist.fields.email')}
						</dt>
						<dd className="text-right font-medium text-slate-900">
							{formData.email}
						</dd>
					</div>
				) : null}
				<div className="flex items-start justify-between gap-4">
					<dt className="text-muted-foreground">{t('waitlist.fields.role')}</dt>
					<dd className="text-right font-medium text-slate-900">
						{roleLabel ? t(roleLabel.labelKey) : formData.role}
					</dd>
				</div>
				{formData.projectName ? (
					<div className="flex items-start justify-between gap-4">
						<dt className="text-muted-foreground">
							{t('waitlist.fields.projectName')}
						</dt>
						<dd className="text-right font-medium text-slate-900">
							{formData.projectName}
						</dd>
					</div>
				) : null}
				{formData.location ? (
					<div className="flex items-start justify-between gap-4">
						<dt className="text-muted-foreground">
							{t('waitlist.fields.location')}
						</dt>
						<dd className="text-right font-medium text-slate-900">
							{formData.location}
						</dd>
					</div>
				) : null}
			</dl>
		</div>
	)
}
