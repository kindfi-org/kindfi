'use client'

import { motion } from 'framer-motion'
import { Gift } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { GamificationSection } from '~/components/sections/gamification/gamification-section'
import { useDashboardContext } from '~/hooks/profile/use-dashboard-context'
import { useI18n } from '~/lib/i18n'
import { profileFadeUp } from '../../profile-motion'
import { ProfileViewSkeleton } from '../../skeletons'
import { SectionHeader } from '../section-header'

const ReferralSection = dynamic(
	() =>
		import('../../referral-section').then((mod) => ({
			default: mod.ReferralSection,
		})),
	{ loading: () => <ProfileViewSkeleton />, ssr: false },
)

export function RewardsSection() {
	const { t } = useI18n()
	const { user } = useDashboardContext()

	return (
		<div className="space-y-8">
			<motion.div {...profileFadeUp(0)}>
				<SectionHeader
					icon={Gift}
					title={t('profile.rewardsSectionTitle')}
					description={t('profile.rewardsSectionDescription')}
				/>
			</motion.div>

			{/* Gamification: quests, streaks, NFTs, gamification referrals */}
			<motion.div {...profileFadeUp(0.04)}>
				<Suspense fallback={<ProfileViewSkeleton />}>
					<GamificationSection />
				</Suspense>
			</motion.div>

			{/* Referral program — distinct from gamification referral engine */}
			<motion.div {...profileFadeUp(0.08)}>
				<Suspense fallback={<ProfileViewSkeleton />}>
					<ReferralSection
						profilePollarAddress={user.profile?.pollar_wallet_address}
						profileExternalAddress={user.profile?.external_wallet_address}
					/>
				</Suspense>
			</motion.div>
		</div>
	)
}
