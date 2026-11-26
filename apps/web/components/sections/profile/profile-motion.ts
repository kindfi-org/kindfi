const reducedMotion =
	typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const profileFadeUp = (delay = 0) =>
	reducedMotion
		? {}
		: {
				initial: { opacity: 0, y: 16 },
				animate: { opacity: 1, y: 0 },
				transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
			}

export const profileFadeInView = (delay = 0) =>
	reducedMotion
		? {}
		: {
				initial: { opacity: 0, y: 20 },
				whileInView: { opacity: 1, y: 0 },
				viewport: { once: true, margin: '-60px' },
				transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
			}
