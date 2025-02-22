import type { ImpactCategory } from '~/lib/types/impact/impact-categories'

export const impactCategories: ImpactCategory[] = [
	{
		id: 'education',
		title: 'Education',
		icon: 'GraduationCap',
		totalFunded: 450000,
		activeProjects: 120,
		growthRate: 45,
	},
	{
		id: 'environment',
		title: 'Environment',
		icon: 'Leaf',
		totalFunded: 380000,
		activeProjects: 95,
		growthRate: 38,
	},
	{
		id: 'healthcare',
		title: 'Healthcare',
		icon: 'Shield',
		totalFunded: 320000,
		activeProjects: 85,
		growthRate: 32,
	},
	{
		id: 'social-welfare',
		title: 'Social Welfare',
		icon: 'Users',
		totalFunded: 280000,
		activeProjects: 75,
		growthRate: 28,
	},
]
