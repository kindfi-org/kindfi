'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

type ManagePageShellProps = {
	children: ReactNode
}

const PAGE_BACKGROUND_CLASS =
	'min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative'
const PAGE_PATTERN_CLASS =
	'absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,1,36,0.03)_1px,transparent_0)] bg-[size:32px_32px] opacity-40'
const INNER_CLASS = 'relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12'

/**
 * Shared shell for foundation manage sub-pages.
 * Provides gradient background, pattern, and container so each page doesn’t duplicate.
 */
export function ManagePageShell({ children }: ManagePageShellProps) {
	const shouldReduceMotion = useReducedMotion()

	return (
		<div className={PAGE_BACKGROUND_CLASS}>
			<div className={PAGE_PATTERN_CLASS} aria-hidden="true" />
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{
					duration: shouldReduceMotion ? 0 : 0.4,
					transitionProperty: 'opacity, transform',
				}}
				className={INNER_CLASS}
			>
				{children}
			</motion.div>
		</div>
	)
}
