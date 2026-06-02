'use client'

import { GamificationSection } from '~/components/sections/gamification/gamification-section'
import { DonorDonationsSection } from './donor-donations-section'
import { DonorNftsSection } from './donor-nfts-section'
import { DonorOverview } from './donor-overview'
import type { DonorProfileProps } from './types'
import { useDonorProfileData } from './use-donor-profile-data'

export function DonorProfile({
	userId,
	displayName: _displayName,
	showSection = 'overview',
}: DonorProfileProps) {
	const { supportedProjects, projectsWithBalances, stats, isLoading, error } =
		useDonorProfileData(userId)

	if (showSection === 'gamification') {
		return <GamificationSection />
	}

	if (showSection === 'donations') {
		return <DonorDonationsSection projectsWithBalances={projectsWithBalances} />
	}

	if (showSection === 'nfts') {
		return <DonorNftsSection />
	}

	return (
		<DonorOverview
			supportedProjectsCount={supportedProjects.length}
			projectsWithBalances={projectsWithBalances}
			stats={stats}
			isLoading={isLoading}
			error={error}
		/>
	)
}
