'use client'

import { Newspaper } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'

export function EmptyNews() {
	const { t } = useI18n()

	return (
		<section
			className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-[#fafbfc] px-6 py-16 text-center"
			aria-labelledby="empty-news-heading"
		>
			<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
				<Newspaper className="h-8 w-8" aria-hidden="true" />
			</div>

			<h2 id="empty-news-heading" className="text-xl font-semibold tracking-tight text-slate-900">
				{t('news.noArticles')}
			</h2>

			<p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
				{t('news.emptyDescription')}
			</p>

			<Button asChild className="gradient-btn mt-8 rounded-full text-white">
				<Link href="/projects">{t('news.exploreProjects')}</Link>
			</Button>
		</section>
	)
}
