/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: any */
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { CategoryBadge, ReleasedProgressBar } from '~/components/sections/projects/shared'
import { useProjectFundingDisplay } from '~/hooks/projects/use-project-funding-display'
import { cardHover, progressBarAnimation } from '~/lib/constants/animations'
import { useI18n } from '~/lib/i18n'
import type { Project } from '~/lib/types/project'
import { cn } from '~/lib/utils'
import { getContrastTextColor } from '~/lib/utils/color-utils'
import { calculateReleasedProgressPercent } from '~/lib/utils/projects/milestone-funding'

interface ProjectCardGridProps {
	project: Project
	/** Pass index from parent to set priority loading for first 6 cards (above-fold). */
	index?: number
}

export function ProjectCardGrid({ project, index = 0 }: ProjectCardGridProps) {
	const { t } = useI18n()
	const { displayRaised, progressPercent, formatCurrency } = useProjectFundingDisplay({
		escrowContractAddress: project.escrowContractAddress,
		escrowType: project.escrowType,
		goal: project.goal,
		raised: project.raised,
	})

	const progressPercentage = progressPercent ?? 0
	const releasedAmount = project.releasedAmount ?? 0
	const releasedPercentage = calculateReleasedProgressPercent(releasedAmount, project.goal) ?? 0

	const imageSrc = project.image || '/images/placeholder.png'

	return (
		<Link
			href={`/projects/${project.slug}`}
			className="long-list-item h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
		>
			<motion.article
				className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-lg"
				whileHover={cardHover}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<div className="relative h-48 overflow-hidden">
					<Image
						src={imageSrc}
						alt={`${project.title} project thumbnail`}
						fill
						className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
						sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
						priority={index < 6}
						loading={index >= 6 ? 'lazy' : undefined}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
					<div className="absolute top-3 left-3 flex flex-col gap-2 drop-shadow">
						{project.category && <CategoryBadge category={project.category} />}
						{project.escrowContractAddress && (
							<Badge
								className="rounded-full border-0 bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-medium text-white"
								aria-label={t('projects.acceptingDonations')}
							>
								{t('projects.acceptingDonations')}
							</Badge>
						)}
					</div>
					<div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
						<span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900 shadow-sm backdrop-blur">
							{t('projects.explore')}
							<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
								<path
									fillRule="evenodd"
									d="M10.293 3.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1-1.414 1.414L11 6.414V16a1 1 0 1 1-2 0V6.414l-4.293 4.293A1 1 0 0 1 3.293 8.293l5-5Z"
									clipRule="evenodd"
								/>
							</svg>
						</span>
					</div>
				</div>

				<div className="p-5 flex flex-col flex-grow">
					<h3 className="text-xl font-bold mb-2 line-clamp-1">{project.title}</h3>
					<p className="text-muted-foreground mb-4 text-sm line-clamp-2">{project.description}</p>

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

					<div className="flex justify-between text-sm text-gray-500 mb-3 tabular-nums">
						<span>
							{displayRaised === null
								? '…'
								: formatCurrency(displayRaised, { maximumFractionDigits: 0 })}{' '}
							{t('projects.raised').toLowerCase()}
						</span>
						<span>{progressPercentage}%</span>
					</div>

					<ReleasedProgressBar
						releasedAmount={releasedAmount}
						progressPercentage={releasedPercentage}
						className="mt-2"
					/>

					<div className="grid grid-cols-3 gap-2 mb-3 tabular-nums">
						<div className="text-center">
							<p className="font-bold">
								{new Intl.NumberFormat(undefined, {
									style: 'currency',
									currency: 'USD',
									maximumFractionDigits: 0,
								}).format(project.goal)}
							</p>
							<p className="text-xs text-gray-500">{t('projects.goal')}</p>
						</div>
						<div className="text-center">
							<p className="font-bold">{project.investors}</p>
							<p className="text-xs text-gray-500">{t('projects.supporters')}</p>
						</div>
						<div className="text-center">
							<p className="font-bold">
								{new Intl.NumberFormat(undefined, {
									style: 'currency',
									currency: 'USD',
									maximumFractionDigits: 0,
								}).format(project.minInvestment)}
							</p>
							<p className="text-xs text-gray-500">{t('projects.minDonation')}</p>
						</div>
					</div>

					<div className="flex flex-wrap gap-1" aria-label="Project tags">
						{project.tags.map((tag) => {
							const bg = tag.color || '#ccc' // fallback
							const textColor = getContrastTextColor(bg)

							return (
								<Badge
									key={tag.id}
									className={cn(
										'uppercase transition-transform duration-200 group-hover:-translate-y-0.5',
										textColor,
									)}
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
