import { Building2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'

export function FoundationNotFound() {
	return (
		<div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
			<Building2 className="mx-auto mb-4 h-14 w-14 text-muted-foreground" aria-hidden="true" />
			<h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Foundation not found</h2>
			<p className="mx-auto mt-2 max-w-md text-muted-foreground">
				This profile may have been removed or the link is incorrect.
			</p>
			<Button asChild className="mt-6">
				<Link href="/foundations">Back to foundations</Link>
			</Button>
		</div>
	)
}
