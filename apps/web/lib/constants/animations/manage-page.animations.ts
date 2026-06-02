/**
 * Animation variants for the project management dashboard page.
 * These variants respect user's motion preferences.
 */

import type { Variants } from 'framer-motion'

export const createManageContainerVariants = (prefersReducedMotion: boolean): Variants => ({
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: prefersReducedMotion
			? { duration: 0 }
			: {
					staggerChildren: 0.08,
					delayChildren: 0.1,
				},
	},
})

export const createManageSectionVariants = (prefersReducedMotion: boolean): Variants => ({
	hidden: {
		opacity: prefersReducedMotion ? 1 : 0,
		y: prefersReducedMotion ? 0 : 20,
	},
	show: {
		opacity: 1,
		y: 0,
		transition: prefersReducedMotion
			? { duration: 0 }
			: {
					type: 'spring' as const,
					stiffness: 100,
					damping: 15,
				},
	},
})

export const createManageCardVariants = (prefersReducedMotion: boolean): Variants => ({
	hidden: {
		opacity: prefersReducedMotion ? 1 : 0,
		y: prefersReducedMotion ? 0 : 20,
	},
	show: {
		opacity: 1,
		y: 0,
		transition: prefersReducedMotion
			? { duration: 0 }
			: {
					type: 'spring' as const,
					stiffness: 100,
					damping: 15,
				},
	},
})
