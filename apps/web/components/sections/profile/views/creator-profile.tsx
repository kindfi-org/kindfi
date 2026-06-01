'use client'

import { Trophy } from 'lucide-react'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { GamificationSection } from '~/components/sections/gamification/gamification-section'
import { NFTCollection } from '~/components/sections/gamification/nft-collection'
import {
	CreatorCampaignsSection,
	CreatorProfileOverview,
} from './creator-profile/creator-profile-sections'
import { useCreatorProfile } from './creator-profile/use-creator-profile'
import { FoundationsSection } from './foundations-section'

interface CreatorProfileProps {
	userId: string
	displayName: string
	showSection?: string
}

export function CreatorProfile({
	userId,
	displayName: _displayName,
	showSection = 'overview',
}: CreatorProfileProps) {
	const profileData = useCreatorProfile(userId)

	if (showSection === 'gamification') {
		return <GamificationSection />
	}

	if (showSection === 'foundations') {
		return <FoundationsSection userId={userId} />
	}

	if (showSection === 'nfts') {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Trophy className="h-5 w-5 text-primary" />
						NFT Collection
					</CardTitle>
				</CardHeader>
				<CardContent>
					<NFTCollection />
				</CardContent>
			</Card>
		)
	}

	if (showSection === 'campaigns') {
		return <CreatorCampaignsSection {...profileData} />
	}

	return <CreatorProfileOverview {...profileData} />
}
