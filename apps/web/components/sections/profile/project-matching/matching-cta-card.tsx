'use client'

import type { LucideIcon } from 'lucide-react'
import { Brain, Sparkles, Target, UserRound } from 'lucide-react'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'
import { ProfileSurfaceCard } from '../profile-surface-card'

const MATCHING_STEPS: Array<{ icon: LucideIcon; labelKey: string }> = [
	{ icon: UserRound, labelKey: 'profile.matchingStepProfile' },
	{ icon: Brain, labelKey: 'profile.matchingStepAnalyze' },
	{ icon: Target, labelKey: 'profile.matchingStepRecommend' },
]

interface MatchingCtaCardProps {
	onActivate: () => void
}

export const MatchingCtaCard = ({ onActivate }: MatchingCtaCardProps) => {
	const { t } = useI18n()

	return (
		<ProfileSurfaceCard className="border-dashed border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30">
			<div className="flex flex-col gap-6">
				<div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
						<Sparkles className="h-5 w-5" aria-hidden="true" />
					</div>
					<div className="flex-1 space-y-1">
						<p className="text-sm font-medium text-foreground">{t('profile.matchingCtaTitle')}</p>
						<p className="text-sm leading-relaxed text-muted-foreground">
							{t('profile.matchingCtaDescription')}
						</p>
					</div>
					<Button
						type="button"
						onClick={onActivate}
						className="shrink-0 rounded-full bg-emerald-400 text-white hover:bg-emerald-500"
					>
						<Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
						{t('profile.matchingCtaButton')}
					</Button>
				</div>

				<ol className="grid gap-3 sm:grid-cols-3">
					{MATCHING_STEPS.map((step, index) => {
						const Icon = step.icon
						return (
							<li
								key={step.labelKey}
								className="flex items-center gap-3 rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-left shadow-sm"
							>
								<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
									{index + 1}
								</span>
								<div className="min-w-0">
									<p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
										<Icon className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
										{t(step.labelKey)}
									</p>
								</div>
							</li>
						)
					})}
				</ol>

				<p className="text-center text-xs text-muted-foreground sm:text-left">
					{t('profile.matchingPrivacyNote')}
				</p>
			</div>
		</ProfileSurfaceCard>
	)
}
