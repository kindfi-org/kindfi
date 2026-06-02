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
				className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
				{t('foundations.allFoundations')}
			</Link>
		</nav>
	)
}
