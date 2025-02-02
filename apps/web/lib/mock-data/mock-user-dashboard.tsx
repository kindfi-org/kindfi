import { BarChart2, Users, Wallet } from 'lucide-react'
import type { ImpactMetric, Project } from '~/lib/types/user-dashboard'

export const mockProjects: ProjectDetails[] = [
	{
		id: 'healthy-kids-id',
		image: '/images/kids.webp',
		category: 'Child Welfare',
		title: 'Healthy Kids Workshop',
		description:
			'Provide nourishing meals and support to children at risk of malnutrition in Costa Rica.',
		currentAmount: 22800,
		targetAmount: 25000,
		investors: 18,
		minInvestment: 5,
		percentageComplete: 90,
		tags: [
			{ id: 'ngo-tag-id', text: 'NGO' },
			{ id: 'nutrition-tag-id', text: 'NUTRITION' },
			{ id: 'children-tag-id', text: 'CHILDREN' },
		],
	},
	{
		id: 'mobile-clinics-id',
		image: '/images/healthcare.webp',
		category: 'Healthcare',
		title: 'Mobile Clinics',
		description:
			'Bring essential healthcare services to remote areas through mobile clinics.',
		currentAmount: 32000,
		targetAmount: 45000,
		investors: 30,
		minInvestment: 20,
		percentageComplete: 71,
		tags: [
			{ id: 'healthcare-tag-id', text: 'HEALTHCARE' },
			{ id: 'community-tag-id', text: 'COMMUNITY' },
			{ id: 'impact-tag-id', text: 'IMPACT' },
		],
	},
]

export const mockImpactMetrics: ImpactMetricItem[] = [
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
