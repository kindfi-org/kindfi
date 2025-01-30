import type { ProjectIconType } from '~/components/icons'

export type Project = {
	id: string
	title: string
	description: string
	category: ProjectIconType
	currentAmount: number
	goalAmount: number
	supporters: number
	minSupport: number
	tags: string[]
	percentageReached: number
}

export const mockProjects: Project[] = [
	{
		id: '1',
		title: 'Empowering Education',
		description:
			'Support education programs for children in low-income areas. Together, we can bridge the educational gap.',
		category: 'education',
		currentAmount: 40000,
		goalAmount: 55000,
		supporters: 40,
		minSupport: 10,
		tags: ['EDUCATION', 'CHILDREN', 'FUTURE'],
		percentageReached: 73,
	},
	{
		id: '2',
		title: 'Mobile Clinics',
		description:
			'Bring essential healthcare services to remote areas through mobile clinics. Your support saves lives.',
		category: 'healthcare',
		currentAmount: 32000,
		goalAmount: 45000,
		supporters: 30,
		minSupport: 20,
		tags: ['HEALTHCARE', 'COMMUNITY', 'IMPACT'],
		percentageReached: 71,
	},
	{
		id: '3',
		title: 'Healthy Kids Workshop',
		description:
			'Provide nourishing meals and support to children at risk of malnutrition in Costa Rica.',
		category: 'healthcare',
		currentAmount: 22800,
		goalAmount: 25000,
		supporters: 18,
		minSupport: 5,
		tags: ['NGO', 'NUTRITION', 'CHILDREN'],
		percentageReached: 91,
	},
	{
		id: '4',
		title: 'Forest Restoration Initiative',
		description:
			'Restore and reforest areas devastated by uncontrolled deforestation. Your support matters.',
		category: 'sustainability',
		currentAmount: 54000,
		goalAmount: 60000,
		supporters: 35,
		minSupport: 10,
		tags: ['ENVIRONMENT', 'ECOLOGICAL', 'SUSTAINABLE'],
		percentageReached: 90,
	},
]
