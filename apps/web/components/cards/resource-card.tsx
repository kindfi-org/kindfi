import { Clock, MessageSquare, ThumbsUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Resource } from '~/lib/types/learning.types'

interface ResourceCardProps {
	resource: Resource
	className?: string
}

export function ResourceCard({ resource, className = '' }: ResourceCardProps) {
	return (
		<Link href={`/resources/${resource.id}`}>
			<article
				className={`bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
			>
				<div className="relative h-48">
					<Image
						src={resource.image}
						alt={resource.title}
						fill
						className="object-cover"
					/>
					{resource.featured && (
						<span className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm">
							Featured
						</span>
					)}
				</div>
				<div className="p-6">
					<div className="flex items-center gap-2 mb-3">
						<span className="text-sm text-muted-foreground">
							{resource.category}
						</span>
						<span className="text-sm text-muted-foreground">•</span>
						<span className="text-sm text-muted-foreground">
							{resource.level}
						</span>
					</div>
					<h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
					<p className="text-muted-foreground mb-4">{resource.description}</p>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<Clock className="w-4 h-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">
								{resource.duration}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<ThumbsUp className="w-4 h-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">
								{resource.engagement.likes}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<MessageSquare className="w-4 h-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">
								{resource.engagement.comments}
							</span>
						</div>
					</div>
				</div>
			</article>
		</Link>
	)
}
