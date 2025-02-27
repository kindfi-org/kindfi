/**
 * ANIMATION UTILITIES
 *
 * Predefined animation class combinations for common UI transitions.
 * Leverages Tailwind CSS animations and Radix UI state attributes.
 * All values are immutable for type safety (`as const`).
 *  @example
 * In a dialog.tsx component
 * className={cn(animations.fade.in)}
 */

export const animations = {
	/**
	 * Fade animations (opacity transitions)
	 * @example Usage: Dialog overlays
	 */
	fade: {
		in: 'data-[state=closed]:fade-out-0', // Applies fade-out when component is closing
		out: 'data-[state=closed]:fade-in-0', // Applies fade-in when component is closing
	},

	/**
	 * Zoom animations (scale transformations)
	 * @example Usage: sheet, dialog, dropdowm
	 */
	zoom: {
		in: 'data-[state=open]:zoom-in-95', // 95% scale-in when opening
		out: 'data-[state=open]:zoom-out-95', // 95% scale-out when opening
	},

	/**
	 * Slide animations (directional transitions)
	 * @example Usage: Side panels, mobile menus
	 */
	slide: {
		/** Entrance animations */
		fromLeft: 'animate-in slide-in-left',
		fromRight: 'animate-in slide-in-right',
		fromTop: 'animate-in slide-in-top',
		fromBottom: 'animate-in slide-in-bottom',

		/** Exit animations */
		toLeft: 'animate-out slide-out-left',
		toRight: 'animate-out slide-out-right',
		toTop: 'animate-out slide-out-top',
		toBottom: 'animate-out slide-out-bottom',
	},

	/**
	 * Base animation states
	 * @example Usage: Simple enter/exit transitions
	 */
	animate: {
		in: 'data-[state=open]:animate-in', // Generic enter animation
		out: 'data-[state=closed]:animate-out', // Generic exit animation
	},

	/**
	 * Combined: Fade + Zoom + Animation states
	 * @example Usage: Complex dialog transitions
	 */
	fadeAndZoomAndAnimate: {
		inOut: [
			'data-[state=open]:animate-in',
			'data-[state=closed]:animate-out',
			'data-[state=closed]:fade-out-0',
			'data-[state=open]:fade-in-0',
			'data-[state=closed]:zoom-out-95',
			'data-[state=open]:zoom-in-95',
		].join(' '), // Simultaneous fade, zoom, and base animation
	},

	/**
	 * Combined: Fade + Animation states
	 * +@example Usage: sheet, dialog, and alert transitions
	 */
	fadeAndAnimate: {
		inOut: [
			'data-[state=open]:fade-in-0',
			'data-[state=open]:animate-in',
			'data-[state=closed]:fade-out-0',
			'data-[state=closed]:animate-out',
		].join(' '),
	},
	/**
	 * Combined: Fade + Animation + Overlay
	 * @example Usage: sheet overlay backgrounds with transitions
	 */
	fadeAndAnimateAndOverlay: {
		inOut: [
			'data-[state=open]:fade-in-0',
			'data-[state=open]:animate-in',
			'data-[state=closed]:fade-out-0',
			'data-[state=closed]:animate-out',
			'bg-black/80', // Semi-transparent overlay background
		].join(' '),
	},

	slideAndAnimate: {
		slideIn: [
			'data-[side=bottom]:slide-in-from-top-2',
			'data-[side=left]:slide-in-from-right-2',
			'data-[side=right]:slide-in-from-left-2',
			'data-[side=top]:slide-in-from-bottom-2',
		].join(' '),
	},
	contentSlide: {
		inOut: [
			'data-[state=closed]:slide-out-to-left-1/2',
			'data-[state=closed]:slide-out-to-top-[48%]',
			'data-[state=open]:slide-in-from-left-1/2',
			'data-[state=open]:slide-in-from-top-[48%]',
		].join(' '),
	},
} as const

export const fadeInUp = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.52 },
}

export const staggerChildren = {
	animate: { transition: { staggerChildren: 0.1 } },
}

export const badgeVariants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0, transition: { duration: 0.52 } },
	hover: { scale: 1.05, transition: { duration: 0.24 } },
	tap: { scale: 0.95 },
}

export const fadeInUpAnimation = {
	initial: { opacity: 0, y: 20 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true },
	transition: { duration: 0.52 },
}

export const fadeInUpVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
}

export const cardVariants = {
	initial: { opacity: 0, y: 20 },
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
		},
	},
	hover: {
		y: -5,
		transition: {
			duration: 0.2,
		},
	},
}

export const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
}

export const itemVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: {
			type: 'spring',
			stiffness: 100,
			damping: 12,
		},
	},
}

export const noResultsVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 100,
			damping: 12,
		},
	},
}
