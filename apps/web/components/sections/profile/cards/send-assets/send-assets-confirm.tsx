'use client'

import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'
import type { ValidatedWalletSendPayment } from '~/lib/wallet-send/types'

interface SendAssetsConfirmProps {
	payment: ValidatedWalletSendPayment
	estimatedFeeXlm: string
	onBack: () => void
	onConfirm: () => void
	isSubmitting: boolean
}

export const SendAssetsConfirm = ({
	payment,
	estimatedFeeXlm,
	onBack,
	onConfirm,
	isSubmitting,
}: SendAssetsConfirmProps) => {
	const { t } = useI18n()

	return (
		<div className="space-y-5">
			<div className="rounded-xl border border-slate-200 bg-white/80 p-4 text-sm">
				<dl className="space-y-3">
					<div className="flex items-start justify-between gap-4">
						<dt className="text-muted-foreground">{t('profile.sendAssetsReviewAsset')}</dt>
						<dd className="font-medium text-gray-900">{payment.asset}</dd>
					</div>
					<div className="flex items-start justify-between gap-4">
						<dt className="text-muted-foreground">{t('profile.sendAssetsReviewAmount')}</dt>
						<dd className="font-medium text-gray-900">
							{payment.amount} {payment.asset}
						</dd>
					</div>
					<div className="flex items-start justify-between gap-4">
						<dt className="text-muted-foreground">{t('profile.sendAssetsReviewDestination')}</dt>
						<dd className="break-all text-right font-medium text-gray-900">
							{payment.destination}
						</dd>
					</div>
					<div className="flex items-start justify-between gap-4">
						<dt className="text-muted-foreground">{t('profile.sendAssetsReviewMemo')}</dt>
						<dd className="font-medium text-gray-900">
							{payment.memo.type === 'none'
								? t('profile.sendAssetsMemoNone')
								: payment.memo.type === 'text'
									? payment.memo.value
									: `#${payment.memo.value}`}
						</dd>
					</div>
					<div className="flex items-start justify-between gap-4">
						<dt className="text-muted-foreground">{t('profile.sendAssetsReviewFee')}</dt>
						<dd className="font-medium text-gray-900">{estimatedFeeXlm} XLM</dd>
					</div>
				</dl>
			</div>

			<p className="text-sm text-muted-foreground">{t('profile.sendAssetsIrreversibleWarning')}</p>
			<p className="text-sm text-muted-foreground">{t('profile.sendAssetsExchangeMemoWarning')}</p>

			<div className="flex flex-col gap-3 sm:flex-row">
				<Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
					{t('profile.sendAssetsBack')}
				</Button>
				<Button type="button" onClick={onConfirm} disabled={isSubmitting}>
					{isSubmitting ? t('profile.sendAssetsSigning') : t('profile.sendAssetsConfirmSend')}
				</Button>
			</div>
		</div>
	)
}
