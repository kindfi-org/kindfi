'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useDashboardContext } from '~/hooks/profile/use-dashboard-context'
import { useI18n } from '~/lib/i18n'
import { profileFadeUp } from '../../profile-motion'
import { ProfileViewSkeleton } from '../../skeletons'
import { SectionHeader } from '../section-header'

const DonorProfile = dynamic(
	() =>
		import('../../views/donor-profile').then((mod) => ({
			default: mod.DonorProfile,
		})),
	{ loading: () => <ProfileViewSkeleton />, ssr: false },
)

export function DonationsSection() {
	const { t } = useI18n()
	const { user, displayName } = useDashboardContext()

	return (
		<div className="space-y-6">
			<motion.div {...profileFadeUp(0)}>
				<SectionHeader
					icon={Heart}
					title={t('profile.donationsSectionTitle')}
					description={t('profile.donationsSectionDescription')}
				/>
			</motion.div>

			<motion.div {...profileFadeUp(0.05)}>
				<Suspense fallback={<ProfileViewSkeleton />}>
					<DonorProfile userId={user.id} displayName={displayName} showSection="overview" />
				</Suspense>
			</motion.div>

			<motion.div {...profileFadeUp(0.08)}>
				<Suspense fallback={<ProfileViewSkeleton />}>
					<DonorProfile userId={user.id} displayName={displayName} showSection="donations" />
				</Suspense>
			</motion.div>
		</div>
	)
}
