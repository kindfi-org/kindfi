import type { CreateProjectFormData } from '~/lib/types/project/create-project.types'

export const project: CreateProjectFormData = {
	id: '1',
	title: 'Empowering Education',
	description:
		'Support education programs for children in low-income areas. Together, we can bridge the education gap and create opportunities for all children regardless of their background.',
	targetAmount: 55000,
	minimumInvestment: 10,
	image: null,
	website: 'https://empoweringeducation.org',
	socialLinks: [
		'https://twitter.com/empowereducation',
		'https://facebook.com/empoweringeducation',
		'https://instagram.com/empowereducation',
	],
	location: 'CRI', // Costa Rica
	category: '7', // Education
	tags: [
		{ label: 'EDUCATION', color: '#3B82F6' },
		{ label: 'CHILDREN', color: '#10B981' },
		{ label: 'FUTURE', color: '#F59E0B' },
	],
}
