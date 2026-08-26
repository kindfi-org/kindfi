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
		<div className="space-y-6">
			{projectsWithBalances.length > 0 ? (
				<ProfileSurfaceCard className="border-emerald-100 bg-emerald-50/40">
					<h3 className="text-lg font-semibold text-foreground">{t('profile.shareImpactTitle')}</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						{t('profile.shareImpactDescription')}
					</p>
				</ProfileSurfaceCard>
			) : null}

			<ProfileSurfaceCard>
				<h3 className="mb-4 text-lg font-semibold">{t('profile.donationHistory')}</h3>
				<DonationHistory donations={projectsWithBalances} t={t} />
			</ProfileSurfaceCard>
		</div>
	)
}
