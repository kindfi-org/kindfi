/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole:any */
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import {
	CategoryBadge,
	ProjectTagList,
	ReleasedProgressBar,
} from '~/components/sections/projects/shared'
import { useProjectFundingDisplay } from '~/hooks/projects/use-project-funding-display'
import { useProjectReleasedDisplay } from '~/hooks/projects/use-project-released-display'
import { cardHover, progressBarAnimation } from '~/lib/constants/animations'
import { useI18n } from '~/lib/i18n'
import type { Project } from '~/lib/types/project'

interface ProjectCardListProps {
	project: Project
}

export function ProjectCardList({ project }: ProjectCardListProps) {
	const { t } = useI18n()
	const { displayRaised, progressPercent, formatCurrency } = useProjectFundingDisplay({
		escrowContractAddress: project.escrowContractAddress,
		escrowType: project.escrowType,
		goal: project.goal,
		raised: project.raised,
	})

	const { displayReleased, releasedProgressPercent } = useProjectReleasedDisplay({
		escrowContractAddress: project.escrowContractAddress,
		escrowType: project.escrowType,
		goal: project.goal,
		dbReleasedAmount: project.releasedAmount,
	})

	const progressPercentage = progressPercent ?? 0
	const releasedAmount = displayReleased ?? 0
	const releasedPercentage = releasedProgressPercent ?? 0

	return (
		<Link
			href={`/projects/${project.slug}`}
			className="long-list-item-compact h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
		>
			<motion.article
				className="flex h-full flex-row overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-md"
				whileHover={cardHover}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<div className="relative w-1/4 min-w-[100px] max-w-[180px] overflow-hidden">
					<Image
						src={project.image || '/images/placeholder.png'}
						alt={`${project.title} project thumbnail`}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, 180px"
						loading="lazy"
					/>
				</div>

				{/* Content section */}
				<div className="flex flex-col flex-grow p-3 sm:p-4 md:p-5">
					<div className="flex flex-col gap-2 mb-2 md:flex-row md:justify-between md:items-start">
						<h3 className="text-base font-bold sm:text-lg md:text-xl line-clamp-1">
							{project.title}
						</h3>
						<div className="flex shrink-0 flex-wrap gap-1.5">
							{project.category && (
								<CategoryBadge
									category={project.category}
									variant="display"
									className="text-[10px] sm:text-[11px]"
								/>
							)}
							{project.escrowContractAddress && (
								<Badge
									className="rounded-full border-0 bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-medium text-white"
									aria-label={t('projects.acceptingDonations')}
								>
									{t('projects.acceptingDonations')}
								</Badge>
							)}
						</div>
					</div>

					<p className="mb-2 text-xs sm:text-sm text-muted-foreground sm:mb-3 md:mb-4 line-clamp-2">
						{project.description}
					</p>

					<div className="mt-auto space-y-2 sm:space-y-3">
						<div
							className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2"
							role="progressbar"
							aria-valuenow={progressPercentage}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label={`${progressPercentage}% funded`}
						>
							<motion.div
								className="h-full rounded-full gradient-progress"
								custom={progressPercentage}
								variants={progressBarAnimation}
								initial="initial"
								animate="animate"
							/>
						</div>

						<div className="flex justify-between text-xs text-gray-500 sm:text-sm tabular-nums">
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

						<div className="grid grid-cols-3 gap-1 sm:gap-2 tabular-nums">
							<div className="text-center">
								<p className="text-xs font-bold sm:text-sm">
									{new Intl.NumberFormat(undefined, {
										style: 'currency',
										currency: 'USD',
										maximumFractionDigits: 0,
									}).format(project.goal)}
								</p>
								<p className="text-[10px] text-gray-500 sm:text-xs">{t('projects.goal')}</p>
							</div>
							<div className="text-center">
								<p className="text-xs font-bold sm:text-sm">{project.investors}</p>
								<p className="text-[10px] text-gray-500 sm:text-xs">{t('projects.supporters')}</p>
							</div>
							<div className="text-center">
								<p className="text-xs font-bold sm:text-sm">
									{new Intl.NumberFormat(undefined, {
										style: 'currency',
										currency: 'USD',
										maximumFractionDigits: 0,
									}).format(project.minInvestment)}
								</p>
								<p className="text-[10px] text-gray-500 sm:text-xs">{t('projects.minDonation')}</p>
							</div>
						</div>
						<ProjectTagList tags={project.tags} />
					</div>
				</div>
			</motion.article>
		</Link>
	)
}
