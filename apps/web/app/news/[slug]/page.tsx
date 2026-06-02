import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { mdxComponents } from '~/components/mdx-components'
import { NewsArticleIntro } from '~/components/sections/news/news-article-intro'
import { NewsRelated } from '~/components/sections/news/news-related'
import { JsonLd } from '~/components/shared/json-ld'
import { SectionContainer } from '~/components/shared/section-container'
import { ShareButtons } from '~/components/shared/share-buttons'
import { type MdxFrontmatter, readAllPosts, readRawPostBySlug } from '~/lib/mdx'
import { getBreadcrumbSchema } from '~/lib/seo/structured-data'
import { formatNewsCategoryLabel } from '~/lib/utils/news'

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
		title: `${fm.title} | KindFi News`,
		description: fm.description,
		openGraph: {
			title: fm.title,
			description: fm.description,
			images: fm.image ? [fm.image] : [`/news/opengraph-image?slug=${slug}`],
			type: 'article',
			url: `/news/${slug}`,
		},
		alternates: {
			canonical: `/news/${slug}`,
		},
	}
}

export default async function NewsPostPage({ params }: PageProps) {
	const { slug } = await params
	const raw = readRawPostBySlug(slug)
	if (!raw) return notFound()
	const fm = raw.frontmatter

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
		<>
			<JsonLd
				data={getBreadcrumbSchema([
					{ name: 'Home', url: '/' },
					{ name: 'News', url: '/news' },
					{ name: fm.title, url: `/news/${slug}` },
				])}
			/>
			<main className="min-h-screen bg-white" aria-label="News article">
				<section className="relative isolate overflow-hidden border-b border-slate-200/60 bg-[#fafbfc] py-10 sm:py-14 lg:py-16">
					<div className="pointer-events-none absolute inset-0">
						<div className="absolute inset-0 bg-grid-slate-100/60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_72%)]" />
						<div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
					</div>
					<SectionContainer maxWidth="4xl" className="relative">
						<NewsArticleIntro
							title={fm.title}
							description={fm.description}
							date={fm.date}
							category={fm.category}
						/>
						<div className="mx-auto mt-8 max-w-3xl">
							<ShareButtons url={articleUrl} title={fm.title} description={fm.description} />
						</div>
					</SectionContainer>
				</section>

				<SectionContainer maxWidth="4xl" className="py-10 sm:py-14 lg:py-16">
					<article className="mx-auto max-w-3xl">
						{fm.image ? (
							<div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl border border-slate-200/80 md:h-80">
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

						<div className="prose prose-neutral max-w-none prose-headings:text-slate-900 prose-a:text-emerald-800">
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
							<div className="mt-10 flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-8">
								{fm.category ? (
									<Link
										href={`/news/category/${encodeURIComponent(fm.category)}`}
										className="rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									>
										{formatNewsCategoryLabel(fm.category)}
									</Link>
								) : null}
								{fm.tags?.map((tag) => (
									<Link
										key={tag}
										href={`/news/tag/${encodeURIComponent(tag)}`}
										className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-200/80 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									>
										#{tag}
									</Link>
								))}
							</div>
						) : null}
					</article>
				</SectionContainer>

				<NewsRelated posts={relatedPosts} />
			</main>
		</>
	)
}
