'use client'

import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, Calendar, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'

export function DonorStatCard({
	label,
	value,
	icon,
}: {
	label: string
	value: string
	icon?: React.ReactNode
}) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-3xl font-bold text-foreground flex items-center gap-2">
					{icon}
					{value}
				</div>
			</CardContent>
		</Card>
	)
}

export function DonorImpactMetric({
	label,
	value,
	description,
}: {
	label: string
	value: string
	description: string
}) {
	return (
		<div className="space-y-1">
			<p className="text-sm font-medium text-muted-foreground">{label}</p>
			<p className="text-2xl font-bold text-foreground">{value}</p>
			<p className="text-xs text-muted-foreground">{description}</p>
		</div>
	)
}

export function DonationHistory({
	donations,
}: {
	donations: Array<{
		id: string
		title: string
		contributionAmount: string | number
		contributionDate: string | null
	}>
}) {
	if (donations.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<p>No donation history yet</p>
			</div>
		)
	}

	return (
		<div className="space-y-2 max-h-[400px] overflow-y-auto">
			{donations.map((donation) => {
				const amount = Number(donation.contributionAmount)
				const date = donation.contributionDate
					? new Date(donation.contributionDate)
					: null
				const timeAgo = date
					? formatDistanceToNow(date, { addSuffix: true })
					: 'Recently'

				return (
					<div
						key={donation.id}
						className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
					>
						<div className="flex items-center gap-3 flex-1 min-w-0">
							<div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
								<Heart className="h-4 w-4 text-primary fill-primary" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-sm truncate">
									Donated to {donation.title}
								</p>
								<p className="text-xs text-muted-foreground flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									{timeAgo}
								</p>
							</div>
						</div>
						<span className="font-bold text-foreground ml-4 flex-shrink-0 tabular-nums">
							${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</span>
					</div>
				)
			})}
		</div>
	)
}

export function SupportedProjectCard({
	project,
}: {
	project: {
		id: string
		title: string
		slug: string
		description: string | null
		image: string | null
		raised: number
		goal: number
		percentageComplete: number | null
		status: string
		tags: Array<{ name: string; color: string | null }>
		contributionAmount: string | number
		contributionDate: string | null
	}
}) {
	const percentage = project.percentageComplete ?? 0
	const contributionAmount = Number(project.contributionAmount)

	return (
		<Card className="overflow-hidden h-full flex flex-col group hover:shadow-md transition-shadow">
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
			<CardHeader className="pb-2">
				<CardTitle className="text-base line-clamp-2">{project.title}</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 flex flex-col gap-3">
				{project.description && (
					<p className="text-sm text-muted-foreground line-clamp-2">
						{project.description}
					</p>
				)}
				<div className="space-y-2 mt-auto">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Your Contribution</span>
						<span className="font-semibold">
							${contributionAmount.toLocaleString()}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Total Raised</span>
						<span className="font-semibold">
							${Number(project.raised).toLocaleString()} / $
							{Number(project.goal).toLocaleString()}
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
				<Button asChild variant="outline" size="sm" className="w-full">
					<Link href={`/projects/${project.slug}`}>
						View Project
						<ArrowRight className="h-4 w-4 ml-2" />
					</Link>
				</Button>
			</CardContent>
		</Card>
	)
}
