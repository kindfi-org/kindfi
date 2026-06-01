'use client'

import { useReducedMotion } from 'framer-motion'
import { FoundationCampaignsSection } from './foundation-detail/foundation-campaigns-section'
import { FoundationDetailHero } from './foundation-detail/foundation-detail-hero'
import { FoundationDetailHeader } from './foundation-detail/foundation-detail-header'
import {
	FoundationDetailLoading,
	FoundationDetailNotFound,
} from './foundation-detail/foundation-detail-states'
import { FoundationFounderConnect } from './foundation-detail/foundation-founder-connect'
import { FoundationMilestonesSection } from './foundation-detail/foundation-milestones-section'
import { FoundationMissionVision } from './foundation-detail/foundation-mission-vision'
import { useFoundationDetail } from './foundation-detail/use-foundation-detail'

interface FoundationDetailClientWrapperProps {
	slug: string
}

export function FoundationDetailClientWrapper({
	slug,
}: FoundationDetailClientWrapperProps) {
	const {
		foundation,
		isLoading,
		error,
		yearFounded,
		formattedDonations,
		shareUrl,
		campaignsWithSlug,
		isFounder,
	} = useFoundationDetail(slug)

	const shouldReduceMotion = useReducedMotion()

	if (isLoading) {
		return <FoundationDetailLoading />
	}

	if (error || !foundation) {
		return <FoundationDetailNotFound />
	}

	return (
		<div className="space-y-8">
			<FoundationDetailHero coverImageUrl={foundation.coverImageUrl} />
			<FoundationDetailHeader
				foundation={foundation}
				slug={slug}
				yearFounded={yearFounded}
				formattedDonations={formattedDonations}
				shareUrl={shareUrl}
				isFounder={isFounder}
			/>
			<FoundationMissionVision
				foundation={foundation}
				shouldReduceMotion={shouldReduceMotion}
			/>
			<FoundationMilestonesSection
				foundation={foundation}
				shouldReduceMotion={shouldReduceMotion}
			/>
			<FoundationCampaignsSection
				campaignsWithSlug={campaignsWithSlug}
				shouldReduceMotion={shouldReduceMotion}
			/>
			<FoundationFounderConnect
				foundation={foundation}
				shouldReduceMotion={shouldReduceMotion}
			/>
		</div>
	)
}
