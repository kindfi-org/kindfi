'use client'

import { Fingerprint, KeyRound, Lock, Shield } from 'lucide-react'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

type PasskeySetupTipsVariant = 'panel' | 'inline'

interface PasskeySetupTipsProps {
	variant?: PasskeySetupTipsVariant
	className?: string
}

const tipItems = [
	{ icon: Shield, titleKey: 'passkeyTipSecureTitle', bodyKey: 'passkeyTipSecureBody' },
	{ icon: Fingerprint, titleKey: 'passkeyTipEasyTitle', bodyKey: 'passkeyTipEasyBody' },
	{ icon: Lock, titleKey: 'passkeyTipDevicesTitle', bodyKey: 'passkeyTipDevicesBody' },
] as const

export function PasskeySetupTips({ variant = 'inline', className }: PasskeySetupTipsProps) {
	const { t } = useI18n()
	const isPanel = variant === 'panel'

	return (
		<section
			aria-labelledby="passkey-tips-title"
			className={cn(
				isPanel ? undefined : 'rounded-xl border border-slate-200/80 bg-[#fafbfc] px-4 py-4',
				className,
			)}
		>
			<div className={cn('mb-4 flex items-center gap-3', !isPanel && 'mb-3')}>
				<div
					className={cn(
						'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
						isPanel ? 'bg-white/15' : 'bg-emerald-50 text-emerald-700',
					)}
				>
					<KeyRound
						className={cn('h-5 w-5', isPanel ? 'text-white' : 'text-emerald-700')}
						aria-hidden="true"
					/>
				</div>
				<h2
					id="passkey-tips-title"
					className={cn('font-semibold', isPanel ? 'text-xl text-white' : 'text-sm text-slate-900')}
				>
					{t('auth.passkeyTipsTitle')}
				</h2>
			</div>

			<ul className="list-none space-y-4">
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
		</section>
	)
}
