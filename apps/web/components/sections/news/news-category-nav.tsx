'use client'

import Link from 'next/link'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'
import { formatNewsCategoryLabel } from '~/lib/utils/news'

interface NewsCategoryNavProps {
	categories: string[]
	className?: string
}

export function NewsCategoryNav({ categories, className }: NewsCategoryNavProps) {
	const { t } = useI18n()

	if (categories.length === 0) return null

	return (
		<nav
			className={cn('mb-10 flex flex-wrap gap-2 sm:mb-12', className)}
			aria-label={t('news.browseCategories')}
		>
			{categories.map((cat) => (
				<Link
					key={cat}
					href={`/news/category/${encodeURIComponent(cat)}`}
					className="rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-200/80 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					{formatNewsCategoryLabel(cat)}
				</Link>
			))}
		</nav>
	)
}
