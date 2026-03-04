import { Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '~/lib/utils'
import type { NewsUpdate } from '~/lib/types/learning.types'
import { formatDate } from '~/lib/utils/date-utils'

const PLACEHOLDER_IMG = '/images/placeholder.png'

interface NewsCardProps {
	update: NewsUpdate
	className?: string
}

export function NewsCard({ update, className }: NewsCardProps) {
	const href = `/news/${update.slug}`
	const imageSrc = update.image || PLACEHOLDER_IMG
	const hasTags = Array.isArray(update.tags) && update.tags.length > 0

	return (
		<Link
			href={href}
			className={cn('block group', className)}
			aria-label={`Read article: ${update.title}`}
		>
			<article className="rounded-xl border border-gray-200 bg-white text-card-foreground shadow-sm transition-all duration-300 h-full overflow-hidden hover:shadow-md hover:border-emerald-800/20 hover:-translate-y-0.5">
				{update.image ? (
					<div className="relative h-44 w-full overflow-hidden rounded-t-xl">
						<Image
							src={imageSrc}
							alt={update.title}
							fill
							className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
							sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
					</div>
				) : null}

				<div className="p-5">
					<div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
						<Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden />
						<time dateTime={update.date}>{formatDate(update.date)}</time>
					</div>

					<h3 className="text-lg font-semibold text-gray-900 mb-2 transition-colors group-hover:text-emerald-800">
						{update.title}
					</h3>

					<p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
						{update.description}
					</p>

					{hasTags ? (
						<ul className="flex gap-1.5 mt-3 flex-wrap list-none p-0 m-0">
							{update.tags.map((tag: string) => (
								<li
									key={tag}
									className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
								>
									{tag}
								</li>
							))}
						</ul>
					) : null}
				</div>
			</article>
		</Link>
	)
}
