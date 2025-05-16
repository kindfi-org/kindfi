import type { Tables } from '@services/supabase'

export const categories: Tables<'categories'>[] = [
	{ id: '1', name: 'Animal Welfare', slug: 'animal-welfare', color: '#FF7043' },
	{ id: '2', name: 'Child Welfare', slug: 'child-welfare', color: '#9B59B6' },
	{
		id: '3',
		name: 'Environmental Protection',
		slug: 'environmental-protection',
		color: '#7CB342',
	},
	{
		id: '4',
		name: 'Disaster Relief',
		slug: 'disaster-relief',
		color: '#FF5252',
	},
	{
		id: '5',
		name: 'Culture and Arts',
		slug: 'culture-and-arts',
		color: '#9B59B6',
	},
	{
		id: '6',
		name: 'Access to Clean Water',
		slug: 'access-to-clean-water',
		color: '#00BCD4',
	},
	{ id: '7', name: 'Education', slug: 'education', color: '#4A90E2' },
	{ id: '8', name: 'Healthcare', slug: 'healthcare', color: '#27AE60' },
	{
		id: '9',
		name: 'Environmental Projects',
		slug: 'environmental-projects',
		color: '#7CB342',
	},
	{
		id: '10',
		name: 'Empowering Communities',
		slug: 'empowering-communities',
		color: '#00BCD4',
	},
	{
		id: '11',
		name: 'Animal Shelters',
		slug: 'animal-shelters',
		color: '#E53935',
	},
	{
		id: '12',
		name: 'Community News',
		slug: 'community-news',
		color: '#607D8B',
	},
]
