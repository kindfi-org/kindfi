'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'
import { formatDate } from '~/lib/utils/date-utils'
import { formatNewsCategoryLabel } from '~/lib/utils/news'

interface NewsArticleIntroProps {
	title: string
	description: string
	date: string
	category?: string
	className?: string
}

export function NewsArticleIntro({
	title,
	description,
	date,
	category,
	className,
}: NewsArticleIntroProps) {
	const { t } = useI18n()

	return (
		<div className={cn('mx-auto max-w-3xl', className)}>
			<nav aria-label="Breadcrumb" className="mb-6">
				<ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
					<li>
						<Link
							href="/news"
							className="inline-flex items-center gap-1 font-medium transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
						>
							<ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
							{t('news.articleBreadcrumb')}
						</Link>
					</li>
					{category ? (
						<>
							<li aria-hidden className="text-slate-300">
								/
							</li>
							<li>
								<Link
									href={`/news/category/${encodeURIComponent(category)}`}
									className="font-medium transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
								>
									{formatNewsCategoryLabel(category)}
								</Link>
							</li>
						</>
					) : null}
				</ol>
			</nav>

			<div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
				<time dateTime={date}>{formatDate(date)}</time>
				{category ? (
					<>
						<span className="text-slate-300" aria-hidden>
							·
						</span>
						<span className="normal-case tracking-normal text-emerald-700">
							{formatNewsCategoryLabel(category)}
						</span>
					</>
				) : null}
			</div>

			<h1 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
				{title}
			</h1>
			<p className="mt-4 text-lg leading-relaxed text-muted-foreground">{description}</p>
		</div>
	)
}
