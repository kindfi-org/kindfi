'use client'

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { useDashboardContext } from '~/hooks/profile/use-dashboard-context'
import { useI18n } from '~/lib/i18n'
import { KYCCard } from '../../cards/kyc-card'
import { profileFadeUp } from '../../profile-motion'
import { SectionHeader } from '../section-header'

export function KycSection() {
	const { t } = useI18n()
	const { user, kycCompleted } = useDashboardContext()

	return (
		<div className="space-y-6">
			<motion.div {...profileFadeUp(0)}>
				<SectionHeader
					icon={Shield}
					title={t('profile.kycSectionTitle')}
					description={t('profile.kycSectionDescription')}
				/>
			</motion.div>

			<motion.div {...profileFadeUp(0.05)}>
				<KYCCard userId={user.id} shouldRefresh={kycCompleted} />
			</motion.div>
		</div>
	)
}
