'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { CategoryBadge } from '~/components/sections/projects/filters'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { getCountryNameFromAlpha3 } from '~/lib/utils/project-utils'
import { CountryFlag } from '../create/country-flag'
import { AnimatedCounter } from './animated-counter'
import { SocialLinksDisplay } from './social-links-display'

interface ProjectHeroProps {
	project: ProjectDetail
}

export function ProjectHero({ project }: ProjectHeroProps) {
	return (
		<motion.section
			className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
				<Image
					src={project.image || '/placeholder.svg'}
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
				<h1 className="text-3xl md:text-4xl font-bold mb-3">{project.title}</h1>

				<p className="text-muted-foreground mb-6">{project.description}</p>

				{/* Location + Social Links */}
				{(project.location || project.socialLinks) && (
					<div className="flex flex-wrap items-center justify-between mb-6 gap-2">
						{project.location && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
								<span>Location:</span>
								<CountryFlag countryCode={project.location} />
								<span className="text-gray-700">
									{getCountryNameFromAlpha3(project.location)}
								</span>
							</div>
						)}

						{project.socialLinks && (
							<div className="flex items-center gap-3">
								<SocialLinksDisplay socialLinks={project.socialLinks} />
							</div>
						)}
					</div>
				)}

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					<div className="bg-gray-50 p-4 rounded-lg text-center">
						<p className="text-sm text-muted-foreground mb-1">Raised</p>
						<p className="text-xl font-bold">
							$<AnimatedCounter value={project.raised} />
						</p>
					</div>
					<div className="bg-gray-50 p-4 rounded-lg text-center">
						<p className="text-sm text-muted-foreground mb-1">Goal</p>
						<p className="text-xl font-bold">
							$<AnimatedCounter value={project.goal} />
						</p>
					</div>
					<div className="bg-gray-50 p-4 rounded-lg text-center">
						<p className="text-sm text-muted-foreground mb-1">Supporters</p>
						<p className="text-xl font-bold">
							<AnimatedCounter value={project.investors} />
						</p>
					</div>
					<div className="bg-gray-50 p-4 rounded-lg text-center">
						<p className="text-sm text-muted-foreground mb-1">
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
