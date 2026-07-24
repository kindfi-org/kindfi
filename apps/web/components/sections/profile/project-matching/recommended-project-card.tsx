'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Crown, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { CategoryBadge, ProjectTagList } from '~/components/sections/projects/shared'
import { getFadeInViewProps } from '~/lib/constants/animations'
import { useI18n } from '~/lib/i18n'
import type { ProjectMatchRecommendation } from '~/lib/services/project-matching/schemas'
import { ProfileSurfaceCard } from '../profile-surface-card'

interface RecommendedProjectCardProps {
	project: ProjectMatchRecommendation
	rank: number
}

export const RecommendedProjectCard = memo(function RecommendedProjectCard({
	project,
	rank,
}: RecommendedProjectCardProps) {
	const { t } = useI18n()
	const reducedMotion = useReducedMotion()
	const percentage = project.percentageComplete ?? 0
	const imageSrc = project.image || '/images/placeholder.png'
	const isTopPick = rank === 1
	const motionProps = getFadeInViewProps(reducedMotion, { delay: (rank - 1) * 0.08, y: 16 })

	return (
		<motion.div {...motionProps} className="h-full">
			<ProfileSurfaceCard
				padding="sm"
				className={`group flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-md ${
					isTopPick ? 'ring-2 ring-emerald-500/30' : ''
				}`}
			>
				<div className="relative h-40 w-full overflow-hidden">
					<Image
						src={imageSrc}
						alt={project.title}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
					/>
					<div className="absolute top-3 left-3 flex flex-col gap-2">
						{isTopPick ? (
							<Badge className="w-fit rounded-full border-0 bg-amber-500/95 text-[10px] text-white">
								<Crown className="mr-1 inline h-3 w-3" aria-hidden="true" />
								{t('profile.matchingTopPick')}
							</Badge>
						) : null}
						{project.category ? (
							<CategoryBadge category={project.category} variant="display" />
						) : null}
						<Badge className="w-fit rounded-full border-0 bg-emerald-600/90 text-[10px] text-white">
							{t('profile.matchingScore')} {project.matchScore}%
						</Badge>
					</div>
					<span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-xs font-semibold text-white backdrop-blur-sm">
						#{rank}
					</span>
				</div>

				<div className="flex flex-1 flex-col gap-3 p-5">
					<div className="space-y-1">
						<h4 className="line-clamp-2 text-base font-semibold text-gray-900">{project.title}</h4>
						<p className="flex items-center gap-1 text-xs text-muted-foreground">
							<MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
							{project.projectLocation}
						</p>
					</div>

					<div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
						<p className="text-[11px] font-medium uppercase tracking-wide text-emerald-800">
							{t('profile.matchingWhyMatch')}
						</p>
						<p className="mt-1 text-sm leading-relaxed text-slate-700">{project.reason}</p>
					</div>

					{project.description ? (
						<p className="line-clamp-2 text-sm text-muted-foreground/90">{project.description}</p>
					) : null}

					<div className="mt-auto space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">{t('profile.matchingFunded')}</span>
							<span className="font-medium tabular-nums">{percentage.toFixed(0)}%</span>
						</div>
						<div className="relative h-2 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-emerald-500 transition-all duration-500"
								style={{ width: `${Math.min(percentage, 100)}%` }}
								role="progressbar"
								aria-valuenow={percentage}
								aria-valuemin={0}
								aria-valuemax={100}
							/>
						</div>
					</div>

					{project.tags.length > 0 ? <ProjectTagList tags={project.tags} limit={3} /> : null}

					<Button asChild variant="outline" size="sm" className="w-full rounded-full">
						<Link href={`/projects/${project.slug}`}>
							{t('profile.viewProject')}
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
			</ProfileSurfaceCard>
		</motion.div>
	)
})
