'use client'

import { Badge } from '~/components/base/badge'
import { Card, CardContent, CardHeader } from '~/components/base/card'
import { Progress } from '~/components/base/progress'
import type { Project } from './mock-data'

interface ProjectCardProps {
	project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
	return (
		<Card className="w-full">
			<CardHeader className="p-0">
				<div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
					<span className="text-gray-400">Image Placeholder</span>
				</div>
				<div className="p-4">
					<h4 className="font-bold mb-1">{project.category}</h4>
					<h3 className="text-xl font-bold mb-2">{project.title}</h3>
					<p className="text-gray-600 text-sm">{project.description}</p>
				</div>
			</CardHeader>
			<CardContent className="p-4 pt-0">
				<div className="space-y-4">
					<div>
						<div className="flex justify-between mb-2">
							<span className="font-bold">
								${project.currentAmount.toLocaleString()}
							</span>
							<span className="text-gray-600">
								{project.percentageReached}% of $
								{project.goalAmount.toLocaleString()}
							</span>
						</div>
						<Progress value={project.percentageReached} className="h-2" />
					</div>

					<div className="flex justify-between text-sm">
						<div className="text-center">
							<div className="font-bold">
								${project.currentAmount.toLocaleString()}
							</div>
							<div className="text-gray-600">Goal</div>
						</div>
						<div className="text-center">
							<div className="font-bold">{project.supporters}</div>
							<div className="text-gray-600">Supporters</div>
						</div>
						<div className="text-center">
							<div className="font-bold">${project.minSupport}</div>
							<div className="text-gray-600">Min. Support</div>
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						{project.tags.map((tag) => (
							<Badge key={tag} variant="outline" className="text-xs">
								{tag}
							</Badge>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
