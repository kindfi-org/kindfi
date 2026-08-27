'use client'

import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useDashboardContext } from '~/hooks/profile/use-dashboard-context'
import { useI18n } from '~/lib/i18n'
import { profileFadeUp } from '../../profile-motion'
import { ProfileViewSkeleton } from '../../skeletons'
import { SectionHeader } from '../section-header'

const CreatorProfile = dynamic(
	() =>
		import('../../views/creator-profile').then((mod) => ({
			default: mod.CreatorProfile,
		})),
	{ loading: () => <ProfileViewSkeleton />, ssr: false },
)

export function CampaignsSection() {
	const { t } = useI18n()
	const { user, displayName } = useDashboardContext()

	return (
		<div className="space-y-6">
			<motion.div {...profileFadeUp(0)}>
				<SectionHeader
					icon={BarChart3}
					title={t('profile.campaignsSectionTitle')}
					description={t('profile.campaignsSectionDescription')}
				/>
			</motion.div>

			<motion.div {...profileFadeUp(0.05)}>
				<Suspense fallback={<ProfileViewSkeleton />}>
					<CreatorProfile userId={user.id} displayName={displayName} showSection="overview" />
				</Suspense>
			</motion.div>

			<motion.div {...profileFadeUp(0.08)}>
				<Suspense fallback={<ProfileViewSkeleton />}>
					<CreatorProfile userId={user.id} displayName={displayName} showSection="campaigns" />
				</Suspense>
			</motion.div>

			<motion.div {...profileFadeUp(0.1)}>
				<Suspense fallback={<ProfileViewSkeleton />}>
					<CreatorProfile userId={user.id} displayName={displayName} showSection="foundations" />
				</Suspense>
			</motion.div>
		</div>
	)
}
