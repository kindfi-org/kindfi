import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '~/components/base/accordion'
import { ScrollArea } from '~/components/base/scroll-area'
import { NewsCard } from '~/components/cards/news-card'
import { SectionContainer } from '~/components/shared/section-container'
import { readAllPosts } from '~/lib/mdx'
import { mapPostToNewsUpdate } from '~/lib/utils/news'

export const revalidate = 3600

export const metadata: Metadata = {
	title: 'News | KindFi',
	description:
		'Latest KindFi news, product updates, and stories on transparent crowdfunding, blockchain, and social impact.',
}

export default async function NewsIndexPage() {
	const posts = readAllPosts().sort((a, b) => (a.date < b.date ? 1 : -1))
	const [hero, ...rest] = posts
	const sidebar = rest.slice(0, 7)

	const postsByCategory = rest.reduce<Record<string, typeof rest>>((acc, p) => {
		const key = p.category ?? 'general'
		if (!acc[key]) acc[key] = []
		acc[key].push(p)
		return acc
	}, {})

	return (
		<main
			className="min-h-screen bg-neutral-50/50 py-8 sm:py-12 lg:py-16"
			aria-label="News and updates"
		>
			<SectionContainer maxWidth="7xl">
				<header className="mb-10 sm:mb-14">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 mb-2">
						Updates &amp; stories
					</p>
					<h1
						id="news-page-title"
						className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl"
					>
						News
					</h1>
					<p className="mt-2 text-muted-foreground max-w-xl">
						Product updates, impact stories, and insights from KindFi.
					</p>
				</header>

				{/* Hero featured */}
				{hero ? (
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-14 sm:mb-16">
						<Link
							href={`/news/${hero.slug}`}
							className="group block lg:col-span-8 rounded-2xl overflow-hidden bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2"
							aria-label={`Read: ${hero.title}`}
						>
							<div className="relative aspect-[16/10] sm:aspect-[2/1]">
								{hero.image ? (
									<Image
										src={hero.image}
										alt={hero.title}
										fill
										className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
										priority
										sizes="(max-width: 1024px) 100vw, 66vw"
									/>
								) : (
									<div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
								)}
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
								<div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
									<p className="text-xs font-medium uppercase tracking-wider text-emerald-300 mb-2">
										Latest
									</p>
									<h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl group-hover:text-emerald-200 transition-colors">
										{hero.title}
									</h2>
									<p className="mt-2 text-gray-300 text-sm sm:text-base line-clamp-2 max-w-2xl">
										{hero.description}
									</p>
									<span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-300 group-hover:text-emerald-200 transition-colors">
										Read article
										<span aria-hidden>→</span>
									</span>
								</div>
							</div>
						</Link>

						<aside className="lg:col-span-4">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
								More news
							</h2>
							<ScrollArea className="h-[22rem] sm:h-[28rem] pr-2">
								<nav aria-label="Recent news" className="flex flex-col gap-0">
									{sidebar.map((p) => (
										<Link
											key={p.slug}
											href={`/news/${p.slug}`}
											className="group flex gap-4 py-4 border-b border-gray-200 last:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 rounded px-1 -mx-1 hover:bg-white/80 transition-colors"
										>
											<span className="font-medium text-gray-900 group-hover:text-emerald-800 transition-colors line-clamp-2 flex-1 min-w-0">
												{p.title}
											</span>
											<span className="text-muted-foreground text-sm shrink-0 group-hover:text-emerald-700 transition-colors">
												→
											</span>
										</Link>
									))}
								</nav>
							</ScrollArea>
						</aside>
					</div>
				) : null}

				{/* Categories */}
				<div className="space-y-12 sm:space-y-16">
					{Object.entries(postsByCategory).map(([category, items]) => {
						const rows: (typeof items)[] = []
						for (let i = 0; i < items.length; i += 3)
							rows.push(items.slice(i, i + 3))
						const firstRow = rows[0] ?? []
						const remaining = rows.slice(1)
						const sectionId = `news-category-${category}`

						return (
							<section
								key={category}
								className="space-y-6"
								aria-labelledby={sectionId}
							>
								<h2
									id={sectionId}
									className="text-xl font-semibold tracking-tight text-gray-900 capitalize border-l-4 border-emerald-800 pl-4"
								>
									{category}
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
									{firstRow.map((post) => (
										<NewsCard
											key={post.slug}
											update={mapPostToNewsUpdate(post)}
										/>
									))}
								</div>

								{remaining.length > 0 ? (
									<Accordion type="single" collapsible className="mt-6">
										{remaining.map((row) => (
											<AccordionItem
												key={`${category}-${row.map((p) => p.slug).join('-')}`}
												value={`${category}-${row.map((p) => p.slug).join('-')}`}
											>
												<AccordionTrigger className="text-emerald-800 hover:text-emerald-900 font-medium py-4">
													Show more in {category}
												</AccordionTrigger>
												<AccordionContent>
													<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-2 pb-4">
														{row.map((post) => (
															<NewsCard
																key={post.slug}
																update={mapPostToNewsUpdate(post)}
															/>
														))}
													</div>
												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>
								) : null}
							</section>
						)
					})}
				</div>
			</SectionContainer>
		</main>
	)
}
