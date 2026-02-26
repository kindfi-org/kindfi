'use client'

import type { ReactNode } from 'react'

type ManageSectionHeaderProps = {
	icon: ReactNode
	title: string
	description?: string
}

/**
 * Shared header for foundation manage sub-pages.
 * Single component to avoid duplicated layout and copy.
 */
export function ManageSectionHeader({
	icon,
	title,
	description,
}: ManageSectionHeaderProps) {
	return (
		<header className="flex flex-col items-center justify-center mb-8">
			<div className="flex items-center gap-3">
				<div
					className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-3 text-white shadow-sm"
					aria-hidden="true"
				>
					{icon}
				</div>
				<div>
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text text-wrap-balance">
						{title}
					</h1>
					{description ? (
						<p className="text-lg md:text-xl text-muted-foreground mt-2 text-center">
							{description}
						</p>
					) : null}
				</div>
			</div>
		</header>
	)
}
