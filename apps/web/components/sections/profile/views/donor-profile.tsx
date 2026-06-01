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
import { DonationHistory } from './donor-profile/donor-profile-parts'
import { DonorProfileOverview } from './donor-profile/donor-profile-overview'
import { useDonorProfile } from './donor-profile/use-donor-profile'

interface DonorProfileProps {
	userId: string
	displayName: string
	showSection?: string
}

export function DonorProfile({
	userId,
	displayName: _displayName,
	showSection = 'overview',
}: DonorProfileProps) {
	const profileData = useDonorProfile(userId)

	if (showSection === 'gamification') {
		return <GamificationSection />
	}

	if (showSection === 'donations') {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Donation History</CardTitle>
				</CardHeader>
				<CardContent>
					<DonationHistory donations={profileData.projectsWithBalances} />
				</CardContent>
			</Card>
		)
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

	return <DonorProfileOverview {...profileData} />
}
