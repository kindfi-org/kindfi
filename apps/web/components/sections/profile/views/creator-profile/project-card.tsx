import { ArrowRight, Settings } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { CardContent, CardHeader, CardTitle } from '~/components/base/card'
import { ProfileSurfaceCard } from '../../profile-surface-card'
import type { CreatorProjectWithBalance } from './types'

const STATUS_COLORS: Record<string, string> = {
	active: 'bg-primary text-primary-foreground',
	review: 'bg-secondary text-secondary-foreground',
	funded: 'bg-primary/80 text-primary-foreground',
	draft: 'bg-muted text-muted-foreground',
	paused: 'bg-destructive text-destructive-foreground',
}

interface ProjectCardProps {
	project: CreatorProjectWithBalance
	compact?: boolean
	t: (key: string) => string
}

export function ProjectCard({ project, compact = false, t }: ProjectCardProps) {
	const percentage = project.percentageComplete ?? 0

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount)

	return (
		<ProfileSurfaceCard
			padding="sm"
			className="group flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-md"
		>
			{project.image && (
				<div className="relative h-44 w-full overflow-hidden">
					<Image
						src={project.image}
						alt={project.title}
						fill
						className="object-cover group-hover:scale-105 transition-transform duration-300"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						loading="lazy"
					/>
				</div>
			)}
			<CardHeader className="px-5 pb-2 pt-5">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="text-base line-clamp-2 min-w-0">{project.title}</CardTitle>
					<Badge
						variant="outline"
						className={`${STATUS_COLORS[project.status] || STATUS_COLORS.draft} border-0 shrink-0 text-xs`}
					>
						{project.status}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5">
				{!compact && project.description && (
					<p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
				)}
				<div className="space-y-2 mt-auto">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Raised</span>
						<span className="font-semibold tabular-nums">
							{formatCurrency(project.raised)} / {formatCurrency(project.goal)}
						</span>
					</div>
					<div
						className="relative h-2 bg-muted rounded-full overflow-hidden"
						role="progressbar"
						aria-valuenow={percentage}
						aria-valuemin={0}
						aria-valuemax={100}
					>
						<div
							className="h-full bg-primary rounded-full transition-all duration-500"
							style={{ width: `${percentage}%` }}
						/>
					</div>
					<p className="text-xs text-muted-foreground text-right tabular-nums">
						{percentage.toFixed(1)}% funded
					</p>
				</div>
				{project.tags.length > 0 && (
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
				)}
				<div className="flex gap-2">
					<Button asChild variant="outline" size="sm" className="flex-1 rounded-full">
						<Link href={`/projects/${project.slug || project.id}`}>
							{t('profile.viewCampaign')}
							<ArrowRight className="h-4 w-4 ml-2" />
						</Link>
					</Button>
					<Button asChild variant="outline" size="sm" className="flex-1 rounded-full">
						<Link href={`/projects/${project.slug || project.id}/manage`}>
							<Settings className="h-4 w-4 mr-2" />
							{t('profile.manageCampaign')}
						</Link>
					</Button>
				</div>
			</CardContent>
		</ProfileSurfaceCard>
	)
}
