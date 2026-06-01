import { useI18n } from '~/lib/i18n'
import { ProfileSurfaceCard } from '../../profile-surface-card'
import { DonationHistory } from './donation-history'
import type { DonorProjectWithBalance } from './types'

interface DonorDonationsSectionProps {
	projectsWithBalances: DonorProjectWithBalance[]
}

export function DonorDonationsSection({ projectsWithBalances }: DonorDonationsSectionProps) {
	const { t } = useI18n()

	return (
		<ProfileSurfaceCard>
			<h3 className="mb-4 text-lg font-semibold">{t('profile.donationHistory')}</h3>
			<DonationHistory donations={projectsWithBalances} t={t} />
		</ProfileSurfaceCard>
	)
}
