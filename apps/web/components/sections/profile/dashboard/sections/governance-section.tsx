'use client'

import { motion } from 'framer-motion'
import { Vote } from 'lucide-react'
import { useI18n } from '~/lib/i18n'
import { GovernanceCard } from '../../cards/governance-card'
import { profileFadeUp } from '../../profile-motion'
import { SectionHeader } from '../section-header'

export function GovernanceSection() {
	const { t } = useI18n()

	return (
		<div className="space-y-6">
			<motion.div {...profileFadeUp(0)}>
				<SectionHeader
					icon={Vote}
					title={t('profile.governanceSectionTitle')}
					description={t('profile.governanceSectionDescription')}
				/>
			</motion.div>

			<motion.div {...profileFadeUp(0.05)}>
				<GovernanceCard />
			</motion.div>
		</div>
	)
}
