'use client'

import { SearchX, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'

interface EmptyStateProps {
	selectedCategories: string[]
	onClearFilters: () => void
}

export function EmptyProject({
	selectedCategories,
	onClearFilters,
}: EmptyStateProps) {
	const { t } = useI18n()
	const hasFilters = selectedCategories.length > 0

	return (
		<section
			className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-[#fafbfc] px-6 py-16 text-center"
			aria-labelledby="empty-projects-heading"
		>
			<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
				<SearchX className="h-8 w-8" aria-hidden="true" />
			</div>

			<h2
				id="empty-projects-heading"
				className="text-xl font-semibold tracking-tight text-slate-900"
			>
				{t('projects.noProjects')}
			</h2>

			<p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
				{hasFilters
					? t('projects.emptyFilteredDescription')
					: t('projects.emptyDescription')}
			</p>

			<div className="mt-8 flex flex-col gap-3 sm:flex-row">
				{hasFilters ? (
					<Button
						onClick={onClearFilters}
						variant="outline"
						className="rounded-full border-slate-200 bg-white"
					>
						{t('projects.clearCategories')}
					</Button>
				) : null}
				<Button asChild className="gradient-btn rounded-full text-white">
					<Link href="/create-project">
						<Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
						{t('projects.createNew')}
					</Link>
				</Button>
			</div>
		</section>
	)
}
