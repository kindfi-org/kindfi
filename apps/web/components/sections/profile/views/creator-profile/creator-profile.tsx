'use client'

import { GamificationSection } from '~/components/sections/gamification/gamification-section'
import { FoundationsSection } from '../foundations-section'
import { CreatorCampaignsSection } from './creator-campaigns-section'
import { CreatorNftsSection } from './creator-nfts-section'
import { CreatorOverview } from './creator-overview'
import type { CreatorProfileProps } from './types'
import { useCreatorProfileData } from './use-creator-profile-data'

export function CreatorProfile({
	userId,
	displayName: _displayName,
	showSection = 'overview',
}: CreatorProfileProps) {
	const {
		projects,
		projectsWithBalances,
		activeProjects,
		totalRaised,
		formatCurrency,
		isLoading,
		error,
	} = useCreatorProfileData(userId)

	if (showSection === 'gamification') {
		return <GamificationSection />
	}

	if (showSection === 'foundations') {
		return <FoundationsSection userId={userId} />
	}

	if (showSection === 'nfts') {
		return <CreatorNftsSection />
	}

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
