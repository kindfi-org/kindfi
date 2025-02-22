import type { ImpactMaker } from '~/lib/types/impact/impact-makers'

export const impactMakers: ImpactMaker[] = [
	{
		id: 'sarah',
		name: 'Sarah Chen',
		level: 'Platinum',
		image: '/placeholder.svg?height=100&width=100',
		totalImpact: 250000,
		projectsSupported: 45,
		badges: ['Global Changemaker', 'Early Supporter'],
	},
	{
		id: 'michael',
		name: 'Michael Roberts',
		level: 'Gold',
		image: '/placeholder.svg?height=100&width=100',
		totalImpact: 175000,
		projectsSupported: 32,
		badges: ['Consistent Contributor', 'Community Leader'],
	},
	{
		id: 'aisha',
		name: 'Aisha Patel',
		level: 'Silver',
		image: '/placeholder.svg?height=100&width=100',
		totalImpact: 125000,
		projectsSupported: 28,
		badges: ['Rising Star', 'Education Champion'],
	},
]

export const levelColors = {
	Platinum: 'text-purple-600',
	Gold: 'text-yellow-600',
	Silver: 'text-gray-600',
} as const
