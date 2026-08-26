'use client'

import { useReducedMotion } from 'framer-motion'
import { FoundationBreadcrumb } from './components/foundation-breadcrumb'
import { FoundationCampaigns } from './components/foundation-campaigns'
import { FoundationDetailSkeleton } from './components/foundation-detail-skeleton'
import {
	FoundationConnectCard,
	FoundationFounderCard,
} from './components/foundation-founder-connect'
import { FoundationHero } from './components/foundation-hero'
import { FoundationMilestones } from './components/foundation-milestones'
import { FoundationMissionVision } from './components/foundation-mission-vision'
import { FoundationNotFound } from './components/foundation-not-found'
import { FoundationStoryImpact } from './components/foundation-story-impact'
import { FoundationTeamSection } from './components/foundation-team-section'
import { useFoundationDetail } from './hooks/use-foundation-detail'

interface FoundationDetailClientWrapperProps {
	slug: string
}

export function FoundationDetailClientWrapper({ slug }: FoundationDetailClientWrapperProps) {
	const shouldReduceMotion = useReducedMotion()
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

	if (isLoading) {
		return <FoundationDetailSkeleton />
	}

	if (error || !foundation) {
		return <FoundationNotFound />
	}

	return (
		<div className="space-y-12 sm:space-y-14 md:space-y-16">
			<div className="space-y-5">
				<FoundationBreadcrumb />
				<FoundationHero
					foundation={foundation}
					slug={slug}
					yearFounded={yearFounded}
					formattedDonations={formattedDonations}
					shareUrl={shareUrl}
					isFounder={isFounder}
				/>
			</div>

			<FoundationMissionVision foundation={foundation} shouldReduceMotion={shouldReduceMotion} />

			<FoundationStoryImpact foundation={foundation} shouldReduceMotion={shouldReduceMotion} />

			{foundation.milestones && foundation.milestones.length > 0 ? (
				<FoundationMilestones
					milestones={foundation.milestones}
					shouldReduceMotion={shouldReduceMotion}
				/>
			) : null}

			<FoundationCampaigns campaigns={campaignsWithSlug} shouldReduceMotion={shouldReduceMotion} />

			<FoundationTeamSection slug={slug} shouldReduceMotion={shouldReduceMotion} />

			<div className="grid gap-5 md:grid-cols-2">
				{foundation.founder ? (
					<FoundationFounderCard
						founder={foundation.founder}
						shouldReduceMotion={shouldReduceMotion}
					/>
				) : null}

				<FoundationConnectCard
					websiteUrl={foundation.websiteUrl}
					socialLinks={foundation.socialLinks}
					shouldReduceMotion={shouldReduceMotion}
				/>
			</div>
		</div>
	)
}
