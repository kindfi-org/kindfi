import { Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { NewsUpdate } from '~/lib/types/learning.types'
import { formatDate } from '~/lib/utils/date-utils'

interface NewsCardProps {
	update: NewsUpdate
	className?: string
}

export function NewsCard({ update, className = '' }: NewsCardProps) {
	return (
		<Link href={`/news/${update.slug}`} className={`block group ${className}`}>
			<article className="rounded-xl border-0 bg-white/80 backdrop-blur-sm text-card-foreground shadow-xl hover:shadow-green-200/50 hover:shadow-2xl transition-all duration-300 h-full overflow-hidden">
				<div className="h-2 bg-gradient-to-r from-green-500 to-blue-700" />
				{/* Image Container */}
				{update.image && (
					<div className="relative h-48 w-full overflow-hidden">
						<Image
							src={update.image || '/images/placeholder.png'}
							alt={update.title}
							fill
							className="object-cover group-hover:scale-105 transition-transform duration-300"
						/>
					</div>
				)}

				{/* Content Container */}
				<div className="p-6">
					{/* Date */}
					<div className="flex items-center gap-2 text-muted-foreground mb-3">
						<Calendar className="w-4 h-4" />
						<time dateTime={update.date}>{formatDate(update.date)}</time>
					</div>

					{/* Title */}
					<h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
						{update.title}
					</h3>

					{/* Description */}
					<p className="text-muted-foreground line-clamp-3">
						{update.description}
					</p>

					{/* Tags */}
					{update.tags && update.tags.length > 0 && (
						<div className="flex gap-2 mt-4 flex-wrap">
							{update.tags.map((tag: string) => (
								<span
									key={tag}
									className="text-xs px-2.5 py-1 bg-muted text-muted-foreground rounded-full"
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>
			</article>
		</Link>
	)
}
