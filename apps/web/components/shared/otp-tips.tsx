'use client'

import { AlertTriangle, CheckCircle, Clock, Info, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

type OTPTipsVariant = 'card' | 'panel' | 'inline'

interface OTPTipsProps {
	variant?: OTPTipsVariant
	className?: string
}

const tipItems = [
	{ icon: Clock, titleKey: 'otpTipWhatTitle', bodyKey: 'otpTipWhatBody' },
	{ icon: Mail, titleKey: 'otpTipInboxTitle', bodyKey: 'otpTipInboxBody' },
	{ icon: AlertTriangle, titleKey: 'otpTipSecurityTitle', bodyKey: 'otpTipSecurityBody' },
	{ icon: CheckCircle, titleKey: 'otpTipDigitsTitle', bodyKey: 'otpTipDigitsBody' },
] as const

export function OTPTips({ variant = 'card', className }: OTPTipsProps) {
	const { t } = useI18n()

	const isPanel = variant === 'panel'
	const isInline = variant === 'inline'

	const list = (
		<ul className={cn('list-none space-y-4', isInline && 'space-y-3')}>
			{tipItems.map(({ icon: Icon, titleKey, bodyKey }) => (
				<li key={titleKey} className="flex gap-3">
					<Icon
						className={cn(
							'mt-0.5 h-4 w-4 shrink-0',
							isPanel ? 'text-white/70' : 'text-muted-foreground',
						)}
						aria-hidden="true"
					/>
					<p
						className={cn(
							'text-sm leading-relaxed',
							isPanel ? 'text-white/90' : 'text-muted-foreground',
						)}
					>
						<span className={cn('font-medium', isPanel ? 'text-white' : 'text-slate-800')}>
							{t(`auth.${titleKey}`)}
						</span>
						<span className={isPanel ? 'text-white/75' : ''}> — {t(`auth.${bodyKey}`)}</span>
					</p>
				</li>
			))}
		</ul>
	)

	if (isPanel) {
		return (
			<section aria-labelledby="otp-tips-title" className={className}>
				<div className="mb-6 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
						<Info className="h-5 w-5 text-white" aria-hidden="true" />
					</div>
					<h2 id="otp-tips-title" className="text-xl font-semibold text-white">
						{t('auth.otpTipsTitle')}
					</h2>
				</div>
				{list}
			</section>
		)
	}

	if (isInline) {
		return (
			<section
				aria-labelledby="otp-tips-title"
				className={cn('rounded-xl border border-slate-200/80 bg-[#fafbfc] px-4 py-4', className)}
			>
				<h2
					id="otp-tips-title"
					className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"
				>
					<Info className="h-4 w-4 text-primary" aria-hidden="true" />
					{t('auth.otpTipsTitle')}
				</h2>
				{list}
			</section>
		)
	}

	return (
		<Card aria-labelledby="otp-tips-title" className={className}>
			<CardHeader className="pb-2">
				<CardTitle id="otp-tips-title" className="flex items-center gap-2 text-base font-medium">
					<Info className="h-4 w-4 text-primary" aria-hidden="true" />
					{t('auth.otpTipsTitle')}
				</CardTitle>
			</CardHeader>
			<CardContent className="pb-4 pt-0">{list}</CardContent>
		</Card>
	)
}
