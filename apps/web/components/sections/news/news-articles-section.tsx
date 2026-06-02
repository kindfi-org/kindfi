'use client'

import { NewsCard } from '~/components/cards/news-card'
import { useI18n } from '~/lib/i18n'
import type { NewsUpdate } from '~/lib/types/learning.types'

interface NewsArticlesSectionProps {
	articles: NewsUpdate[]
}

export function NewsArticlesSection({ articles }: NewsArticlesSectionProps) {
	const { t } = useI18n()

	if (articles.length === 0) return null

	const countLabel =
		articles.length === 1
			? t('news.articlesCountOne').replace('{count}', String(articles.length))
			: t('news.articlesCountMany').replace('{count}', String(articles.length))

	return (
		<section aria-labelledby="news-all-heading">
			<h2
				id="news-all-heading"
				className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
			>
				{t('news.allArticles')}
			</h2>
			<p className="mt-1 text-sm text-muted-foreground sm:text-base">{countLabel}</p>
			<ul className="mt-8 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
				{articles.map((update) => (
					<li key={update.slug} className="min-w-0">
						<NewsCard update={update} showCategory />
					</li>
				))}
			</ul>
		</section>
	)
}
