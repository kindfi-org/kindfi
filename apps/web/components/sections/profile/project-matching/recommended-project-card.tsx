'use client'

import { ArrowRight, MapPin, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { CategoryBadge } from '~/components/sections/projects/shared'
import { useI18n } from '~/lib/i18n'
import type { ProjectMatchRecommendation } from '~/lib/services/project-matching/schemas'
import { ProfileSurfaceCard } from '../profile-surface-card'

interface RecommendedProjectCardProps {
	project: ProjectMatchRecommendation
}

export const RecommendedProjectCard = ({ project }: RecommendedProjectCardProps) => {
	const { t } = useI18n()
	const percentage = project.percentageComplete ?? 0
	const imageSrc = project.image || '/images/placeholder.png'

	return (
		<ProfileSurfaceCard
			padding="sm"
			className="group flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-md"
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
					{project.category ? <CategoryBadge category={project.category} /> : null}
					<Badge className="w-fit rounded-full border-0 bg-emerald-600/90 text-[10px] text-white">
						{t('profile.matchingScore')} {project.matchScore}%
					</Badge>
				</div>
			</div>

			<div className="flex flex-1 flex-col gap-3 p-5">
				<div className="space-y-1">
					<h4 className="line-clamp-2 text-base font-semibold text-gray-900">{project.title}</h4>
					<p className="flex items-center gap-1 text-xs text-muted-foreground">
						<MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
						{project.projectLocation}
					</p>
				</div>

				<p className="text-sm leading-relaxed text-muted-foreground">{project.reason}</p>

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
						/>
					</div>
				</div>

				{project.tags.length > 0 ? (
					<div className="flex flex-wrap gap-1">
						{project.tags.slice(0, 3).map((tag) => (
							<Badge
								key={tag.name}
								variant="outline"
								className="text-xs"
								style={{
									borderColor: tag.color || undefined,
									color: tag.color || undefined,
								}}
							>
								{tag.name}
							</Badge>
						))}
					</div>
				) : null}

				<Button asChild variant="outline" size="sm" className="w-full rounded-full">
					<Link href={`/projects/${project.slug}`}>
						{t('profile.viewProject')}
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</div>
		</ProfileSurfaceCard>
	)
}
