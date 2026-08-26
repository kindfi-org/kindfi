'use client'

import { ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'
import { ProfileSurfaceCard } from '../../profile-surface-card'

interface RampsOrderSuccessProps {
	mode: 'deposit' | 'withdraw'
	statusPage: string
	burnTransaction?: string | null
	onReset: () => void
}

export function RampsOrderSuccess({
	mode,
	statusPage,
	burnTransaction,
	onReset,
}: RampsOrderSuccessProps) {
	const { t } = useI18n()

	return (
		<ProfileSurfaceCard padding="lg" className="overflow-hidden">
			<div className="relative">
				<div
					className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl"
					aria-hidden="true"
				/>
				<div className="relative space-y-6">
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
							<CheckCircle2 className="h-6 w-6" aria-hidden="true" />
						</div>
						<div className="space-y-1">
							<h3 className="text-lg font-semibold text-gray-900">
								{t('profile.rampsOrderCreatedTitle')}
							</h3>
							<p className="text-sm leading-relaxed text-muted-foreground">
								{mode === 'deposit'
									? t('profile.rampsOrderCreatedDepositDesc')
									: t('profile.rampsOrderCreatedWithdrawDesc')}
							</p>
						</div>
					</div>

					{burnTransaction ? (
						<div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
							<p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
								{t('profile.rampsBurnTransaction')}
							</p>
							<p className="mt-2 break-all font-mono text-xs text-gray-900">{burnTransaction}</p>
						</div>
					) : null}

					<div className="flex flex-col gap-3 sm:flex-row">
						<Button
							onClick={() => window.open(statusPage, '_blank', 'noopener,noreferrer')}
							className="gradient-btn flex-1 rounded-full text-white"
						>
							<ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
							{t('profile.rampsViewStatus')}
						</Button>
						<Button onClick={onReset} variant="outline" className="flex-1 rounded-full">
							<ArrowRight className="mr-2 h-4 w-4" aria-hidden="true" />
							{t('profile.rampsNewOrder')}
						</Button>
					</div>
				</div>
			</div>
		</ProfileSurfaceCard>
	)
}
