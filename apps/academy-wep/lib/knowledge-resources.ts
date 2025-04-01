export interface ResourceType {
	id: string
	title: string
	description: string
	category: string
	type: string
	image?: string
	duration: number
	level: string
	tags: string[]
	likes: number
	comments: number
	date: string
	url: string
}

export const resourcesData: ResourceType[] = [
	{
		id: 'blockchain-fundamentals',
		title: 'Understanding Blockchain',
		description:
			'A comprehensive guide to blockchain fundamentals and how they apply to social impact initiatives.',
		category: 'Blockchain',
		type: 'Article',
		image: '/placeholder.svg?height=200&width=400',
		duration: 15,
		level: 'Beginner',
		tags: ['Blockchain', 'Fundamentals', 'Technology'],
		likes: 42,
		comments: 8,
		date: 'Mar 15, 2024',
		url: '/resources/blockchain-fundamentals',
	},
	{
		id: 'stellar-wallet-setup',
		title: 'Setting Up Your First Stellar Wallet',
		description:
			'Step-by-step video tutorial on creating and securing your Stellar wallet for social impact projects.',
		category: 'Stellar',
		type: 'Video',
		image: '/placeholder.svg?height=200&width=400',
		duration: 12,
		level: 'Beginner',
		tags: ['Stellar', 'Wallets', 'Security'],
		likes: 36,
		comments: 12,
		date: 'Mar 10, 2024',
		url: '/resources/stellar-wallet-setup',
	},
	{
		id: 'web3-crowdfunding',
		title: 'Web3 Crowdfunding Best Practices',
		description:
			'Learn the most effective strategies for running successful Web3 crowdfunding campaigns for social impact.',
		category: 'Web3',
		type: 'Guide',
		image: '/placeholder.svg?height=200&width=400',
		duration: 20,
		level: 'Intermediate',
		tags: ['Web3', 'Crowdfunding', 'Best Practices'],
		likes: 28,
		comments: 5,
		date: 'Mar 5, 2024',
		url: '/resources/web3-crowdfunding',
	},
]
