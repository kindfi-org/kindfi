'use client'

import { isSmartAccountEnabled } from '@packages/lib/smart-account'
import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useDashboardContext } from '~/hooks/profile/use-dashboard-context'
import { useI18n } from '~/lib/i18n'
import { SendAssetsCard } from '../../cards/send-assets/send-assets-card'
import { WalletCard } from '../../cards/wallet-card'
import { profileFadeUp } from '../../profile-motion'
import { ProfileViewSkeleton } from '../../skeletons'
import { SectionHeader } from '../section-header'

const FiatRampsSection = dynamic(
	() =>
		import('../../cards/fiat-ramps-section').then((mod) => ({
			default: mod.FiatRampsSection,
		})),
	{
		loading: () => <ProfileViewSkeleton />,
		ssr: false,
	},
)

export function WalletsSection() {
	const { t } = useI18n()
	const {
		user,
		smartAccountAddress,
		externalWalletAddress,
		isExternalConnected,
		effectiveWalletAddress,
		isWalletReady,
		isPollarUser,
		connectKit,
		disconnectKit,
	} = useDashboardContext()

	return (
		<div className="space-y-6">
			<motion.div {...profileFadeUp(0)}>
				<SectionHeader
					icon={Wallet}
					title={t('profile.walletsSectionTitle')}
					description={t('profile.walletsSectionDescription')}
				/>
			</motion.div>

			{/* Wallet card */}
			<motion.div {...profileFadeUp(0.04)}>
				<WalletCard
					smartAccountAddress={isSmartAccountEnabled() ? (smartAccountAddress ?? null) : null}
					externalWalletAddress={externalWalletAddress}
					isExternalConnected={isExternalConnected}
					onboardingProvider={user.profile?.onboarding_provider ?? 'legacy_passkey'}
					pollarWalletAddress={
						user.profile?.pollar_wallet_address ?? user.profile?.external_wallet_address ?? null
					}
					onConnectExternal={connectKit}
					onDisconnectExternal={disconnectKit}
				/>
			</motion.div>

			{/* Send assets */}
			<motion.div {...profileFadeUp(0.06)}>
				<SendAssetsCard walletAddress={effectiveWalletAddress} isWalletReady={isWalletReady} />
			</motion.div>

			{/* Fiat on/off ramps — lazy mounted */}
			<motion.div {...profileFadeUp(0.08)}>
				<Suspense fallback={<ProfileViewSkeleton />}>
					<FiatRampsSection
						userId={user.id}
						walletAddress={effectiveWalletAddress}
						isWalletReady={isWalletReady}
						isPollarUser={isPollarUser}
						onConnectKit={connectKit}
					/>
				</Suspense>
			</motion.div>
		</div>
	)
}
