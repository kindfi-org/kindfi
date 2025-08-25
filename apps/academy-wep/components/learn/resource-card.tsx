'use client'

import { motion } from 'framer-motion'
import { Clock, MessageSquare, ThumbsUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { PLACEHOLDER_IMG } from '~/lib/constants/paths'
import type { Resource } from './learning-materials'

interface ResourceCardProps {
	resource: Resource
	index: number
}

export function ResourceCard({ resource, index }: ResourceCardProps) {
	return (
		<motion.div
			key={resource.id}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.4, delay: index * 0.05 }}
			className="group relative overflow-hidden bg-white rounded-2xl transition-all duration-500 hover:shadow-xl flex flex-col h-full border border-gray-100 shadow-sm"
		>
			{/* Hover effect background */}
			<div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

			{/* Card content */}
			<div className="relative z-10 flex flex-col h-full">
				<div className="h-48 bg-gray-100 relative overflow-hidden flex-shrink-0">
					<Image
						src={resource.image || PLACEHOLDER_IMG}
						alt={resource.title}
						className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
						width={400}
						height={240}
					/>

					<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

					<div className="absolute top-3 left-3 z-20">
						<div className="bg-white/90 backdrop-blur-sm py-1 px-3 rounded-full text-xs font-medium shadow-sm">
							{resource.category}
						</div>
					</div>

					<div className="absolute top-3 right-3 z-20">
						{resource.type === 'article' && (
							<div className="bg-blue-600 text-white py-1 px-3 rounded-full text-xs font-medium shadow-sm">
								article
							</div>
						)}
						{resource.type === 'video' && (
							<div className="bg-red-600 text-white py-1 px-3 rounded-full text-xs font-medium shadow-sm">
								video
							</div>
						)}
						{resource.type === 'guide' && (
							<div className="bg-green-600 text-white py-1 px-3 rounded-full text-xs font-medium shadow-sm">
								guide
							</div>
						)}
					</div>
				</div>

				<div className="p-6 flex-grow flex flex-col">
					<h3 className="text-xl font-bold mb-2 group-hover:text-[#7CC635] transition-colors duration-300 line-clamp-1">
						{resource.title}
					</h3>
					<p className="text-gray-600 mb-4 line-clamp-2 group-hover:text-gray-800 transition-colors duration-300 flex-grow">
						{resource.description}
					</p>

					<div className="flex items-center justify-between text-sm text-gray-500 mb-4">
						<div className="flex items-center">
							<Clock className="h-4 w-4 mr-1" />
							{resource.duration}
						</div>
						<div className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
							{resource.level}
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2 mb-4 min-h-[28px]">
						{resource.tags.slice(0, 3).map((tag) => (
							<span
								key={tag}
								className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
							>
								{tag}
							</span>
						))}
						{resource.tags.length > 3 && (
							<span className="text-xs text-gray-500">
								+{resource.tags.length - 3} more
							</span>
						)}
					</div>

					<div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mt-auto">
						<div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
							<div className="flex items-center">
								<ThumbsUp className="h-4 w-4 mr-1" />
								{resource.likes}
							</div>
							<div className="flex items-center">
								<MessageSquare className="h-4 w-4 mr-1" />
								{resource.comments}
							</div>
						</div>

						<Link
							href={`/resources/${resource.id}`}
							className="w-full sm:w-auto"
						>
							<Button
								variant="default"
								size="sm"
								className="bg-[#7CC635] hover:bg-[#6bb12a] text-white shadow-sm hover:shadow-md rounded-xl transition-all duration-300 w-full sm:w-auto"
							>
								View Resource
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</motion.div>
	)
}
