import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

export interface MdxFrontmatter {
	title: string
	description: string
	date: string
	updated?: string
	image?: string
	tags?: string[]
	author?: string
	category?: string
	slug: string
}

export interface MdxPost extends MdxFrontmatter {
	content: string
	words: number
	readingMinutes: number
}

const CONTENT_DIR = path.join(process.cwd(), 'content/news')

export function getNewsContentDir(): string {
	return CONTENT_DIR
}

export function listPostSlugs(): string[] {
	if (!fs.existsSync(CONTENT_DIR)) return []
	return fs
		.readdirSync(CONTENT_DIR)
		.filter((file) => file.endsWith('.mdx'))
		.map((file) => file.replace(/\.mdx$/, ''))
}

export function readRawPostBySlug(
	slug: string,
): { frontmatter: MdxFrontmatter; body: string } | null {
	const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
	if (!fs.existsSync(filePath)) return null
	const raw = fs.readFileSync(filePath, 'utf8')
	const { data, content } = matter(raw)
	const fm = {
		title: data.title as string,
		description: (data.description as string) || '',
		date: data.date as string,
		updated: data.updated as string | undefined,
		image: data.image as string | undefined,
		tags: (data.tags as string[]) || [],
		author: data.author as string | undefined,
		category: data.category as string | undefined,
		slug,
	}
	return { frontmatter: fm, body: content }
}

export function readAllPosts(): MdxPost[] {
	return listPostSlugs()
		.map((slug) => readRawPostBySlug(slug))
		.filter(
			(p): p is { frontmatter: MdxFrontmatter; body: string } => p !== null,
		)
		.map(({ frontmatter, body }) => {
			const words = body.trim().split(/\s+/).length
			const tpm = 200
			return {
				...frontmatter,
				content: body,
				words,
				readingMinutes: Math.max(1, Math.round(words / tpm)),
			}
		})
}

export async function compileMdx(source: string) {
	return serialize(source, {
		mdxOptions: {
			remarkPlugins: [remarkGfm],
			rehypePlugins: [
				rehypeSlug,
				[rehypeAutolinkHeadings, { behavior: 'append' }],
			],
		},
	})
}
