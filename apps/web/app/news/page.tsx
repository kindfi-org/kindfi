import Image from 'next/image'
import Link from 'next/link'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '~/components/base/accordion'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { ScrollArea } from '~/components/base/scroll-area'
import { NewsCard } from '~/components/cards/news-card'
import { readAllPosts } from '~/lib/mdx'

export const revalidate = 3600

export default async function NewsIndexPage() {
	const posts = readAllPosts().sort((a, b) => (a.date < b.date ? 1 : -1))
	const [hero, ...rest] = posts
	const sidebar = rest.slice(0, 7)

	const postsByCategory = rest.reduce<Record<string, typeof rest>>((acc, p) => {
		const key = p.category || 'general'
		if (!acc[key]) acc[key] = []
		acc[key].push(p)
		return acc
	}, {})

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-3xl font-bold mb-6">News</h1>

			{/* Hero + Sidebar */}
			{hero && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
					{/* Hero */}
					<Card className="lg:col-span-2 overflow-hidden">
						{hero.image && (
							<div className="relative w-full h-80">
								<Image
									src={hero.image}
									alt={hero.title}
									fill
									className="object-cover"
								/>
							</div>
						)}
						<CardHeader>
							<CardTitle className="text-3xl">{hero.title}</CardTitle>
							<CardDescription>{hero.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<Link
								href={`/news/${hero.slug}`}
								className="text-primary underline underline-offset-4"
							>
								Read more →
							</Link>
						</CardContent>
					</Card>

					{/* Sidebar */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">More News</CardTitle>
							<CardDescription>Latest updates</CardDescription>
						</CardHeader>
						<CardContent>
							<ScrollArea className="h-[28rem] pr-2">
								<div className="flex flex-col gap-4">
									{sidebar.map((p) => (
										<Link
											key={p.slug}
											href={`/news/${p.slug}`}
											className="group block"
										>
											<div className="font-medium group-hover:text-primary transition-colors">
												{p.title}
											</div>
											<div className="text-sm text-muted-foreground line-clamp-2">
												{p.description}
											</div>
										</Link>
									))}
								</div>
							</ScrollArea>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Categories Grid */}
			<div className="space-y-10">
				{Object.entries(postsByCategory).map(([category, items]) => {
					const rows: (typeof items)[] = []
					for (let i = 0; i < items.length; i += 3)
						rows.push(items.slice(i, i + 3))
					const firstRow = rows[0] ?? []
					const remaining = rows.slice(1)

					return (
						<section key={category} className="space-y-4">
							<h2 className="text-2xl font-semibold capitalize">{category}</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{firstRow.map((post) => (
									<NewsCard
										key={post.slug}
										update={{
											id: 0,
											slug: post.slug,
											title: post.title,
											description: post.description,
											image: post.image || '/images/placeholder.png',
											date: post.date,
											category: post.category || 'news',
											tags: post.tags || [],
										}}
									/>
								))}
							</div>

							{remaining.length > 0 && (
								<Accordion type="single" collapsible>
									{remaining.map((row, idx) => (
										<AccordionItem key={idx} value={`row-${idx}`}>
											<AccordionTrigger>Show more</AccordionTrigger>
											<AccordionContent>
												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
													{row.map((post) => (
														<NewsCard
															key={post.slug}
															update={{
																id: 0,
																slug: post.slug,
																title: post.title,
																description: post.description,
																image: post.image || '/images/placeholder.png',
																date: post.date,
																category: post.category || 'news',
																tags: post.tags || [],
															}}
														/>
													))}
												</div>
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							)}
						</section>
					)
				})}
			</div>
		</div>
	)
}
