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
import { ShareButtons } from '~/components/shared/share-buttons'
import { type MdxFrontmatter, readRawPostBySlug } from '~/lib/mdx'

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

	return (
		<div className="container mx-auto py-10">
			<article className="mx-auto max-w-3xl">
				{fm.image && (
					<div className="relative w-full h-64 md:h-80 mb-6 rounded-lg overflow-hidden">
						<Image
							src={fm.image}
							alt={fm.title}
							fill
							className="object-cover"
						/>
					</div>
				)}
				<h1 className="text-4xl font-bold mb-2">{fm.title}</h1>
				<p className="text-muted-foreground mb-6">{fm.description}</p>
				<div className="mb-8">
					<Link
						href="/news"
						className="text-primary underline underline-offset-4"
					>
						← Back to News
					</Link>
				</div>

				<div className="mb-8">
					<ShareButtons
						url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/news/${slug}`}
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
				{(fm.tags?.length || fm.category) && (
					<div className="mt-10 flex flex-wrap items-center gap-2">
						{fm.category && (
							<Link
								href={`/news/category/${encodeURIComponent(fm.category)}`}
								className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs"
							>
								{fm.category}
							</Link>
						)}
						{fm.tags?.map((tag) => (
							<Link
								key={tag}
								href={`/news/tag/${encodeURIComponent(tag)}`}
								className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs"
							>
								#{tag}
							</Link>
						))}
					</div>
				)}
			</article>

			{/* Suggested posts */}
			<Card className="mt-12">
				<CardHeader>
					<CardTitle>More like this</CardTitle>
					<CardDescription>Explore related articles</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{(
							await (async () => {
								const { readAllPosts } = await import('~/lib/mdx')
								return readAllPosts()
									.filter(
										(p) =>
											p.slug !== slug &&
											(p.category === fm.category ||
												p.tags?.some((t) => fm.tags?.includes(t))),
									)
									.slice(0, 3)
							})()
						).map((post) => (
							<Link
								key={post.slug}
								href={`/news/${post.slug}`}
								className="group"
							>
								<div className="font-medium group-hover:text-primary transition-colors">
									{post.title}
								</div>
								<div className="text-sm text-muted-foreground line-clamp-2">
									{post.description}
								</div>
							</Link>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
