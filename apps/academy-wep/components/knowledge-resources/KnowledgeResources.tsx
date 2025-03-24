'use client'

import { type ResourceType, resourcesData } from '@/lib/knowledge-resources'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FeaturedResources } from './FeaturedResources'
import { ResourceCard } from './ResourceCard'
import { SearchBar } from './SearchBar'

export const KnowledgeResources = () => {
	const [searchQuery, setSearchQuery] = useState('')
	const [filteredResources, setFilteredResources] =
		useState<ResourceType[]>(resourcesData)

	// Filter resources based on search query
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredResources(resourcesData)
			return
		}

		const query = searchQuery.toLowerCase().trim()
		const filtered = resourcesData.filter((resource) => {
			return (
				resource.title.toLowerCase().includes(query) ||
				resource.description.toLowerCase().includes(query) ||
				resource.category.toLowerCase().includes(query) ||
				resource.type.toLowerCase().includes(query) ||
				resource.level.toLowerCase().includes(query) ||
				resource.tags.some((tag) => tag.toLowerCase().includes(query))
			)
		})

		setFilteredResources(filtered)
	}, [searchQuery])

	const handleSearch = (query: string) => {
		setSearchQuery(query)
	}

	return (
		<div className="w-full mx-auto px-4 md:px-6 lg:px-8 xl:px-12 py-8">
			<motion.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
				className="rounded-2xl p-8 md:p-12 w-full bg-gradient-to-r from-blue-50 via-white to-primary/10"
				style={{ boxShadow: '0 0 15px 5px rgba(0, 0, 0, 0.1)' }}
			>
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mb-6"
				>
					<h1 className="text-4xl md:text-5xl font-bold mb-4">
						<span className="text-black">Knowledge</span>{' '}
						<span className="text-primary">Resources</span>
					</h1>
					<motion.p
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="text-slate-700 text-xl max-w-3xl font-medium"
					>
						Explore our collection of articles, videos, guides, and documents to
						deepen your understanding of blockchain, Stellar, and Web3
						technologies for social impact.
					</motion.p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
				>
					<SearchBar onSearch={handleSearch} />
				</motion.div>
			</motion.section>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
				className="mt-16"
			>
				<FeaturedResources />

				{filteredResources.length === 0 ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center py-12"
					>
						<p className="text-xl text-slate-600">
							No resources found matching &quot;{searchQuery}&quot;.
						</p>

						<p className="text-slate-500 mt-2">
							Try a different search term or browse all resources.
						</p>
					</motion.div>
				) : (
					<AnimatePresence>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
							{filteredResources.map((resource, index) => (
								<ResourceCard
									key={resource.id}
									resource={resource}
									index={index}
								/>
							))}
						</div>
					</AnimatePresence>
				)}
			</motion.div>
		</div>
	)
}

export default KnowledgeResources
