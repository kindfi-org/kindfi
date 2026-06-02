'use client'

import { NewsCard } from '~/components/cards/news-card'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'
import type { MdxPost } from '~/lib/mdx'
import { mapPostToNewsUpdate } from '~/lib/utils/news'

interface NewsRelatedProps {
	posts: MdxPost[]
}

export function NewsRelated({ posts }: NewsRelatedProps) {
	const { t } = useI18n()

	if (posts.length === 0) return null

	return (
		<section
			className="border-t border-slate-200/60 bg-[#fafbfc] py-14 sm:py-16 lg:py-20"
			aria-labelledby="news-related-heading"
		>
			<SectionContainer maxWidth="6xl">
				<div className="mb-8 text-center sm:mb-10">
					<h2
						id="news-related-heading"
						className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
					>
						{t('news.relatedTitle')}
					</h2>
					<p className="mt-2 text-muted-foreground">{t('news.relatedSubtitle')}</p>
				</div>
				<ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
					{posts.map((post, index) => (
						<li key={post.slug} className="min-w-0">
							<NewsCard update={mapPostToNewsUpdate(post, index)} showCategory />
						</li>
					))}
				</ul>
			</SectionContainer>
		</section>
	)
}
