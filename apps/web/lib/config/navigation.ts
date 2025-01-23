export interface NavigationItem {
	title: string
	href: string
	description: string
}

export const projects: NavigationItem[] = [
	{
		title: 'Explore Projects',
		href: '/projects',
		description: 'Discover verified social initiatives powered by blockchain',
	},
	{
		title: 'Create a Project',
		href: '/create',
		description: 'Start your social impact campaign with Web3 technology',
	},
	{
		title: 'Featured Projects',
		href: '/featured',
		description: 'Explore the most successful initiatives from our community',
	},
]

export const resources: NavigationItem[] = [
	{
		title: 'Learn Web3',
		href: '/learn',
		description:
			'Access guides and resources to understand blockchain and crypto',
	},
	{
		title: 'Community',
		href: '/community',
		description: 'Join our decentralized and collaborative community',
	},
	{
		title: 'Social Impact',
		href: 'Social Impact',
		description: 'Description of Resource Y',
	},
]
