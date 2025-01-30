export type Project = {
	id: string
	title: string
	description: string
	category: string
	currentAmount: number
	goalAmount: number
	supporters: number
	minSupport: number
	tags: string[]
	percentageReached: number
}

export const mockProjects = [
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
	// Add other projects...
]
