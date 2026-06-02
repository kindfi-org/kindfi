'use client'

import { CheckCircle2 } from 'lucide-react'
import { Button } from '~/components/base/button'
import { DialogDescription, DialogTitle } from '~/components/base/dialog'
import { useI18n } from '~/lib/i18n'

interface WaitlistSuccessProps {
	onClose: () => void
}

export function WaitlistSuccess({ onClose }: WaitlistSuccessProps) {
	const { t } = useI18n()

	return (
		<div className="flex flex-col items-center px-6 py-10 text-center">
			<div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
				<CheckCircle2 className="h-8 w-8" />
			</div>
			<DialogTitle className="text-2xl font-bold tracking-tight">
				{t('waitlist.successTitle')}
			</DialogTitle>
			<DialogDescription className="mt-3 max-w-sm text-base leading-relaxed">
				{t('waitlist.successDescription')}
			</DialogDescription>
			<Button className="gradient-btn mt-8 min-w-40 text-white" onClick={onClose}>
				{t('waitlist.actions.close')}
			</Button>
		</div>
	)
}
