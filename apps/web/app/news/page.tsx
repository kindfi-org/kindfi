import type { Metadata } from 'next'
import { EmptyNews } from '~/components/sections/news/empty-news'
import { NewsArticlesSection } from '~/components/sections/news/news-articles-section'
import { NewsCategoryNav } from '~/components/sections/news/news-category-nav'
import { NewsFeatured } from '~/components/sections/news/news-featured'
import { NewsHero } from '~/components/sections/news/news-hero'
import { JsonLd } from '~/components/shared/json-ld'
import { SectionContainer } from '~/components/shared/section-container'
import { readAllPosts } from '~/lib/mdx'
import { getBreadcrumbSchema } from '~/lib/seo/structured-data'
import { mapPostToNewsUpdate } from '~/lib/utils/news'

export const revalidate = 3600

export const metadata: Metadata = {
	title: 'News | KindFi',
	description:
		'Product updates, impact stories, and milestones from KindFi—transparent crowdfunding on Stellar.',
	openGraph: {
		title: 'News | KindFi',
		description:
			'Product updates, impact stories, and milestones from KindFi—transparent crowdfunding on Stellar.',
		type: 'website',
		url: '/news',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'News | KindFi',
		description:
			'Product updates, impact stories, and milestones from KindFi—transparent crowdfunding on Stellar.',
	},
	alternates: {
		canonical: '/news',
	},
}

export default async function NewsIndexPage() {
	const posts = readAllPosts().sort((a, b) => (a.date < b.date ? 1 : -1))
	const [hero, ...rest] = posts

	const categoryLinks = Array.from(
		new Set(posts.map((p) => p.category).filter((c): c is string => Boolean(c?.trim()))),
	).sort((a, b) => a.localeCompare(b))

	const latestDate = posts[0]?.date
	const restUpdates = rest.map((post, index) => mapPostToNewsUpdate(post, index + 1))

	return (
		<>
			<JsonLd
				data={getBreadcrumbSchema([
					{ name: 'Home', url: '/' },
					{ name: 'News', url: '/news' },
				])}
			/>
			<main className="flex min-h-screen w-full flex-col bg-white" aria-label="News and updates">
				<NewsHero
					articleCount={posts.length}
					categoryCount={categoryLinks.length}
					latestDate={latestDate}
				/>

				<section className="bg-white py-10 sm:py-14 lg:py-16">
					<SectionContainer maxWidth="6xl">
						<NewsCategoryNav categories={categoryLinks} />
						{hero ? <NewsFeatured post={hero} /> : null}
						{rest.length > 0 ? <NewsArticlesSection articles={restUpdates} /> : null}
						{!hero && rest.length === 0 ? <EmptyNews /> : null}
					</SectionContainer>
				</section>
			</main>
		</>
	)
}
