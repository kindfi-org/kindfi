import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { mdxComponents } from '~/components/mdx-components'
import { SectionContainer } from '~/components/shared/section-container'
import { ShareButtons } from '~/components/shared/share-buttons'
import { type MdxFrontmatter, readAllPosts, readRawPostBySlug } from '~/lib/mdx'

export const revalidate = 3600

interface PageProps {
	params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
	const { listPostSlugs } = await import('~/lib/mdx')
	return (listPostSlugs() || []).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params
	const raw = readRawPostBySlug(slug)
	if (!raw) return {}
	const fm: MdxFrontmatter = raw.frontmatter
	return {
		title: fm.title,
		description: fm.description,
		openGraph: {
			title: fm.title,
			description: fm.description,
			images: fm.image ? [fm.image] : [`/news/opengraph-image?slug=${slug}`],
			type: 'article',
		},
	}
}

export default async function NewsPostPage({ params }: PageProps) {
	const { slug } = await params
	const raw = readRawPostBySlug(slug)
	if (!raw) return notFound()
	const fm = raw.frontmatter

	// Single read for related posts (async-parallel: avoid waterfall)
	const allPosts = readAllPosts()
	const relatedPosts = allPosts
		.filter(
			(p) =>
				p.slug !== slug &&
				(p.category === fm.category ||
					(fm.tags?.length && p.tags?.some((t) => fm.tags?.includes(t)))),
		)
		.slice(0, 3)

	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
	const articleUrl = `${baseUrl}/news/${slug}`

	return (
		<main className="min-h-screen py-10 sm:py-14 lg:py-16" aria-label="News article">
			<SectionContainer maxWidth="4xl">
				<article className="mx-auto max-w-3xl">
					{fm.image ? (
						<div className="relative w-full h-64 md:h-80 mb-6 rounded-2xl overflow-hidden">
							<Image
								src={fm.image}
								alt={fm.title}
								fill
								className="object-cover"
								priority
								sizes="(max-width: 768px) 100vw, 768px"
							/>
						</div>
					) : null}
					<h1 className="text-3xl font-bold tracking-tight mb-2 sm:text-4xl">
						{fm.title}
					</h1>
					<p className="text-muted-foreground text-lg mb-6">{fm.description}</p>
					<div className="mb-8">
						<Link
							href="/news"
							className="text-emerald-800 font-medium underline underline-offset-4 hover:text-emerald-900 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 rounded"
							aria-label="Back to News"
						>
							← Back to News
						</Link>
					</div>

					<div className="mb-8">
						<ShareButtons
							url={articleUrl}
							title={fm.title}
							description={fm.description}
						/>
					</div>
					<div className="prose prose-neutral dark:prose-invert max-w-none">
						<MDXRemote
							source={raw.body}
							components={mdxComponents as never}
							options={{
								mdxOptions: {
									remarkPlugins: [remarkGfm],
									rehypePlugins: [
										rehypeSlug,
										[rehypeAutolinkHeadings, { behavior: 'append' }],
										[rehypePrettyCode, { theme: 'github-dark' }],
									],
								},
							}}
						/>
					</div>
					{fm.tags?.length || fm.category ? (
						<div className="mt-10 flex flex-wrap items-center gap-2">
							{fm.category ? (
								<Link
									href={`/news/category/${encodeURIComponent(fm.category)}`}
									className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2"
								>
									{fm.category}
								</Link>
							) : null}
							{fm.tags?.map((tag) => (
								<Link
									key={tag}
									href={`/news/tag/${encodeURIComponent(tag)}`}
									className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2"
								>
									#{tag}
								</Link>
							))}
						</div>
					) : null}
				</article>

				{relatedPosts.length > 0 ? (
					<Card className="mt-12 rounded-2xl border border-gray-100 shadow-sm">
						<CardHeader className="px-6 sm:px-8">
							<CardTitle className="text-xl">More like this</CardTitle>
							<CardDescription className="text-muted-foreground">
								Explore related articles
							</CardDescription>
						</CardHeader>
						<CardContent className="px-6 sm:px-8 pb-6">
							<nav
								aria-label="Related articles"
								className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
							>
								{relatedPosts.map((post) => (
									<Link
										key={post.slug}
										href={`/news/${post.slug}`}
										className="group block rounded-lg p-3 -m-3 hover:bg-emerald-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2"
									>
										<span className="font-medium text-gray-900 group-hover:text-emerald-800 transition-colors">
											{post.title}
										</span>
										<p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
											{post.description}
										</p>
									</Link>
								))}
							</nav>
						</CardContent>
					</Card>
				) : null}
			</SectionContainer>
		</main>
	)
}
