'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { KycRequiredGate } from '~/components/sections/kyc/kyc-required-gate'
import { useAuth } from '~/hooks/use-auth'
import { useKycRequiredGate } from '~/hooks/use-kyc-required-gate'
import { useWalletSendBalances } from '~/hooks/wallet-send/use-wallet-send-balances'
import { useWalletSendFlow } from '~/hooks/wallet-send/use-wallet-send-flow'
import { useI18n } from '~/lib/i18n'
import { profileFadeUp } from '../../profile-motion'
import { ProfileSectionHeader } from '../../profile-section-header'
import { ProfileSurfaceCard } from '../../profile-surface-card'
import { SendAssetsConfirm } from './send-assets-confirm'
import { SendAssetsForm } from './send-assets-form'
import { SendAssetsResult } from './send-assets-result'

interface SendAssetsCardProps {
	walletAddress: string | null
	isWalletReady: boolean
}

export const SendAssetsCard = ({ walletAddress, isWalletReady }: SendAssetsCardProps) => {
	const { t } = useI18n()
	const { user } = useAuth()
	const kycGate = useKycRequiredGate(user?.id ?? '')
	const {
		step,
		formInput,
		setFormInput,
		validatedPayment,
		formError,
		result,
		isSubmitting,
		config,
		configError,
		review,
		confirmSend,
		reset,
		goBack,
	} = useWalletSendFlow(walletAddress)
	const { balances, isLoading, refresh } = useWalletSendBalances(walletAddress)

	if (!isWalletReady || !walletAddress) {
		return null
	}

	if (configError) {
		return (
			<motion.div {...profileFadeUp(0.09)}>
				<ProfileSurfaceCard padding="lg">
					<p className="text-sm text-destructive">{configError}</p>
				</ProfileSurfaceCard>
			</motion.div>
		)
	}

	return (
		<motion.div {...profileFadeUp(0.09)} className="space-y-6">
			<ProfileSectionHeader
				eyebrow={t('profile.sendAssetsEyebrow')}
				title={t('profile.sendAssetsTitle')}
				highlight={t('profile.sendAssetsHighlight')}
				description={t('profile.sendAssetsDescription')}
			/>

			<ProfileSurfaceCard padding="lg">
				{step === 'form' ? (
					<SendAssetsForm
						formInput={formInput}
						onChange={setFormInput}
						onContinue={review}
						formError={formError}
						isDisabled={isSubmitting || isLoading}
						xlmBalance={balances?.XLM.available}
						usdcBalance={balances?.USDC.available}
						isLoadingBalances={isLoading}
					/>
				) : null}

				{step === 'confirm' && validatedPayment ? (
					<SendAssetsConfirm
						payment={validatedPayment}
						estimatedFeeXlm="0.00001"
						onBack={goBack}
						onConfirm={async () => {
							const allowed = await kycGate.preflight('send_assets', {
								amount: Number(validatedPayment.amount),
								asset: validatedPayment.asset,
							})
							if (!allowed) return
							await confirmSend()
							await refresh()
						}}
						isSubmitting={isSubmitting}
					/>
				) : null}

				{step === 'signing' ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="size-4 animate-spin" />
						{t('profile.sendAssetsSigning')}
					</div>
				) : null}

				{step === 'result' && result && config ? (
					<SendAssetsResult result={result} networkId={config.networkId} onReset={reset} />
				) : null}
			</ProfileSurfaceCard>

			<KycRequiredGate
				open={kycGate.open}
				onOpenChange={kycGate.setOpen}
				userId={kycGate.userId}
				denial={kycGate.denial}
			/>
		</motion.div>
	)
}
