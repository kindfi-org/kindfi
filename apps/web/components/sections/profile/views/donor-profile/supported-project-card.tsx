import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { CardContent, CardHeader, CardTitle } from '~/components/base/card'
import { ProfileSurfaceCard } from '../../profile-surface-card'
import { DonationSharePopover } from './donation-share-popover'
import type { DonorProjectWithBalance } from './types'

interface SupportedProjectCardProps {
	project: DonorProjectWithBalance
	t: (key: string) => string
}

export function SupportedProjectCard({ project, t }: SupportedProjectCardProps) {
	const percentage = project.percentageComplete ?? 0
	const contributionAmount = Number(project.contributionAmount)

	return (
		<ProfileSurfaceCard
			padding="sm"
			className="group flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-md"
		>
			{project.image && (
				<div className="relative h-40 w-full overflow-hidden">
					<Image
						src={project.image}
						alt={project.title}
						fill
						className="object-cover group-hover:scale-105 transition-transform duration-300"
					/>
				</div>
			)}
			<CardHeader className="px-5 pb-2 pt-5">
				<CardTitle className="text-base line-clamp-2">{project.title}</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5">
				{project.description && (
					<p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
				)}
				<div className="space-y-2 mt-auto">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Your Contribution</span>
						<span className="font-semibold">${contributionAmount.toLocaleString()}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Total Raised</span>
						<span className="font-semibold">
							${Number(project.raised).toLocaleString()} / ${Number(project.goal).toLocaleString()}
						</span>
					</div>
					<div className="relative h-2 bg-muted rounded-full overflow-hidden">
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
						<Link href={`/projects/${project.slug}`}>
							{t('profile.viewProject')}
							<ArrowRight className="h-4 w-4 ml-2" />
						</Link>
					</Button>
					<DonationSharePopover
						projectTitle={project.title}
						projectSlug={project.slug}
						projectDescription={project.description}
						contributionAmount={contributionAmount}
						shareLabel={t('profile.shareDonation')}
						fullWidth
						className="flex-1 rounded-full"
					/>
				</div>
			</CardContent>
		</ProfileSurfaceCard>
	)
}
