'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useMemo } from 'react'
import { AnimatedCounter } from '~/components/sections/projects/detail/animated-counter'
import { SocialLinksDisplay } from '~/components/sections/projects/detail/social-links-display'
import {
	CategoryBadge,
	CountryFlag,
} from '~/components/sections/projects/shared'
import { useEscrowBalance } from '~/hooks/escrow/use-escrow-balance'
import { useProjectSupportersCount } from '~/hooks/projects/use-project-supporters-count'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { getCountryNameFromAlpha3 } from '~/lib/utils/project-utils'

interface ProjectHeroProps {
	project: ProjectDetail
}

export function ProjectHero({ project }: ProjectHeroProps) {
	const { balance: onChainRaised } = useEscrowBalance({
		escrowContractAddress: project.escrowContractAddress,
		escrowType: project.escrowType,
	})

	const { supportersCount } = useProjectSupportersCount({
		projectId: project.id,
	})

	const displayRaised = useMemo(
		() => onChainRaised ?? project.raised,
		[onChainRaised, project.raised],
	)

	const displaySupporters = useMemo(
		() => supportersCount ?? project.investors,
		[supportersCount, project.investors],
	)

	return (
		<motion.section
			className="overflow-hidden mb-8 bg-white rounded-xl shadow-md"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="overflow-hidden relative h-64 md:h-80 lg:h-96">
				<Image
					src={project.image || '/images/placeholder.png'}
					alt={`${project.title} banner`}
					fill
					className="object-cover"
					priority
				/>
				{project.category && (
					<div className="absolute top-4 left-4">
						<CategoryBadge category={project.category} />
					</div>
				)}
			</div>

			<div className="p-6">
				<h1 className="mb-3 text-3xl font-bold md:text-4xl">{project.title}</h1>

				<p className="mb-6 text-muted-foreground">{project.description}</p>

				{/* Location + Social Links */}
				{(project.location || project.socialLinks) && (
					<div className="flex flex-wrap gap-2 justify-between items-center mb-6">
						{project.location && (
							<div className="flex gap-2 items-center text-sm font-medium text-muted-foreground">
								<span>Location:</span>
								<CountryFlag countryCode={project.location} />
								<span className="text-gray-700">
									{getCountryNameFromAlpha3(project.location)}
								</span>
							</div>
						)}

						{project.socialLinks && (
							<div className="flex gap-3 items-center">
								<SocialLinksDisplay socialLinks={project.socialLinks} />
							</div>
						)}
					</div>
				)}

				<div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
					<div className="p-4 text-center bg-gray-50 rounded-lg">
						<p className="mb-1 text-sm text-muted-foreground">Raised</p>
						<p className="text-xl font-bold">
							$<AnimatedCounter value={displayRaised} />
						</p>
					</div>
					<div className="p-4 text-center bg-gray-50 rounded-lg">
						<p className="mb-1 text-sm text-muted-foreground">Goal</p>
						<p className="text-xl font-bold">
							$<AnimatedCounter value={project.goal} />
						</p>
					</div>
					<div className="p-4 text-center bg-gray-50 rounded-lg">
						<p className="mb-1 text-sm text-muted-foreground">Supporters</p>
						<p className="text-xl font-bold">
							<AnimatedCounter value={displaySupporters} />
						</p>
					</div>
					<div className="p-4 text-center bg-gray-50 rounded-lg">
						<p className="mb-1 text-sm text-muted-foreground">
							Minimum Donation
						</p>
						<p className="text-xl font-bold">
							$<AnimatedCounter value={project.minInvestment} />
						</p>
					</div>
				</div>
			</div>
		</motion.section>
	)
}
