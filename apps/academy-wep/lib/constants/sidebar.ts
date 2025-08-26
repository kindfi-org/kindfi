import {
	BookOpen,
	CircleAlert,
	CircleAlertIcon,
	FileText,
	Home,
	Trophy,
} from 'lucide-react'

import type { LearningPath, NavigationRoute } from '../types/sidebar.types'

export const navigationRoutes: NavigationRoute[] = [
	{ name: 'Home', href: '/', icon: Home },
	{ name: 'Learn', href: '/learn', icon: BookOpen },
	{ name: 'Resources', href: '/resources', icon: FileText },
	{ name: 'Badges', href: '/badges', icon: Trophy },
	{ name: 'About KindFi', href: '/about', icon: CircleAlert },
	{ name: 'Connect', href: '/connect', icon: CircleAlertIcon },
]

export const learningPaths: LearningPath[] = [
	{
		name: 'Blockchain Fundamentals',
		icon: 'B',
		href: '/learn/blockchain-fundamentals',
		subItems: [
			{
				name: 'Introduction',
				href: '/learn/blockchain-fundamentals/introduction',
			},
			{
				name: 'Core Concepts',
				href: '/learn/blockchain-fundamentals/core-concepts',
			},
		],
	},
	{
		name: 'Impact Crowdfunding',
		icon: 'I',
		href: '/learn/impact-crowdfunding',
		subItems: [
			{
				name: 'Getting Started',
				href: '/learn/impact-crowdfunding/getting-started',
			},
			{
				name: 'Campaign Management',
				href: '/learn/impact-crowdfunding/campaign-management',
			},
		],
	},
]
