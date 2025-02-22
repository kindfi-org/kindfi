import { LayoutGrid, Shield, ShieldCheck, Zap } from 'lucide-react'
import type { Category, NewsUpdate, Resource } from '~/lib/types/learning.types'

export const categories: Category[] = [
	{
		name: 'Crowdfunding',
		description: 'Learn the basics of crowdfunding and best practices',
		icon: LayoutGrid,
		slug: 'crowdfunding',
		type: 'crowdfunding',
	},
	{
		name: 'Blockchain',
		description: 'Understand how blockchain ensures transparency',
		icon: Shield,
		slug: 'blockchain',
		type: 'blockchain',
	},
	{
		name: 'Web3',
		description: 'Explore the future of decentralized funding',
		icon: Zap,
		slug: 'web3',
		type: 'web3',
	},
	{
		name: 'Security',
		description: 'Learn about secure donation practices',
		icon: ShieldCheck,
		slug: 'security',
		type: 'security',
	},
]

export const resources: Resource[] = [
	{
		id: 1,
		title: 'How Blockchain Ensures Donation Transparency',
		description:
			'Learn how blockchain technology creates an immutable record of all donations and ensures complete transparency in crowdfunding.',
		category: 'Blockchain',
		type: 'article',
		level: 'Beginner',
		duration: '10 min',
		engagement: {
			likes: 245,
			comments: 45,
		},
		image: '/images/disaster-aid.webp',
	},
	{
		id: 2,
		title: 'Getting Started with Stellar Wallets',
		description:
			'A step-by-step guide to setting up and using Stellar wallets for secure cryptocurrency donations.',
		category: 'Stellar',
		type: 'video',
		level: 'Beginner',
		duration: '15 min',
		engagement: {
			likes: 189,
			comments: 32,
		},
		image: '/images/bosques.webp',
	},
	{
		id: 3,
		title: 'Web3 Crowdfunding: A Complete Guide',
		description:
			'Understand how Web3 technology is revolutionizing crowdfunding through smart contracts and decentralized finance.',
		category: 'Web3',
		type: 'guide',
		level: 'Intermediate',
		duration: '20 min',
		engagement: {
			likes: 312,
			comments: 67,
		},
		image: '/images/ecommerce.webp',
	},
]

export const newsUpdates: NewsUpdate[] = []
