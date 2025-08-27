'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, MessageSquare, ThumbsUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { PLACEHOLDER_IMG } from '~/lib/constants/paths'
import type { ResourceType } from '~/lib/knowledge-resources'

interface ResourceCardProps {
	resource: ResourceType
	index: number
}

export const ResourceCard = ({ resource, index }: ResourceCardProps) => {
	const getTypeColor = (type: string) => {
		switch (type.toLowerCase()) {
			case 'article':
				return 'bg-blue-500'
			case 'video':
				return 'bg-red-500'
			case 'guide':
				return 'bg-green-500'
			default:
				return 'bg-gray-500'
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
			className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
		>
			<div className="relative h-48 bg-slate-200">
				<Image
					src={resource.image || `${PLACEHOLDER_IMG}?height=200&width=400`}
					alt={resource.title}
					fill
					className="object-cover"
				/>

				<span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white text-slate-800 text-xs font-medium">
					{resource.category}
				</span>
				<span
					className={`absolute top-3 right-3 px-3 py-1 rounded-full ${getTypeColor(resource.type)} text-white text-xs font-medium`}
				>
					{resource.type}
				</span>
			</div>

			<div className="p-6">
				<Link href={`/resources/${resource.id}`}>
					<h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
						{resource.title}
					</h3>
				</Link>

				<p className="text-slate-600 mb-4 line-clamp-2">
					{resource.description}
				</p>

				<div className="flex items-center text-sm text-slate-600 mb-4">
					{resource.type === 'Video' ? (
						<span className="flex items-center mr-4">
							<Clock className="h-4 w-4 mr-1" />
							{resource.duration} min watch
						</span>
					) : (
						<span className="flex items-center mr-4">
							<Clock className="h-4 w-4 mr-1" />
							{resource.duration} min read
						</span>
					)}

					<span className="ml-auto px-2 py-1 bg-slate-100 rounded text-xs">
						{resource.level}
					</span>
				</div>

				<div className="flex flex-wrap gap-2 mb-4">
					{resource.tags.map((tag) => (
						<span key={tag} className="text-xs bg-slate-100 px-2 py-1 rounded">
							{tag}
						</span>
					))}
				</div>

				<div className="flex items-center justify-between text-sm text-slate-500 mb-4">
					<div className="flex items-center gap-4">
						<span className="flex items-center">
							<ThumbsUp className="h-4 w-4 mr-1" />
							{resource.likes}
						</span>
						<span className="flex items-center">
							<MessageSquare className="h-4 w-4 mr-1" />
							{resource.comments}
						</span>
					</div>
					<span className="flex items-center">
						<Calendar className="h-4 w-4 mr-1" />
						{resource.date}
					</span>
				</div>

				<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
					<Button
						variant="outline"
						className="w-full bg-slate-50 hover:bg-slate-200 text-slate-700"
					>
						View
					</Button>
				</motion.div>
			</div>
		</motion.div>
	)
}
