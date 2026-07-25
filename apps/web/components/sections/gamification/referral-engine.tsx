'use client'

import { ReferralSection } from '~/components/sections/profile/referral-section'

interface ReferralEngineProps {
	profilePollarAddress?: string | null
	profileExternalAddress?: string | null
}

export function ReferralEngine({
	profilePollarAddress,
	profileExternalAddress,
}: ReferralEngineProps) {
	return (
		<ReferralSection
			profilePollarAddress={profilePollarAddress}
			profileExternalAddress={profileExternalAddress}
		/>
	)
}
