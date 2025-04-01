'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/base/button'
import { Tabs, TabsContent } from '~/components/base/tabs'
import { LearningModuleCard } from '~/components/learn/learning-module-card'
import { ResourceCard } from '~/components/learn/resource-card'
import { TabSelector } from '~/components/learn/tab-selector'

// Define types for our data
export interface Module {
	id: number
	title: string
	description: string
	lessons: number
	completed: number
	unlocked: boolean
	category: string
	level: string
	duration: string
	likes: number
	comments: number
	image: string
	tags: string[]
}

export interface Resource {
	id: number
	title: string
	description: string
	type: string
	category: string
	level: string
	duration: string
	author: string
	date: string
	likes: number
	comments: number
	image: string
	tags: string[]
}

export function LearningMaterials() {
	// State for filters
	const [activeCategory, setActiveCategory] = useState<string>('all')
	const [activeLevel, setActiveLevel] = useState<string>('all')
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [activeTab, setActiveTab] = useState<string>('modules')

	// This would come from a database in a real application
	const modules: Module[] = [
		{
			id: 1,
			title: 'Introduction to Blockchain',
			description:
				'Learn the fundamentals of blockchain technology and its applications.',
			lessons: 5,
			completed: 5,
			unlocked: true,
			category: 'Blockchain',
			level: 'Beginner',
			duration: '10 min read',
			likes: 245,
			comments: 45,
			image: '/images/blockchain.jpg?height=240&width=400',
			tags: ['Fundamentals', 'Technology'],
		},
		{
			id: 2,
			title: 'Stellar Blockchain Basics',
			description:
				'Understand the Stellar network, consensus mechanism, and ecosystem.',
			lessons: 4,
			completed: 2,
			unlocked: true,
			category: 'Stellar',
			level: 'Beginner',
			duration: '15 min read',
			likes: 189,
			comments: 32,
			image: '/images/stellar-blockchain.avif?height=240&width=400',
			tags: ['Stellar', 'Consensus'],
		},
		{
			id: 3,
			title: 'Stellar Wallets',
			description:
				'Set up and manage Stellar wallets securely for your project funds.',
			lessons: 6,
			completed: 0,
			unlocked: true,
			category: 'Stellar',
			level: 'Beginner',
			duration: '20 min read',
			likes: 156,
			comments: 28,
			image: '/images/stellar-wallets.webp?height=240&width=400',
			tags: ['Wallets', 'Security'],
		},
		{
			id: 4,
			title: 'Managing XLM & USDC',
			description:
				'Learn how to handle different assets on the Stellar network.',
			lessons: 5,
			completed: 0,
			unlocked: false,
			category: 'Stellar',
			level: 'Intermediate',
			duration: '25 min read',
			likes: 132,
			comments: 24,
			image: '/placeholder.svg?height=240&width=400',
			tags: ['Assets', 'XLM', 'USDC'],
		},
		{
			id: 5,
			title: 'Web3 Integration',
			description: 'Connect your project to the broader web3 ecosystem.',
			lessons: 4,
			completed: 0,
			unlocked: false,
			category: 'Web3',
			level: 'Intermediate',
			duration: '30 min read',
			likes: 312,
			comments: 67,
			image: '/placeholder.svg?height=240&width=400',
			tags: ['Web3', 'Integration'],
		},
		{
			id: 6,
			title: 'KindFi Fund Management',
			description:
				'Best practices for managing crowdfunded resources on KindFi.',
			lessons: 3,
			completed: 0,
			unlocked: false,
			category: 'KindFi',
			level: 'Advanced',
			duration: '20 min read',
			likes: 178,
			comments: 39,
			image: '/placeholder.svg?height=240&width=400',
			tags: ['KindFi', 'Management'],
		},
	]

	// Featured resources data
	const resources: Resource[] = [
		{
			id: 1,
			title: 'Understanding Blockchain Technology',
			description:
				'A comprehensive guide to blockchain fundamentals and how they apply to social impact projects.',
			type: 'article',
			category: 'Blockchain',
			level: 'Beginner',
			duration: '15 min read',
			author: 'Alex Johnson',
			date: 'April 10, 2025',
			likes: 245,
			comments: 45,
			image: '/images/blockchain-basics.jpg?height=240&width=400',
			tags: ['Blockchain', 'Fundamentals', 'Technology'],
		},
		{
			id: 2,
			title: 'Setting Up Your First Stellar Wallet',
			description:
				'Step-by-step video tutorial on creating and securing your Stellar wallet for donations.',
			type: 'video',
			category: 'Stellar',
			level: 'Beginner',
			duration: '12 min watch',
			author: 'Maria Rodriguez',
			date: 'March 28, 2025',
			likes: 189,
			comments: 32,
			image: '/images/setup-stellar-wallet.png?height=240&width=400',
			tags: ['Stellar', 'Wallets', 'Security'],
		},
		{
			id: 3,
			title: 'Web3 Crowdfunding Best Practices',
			description:
				'Learn the most effective strategies for running successful Web3 crowdfunding campaigns.',
			type: 'guide',
			category: 'Web3',
			level: 'Intermediate',
			duration: '20 min read',
			author: 'David Chen',
			date: 'April 2, 2025',
			likes: 312,
			comments: 67,
			image: '/images/crowdfunding.png?height=240&width=400',
			tags: ['Web3', 'Crowdfunding', 'Best Practices'],
		},
		{
			id: 4,
			title: 'Managing XLM & USDC Assets',
			description:
				'A detailed guide on handling different assets on the Stellar network for your projects.',
			type: 'guide',
			category: 'Stellar',
			level: 'Intermediate',
			duration: '25 min read',
			author: 'Sarah Williams',
			date: 'March 15, 2025',
			likes: 132,
			comments: 24,
			image: '/images/xlm.png?height=240&width=400',
			tags: ['Stellar', 'XLM', 'USDC', 'Assets'],
		},
		{
			id: 5,
			title: 'Transparency in Blockchain Donations',
			description:
				'How blockchain technology ensures complete transparency in the donation process.',
			type: 'article',
			category: 'Blockchain',
			level: 'Beginner',
			duration: '10 min read',
			author: 'Michael Brown',
			date: 'April 5, 2025',
			likes: 178,
			comments: 39,
			image: '/images/blockchain-transparency.jpg?height=240&width=400',
			tags: ['Blockchain', 'Transparency', 'Donations'],
		},
		{
			id: 6,
			title: 'KindFi Platform Tutorial',
			description:
				'Complete walkthrough of the KindFi platform features and how to use them effectively.',
			type: 'video',
			category: 'KindFi',
			level: 'Beginner',
			duration: '30 min watch',
			author: 'Emma Davis',
			date: 'March 20, 2025',
			likes: 215,
			comments: 53,
			image: '/images/kindfi-org.png?height=240&width=400',
			tags: ['KindFi', 'Tutorial', 'Platform'],
		},
	]

	// Filter modules based on active filters
	const filteredModules = modules.filter((module) => {
		// Filter by category
		if (activeCategory !== 'all' && module.category !== activeCategory)
			return false

		// Filter by level
		if (activeLevel !== 'all' && module.level !== activeLevel) return false

		// Filter by search query
		if (
			searchQuery &&
			!module.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
			!module.description.toLowerCase().includes(searchQuery.toLowerCase())
		)
			return false

		return true
	})

	// Filter resources based on active filters
	const filteredResources = resources.filter((resource) => {
		// Filter by category
		if (activeCategory !== 'all' && resource.category !== activeCategory)
			return false

		// Filter by level
		if (activeLevel !== 'all' && resource.level !== activeLevel) return false

		// Filter by search query
		if (
			searchQuery &&
			!resource.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
			!resource.description.toLowerCase().includes(searchQuery.toLowerCase())
		)
			return false

		return true
	})

	// Reset filters
	const resetFilters = () => {
		setActiveCategory('all')
		setActiveLevel('all')
		setSearchQuery('')
	}

	return (
		<div className="flex flex-col min-h-screen bg-transparent">
			<main className="flex-1 py-6">
				<div className="container px-4 md:px-6 mx-auto">
					{/* Tabs for switching between modules and resources */}
					<Tabs
						defaultValue="modules"
						className="mb-10"
						onValueChange={setActiveTab}
					>
						<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
							<div>
								<div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f0f9e8] text-[#7CC635] rounded-full text-sm font-medium mb-4">
									<Sparkles className="h-4 w-4" />
									<span>Learning Content</span>
								</div>
								<h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-[#7CC635] bg-clip-text text-transparent">
									Explore Our Learning Materials
								</h2>
								<p className="text-gray-600 max-w-2xl">
									Browse through our collection of learning modules and
									resources to continue your blockchain education journey.
								</p>
							</div>
						</div>

						<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
							<div className="md:ml-auto">
								<TabSelector activeTab={activeTab} />
							</div>
						</div>

						<TabsContent
							value="modules"
							className="mt-0 focus-visible:outline-none focus-visible:ring-0"
						>
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
								{/* Decorative line elements */}
								<div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7CC635]/20 to-transparent"></div>
								<div className="absolute top-2/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

								<AnimatePresence mode="wait">
									{filteredModules.length > 0 ? (
										filteredModules.map((module, index) => (
											<LearningModuleCard
												key={module.id}
												module={module}
												index={index}
											/>
										))
									) : (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="col-span-full flex flex-col items-center justify-center py-16 text-center"
										>
											<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
												<Search className="h-8 w-8 text-gray-400" />
											</div>
											<h3 className="text-xl font-medium text-gray-900 mb-2">
												No modules found
											</h3>
											<p className="text-gray-600 mb-6 max-w-md">
												We couldn&apos;t find any modules matching your current
												filters. Try adjusting your search criteria.
											</p>
											<Button variant="outline" onClick={resetFilters}>
												Reset Filters
											</Button>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</TabsContent>

						<TabsContent
							value="resources"
							className="mt-0 focus-visible:outline-none focus-visible:ring-0"
						>
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
								{/* Decorative line elements */}
								<div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7CC635]/20 to-transparent"></div>
								<div className="absolute top-2/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

								<AnimatePresence mode="wait">
									{filteredResources.length > 0 ? (
										filteredResources.map((resource, index) => (
											<ResourceCard
												key={resource.id}
												resource={resource}
												index={index}
											/>
										))
									) : (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="col-span-full flex flex-col items-center justify-center py-16 text-center"
										>
											<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
												<Search className="h-8 w-8 text-gray-400" />
											</div>
											<h3 className="text-xl font-medium text-gray-900 mb-2">
												No resources found
											</h3>
											<p className="text-gray-600 mb-6 max-w-md">
												We couldn&apos;t find any resources matching your
												current filters. Try adjusting your search criteria.
											</p>
											<Button variant="outline" onClick={resetFilters}>
												Reset Filters
											</Button>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</main>
		</div>
	)
}
