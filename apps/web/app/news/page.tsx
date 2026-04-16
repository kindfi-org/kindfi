import { Rss } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { NewsCard } from '~/components/cards/news-card'
import { SectionContainer } from '~/components/shared/section-container'
import { readAllPosts } from '~/lib/mdx'
import { formatNewsCategoryLabel, mapPostToNewsUpdate } from '~/lib/utils/news'

export const revalidate = 3600

export const metadata: Metadata = {
	title: 'News | KindFi',
	description:
		'Product updates, impact stories, and milestones from KindFi—transparent crowdfunding on Stellar.',
}

export default async function NewsIndexPage() {
	const posts = readAllPosts().sort((a, b) => (a.date < b.date ? 1 : -1))
	const [hero, ...rest] = posts

	const categoryLinks = Array.from(
		new Set(
			posts
				.map((p) => p.category)
				.filter((c): c is string => Boolean(c?.trim())),
		),
	).sort((a, b) => a.localeCompare(b))

	return (
		<main className="min-h-screen bg-muted/30" aria-label="News and updates">
			<SectionContainer maxWidth="6xl" className="py-10 sm:py-14 lg:py-16">
				<header className="mb-10 flex flex-col gap-6 border-b border-border pb-10 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:pb-12">
					<div className="min-w-0">
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Updates &amp; stories
						</p>
						<h1
							id="news-page-title"
							className="mt-2 text-3xl font-bold tracking-tight gradient-text sm:text-4xl lg:text-5xl"
						>
							News
						</h1>
						<p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
							Product updates, field notes, and milestones from the KindFi
							team—same transparency standards we bring to crowdfunding.
						</p>
					</div>
					<Link
						href="/news/rss"
						className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:self-auto"
					>
						<Rss className="h-4 w-4 text-primary" aria-hidden />
						RSS feed
					</Link>
				</header>

				{categoryLinks.length > 0 ? (
					<nav
						className="mb-10 flex flex-wrap gap-2 sm:mb-12"
						aria-label="Browse by category"
					>
						{categoryLinks.map((cat) => (
							<Link
								key={cat}
								href={`/news/category/${encodeURIComponent(cat)}`}
								className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
							>
								{formatNewsCategoryLabel(cat)}
							</Link>
						))}
					</nav>
				) : null}

				{hero ? (
					<div className="mb-12 sm:mb-16">
						<Link
							href={`/news/${hero.slug}`}
							className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							aria-label={`Read: ${hero.title}`}
						>
							<div className="relative aspect-[16/10] sm:aspect-[2/1]">
								{hero.image ? (
									<Image
										src={hero.image}
										alt={hero.title}
										fill
										className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
										priority
										sizes="(max-width: 1024px) 100vw, 72rem"
									/>
								) : (
									<div
										className="absolute inset-0 bg-gradient-to-br from-muted to-muted/60"
										aria-hidden
									/>
								)}
								<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
								<div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
									{hero.category ? (
										<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
											{formatNewsCategoryLabel(hero.category)}
										</p>
									) : (
										<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
											Latest
										</p>
									)}
									<h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
										{hero.title}
									</h2>
									<p className="mt-2 line-clamp-2 max-w-3xl text-sm text-white/85 sm:text-base">
										{hero.description}
									</p>
									<span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:text-primary/90">
										Read article
										<span aria-hidden>→</span>
									</span>
								</div>
							</div>
						</Link>
					</div>
				) : null}

				{rest.length > 0 ? (
					<section aria-labelledby="news-all-heading">
						<h2
							id="news-all-heading"
							className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
						>
							All articles
						</h2>
						<p className="mt-1 text-sm text-muted-foreground sm:text-base">
							{rest.length} more {rest.length === 1 ? 'story' : 'stories'} on
							KindFi and our ecosystem.
						</p>
						<ul className="mt-8 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
							{rest.map((post, index) => (
								<li key={post.slug} className="min-w-0">
									<NewsCard
										update={mapPostToNewsUpdate(post, index)}
										showCategory
									/>
								</li>
							))}
						</ul>
					</section>
				) : null}

				{!hero && rest.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
						<p className="text-lg font-medium text-foreground">
							No articles published yet.
						</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Check back soon or explore active campaigns.
						</p>
						<Link
							href="/projects"
							className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
						>
							Explore projects
						</Link>
					</div>
				) : null}
			</SectionContainer>
		</main>
	)
}
