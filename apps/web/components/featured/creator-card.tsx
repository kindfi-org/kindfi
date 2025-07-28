'use client'

import { Verified } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import type { Creator } from '~/lib/types/projects.types'

interface CreatorCardProps {
	creator: Creator
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
	const {
		name,
		role,
		image,
		total_raised,
		completed_projects,
		followers,
		recent_project,
		verified,
	} = creator

	return (
		<div className="group relative">
			<div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
			<Card className="relative bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden h-full">
				<CardContent className="p-8">
					<div className="flex items-center gap-4 mb-6">
						<div className="relative h-16 w-16 rounded-full overflow-hidden">
							<Image
								src={image || '/placeholder.svg'}
								alt={name}
								fill
								className="object-cover"
							/>
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h4 className="font-bold text-lg">{name}</h4>
								{verified && <Verified className="h-4 w-4 text-primary" />}
							</div>
							<p className="text-sm text-muted-foreground">{role}</p>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Total Raised</span>
							<span className="font-bold">
								${total_raised?.toLocaleString()}
							</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Completed Projects</span>
							<span className="font-bold">{completed_projects}</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Followers</span>
							<span className="font-bold">{followers?.toLocaleString()}</span>
						</div>
						<div className="pt-2">
							<div className="text-sm font-medium mb-2">Recent Project</div>
							<Badge
								variant="secondary"
								className="bg-primary/10 text-primary hover:bg-primary/20"
							>
								{recent_project}
							</Badge>
						</div>
					</div>

					<div className="flex gap-2 mt-6">
						<Button className="w-full" variant="outline">
							Follow
						</Button>
						<Button className="w-full">View Projects</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
