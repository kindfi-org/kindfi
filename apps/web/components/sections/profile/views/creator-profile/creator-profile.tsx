'use client'

import { GamificationSection } from '~/components/sections/gamification/gamification-section'
import { FoundationsSection } from '../foundations-section'
import { CreatorCampaignsSection } from './creator-campaigns-section'
import { CreatorNftsSection } from './creator-nfts-section'
import { CreatorOverview } from './creator-overview'
import type { CreatorProfileProps } from './types'
import { useCreatorProfileData } from './use-creator-profile-data'

function CreatorProfileCampaigns({
	userId,
	showSection,
}: {
	userId: string
	showSection: 'overview' | 'campaigns'
}) {
	const {
		projects,
		projectsWithBalances,
		activeProjects,
		totalRaised,
		formatCurrency,
		isLoading,
		error,
	} = useCreatorProfileData(userId)

	if (showSection === 'campaigns') {
		return (
			<CreatorCampaignsSection
				projectsCount={projects.length}
				activeProjectsCount={activeProjects.length}
				totalRaised={totalRaised}
				formatCurrency={formatCurrency}
				projectsWithBalances={projectsWithBalances}
				isLoading={isLoading}
				error={error}
			/>
		)
	}

	return (
		<CreatorOverview
			projectsCount={projects.length}
			activeProjects={activeProjects}
			totalRaised={totalRaised}
			formatCurrency={formatCurrency}
			projectsWithBalances={projectsWithBalances}
			isLoading={isLoading}
			error={error}
		/>
	)
}

export function CreatorProfile({
	userId,
	displayName: _displayName,
	showSection = 'overview',
}: CreatorProfileProps) {
	if (showSection === 'gamification') {
		return <GamificationSection />
	}

	if (showSection === 'foundations') {
		return <FoundationsSection userId={userId} />
	}

	if (showSection === 'nfts') {
		return <CreatorNftsSection />
	}

	return (
		<CreatorProfileCampaigns
			userId={userId}
			showSection={showSection === 'campaigns' ? 'campaigns' : 'overview'}
		/>
	)
}
