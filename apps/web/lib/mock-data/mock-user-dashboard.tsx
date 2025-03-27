import { BarChart2, Users, Wallet } from 'lucide-react'
import type { ImpactMetric, Project } from '~/lib/types'

export const mockProjects: Project[] = [
	{
		id: 'healthy-kids-id',
		image_url: '/images/kids.webp',
		categories: ['Child Welfare'],
		title: 'Healthy Kids Workshop',
		description:
			'Provide nourishing meals and support to children at risk of malnutrition in Costa Rica.',
		current_amount: 22800,
		target_amount: 25000,
		investors_count: 18,
		min_investment: 5,
		created_at: '2023-08-22T09:30:00Z',
		percentage_complete: 90,
		tags: [
			{ id: 'ngo-tag-id', text: 'NGO' },
			{ id: 'nutrition-tag-id', text: 'NUTRITION' },
			{ id: 'children-tag-id', text: 'CHILDREN' },
		],
	},
	{
		id: 'mobile-clinics-id',
		image_url: '/images/healthcare.webp',
		categories: ['Healthcare'],
		title: 'Mobile Clinics',
		description:
			'Bring essential healthcare services to remote areas through mobile clinics.',
		current_amount: 32000,
		target_amount: 45000,
		investors_count: 30,
		min_investment: 20,
		created_at: '2023-09-22T09:30:00Z',
		percentage_complete: 71,
		tags: [
			{ id: 'healthcare-tag-id', text: 'HEALTHCARE' },
			{ id: 'community-tag-id', text: 'COMMUNITY' },
			{ id: 'impact-tag-id', text: 'IMPACT' },
		],
	},
]

export const mockImpactMetrics: ImpactMetric[] = [
	{
		label: 'Total Impact',
		value: '$12,890.50',
		icon: <BarChart2 className="h-5 w-5 text-teal-500" />,
	},
	{
		label: 'Active Projects',
		value: '12',
		icon: <Users className="h-5 w-5 text-blue-500" />,
	},
	{
		label: 'Available Balance',
		value: '0.5 ETH',
		icon: <Wallet className="h-5 w-5 text-purple-500" />,
	},
]
