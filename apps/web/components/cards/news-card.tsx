import { Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { NewsUpdate } from '~/lib/types/learning.types'
import { cn } from '~/lib/utils'
import { formatDate } from '~/lib/utils/date-utils'
import { formatNewsCategoryLabel } from '~/lib/utils/news'

interface NewsCardProps {
	update: NewsUpdate
	className?: string
	/** When true, show category chip above the title (index / hub views). */
	showCategory?: boolean
}

export function NewsCard({ update, className, showCategory = false }: NewsCardProps) {
	const href = `/news/${update.slug}`
	const hasTags = Array.isArray(update.tags) && update.tags.length > 0
	const showImage = Boolean(update.image)

	return (
		<Link
			href={href}
			className={cn('group block h-full', className)}
			aria-label={`Read article: ${update.title}`}
		>
			<article
				className={cn(
					'flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-card-foreground shadow-sm transition-all duration-300',
					'hover:-translate-y-0.5 hover:border-emerald-200/60 hover:shadow-md',
				)}
			>
				{showImage ? (
					<div className="relative h-44 w-full shrink-0 overflow-hidden">
						<Image
							src={update.image as string}
							alt=""
							fill
							className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
							sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
						/>
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
					</div>
				) : (
					<div className="h-1 shrink-0 bg-emerald-500/80" aria-hidden />
				)}

				<div className="flex flex-1 flex-col p-5">
					<div className="mb-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
						<span className="inline-flex items-center gap-1.5">
							<Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
							<time dateTime={update.date}>{formatDate(update.date)}</time>
						</span>
						{showCategory && update.category ? (
							<>
								<span className="text-border" aria-hidden>
									·
								</span>
								<span className="font-medium normal-case text-emerald-700">
									{formatNewsCategoryLabel(update.category)}
								</span>
							</>
						) : null}
					</div>

					<h3 className="mb-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-emerald-800">
						{update.title}
					</h3>

					<p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
						{update.description}
					</p>

					{hasTags ? (
						<ul className="mt-3 flex list-none flex-wrap gap-1.5 p-0">
							{update.tags.slice(0, 4).map((tag: string) => (
								<li
									key={tag}
									className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
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
