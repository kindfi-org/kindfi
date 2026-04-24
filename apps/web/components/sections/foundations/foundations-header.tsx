import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '~/components/base/button'
import {
	FOUNDATION_LIST_SORT_NAV,
	type FoundationListSortSlug,
} from '~/lib/queries/foundations/get-all-foundations'
import { cn } from '~/lib/utils'

interface FoundationsHeaderProps {
	activeSort: FoundationListSortSlug
}

export function FoundationsHeader({ activeSort }: FoundationsHeaderProps) {
	return (
		<header className="mb-10 border-b border-border pb-10 sm:mb-12 sm:pb-12">
			<div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
				<div className="min-w-0 max-w-3xl">
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Directory
					</p>
					<h1 className="mt-2 text-3xl font-bold tracking-tight gradient-text sm:text-4xl lg:text-5xl">
						Foundations
					</h1>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
						Verified organizations running campaigns on KindFi. Explore their
						work, follow live initiatives, and support causes that match your
						values.
					</p>
				</div>
				<Button asChild className="shrink-0 self-start lg:self-auto">
					<Link href="/create-foundation">
						<Plus className="mr-2 h-4 w-4" aria-hidden />
						Create foundation
					</Link>
				</Button>
			</div>

			<nav
				className="mt-8 flex flex-wrap gap-2"
				aria-label="Sort foundations"
			>
				{FOUNDATION_LIST_SORT_NAV.map(({ slug, label }) => {
					const active = activeSort === slug
					const href =
						slug === 'most-recent' ? '/foundations' : `/foundations?sort=${slug}`
					return (
						<Link
							key={slug}
							href={href}
							className={cn(
								'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm',
								active
									? 'border-primary bg-primary/10 text-foreground'
									: 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
							)}
							aria-current={active ? 'true' : undefined}
						>
							{label}
						</Link>
					)
				})}
			</nav>
		</header>
	)
}
