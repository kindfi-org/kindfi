'use client'

import { Compass, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'

interface MatchingEmptyStateProps {
	onRetry: () => void
}

export const MatchingEmptyState = ({ onRetry }: MatchingEmptyStateProps) => {
	const { t } = useI18n()

	return (
		<div className="flex flex-col items-center px-4 py-8 text-center sm:px-6 sm:py-10">
			<div className="relative mb-5">
				<div className="absolute inset-0 scale-150 rounded-full bg-gradient-to-br from-emerald-200/40 via-teal-100/30 to-indigo-100/20 blur-2xl" />
				<div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm">
					<Compass className="h-8 w-8 text-emerald-600" aria-hidden="true" />
				</div>
			</div>

			<div className="max-w-md space-y-2">
				<h4 className="text-base font-semibold text-foreground">
					{t('profile.matchingEmptyTitle')}
				</h4>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{t('profile.matchingEmptyDescription')}
				</p>
			</div>

			<div className="mt-6 flex flex-wrap items-center justify-center gap-2">
				<Button
					asChild
					className="rounded-full bg-emerald-500 px-5 text-white hover:bg-emerald-600"
				>
					<Link href="/projects">{t('profile.matchingBrowseProjects')}</Link>
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onRetry}
					className="rounded-full"
				>
					<RefreshCw className="mr-2 h-3.5 w-3.5" />
					{t('profile.matchingRetry')}
				</Button>
			</div>
		</div>
	)
}
