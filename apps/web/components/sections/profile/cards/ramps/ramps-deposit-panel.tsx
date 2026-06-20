'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
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
import { isEtherfuseTermsError } from '~/lib/etherfuse/order-errors'
import { useI18n } from '~/lib/i18n'
import { ProfileSurfaceCard } from '../../profile-surface-card'
import { RAMP_CURRENCIES } from './constants'
import { RampsAssetPicker } from './ramps-asset-picker'
import { RampsOrderSuccess } from './ramps-order-success'

interface RampsDepositPanelProps {
	userId: string
	walletAddress: string
	etherfuseCustomerId?: string
	etherfuseBankAccountId?: string
	isOnboardingReady: boolean
	hasStartedOnboarding: boolean
	onStartOnboarding: () => void
	onRefreshStatus: () => void
	isStartingOnboarding: boolean
}

export function RampsDepositPanel({
	userId,
	walletAddress,
	etherfuseCustomerId,
	etherfuseBankAccountId,
	isOnboardingReady,
	hasStartedOnboarding,
	onStartOnboarding,
	onRefreshStatus,
	isStartingOnboarding,
}: RampsDepositPanelProps) {
	const { t } = useI18n()
	const [amount, setAmount] = useState('')
	const [currency, setCurrency] = useState('MXN')
	const [targetAsset, setTargetAsset] = useState('')
	const [isProcessing, setIsProcessing] = useState(false)
	const [statusPage, setStatusPage] = useState<string | null>(null)

	const handleSubmit = async () => {
		const parsedAmount = Number(amount)
		if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
			toast.error(t('profile.rampsInvalidAmount'))
			return
		}

		if (!targetAsset) {
			toast.error(t('profile.rampsAssetRequired'))
			return
		}

		if (!isOnboardingReady || !etherfuseCustomerId || !etherfuseBankAccountId) {
			if (hasStartedOnboarding) {
				onRefreshStatus()
			}
			onStartOnboarding()
			return
		}

		try {
			setIsProcessing(true)

			const response = await fetch('/api/etherfuse/on-ramp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId,
					amount: String(parsedAmount),
					currency,
					targetAsset,
					walletAddress,
					etherfuseCustomerId,
					etherfuseBankAccountId,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || t('profile.rampsDepositFailed'))
			}

			if (data.success) {
				setStatusPage(data.statusPage)
				setAmount('')
				toast.success(t('profile.rampsDepositSuccess'))
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : t('profile.rampsDepositFailed')
			if (isEtherfuseTermsError(message)) {
				toast.error(t('profile.rampsTermsRequired'))
				onRefreshStatus()
				onStartOnboarding()
				return
			}
			logger.error('Etherfuse on-ramp error:', error)
			toast.error(message)
		} finally {
			setIsProcessing(false)
		}
	}

	if (statusPage) {
		return (
			<RampsOrderSuccess
				mode="deposit"
				statusPage={statusPage}
				onReset={() => setStatusPage(null)}
			/>
		)
	}

	return (
		<ProfileSurfaceCard padding="lg" className="h-full">
			<div className="space-y-6">
				<div className="space-y-1">
					<h3 className="text-lg font-semibold text-gray-900">{t('profile.rampsDepositTitle')}</h3>
					<p className="text-sm text-muted-foreground">{t('profile.rampsDepositDescription')}</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="ramp-deposit-amount">{t('profile.rampsAmountLabel')}</Label>
					<div className="flex overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100">
						<Select value={currency} onValueChange={setCurrency} disabled={isProcessing}>
							<SelectTrigger
								id="ramp-deposit-currency"
								className="h-14 w-[110px] shrink-0 rounded-none border-0 border-r bg-slate-50/80 px-3 shadow-none focus:ring-0"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{RAMP_CURRENCIES.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{t(item.labelKey)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Input
							id="ramp-deposit-amount"
							type="number"
							inputMode="decimal"
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
							placeholder={t('profile.rampsAmountPlaceholder')}
							min="0"
							step="0.01"
							disabled={isProcessing}
							className="h-14 border-0 bg-transparent text-2xl font-semibold tabular-nums shadow-none focus-visible:ring-0"
						/>
					</div>
				</div>

				<RampsAssetPicker
					currency={currency}
					walletAddress={walletAddress}
					value={targetAsset}
					onChange={setTargetAsset}
					disabled={isProcessing}
					label={t('profile.rampsReceiveAsset')}
					loadingMessage={t('profile.rampsAssetsLoading')}
					emptyMessage={t('profile.rampsAssetsEmpty')}
				/>

				<div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm leading-relaxed text-sky-950">
					{t('profile.rampsDepositNote')}
				</div>

				<Button
					onClick={handleSubmit}
					disabled={
						!amount || Number(amount) <= 0 || !targetAsset || isProcessing || isStartingOnboarding
					}
					className="gradient-btn h-12 w-full rounded-full text-base text-white"
				>
					{isProcessing ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
							{t('profile.rampsProcessing')}
						</>
					) : (
						<>
							<ArrowRight className="mr-2 h-4 w-4" aria-hidden="true" />
							{t('profile.rampsContinueCta')}
						</>
					)}
				</Button>
			</div>
		</ProfileSurfaceCard>
	)
}
