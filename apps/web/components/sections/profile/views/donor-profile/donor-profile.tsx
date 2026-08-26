'use client'

import { GamificationSection } from '~/components/sections/gamification/gamification-section'
import { DonorDonationsSection } from './donor-donations-section'
import { DonorNftsSection } from './donor-nfts-section'
import { DonorOverview } from './donor-overview'
import type { DonorProfileProps } from './types'
import { useDonorProfileData } from './use-donor-profile-data'

function DonorProfileWithProjects({
	userId,
	showSection,
}: {
	userId: string
	showSection: 'overview' | 'donations'
}) {
	const { supportedProjects, projectsWithBalances, stats, isLoading, error } =
		useDonorProfileData(userId)

	if (showSection === 'donations') {
		return <DonorDonationsSection projectsWithBalances={projectsWithBalances} />
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

export function DonorProfile({
	userId,
	displayName: _displayName,
	showSection = 'overview',
}: DonorProfileProps) {
	if (showSection === 'gamification') {
		return <GamificationSection />
	}

	if (showSection === 'nfts') {
		return <DonorNftsSection />
	}

	return (
		<DonorProfileWithProjects
			userId={userId}
			showSection={showSection === 'donations' ? 'donations' : 'overview'}
		/>
	)
}
