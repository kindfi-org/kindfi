'use client'

import { motion } from 'framer-motion'
import { Link2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import { useEtherfuseUserOnboarding } from '~/hooks/use-etherfuse-user-onboarding'
import { useI18n } from '~/lib/i18n'
import { profileFadeUp } from '../profile-motion'
import { ProfileSectionHeader } from '../profile-section-header'
import { ProfileSurfaceCard } from '../profile-surface-card'
import { RampsDepositPanel } from './ramps/ramps-deposit-panel'
import { RampsSidebar } from './ramps/ramps-sidebar'
import { RampsWithdrawPanel } from './ramps/ramps-withdraw-panel'

interface FiatRampsSectionProps {
	userId: string
	walletAddress: string | null
	isWalletReady: boolean
	isPollarUser: boolean
	onConnectKit: () => Promise<void>
}

type RampMode = 'deposit' | 'withdraw'

export function FiatRampsSection({
	userId,
	walletAddress,
	isWalletReady,
	isPollarUser,
	onConnectKit,
}: FiatRampsSectionProps) {
	const { t } = useI18n()
	const [mode, setMode] = useState<RampMode>('deposit')
	const {
		onboarding,
		isStarting,
		startOnboarding,
		isReady,
		refreshStatus,
		status,
		hasStartedOnboarding,
	} = useEtherfuseUserOnboarding(userId, walletAddress)

	const handleStartOnboarding = async () => {
		try {
			await startOnboarding()
			toast.success(t('profile.rampsOnboardingStarted'))
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t('profile.rampsOnboardingFailed'))
		}
	}

	return (
		<div className="space-y-8">
			<ProfileSectionHeader
				eyebrow={t('profile.rampsEyebrow')}
				title={t('profile.rampsTitle')}
				highlight={t('profile.rampsHighlight')}
				description={t('profile.rampsDescription')}
			/>

			{!isWalletReady || !walletAddress ? (
				<motion.div {...profileFadeUp(0.05)}>
					<ProfileSurfaceCard padding="lg" className="overflow-hidden">
						<div className="relative mx-auto flex max-w-lg flex-col items-center gap-5 py-4 text-center">
							<div className="relative space-y-2">
								<h3 className="text-xl font-semibold text-gray-900">
									{isPollarUser
										? t('profile.rampsPollarWalletLoadingTitle')
										: t('profile.rampsWalletRequiredTitle')}
								</h3>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{isPollarUser
										? t('profile.rampsPollarWalletLoadingDescription')
										: t('profile.rampsWalletRequiredDescription')}
								</p>
							</div>
							{isPollarUser ? (
								<Loader2
									className="h-5 w-5 animate-spin text-muted-foreground"
									aria-hidden="true"
								/>
							) : (
								<Button onClick={onConnectKit} variant="outline" className="rounded-full">
									<Link2 className="mr-2 h-4 w-4" aria-hidden="true" />
									{t('profile.connectExternalWallet')}
								</Button>
							)}
						</div>
					</ProfileSurfaceCard>
				</motion.div>
			) : (
				<motion.div {...profileFadeUp(0.05)} className="grid gap-5 lg:grid-cols-12 lg:gap-6">
					<div className="lg:col-span-4">
						<RampsSidebar
							mode={mode}
							onModeChange={setMode}
							walletAddress={walletAddress}
							isOnboardingReady={isReady}
							hasStartedOnboarding={hasStartedOnboarding}
							onboardingStatus={status}
							isStartingOnboarding={isStarting}
							onStartOnboarding={handleStartOnboarding}
							onRefreshStatus={() => {
								void refreshStatus()
							}}
						/>
					</div>
					<div className="lg:col-span-8">
						{mode === 'deposit' ? (
							<RampsDepositPanel
								userId={userId}
								walletAddress={walletAddress}
								etherfuseCustomerId={onboarding?.customerId}
								etherfuseBankAccountId={onboarding?.bankAccountId}
								isOnboardingReady={isReady}
								hasStartedOnboarding={hasStartedOnboarding}
								onStartOnboarding={handleStartOnboarding}
								onRefreshStatus={() => {
									void refreshStatus()
								}}
								isStartingOnboarding={isStarting}
							/>
						) : (
							<RampsWithdrawPanel
								userId={userId}
								walletAddress={walletAddress}
								etherfuseCustomerId={onboarding?.customerId}
								bankAccountId={onboarding?.bankAccountId}
								isOnboardingReady={isReady}
								hasStartedOnboarding={hasStartedOnboarding}
								onStartOnboarding={handleStartOnboarding}
								onRefreshStatus={() => {
									void refreshStatus()
								}}
								isStartingOnboarding={isStarting}
							/>
						)}
					</div>
				</motion.div>
			)}
		</div>
	)
}
