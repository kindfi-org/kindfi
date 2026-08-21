'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { useI18n } from '~/lib/i18n'
import type { WalletSendFormInput } from '~/lib/wallet-send/types'

interface SendAssetsFormProps {
	formInput: WalletSendFormInput
	onChange: (input: WalletSendFormInput) => void
	onContinue: () => void
	formError: string | null
	isDisabled: boolean
	xlmBalance?: string
	usdcBalance?: string
	isLoadingBalances: boolean
}

export const SendAssetsForm = ({
	formInput,
	onChange,
	onContinue,
	formError,
	isDisabled,
	xlmBalance,
	usdcBalance,
	isLoadingBalances,
}: SendAssetsFormProps) => {
	const { t } = useI18n()

	return (
		<div className="space-y-5">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="send-asset">{t('profile.sendAssetsAssetLabel')}</Label>
					<Select
						value={formInput.asset}
						onValueChange={(value) =>
							onChange({ ...formInput, asset: value as WalletSendFormInput['asset'] })
						}
					>
						<SelectTrigger id="send-asset">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="XLM">{t('profile.sendAssetsAssetXlm')}</SelectItem>
							<SelectItem value="USDC">{t('profile.sendAssetsAssetUsdc')}</SelectItem>
						</SelectContent>
					</Select>
					<p className="text-xs text-muted-foreground">
						{isLoadingBalances ? (
							<span className="inline-flex items-center gap-1">
								<Loader2 className="size-3 animate-spin" />
								{t('profile.sendAssetsBalanceLoading')}
							</span>
						) : (
							<>
								{t('profile.sendAssetsAvailableBalance')}:{' '}
								{formInput.asset === 'XLM' ? (xlmBalance ?? '0') : (usdcBalance ?? '0')}{' '}
								{formInput.asset}
							</>
						)}
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="send-amount">{t('profile.sendAssetsAmountLabel')}</Label>
					<Input
						id="send-amount"
						inputMode="decimal"
						placeholder="0.0"
						value={formInput.amount}
						onChange={(event) => onChange({ ...formInput, amount: event.target.value })}
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="send-destination">{t('profile.sendAssetsDestinationLabel')}</Label>
				<Input
					id="send-destination"
					placeholder="G… or M…"
					value={formInput.destination}
					onChange={(event) => onChange({ ...formInput, destination: event.target.value })}
				/>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="send-memo-type">{t('profile.sendAssetsMemoTypeLabel')}</Label>
					<Select
						value={formInput.memo.type}
						onValueChange={(value) => {
							if (value === 'none') {
								onChange({ ...formInput, memo: { type: 'none' } })
								return
							}

							onChange({
								...formInput,
								memo: {
									type: value as 'text' | 'id',
									value: formInput.memo.type === value ? formInput.memo.value : '',
								},
							})
						}}
					>
						<SelectTrigger id="send-memo-type">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">{t('profile.sendAssetsMemoNone')}</SelectItem>
							<SelectItem value="text">{t('profile.sendAssetsMemoText')}</SelectItem>
							<SelectItem value="id">{t('profile.sendAssetsMemoId')}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{formInput.memo.type !== 'none' ? (
					<div className="space-y-2">
						<Label htmlFor="send-memo-value">{t('profile.sendAssetsMemoValueLabel')}</Label>
						<Input
							id="send-memo-value"
							value={formInput.memo.value}
							onChange={(event) =>
								onChange({
									...formInput,
									memo: { type: formInput.memo.type, value: event.target.value },
								})
							}
						/>
					</div>
				) : null}
			</div>

			<p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
				{t('profile.sendAssetsMemoWarning')}
			</p>

			{formError ? <p className="text-sm text-destructive">{formError}</p> : null}

			<Button type="button" className="w-full sm:w-auto" disabled={isDisabled} onClick={onContinue}>
				{t('profile.sendAssetsContinue')}
			</Button>
		</div>
	)
}
