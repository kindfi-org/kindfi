import {
	BookOpen,
	Clock,
	FileText,
	MessageSquare,
	ThumbsUp,
	Video as VideoIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Resource } from '~/lib/types/learning.types'

interface ResourceCardProps {
	resource: Resource
	className?: string
}

function ResourceTypeBadge({ type }: { type: string }) {
	const badgeStyles =
		{
			article: 'bg-blue-500 text-white',
			video: 'bg-red-500 text-white',
			guide: 'bg-green-500 text-white',
		}[type.toLowerCase()] || 'bg-gray-500 text-white'

	const IconComponent =
		{
			article: FileText,
			video: VideoIcon,
			guide: BookOpen,
		}[type.toLowerCase()] || FileText

	return (
		<span
			className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 ${badgeStyles}`}
		>
			<IconComponent className="w-4 h-4" />
			{type}
		</span>
	)
}

export function ResourceCard({ resource, className = '' }: ResourceCardProps) {
	return (
		<div className={`rounded-2xl overflow-hidden bg-gray-50 ${className}`}>
			{/* Image Section */}
			<div className="relative h-48 w-full bg-gray-100">
				<Image
					src={resource.image || '/api/placeholder/400/320'}
					alt={resource.title}
					fill
					className="object-cover"
				/>
				<div className="absolute top-4 right-4">
					<ResourceTypeBadge type={resource.type} />
				</div>
			</div>
			{/* Content Section */}
			<div className="p-6">
				{/* Category */}
				<div className="text-sm text-gray-600 mb-2">{resource.category}</div>

				{/* Title */}
				<h3 className="text-2xl font-bold mb-3">{resource.title}</h3>

				{/* Description */}
				<p className="text-gray-600 mb-6">{resource.description}</p>

				{/* Bottom Section */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-6">
						{/* Duration */}
						<div className="flex items-center text-gray-600">
							<Clock className="w-4 h-4 mr-2" />
							<span className="text-sm">
								{resource.duration}{' '}
								{resource.type === 'video' ? 'watch' : 'read'}
							</span>
						</div>

						{/* Engagement Stats */}
						<div className="flex items-center space-x-4">
							<div className="flex items-center text-gray-600">
								<ThumbsUp className="w-4 h-4 mr-2" />
								<span className="text-sm">{resource.engagement.likes}</span>
							</div>
							<div className="flex items-center text-gray-600">
								<MessageSquare className="w-4 h-4 mr-2" />
								<span className="text-sm">{resource.engagement.comments}</span>
							</div>
						</div>
					</div>

					<div className="flex items-center">
						{/* Level Badge */}
						<span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
							{resource.level}
						</span>
					</div>
				</div>

				{/* Start Learning Button */}
				<Link
					href={`/resources/${resource.id}`}
					className="inline-flex items-center mt-6 text-black hover:opacity-80"
					legacyBehavior
				>
					<span className="font-medium">Start Learning</span>
					{/* biome-ignore lint/a11y/noSvgWithoutTitle: any */}
					<svg
						className="w-4 h-4 ml-2"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M5 12H19M19 12L12 5M19 12L12 19"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</Link>
			</div>
		</div>
	)
}
