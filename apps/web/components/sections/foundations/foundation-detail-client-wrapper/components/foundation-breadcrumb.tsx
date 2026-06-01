import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export function FoundationBreadcrumb() {
	return (
		<nav aria-label="Breadcrumb">
			<Link
				href="/foundations"
				className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
			>
				<ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
				All foundations
			</Link>
		</nav>
	)
}
