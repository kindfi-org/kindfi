'use client'

import { NewsCard } from '~/components/cards/news-card'
import { NewsSubpageHeader } from '~/components/sections/news/news-subpage-header'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'
import type { NewsUpdate } from '~/lib/types/learning.types'

interface NewsSubpageShellProps {
	headingId: string
	title: React.ReactNode
	articles: NewsUpdate[]
	showCategory?: boolean
	variant: 'category' | 'tag'
}

export function NewsSubpageShell({
	headingId,
	title,
	articles,
	showCategory = true,
	variant,
}: NewsSubpageShellProps) {
	const { t } = useI18n()

	const subtitleKey =
		articles.length === 1
			? variant === 'category'
				? 'news.categoryArticlesOne'
				: 'news.tagArticlesOne'
			: variant === 'category'
				? 'news.categoryArticlesMany'
				: 'news.tagArticlesMany'
	const subtitle = t(subtitleKey).replace('{count}', String(articles.length))

	return (
		<main className="min-h-screen bg-white" aria-labelledby={headingId}>
			<section className="relative isolate overflow-hidden bg-[#fafbfc] pt-10 pb-12 sm:pt-12 sm:pb-14">
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute inset-0 bg-grid-slate-100/60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_72%)]" />
				</div>
				<SectionContainer maxWidth="6xl" className="relative">
					<NewsSubpageHeader id={headingId} title={title} subtitle={subtitle} />
				</SectionContainer>
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-white" />
			</section>

			<section className="bg-white py-10 sm:py-14 lg:py-16" aria-labelledby={headingId}>
				<SectionContainer maxWidth="6xl">
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
						{articles.map((update) => (
							<NewsCard key={update.slug} update={update} showCategory={showCategory} />
						))}
					</div>
				</SectionContainer>
			</section>
		</main>
	)
}
