/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: any */
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import { Badge } from '~/components/base/badge'
import { CategoryBadge } from '~/components/sections/projects/shared'
import { useEscrowBalance } from '~/hooks/escrow/use-escrow-balance'
import { cardHover, progressBarAnimation } from '~/lib/constants/animations'
import type { Project } from '~/lib/types/project'
import { cn } from '~/lib/utils'
import { getContrastTextColor } from '~/lib/utils/color-utils'

interface ProjectCardGridProps {
	project: Project
}

export function ProjectCardGrid({ project }: ProjectCardGridProps) {
	const { balance: onChainRaised } = useEscrowBalance({
		escrowContractAddress: project.escrowContractAddress,
		escrowType: 'multi-release',
	})

	const displayRaised = useMemo(
		() => onChainRaised ?? project.raised,
		[onChainRaised, project.raised],
	)

	const progressPercentage = Math.min(
		Math.round((displayRaised / project.goal) * 100),
		100,
	)

	return (
		<Link href={`/projects/${project.slug}`} className="h-full">
			<motion.article
				className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full transition-all duration-300 hover:shadow-xl"
				whileHover={cardHover}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<div className="relative h-48 overflow-hidden">
					<Image
						src={project.image || '/images/placeholder.png'}
						alt={`${project.title} project thumbnail`}
						fill
						className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
						priority
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
					{project.category && (
						<div className="absolute top-3 left-3 drop-shadow">
							<CategoryBadge category={project.category} />
						</div>
					)}
					<div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
						<span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900 shadow-sm backdrop-blur">
							Explore
							<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
								<path fillRule="evenodd" d="M10.293 3.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1-1.414 1.414L11 6.414V16a1 1 0 1 1-2 0V6.414l-4.293 4.293A1 1 0 0 1 3.293 8.293l5-5Z" clipRule="evenodd" />
							</svg>
						</span>
					</div>
				</div>

				<div className="p-5 flex flex-col flex-grow">
					<h3 className="text-xl font-bold mb-2 line-clamp-1">
						{project.title}
					</h3>
					<p className="text-muted-foreground mb-4 text-sm line-clamp-2">
						{project.description}
					</p>

					<div
						className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 shadow-inner"
						role="progressbar"
						aria-valuenow={progressPercentage}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label={`${progressPercentage}% funded`}
					>
						<motion.div
							className="h-full rounded-full gradient-progress shadow-sm"
							custom={progressPercentage}
							variants={progressBarAnimation}
							initial="initial"
							animate="animate"
						/>
					</div>

					<div className="flex justify-between text-sm text-gray-500 mb-3">
						<span>${displayRaised.toLocaleString()} raised</span>
						<span>{progressPercentage}%</span>
					</div>

					<div className="grid grid-cols-3 gap-2 mb-3">
						<div className="text-center">
							<p className="font-bold">${project.goal.toLocaleString()}</p>
							<p className="text-xs text-gray-500">Goal</p>
						</div>
						<div className="text-center">
							<p className="font-bold">{project.investors}</p>
							<p className="text-xs text-gray-500">Supporters</p>
						</div>
						<div className="text-center">
							<p className="font-bold">${project.minInvestment}</p>
							<p className="text-xs text-gray-500">Min Donation</p>
						</div>
					</div>

					<div className="flex flex-wrap gap-1" aria-label="Project tags">
						{project.tags.map((tag) => {
							const bg = tag.color || '#ccc' // fallback
							const textColor = getContrastTextColor(bg)

							return (
								<Badge
									key={tag.id}
									className={cn('uppercase transition-transform duration-200 group-hover:-translate-y-0.5', textColor)}
									style={{ backgroundColor: bg }}
								>
									{tag.name}
								</Badge>
							)
						})}
					</div>
				</div>
			</motion.article>
		</Link>
	)
}
