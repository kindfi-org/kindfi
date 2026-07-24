'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { MapPin, Share2, Target, TrendingUp, Unlock, Users, Wallet } from 'lucide-react'
import { type ReactNode, useMemo } from 'react'
import { Badge } from '~/components/base/badge'
import { AnimatedCounter } from '~/components/sections/projects/detail/animated-counter'
import { ProjectHeroBanner } from '~/components/sections/projects/detail/project-hero-banner'
import { SocialLinksDisplay } from '~/components/sections/projects/detail/social-links-display'
import {
	CategoryBadge,
	CountryFlag,
	ProjectTagList,
	ReleasedProgressBar,
} from '~/components/sections/projects/shared'
import { ShareButtons } from '~/components/shared/share-buttons'
import { useProjectFundingDisplay } from '~/hooks/projects/use-project-funding-display'
import { useProjectReleasedDisplay } from '~/hooks/projects/use-project-released-display'
import { progressBarAnimation } from '~/lib/constants/animations'
import { useI18n } from '~/lib/i18n'
import { getProjectPageUrl } from '~/lib/seo/project-metadata'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { cn } from '~/lib/utils'
import { getCountryNameFromAlpha3 } from '~/lib/utils/project-utils'

interface ProjectHeroProps {
	project: ProjectDetail
	projectSlug: string
}

interface HeroStatProps {
	label: string
	value: ReactNode
	icon: typeof TrendingUp
	className?: string
}

function HeroStat({ label, value, icon: Icon, className }: HeroStatProps) {
	return (
		<div
			className={cn(
				'flex flex-col gap-1 rounded-xl border border-slate-100 bg-white p-3 shadow-sm',
				className,
			)}
		>
			<div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
				<Icon className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
				<span className="truncate">{label}</span>
			</div>
			<p className="text-lg font-bold tabular-nums text-slate-900 sm:text-xl">{value}</p>
		</div>
	)
}

export function ProjectHero({ project, projectSlug }: ProjectHeroProps) {
	const { t } = useI18n()
	const reducedMotion = useReducedMotion()

	const { displayRaised, displaySupporters, progressPercent, raisedLabel, formatCurrency } =
		useProjectFundingDisplay({
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

	const { displayReleased, releasedProgressPercent } = useProjectReleasedDisplay({
		escrowContractAddress: project.escrowContractAddress,
		escrowType: project.escrowType,
		goal: project.goal,
		dbMilestones: project.milestones,
	})

	const releasedAmount = displayReleased ?? 0
	const releasedPercentage = releasedProgressPercent ?? 0
	const progressPercentage = progressPercent ?? 0
	const hasEscrow = Boolean(project.escrowContractAddress)

	return (
		<motion.section
			className="mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
			initial={reducedMotion ? false : { opacity: 0, y: 20 }}
			animate={reducedMotion ? false : { opacity: 1, y: 0 }}
			transition={reducedMotion ? { duration: 0 } : { duration: 0.5 }}
			aria-labelledby="project-hero-title"
		>
			<ProjectHeroBanner src={project.image} alt={`${project.title} banner`}>
				{project.category ? (
					<CategoryBadge category={project.category} variant="display" />
				) : (
					<span />
				)}
				{hasEscrow ? (
					<Badge className="shrink-0 rounded-full border-0 bg-emerald-600/95 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm">
						{t('projects.acceptingDonations')}
					</Badge>
				) : null}
			</ProjectHeroBanner>

			<div className="relative -mt-8 rounded-t-3xl bg-white px-5 pb-6 pt-7 sm:px-6 md:-mt-10 md:px-8 md:pb-8 md:pt-9">
				<h1
					id="project-hero-title"
					className="mb-3 text-2xl font-bold text-balance text-slate-900 sm:text-3xl md:text-4xl"
				>
					{project.title}
				</h1>

				{project.description ? (
					<p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
						{project.description}
					</p>
				) : null}

				{(project.location || project.socialLinks) && (
					<div className="mt-5 flex flex-wrap items-center justify-between gap-3">
						{project.location ? (
							<div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
								<MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
								<CountryFlag countryCode={project.location} />
								<span className="font-medium">{getCountryNameFromAlpha3(project.location)}</span>
							</div>
						) : null}

						{project.socialLinks ? (
							<div className="flex items-center gap-2">
								<SocialLinksDisplay socialLinks={project.socialLinks} />
							</div>
						) : null}
					</div>
				)}

				{project.tags.length > 0 ? <ProjectTagList tags={project.tags} className="mt-4" /> : null}

				<section
					className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5"
					aria-label={t('projects.detail.fundingProgress')}
				>
					<div className="mb-4">
						<div className="mb-2 flex items-center justify-between gap-3 text-sm">
							<span className="font-medium text-slate-700">{raisedLabel}</span>
							<span className="font-semibold tabular-nums text-emerald-700">
								{progressPercentage}%
							</span>
						</div>
						<div
							className="h-2 w-full overflow-hidden rounded-full bg-white shadow-inner"
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
						<p className="mt-2 text-sm text-muted-foreground tabular-nums">
							{displayRaised === null
								? '…'
								: formatCurrency(displayRaised, { maximumFractionDigits: 0 })}{' '}
							{t('projects.raised').toLowerCase()} ·{' '}
							{formatCurrency(project.goal, { maximumFractionDigits: 0 })}{' '}
							{t('projects.goal').toLowerCase()}
						</p>
					</div>

					<ReleasedProgressBar
						releasedAmount={releasedAmount}
						progressPercentage={releasedPercentage}
					/>
				</section>

				<section
					className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
					aria-label={t('projects.detail.fundingStats')}
				>
					<HeroStat
						label={raisedLabel}
						icon={TrendingUp}
						value={
							displayRaised === null ? (
								'…'
							) : (
								<>
									$<AnimatedCounter value={displayRaised} />
								</>
							)
						}
					/>
					<HeroStat
						label={t('projects.detail.released')}
						icon={Unlock}
						value={
							displayReleased === null ? (
								'…'
							) : (
								<>
									$<AnimatedCounter value={releasedAmount} />
								</>
							)
						}
					/>
					<HeroStat
						label={t('projects.goal')}
						icon={Target}
						value={
							<>
								$<AnimatedCounter value={project.goal} />
							</>
						}
					/>
					<HeroStat
						label={t('projects.supporters')}
						icon={Users}
						value={<AnimatedCounter value={displaySupporters} />}
					/>
					<HeroStat
						label={t('projects.minDonation')}
						icon={Wallet}
						className="col-span-2 sm:col-span-1"
						value={
							<>
								$<AnimatedCounter value={project.minInvestment} />
							</>
						}
					/>
				</section>

				<section
					className="mt-6 border-t border-slate-100 pt-6"
					aria-label={t('projects.detail.shareTitle')}
				>
					<div className="mb-3 flex items-center gap-2">
						<Share2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
						<span className="text-sm font-semibold text-slate-800">
							{t('projects.detail.shareTitle')}
						</span>
					</div>
					<ShareButtons
						url={shareUrl}
						title={project.title}
						description={project.description ?? undefined}
						variant="pill"
					/>
					<p className="mt-2 text-xs text-muted-foreground">{t('projects.detail.shareHint')}</p>
				</section>
			</div>
		</motion.section>
	)
}
