import getContrast from 'get-contrast'

const MAXIMUM_COLOR_RANGE = 0xffffff
function randomHexColor(): string {
	return `#${`${Math.floor(Math.random() * MAXIMUM_COLOR_RANGE)
		.toString(16)
		.padStart(6, '0')}`}`
}

export function getA11yColorMatch(color: string): [string, string] {
	// Validate input color format
	let newColor = color
	if (!newColor.startsWith('#')) {
		newColor = `#${newColor}`
	}

	let attempts = 0
	const MAX_ATTEMPTS = 100
	let contrastColor = randomHexColor()

	while (
		!getContrast.isAccessible(newColor, contrastColor) &&
		attempts < MAX_ATTEMPTS
	) {
		contrastColor = randomHexColor()
		attempts++
	}

	return [newColor, contrastColor] // [background, text]
}

/**
 * Calculate the contrast ratio between two colors
 * Based on WCAG guidelines for accessibility
 */
export function getContrastRatio(color1: string, color2: string): number {
	const getLuminance = (color: string): number => {
		// Convert hex to RGB
		const hex = color.replace('#', '')
		const r = Number.parseInt(hex.slice(0, 2), 16) / 255
		const g = Number.parseInt(hex.slice(2, 4), 16) / 255
		const b = Number.parseInt(hex.slice(4, 6), 16) / 255

		// Calculate relative luminance
		const toLinear = (v: number) =>
			v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4

		return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
	}

	const lum1 = getLuminance(color1)
	const lum2 = getLuminance(color2)
	const brightest = Math.max(lum1, lum2)
	const darkest = Math.min(lum1, lum2)

	return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Get the appropriate text color (black or white) for a given background color
 * Uses WCAG AA standard (4.5:1 contrast ratio)
 */
export function getContrastTextColor(
	backgroundColor: string,
): 'black' | 'white' {
	const whiteContrast = getContrastRatio(backgroundColor, '#FFFFFF')
	const blackContrast = getContrastRatio(backgroundColor, '#000000')

	// Return the color that provides better contrast
	return whiteContrast > blackContrast ? 'white' : 'black'
}
