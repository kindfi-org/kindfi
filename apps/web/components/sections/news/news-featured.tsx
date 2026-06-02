'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useI18n } from '~/lib/i18n'
import type { MdxPost } from '~/lib/mdx'
import { formatNewsCategoryLabel } from '~/lib/utils/news'

interface NewsFeaturedProps {
	post: MdxPost
}

export function NewsFeatured({ post }: NewsFeaturedProps) {
	const { t } = useI18n()

	return (
		<div className="mb-12 sm:mb-16">
			<Link
				href={`/news/${post.slug}`}
				className="group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-emerald-200/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				aria-label={`${t('news.readArticle')}: ${post.title}`}
			>
				<div className="relative aspect-[16/10] sm:aspect-[2/1]">
					{post.image ? (
						<Image
							src={post.image}
							alt={post.title}
							fill
							className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
							priority
							sizes="(max-width: 1024px) 100vw, 72rem"
						/>
					) : (
						<div
							className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50"
							aria-hidden
						/>
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
					<div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
						<p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
							{post.category ? formatNewsCategoryLabel(post.category) : t('news.featuredLatest')}
						</p>
						<h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
							{post.title}
						</h2>
						<p className="mt-2 line-clamp-2 max-w-3xl text-sm text-white/85 sm:text-base">
							{post.description}
						</p>
						<span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-300 transition-colors group-hover:text-white">
							{t('news.readArticle')}
							<span aria-hidden>→</span>
						</span>
					</div>
				</div>
			</Link>
		</div>
	)
}
