'use client'

import {
	Apple,
	Building2,
	Cloud,
	Droplet,
	GraduationCap,
	Heart,
	Home,
	Leaf,
	type LucideIcon,
	Users,
	Zap,
} from 'lucide-react'
import React, { useState } from 'react'

interface Category {
	id: string
	icon: LucideIcon
	label: string
}

const categories: Category[] = [
	{ id: 'sustainability', icon: Leaf, label: 'Sustainability' },
	{ id: 'education', icon: GraduationCap, label: 'Education' },
	{ id: 'healthcare', icon: Heart, label: 'Healthcare' },
	{ id: 'climate', icon: Cloud, label: 'Climate Action' },
	{ id: 'equality', icon: Users, label: 'Social Equality' },
	{ id: 'food', icon: Apple, label: 'Food Security' },
	{ id: 'water', icon: Droplet, label: 'Clean Water' },
	{ id: 'energy', icon: Zap, label: 'Clean Energy' },
	{ id: 'poverty', icon: Home, label: 'Poverty Relief' },
	{ id: 'community', icon: Building2, label: 'Community' },
]

interface Project {
	id: number
	title: string
	category: string
	description: string
	currentAmount: number
	goal: number
	progress: number
	supporters: number
	minSupport: number
	tags: string[]
}

const projects: Project[] = [
	{
		id: 1,
		title: 'Empowering Education',
		category: 'Education',
		description: 'Support education programs for children in low-income areas.',
		currentAmount: 40000,
		goal: 55000,
		progress: 73,
		supporters: 40,
		minSupport: 10,
		tags: ['EDUCATION', 'CHILDREN', 'FUTURE'],
	},
]

interface ProjectCardProps {
	project: Project
}

const ProjectCard = ({ project }: ProjectCardProps) => (
	<div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
		<div className="relative">
			<div className="absolute top-4 left-4">
				<span className="bg-white px-3 py-1 rounded-full text-sm font-medium">
					{project.category}
				</span>
			</div>
			<div className="h-48 bg-gray-200 flex items-center justify-center">
				<span className="text-gray-400">Project Image</span>
			</div>
		</div>

		<div className="p-4">
			<h3 className="text-lg font-semibold mb-2">{project.title}</h3>
			<p className="text-gray-600 text-sm mb-4">{project.description}</p>

			<div className="space-y-4">
				<div>
					<div className="flex justify-between text-sm mb-1">
						<span className="font-semibold">
							${project.currentAmount.toLocaleString()}
						</span>
						<span className="text-gray-600">
							{project.progress}% of ${project.goal.toLocaleString()}
						</span>
					</div>
					<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
						<div
							className="h-full bg-green-500 rounded-full transition-all duration-500"
							style={{ width: `${project.progress}%` }}
						/>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4 text-center py-2">
					<div>
						<div className="font-semibold">
							${project.currentAmount.toLocaleString()}
						</div>
						<div className="text-xs text-gray-600">Goal</div>
					</div>
					<div>
						<div className="font-semibold">{project.supporters}</div>
						<div className="text-xs text-gray-600">Supporters</div>
					</div>
					<div>
						<div className="font-semibold">${project.minSupport}</div>
						<div className="text-xs text-gray-600">Min. Support</div>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					{project.tags.map((tag: string) => (
						<span
							key={tag}
							className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-sm"
						>
							{tag}
						</span>
					))}
				</div>
			</div>
		</div>
	</div>
)

const ProjectsSection = () => {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const [sortBy, setSortBy] = useState<string>('popular')

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-6">Causes That Change Lives</h1>

			<div className="grid grid-cols-5 md:grid-cols-10 gap-4 mb-8">
				{categories.map(({ id, icon: Icon, label }) => (
					<button
						type="button"
						key={id}
						className={`flex flex-col items-center p-2 h-auto hover:bg-gray-50 rounded-md
              ${selectedCategory === id ? 'text-primary' : 'text-gray-600'}`}
						onClick={() => setSelectedCategory(id)}
					>
						<div className="p-2 rounded-full bg-gray-100">
							<Icon size={20} />
						</div>
						<span className="text-sm mt-1">{label}</span>
					</button>
				))}
			</div>

			<div className="flex justify-between items-center mb-6">
				<div className="flex items-baseline gap-4">
					<h2 className="text-xl font-semibold">Social Causes To Support</h2>
					<button
						type="button"
						className="text-primary underline-offset-4 hover:underline"
					>
						See all (50)
					</button>
				</div>

				<select
					className="border rounded-md px-3 py-2"
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value)}
				>
					<option value="popular">Popular Searches</option>
					<option value="recent">Recent</option>
					<option value="goal">Closest to Goal</option>
				</select>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{projects.map((project) => (
					<ProjectCard key={project.id} project={project} />
				))}
			</div>
		</div>
	)
}

export default ProjectsSection
