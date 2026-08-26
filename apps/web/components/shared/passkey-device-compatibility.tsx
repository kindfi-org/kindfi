'use client'

import { MonitorSmartphone } from 'lucide-react'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

type PasskeyDeviceCompatibilityVariant = 'inline' | 'panel'

type CompatResult = 'yes' | 'no' | 'unlikely'

interface PasskeyDeviceCompatibilityProps {
	variant?: PasskeyDeviceCompatibilityVariant
	hideHeader?: boolean
	className?: string
}

const compatRows: Array<{
	id: string
	scenarioKey: string
	detailKey: string
	result: CompatResult
}> = [
	{
		id: 'icloud',
		scenarioKey: 'passkeyCompatIcloud',
		detailKey: 'passkeyCompatIcloudDetail',
		result: 'yes',
	},
	{
		id: 'google',
		scenarioKey: 'passkeyCompatGoogle',
		detailKey: 'passkeyCompatGoogleDetail',
		result: 'yes',
	},
	{
		id: 'device-only',
		scenarioKey: 'passkeyCompatDeviceOnly',
		detailKey: 'passkeyCompatDeviceOnlyDetail',
		result: 'no',
	},
	{
		id: 'cross-ecosystem',
		scenarioKey: 'passkeyCompatCrossEcosystem',
		detailKey: 'passkeyCompatCrossEcosystemDetail',
		result: 'unlikely',
	},
]

const resultLabelKey: Record<CompatResult, string> = {
	yes: 'passkeyCompatYes',
	no: 'passkeyCompatNo',
	unlikely: 'passkeyCompatUnlikely',
}

const resultBadgeClass = {
	inline: {
		yes: 'border-emerald-200 bg-emerald-50 text-emerald-800',
		no: 'border-destructive/20 bg-destructive/5 text-destructive',
		unlikely: 'border-amber-200 bg-amber-50 text-amber-900',
	},
	panel: {
		yes: 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100',
		no: 'border-red-300/40 bg-red-400/15 text-red-100',
		unlikely: 'border-amber-300/40 bg-amber-400/15 text-amber-100',
	},
} as const

export function PasskeyDeviceCompatibility({
	variant = 'inline',
	hideHeader = false,
	className,
}: PasskeyDeviceCompatibilityProps) {
	const { t } = useI18n()
	const isPanel = variant === 'panel'

	return (
		<section
			aria-labelledby={hideHeader ? undefined : 'passkey-compat-title'}
			className={cn(
				isPanel ? undefined : 'rounded-xl border border-slate-200/80 bg-[#fafbfc] px-4 py-4',
				className,
			)}
		>
			{hideHeader ? null : (
				<div className={cn('mb-3 flex items-start gap-3', isPanel && 'mb-4')}>
					<div
						className={cn(
							'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
							isPanel ? 'bg-white/15' : 'bg-primary/10 text-primary',
						)}
					>
						<MonitorSmartphone
							className={cn('h-4 w-4', isPanel && 'text-white')}
							aria-hidden="true"
						/>
					</div>
					<div className="min-w-0">
						<h2
							id="passkey-compat-title"
							className={cn(
								'font-semibold',
								isPanel ? 'text-base text-white' : 'text-sm text-slate-900',
							)}
						>
							{t('auth.passkeyCompatTitle')}
						</h2>
						<p
							className={cn(
								'mt-1 text-sm leading-relaxed',
								isPanel ? 'text-white/75' : 'text-muted-foreground',
							)}
						>
							{t('auth.passkeyCompatSubtitle')}
						</p>
					</div>
				</div>
			)}

			<div className="sr-only">{t('auth.passkeyCompatColScenario')}</div>
			<div className="sr-only">{t('auth.passkeyCompatColWorks')}</div>

			<ul className="list-none space-y-2.5">
				{compatRows.map(({ id, scenarioKey, detailKey, result }) => (
					<li
						key={id}
						className={cn(
							'rounded-lg border px-3 py-2.5',
							isPanel ? 'border-white/15 bg-white/5' : 'border-slate-200/80 bg-white',
						)}
					>
						<p
							className={cn(
								'text-sm font-medium leading-snug',
								isPanel ? 'text-white' : 'text-slate-800',
							)}
						>
							{t(`auth.${scenarioKey}`)}
						</p>
						<div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
							<span
								className={cn(
									'inline-flex shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold',
									resultBadgeClass[variant][result],
								)}
							>
								{t(`auth.${resultLabelKey[result]}`)}
							</span>
							<span
								className={cn(
									'text-xs leading-relaxed',
									isPanel ? 'text-white/70' : 'text-muted-foreground',
								)}
							>
								— {t(`auth.${detailKey}`)}
							</span>
						</div>
					</li>
				))}
			</ul>
		</section>
	)
}
