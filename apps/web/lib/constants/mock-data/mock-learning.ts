import { LayoutGrid, Shield, ShieldCheck, Zap } from 'lucide-react'
import type { Category, NewsUpdate, Resource } from '~/lib/types/learning.types'

export const categories: Category[] = [
	{
		name: 'Crowdfunding',
		description: 'Learn about modern crowdfunding techniques and platforms',
		icon: LayoutGrid,
		slug: 'crowdfunding',
		type: 'crowdfunding',
	},
	{
		name: 'Blockchain',
		description: 'Understand blockchain technology and its applications',
		icon: Shield,
		slug: 'blockchain',
		type: 'blockchain',
	},
	{
		name: 'Web3',
		description: 'Explore the decentralized web and its possibilities',
		icon: Zap,
		slug: 'web3',
		type: 'web3',
	},
	{
		name: 'Security',
		description: 'Learn about crypto security and best practices',
		icon: ShieldCheck,
		slug: 'security',
		type: 'security',
	},
]

export const resources: Resource[] = [
	{
		id: 1,
		title: 'Introduction to Web3 Crowdfunding',
		description: 'Learn the basics of crowdfunding in the Web3 space',
		category: 'Crowdfunding',
		type: 'guide',
		level: 'beginner',
		duration: '30 min',
		engagement: {
			likes: 156,
			comments: 23,
		},
		image: '/images/crowdfunding-intro.jpg',
		featured: true,
	},
	// Add more resources as needed
]

export const newsUpdates: NewsUpdate[] = [
	{
		id: 1,
		title: 'New Security Features Released',
		description:
			'Exploring the latest security enhancements in Web3 crowdfunding',
		date: '2024-02-20',
		category: 'Security',
		image: '/images/security-update.jpg',
		slug: 'new-security-features',
		tags: ['security', 'update', 'web3'],
	},
	// Add more news updates as needed
]
