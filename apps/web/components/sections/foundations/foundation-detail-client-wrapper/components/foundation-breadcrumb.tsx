'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '~/lib/i18n'

export function FoundationBreadcrumb() {
	const { t } = useI18n()

	return (
		<nav aria-label="Breadcrumb">
			<Link
				href="/foundations"
				className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
				{t('foundations.allFoundations')}
			</Link>
		</nav>
	)
}
