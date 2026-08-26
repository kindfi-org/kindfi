'use client'

import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'

interface WaitlistStepActionsProps {
	onBack?: () => void
	onPrimary?: () => void
	primaryLabel: string
	primaryType?: 'button' | 'submit'
	isPending?: boolean
	showBack?: boolean
	secondaryAction?: ReactNode
}

export function WaitlistStepActions({
	onBack,
	onPrimary,
	primaryLabel,
	primaryType = 'submit',
	isPending = false,
	showBack = true,
	secondaryAction,
}: WaitlistStepActionsProps) {
	const { t } = useI18n()

	return (
		<div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-2">
				{showBack && onBack ? (
					<Button type="button" variant="ghost" onClick={onBack}>
						{t('waitlist.actions.back')}
					</Button>
				) : null}
				{secondaryAction}
			</div>
			<Button
				type={primaryType}
				className="gradient-btn min-w-36 text-white"
				disabled={isPending}
				onClick={onPrimary}
			>
				{isPending ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						{t('waitlist.actions.submitting')}
					</>
				) : (
					primaryLabel
				)}
			</Button>
		</div>
	)
}
