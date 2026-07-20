'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Share2 } from 'lucide-react'
import Image from 'next/image'
import { useMemo } from 'react'
import { AnimatedCounter } from '~/components/sections/projects/detail/animated-counter'
import { SocialLinksDisplay } from '~/components/sections/projects/detail/social-links-display'
import {
	CategoryBadge,
	CountryFlag,
	ReleasedProgressBar,
} from '~/components/sections/projects/shared'
import { ShareButtons } from '~/components/shared/share-buttons'
import { useProjectFundingDisplay } from '~/hooks/projects/use-project-funding-display'
import { getProjectPageUrl } from '~/lib/seo/project-metadata'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { getCountryNameFromAlpha3 } from '~/lib/utils/project-utils'
import {
	calculateReleasedAmount,
	calculateReleasedProgressPercent,
} from '~/lib/utils/projects/milestone-funding'

interface ProjectHeroProps {
	project: ProjectDetail
	projectSlug: string
}

export function ProjectHero({ project, projectSlug }: ProjectHeroProps) {
	const reducedMotion = useReducedMotion()

	const { displayRaised, displaySupporters } = useProjectFundingDisplay({
		projectId: project.id,
		escrowContractAddress: project.escrowContractAddress,
		escrowType: project.escrowType,
		goal: project.goal,
		raised: project.raised,
		dbInvestors: project.investors,
	})

	const shareUrl = useMemo(
		() => getProjectPageUrl(project.slug, projectSlug),
		[project.slug, projectSlug],
	)

	const releasedAmount = useMemo(
		() => calculateReleasedAmount(project.milestones),
		[project.milestones],
	)
	const releasedPercentage = calculateReleasedProgressPercent(releasedAmount, project.goal) ?? 0

	return (
		<motion.section
			className="overflow-hidden mb-8 bg-white rounded-xl shadow-md"
			initial={reducedMotion ? false : { opacity: 0, y: 20 }}
			animate={reducedMotion ? false : { opacity: 1, y: 0 }}
			transition={reducedMotion ? { duration: 0 } : { duration: 0.5 }}
			aria-labelledby="project-hero-title"
		>
			<div className="overflow-hidden relative h-64 md:h-80 lg:h-96">
				<Image
					src={project.image || '/images/placeholder.png'}
					alt={`${project.title} banner`}
					fill
					className="object-cover"
					priority
					sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 66vw"
				/>
				{project.category && (
					<div className="absolute top-4 left-4">
						<CategoryBadge category={project.category} />
					</div>
				)}
			</div>

			<div className="p-6">
				<h1 id="project-hero-title" className="mb-3 text-3xl font-bold md:text-4xl text-balance">
					{project.title}
				</h1>

				<p className="mb-6 text-muted-foreground">{project.description}</p>

				{(project.location || project.socialLinks) && (
					<div className="flex flex-wrap gap-2 justify-between items-center mb-6">
						{project.location && (
							<div className="flex gap-2 items-center text-sm font-medium text-muted-foreground">
								<span>Location:</span>
								<CountryFlag countryCode={project.location} />
								<span className="text-gray-700">{getCountryNameFromAlpha3(project.location)}</span>
							</div>
						)}

						{project.socialLinks && (
							<div className="flex gap-3 items-center">
								<SocialLinksDisplay socialLinks={project.socialLinks} />
							</div>
						)}
					</div>
				)}

				<section
					className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-3 lg:grid-cols-5"
					aria-label="Project funding stats"
				>
					<div className="p-4 text-center bg-gray-50 rounded-lg">
						<p className="mb-1 text-sm text-muted-foreground">Raised</p>
						<p className="text-xl font-bold tabular-nums">
							{displayRaised === null ? (
								'…'
							) : (
								<>
									$<AnimatedCounter value={displayRaised} />
								</>
							)}
						</p>
					</div>
					<div className="p-4 text-center bg-gray-50 rounded-lg">
						<p className="mb-1 text-sm text-muted-foreground">Released</p>
						<p className="text-xl font-bold tabular-nums">
							$<AnimatedCounter value={releasedAmount} />
						</p>
					</div>
					<div className="p-4 text-center bg-gray-50 rounded-lg">
						<p className="mb-1 text-sm text-muted-foreground">Goal</p>
						<p className="text-xl font-bold tabular-nums">
							$<AnimatedCounter value={project.goal} />
						</p>
					</div>
					<div className="p-4 text-center bg-gray-50 rounded-lg">
						<p className="mb-1 text-sm text-muted-foreground">Supporters</p>
						<p className="text-xl font-bold tabular-nums">
							<AnimatedCounter value={displaySupporters} />
						</p>
					</div>
					<div className="p-4 text-center bg-gray-50 rounded-lg">
						<p className="mb-1 text-sm text-muted-foreground">Minimum Donation</p>
						<p className="text-xl font-bold tabular-nums">
							$<AnimatedCounter value={project.minInvestment} />
						</p>
					</div>
				</section>

				<div className="mb-6">
					<ReleasedProgressBar
						releasedAmount={releasedAmount}
						progressPercentage={releasedPercentage}
					/>
				</div>

				<section className="border-t border-slate-100 pt-6" aria-label="Share this project">
					<div className="mb-3 flex items-center gap-2">
						<Share2 className="h-5 w-5 text-emerald-700" aria-hidden="true" />
						<span className="text-sm font-medium text-slate-700">Share this project</span>
					</div>
					<ShareButtons
						url={shareUrl}
						title={project.title}
						description={project.description ?? undefined}
						variant="pill"
					/>
					<p className="mt-2 text-xs text-muted-foreground">
						Share on social media or copy the link for Instagram, messaging apps, and more.
					</p>
				</section>
			</div>
		</motion.section>
	)
}
