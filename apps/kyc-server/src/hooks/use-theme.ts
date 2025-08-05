'use client'

import { useTheme as useNextTheme } from 'next-themes'

export function useTheme() {
	const { setTheme, resolvedTheme } = useNextTheme()

	const toggleTheme = () => {
		setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
	}

	return {
		theme: resolvedTheme,
		setTheme,
		toggleTheme,
	}
}
