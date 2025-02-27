'use client'

import {
	CheckCircle2,
	FlameIcon as Fire,
	LinkIcon,
	MapPin,
	Star,
	Users,
	Verified,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import type { Project } from '~/lib/types/featured-projects/featured-projects.types'

interface ProjectCardProps {
	project: Project
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
	const {
		id,
		title,
		description,
		location,
		raised,
		goal,
		donors,
		image,
		milestones,
		completedMilestones,
		creator,
		trending,
		featured,
	} = project

	return (
		<div className="group relative">
			<div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
			<Card className="relative bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden">
				<div className="relative h-48 w-full">
					<Image
						src={image || '/placeholder.svg'}
						alt={title}
						fill
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
					<div className="absolute top-4 right-4 flex gap-2">
						{trending && (
							<Badge
								variant="secondary"
								className="bg-white/90 hover:bg-white text-black"
							>
								<Fire className="h-3 w-3 mr-1 text-orange-500" />
								Trending
							</Badge>
						)}
						{featured && (
							<Badge
								variant="secondary"
								className="bg-white/90 hover:bg-white text-black"
							>
								<Star className="h-3 w-3 mr-1 text-yellow-500" />
								Featured
							</Badge>
						)}
					</div>
					<div className="absolute bottom-4 left-4 right-4">
						<div className="flex items-center gap-2 text-white mb-2">
							<MapPin className="h-4 w-4" />
							<span className="text-sm">{location}</span>
						</div>
						<h3 className="text-xl font-bold text-white">{title}</h3>
					</div>
				</div>
				<CardContent className="p-6 space-y-4">
					<p className="text-muted-foreground">{description}</p>

					<div className="flex items-center gap-3">
						<div className="relative h-10 w-10 rounded-full overflow-hidden">
							<Image
								src={creator.image || '/placeholder.svg'}
								alt={creator.name}
								fill
								className="object-cover"
							/>
						</div>
						<div>
							<div className="flex items-center gap-1">
								<span className="font-medium">{creator.name}</span>
								{creator.verified && (
									<Verified className="h-4 w-4 text-primary" />
								)}
							</div>
							<div className="text-sm text-muted-foreground">
								{creator.completedProjects} successful projects
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Users className="h-4 w-4" />
							<span>{donors} Donors</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<CheckCircle2 className="h-4 w-4" />
							<span>
								{completedMilestones}/{milestones} Milestones
							</span>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="font-medium">Raised</span>
							<span className="text-primary font-bold">
								${raised.toLocaleString()}
							</span>
						</div>
						<div className="h-2 bg-muted rounded-full overflow-hidden">
							<div
								className="h-full bg-primary transition-all duration-500"
								style={{ width: `${Math.min((raised / goal) * 100, 100)}%` }}
							/>
						</div>
						<div className="text-sm text-muted-foreground text-right">
							{Math.round((raised / goal) * 100)}% of ${goal.toLocaleString()}
						</div>
					</div>

					<Button variant="outline" className="w-full group" asChild>
						<Link href={`/projects/${id}`}>
							View Project Details
							<LinkIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
