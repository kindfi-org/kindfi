'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '~/lib/i18n'

interface NewsSubpageHeaderProps {
	id: string
	title: React.ReactNode
	subtitle: string
}

export function NewsSubpageHeader({ id, title, subtitle }: NewsSubpageHeaderProps) {
	const { t } = useI18n()

	return (
		<>
			<Link
				href="/news"
				className="mb-8 inline-flex items-center gap-1 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
				{t('news.allNews')}
			</Link>

			<header className="mb-10 border-b border-slate-200/60 pb-8 sm:mb-12 sm:pb-10">
				<h1
					id={id}
					className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
				>
					{title}
				</h1>
				<p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>
			</header>
		</>
	)
}
