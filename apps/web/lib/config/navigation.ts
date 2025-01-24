interface NavigationItem {
  id: string
	title: string
	href: string
	description: string
}

const projects: NavigationItem[] = [
	{
    id: 'explore-projects-id',
		title: 'Explore Projects',
		href: '/projects',
		description: 'Discover verified social initiatives powered by blockchain',
	},
	{
    id: 'create-project-id',
		title: 'Create a Project',
		href: '/create',
		description: 'Start your social impact campaign with Web3 technology',
	},
	{
    id: 'featured-projects-id',
		title: 'Featured Projects',
		href: '/featured',
		description: 'Explore the most successful initiatives from our community',
	},
]

const resources: NavigationItem[] = [
	{
    id: 'learn-web3-id',
		title: 'Learn Web3',
		href: '/learn',
		description:
			'Access guides and resources to understand blockchain and crypto',
	},
	{
    id: 'community-id',
		title: 'Community',
		href: '/community',
		description: 'Join our decentralized and collaborative community',
	},
	{
    id: 'social-impact-id',
		title: 'Social Impact',
		href: '/social-impact',
		description: 'Learn about the social impact initiatives and their outcomes',
	},
]

export interface NavigationSection {
	section: string
	navigationItems: NavigationItem[]
}

export const sections: NavigationSection[] = [
	{ section: 'Projects', navigationItems: projects },
	{ section: 'Resources', navigationItems: resources },
]
