'use client'

import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useDashboardContext } from '~/hooks/profile/use-dashboard-context'
import { useI18n } from '~/lib/i18n'
import { AccountInfoCard } from '../../cards/account-info-card'
import { CountryOfResidenceCard } from '../../cards/country-of-residence-card'
import { PersonalInfoCard } from '../../cards/personal-info-card'
import { RoleCard } from '../../cards/role-card'
import { profileFadeUp } from '../../profile-motion'
import { SectionHeader } from '../section-header'

export function SettingsSection() {
	const { t } = useI18n()
	const { user } = useDashboardContext()

	return (
		<div className="space-y-6">
			<motion.div {...profileFadeUp(0)}>
				<SectionHeader
					icon={Settings}
					title={t('profile.settingsTitle')}
					description={t('profile.settingsDescription')}
				/>
			</motion.div>

			<motion.div {...profileFadeUp(0.05)}>
				<div className="grid gap-6 lg:grid-cols-2">
					<PersonalInfoCard
						userId={user.id}
						displayName={user.profile?.display_name ?? ''}
						bio={user.profile?.bio ?? ''}
						imageUrl={user.profile?.image_url ?? ''}
						_email={user.email}
					/>
					<CountryOfResidenceCard userId={user.id} />
					<AccountInfoCard
						userEmail={user.email}
						createdAt={user.created_at}
						slug={user.profile?.slug ?? ''}
					/>
					<RoleCard userId={user.id} currentRole={user.profile?.role ?? 'pending'} />
				</div>
			</motion.div>
		</div>
	)
}
