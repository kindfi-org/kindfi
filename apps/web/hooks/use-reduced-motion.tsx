import { useEffect, useState } from 'react'

/**
 * Tracks user's reduced motion preference using CSS media queries
 * @returns boolean indicating if reduced motion is preferred
 */
const useReducedMotion = () => {
	// State to store reduced motion preference (default: animations enabled)
	const [reducedMotion, setReducedMotion] = useState(false)

	useEffect(() => {
		// Guard clause for SSR/Non-browser environments
		if (typeof window === 'undefined') return

		// Media query list for reduced motion preference
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

		// Set initial state from current media query match
		setReducedMotion(mediaQuery.matches)

		// Handler for media query changes
		const handleChange = (e: MediaQueryListEvent | MediaQueryListEvent) => {
			setReducedMotion(e.matches)
		}
		if (mediaQuery.addEventListener) {
			// Subscribe to media query changes
			mediaQuery.addEventListener('change', handleChange)
			return () => mediaQuery.removeEventListener('change', handleChange)
		}
		//fallback for older browsers
		mediaQuery.addListener(handleChange)
		return () => mediaQuery.removeListener(handleChange)
	}, []) // Empty dependency array = runs only on mount

	return reducedMotion
}

export { useReducedMotion }
