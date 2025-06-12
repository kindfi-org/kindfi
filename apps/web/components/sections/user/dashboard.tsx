'use client'
import { ChevronRight, Filter, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import ProjectCard from '~/components/shared/project-card'
import {
	mockImpactMetrics,
	mockProjects,
} from '~/lib/mock-data/mock-user-dashboard'
import type { Project } from '~/lib/types/projects.types'
import type { ImpactMetric } from '~/lib/types/user-dashboard.types'

type MockProject = {
	id: string
	image_url: string
	categories: string[]
	title: string
	description: string
	current_amount: number
	target_amount: number
	investors_count: number
	min_investment: number
	created_at: string
	percentage_complete: number
	tags: { id: string; text: string }[]
}

export function UserDashboard() {
	return (
		<div className="p-4 space-y-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="rounded-lg border bg-card text-card-foreground shadow-sm">
					<div className="p-6">
						<div className="flex items-center justify-between mb-8">
							<div className="flex items-center gap-2">
								<Heart className="h-6 w-6 text-primary" />
								<h2 className="text-2xl font-semibold">Featured Impact</h2>
							</div>
							<Button
								variant="outline"
								className="group"
								aria-label="View all featured impacts"
							>
								View All
								<ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
							</Button>
						</div>

						<div className="relative group">
							<div className="relative bg-muted rounded-lg h-[200px] overflow-hidden mb-4">
								<Image
									src="/images/kids.webp"
									alt="Featured Impact"
									fill
									className="object-cover"
									sizes="(max-width: 768px) 100vw, 50vw"
								/>
								<div
									className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent
                   opacity-0 translate-y-[100.1%] group-hover:translate-y-0 group-hover:opacity-100
                   transition-all duration-500 ease-in-out flex flex-col items-center justify-center space-y-4"
								>
									<p className="text-white text-center px-6 translate-y-8 group-hover:translate-y-0 transition-transform delay-150 duration-300">
										Discover how our featured projects are making a real
										difference in communities worldwide
									</p>
									<Link
										href="/all-featured"
										className="text-white hover:text-white/80 transition-colors font-medium translate-y-8 group-hover:translate-y-0 delay-200 duration-300"
									>
										See All
									</Link>
								</div>
							</div>
						</div>

						<ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{mockImpactMetrics.map((metric: ImpactMetric) => (
								<li
									key={metric.label}
									className="bg-muted rounded-lg p-6 text-center"
								>
									<h3 className="font-medium mb-2">{metric.label}</h3>
									<div className="text-2xl font-bold">{metric.value}</div>
								</li>
							))}
						</ul>
					</div>
				</div>

				<Card className="h-full">
					<CardContent className="p-6 h-full flex flex-col items-center justify-center">
						<h2 className="text-2xl font-semibold mb-6">Join KindFi</h2>
						<Button className="w-[300px] mb-3 gradient-btn text-white">
							Sign Up
						</Button>
						<Button variant="outline" className="w-[300px] mb-4">
							Login
						</Button>
						<p className="text-sm text-center text-gray-600">
							Create an account to support projects and track your impact
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardContent className="p-6">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-semibold">Active Projects</h2>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="icon"
									aria-label="Filter projects"
								>
									<Filter className="h-4 w-4" />
								</Button>
								<Button variant="outline" className="group">
									View All
									<ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
								</Button>
							</div>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{(mockProjects as MockProject[]).map((mockProject) => {
								// Transform mock project to match expected Project type
								const project: Project = {
									...mockProject,
									tags: mockProject.tags.map((tag) => tag.text),
								}
								return <ProjectCard key={project.id} project={project} />
							})}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-semibold">Latest Updates</h2>
							<Button variant="outline" className="group">
								View All
								<ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
							</Button>
						</div>
						<div className="space-y-4">
							{(mockProjects as MockProject[]).map((mockProject) => {
								const formattedDate = new Date().toLocaleDateString(undefined, {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})

								return (
									<div
										key={mockProject.id}
										className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
									>
										<h3 className="font-medium text-sm mb-1">
											{mockProject.title}
										</h3>
										<p className="text-sm text-gray-600">
											{mockProject.description}
										</p>
										<time
											dateTime={new Date().toISOString()}
											className="text-xs text-gray-500 mt-2 block"
										>
											{formattedDate}
										</time>
									</div>
								)
							})}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
