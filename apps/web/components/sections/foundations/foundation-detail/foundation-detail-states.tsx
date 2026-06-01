'use client'

import { Building2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'

export function FoundationDetailLoading() {
	return (
		<div className="space-y-8">
			<div className="relative h-80 md:h-96 w-full overflow-hidden rounded-2xl bg-muted animate-pulse" />
			<div className="space-y-6">
				<div className="h-12 bg-muted animate-pulse rounded-lg w-1/2" />
				<div className="h-6 bg-muted animate-pulse rounded-lg w-2/3" />
				<div className="grid md:grid-cols-3 gap-4">
					{[1, 2, 3].map((i) => (
						<div
							key={`skeleton-${i}`}
							className="h-24 bg-muted animate-pulse rounded-lg"
						/>
					))}
				</div>
			</div>
		</div>
	)
}

export function FoundationDetailNotFound() {
	return (
		<div className="text-center py-16">
			<Building2
				className="h-16 w-16 text-muted-foreground mx-auto mb-4"
				aria-hidden="true"
			/>
			<h2 className="text-2xl font-bold mb-2">Foundation Not Found</h2>
			<p className="text-muted-foreground mb-6">
				The foundation you&apos;re looking for doesn&apos;t exist or has been
				removed.
			</p>
			<Button asChild>
				<Link href="/foundations">Browse All Foundations</Link>
			</Button>
		</div>
	)
}
