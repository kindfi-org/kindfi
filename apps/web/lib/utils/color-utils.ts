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
		if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
			throw new Error(`Invalid hex color format: ${color}`)
		}
		const r = Number.parseInt(hex.slice(0, 2), 16) / 255
		const g = Number.parseInt(hex.slice(2, 4), 16) / 255
		const b = Number.parseInt(hex.slice(4, 6), 16) / 255

		// WCAG luminance formula constants
		const WCAG_LUMINANCE_THRESHOLD = 0.03928
		const WCAG_LUMINANCE_DIVISOR = 12.92
		const WCAG_LUMINANCE_MULTIPLIER = 1.055
		const WCAG_LUMINANCE_OFFSET = 0.055
		const WCAG_LUMINANCE_POWER = 2.4

		// Calculate relative luminance
		const toLinear = (v: number) =>
			v <= WCAG_LUMINANCE_THRESHOLD
				? v / WCAG_LUMINANCE_DIVISOR
				: ((v + WCAG_LUMINANCE_OFFSET) / WCAG_LUMINANCE_MULTIPLIER) **
					WCAG_LUMINANCE_POWER

		return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
	}

	const lum1 = getLuminance(color1)
	const lum2 = getLuminance(color2)
	const brightest = Math.max(lum1, lum2)
	const darkest = Math.min(lum1, lum2)

	return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Get the appropriate text color (black, white, or gray) for a given background color.
 * Returns the one with the highest contrast ratio.
 */
export function getContrastTextColor(
	backgroundColor: string,
): 'text-black' | 'text-white' | 'text-muted-foreground' {
	const contrastWithWhite = getContrastRatio(backgroundColor, '#FFFFFF')
	const contrastWithBlack = getContrastRatio(backgroundColor, '#000000')
	const contrastWithGray = getContrastRatio(backgroundColor, '#61646B') // text-muted-foreground

	const maxContrast = Math.max(
		contrastWithWhite,
		contrastWithBlack,
		contrastWithGray,
	)

	if (maxContrast === contrastWithWhite) return 'text-white'
	if (maxContrast === contrastWithBlack) return 'text-black'
	return 'text-muted-foreground'
}

/**
 * Generate a visually distinct random color using HSL for better distribution
 */
export function generateDistinctRandomColor(
	existingColors: string[] = [],
): string {
	// Use HSL for better color distribution
	const hue = Math.floor(Math.random() * 360)
	const saturation = 60 + Math.floor(Math.random() * 30) // 60-90% for vibrant colors
	const lightness = 45 + Math.floor(Math.random() * 20) // 45-65% for good contrast

	// Convert HSL to hex
	const hslToHex = (h: number, s: number, l: number): string => {
		const light = l / 100
		const a = (s * Math.min(light, 1 - light)) / 100
		const f = (n: number) => {
			const k = (n + h / 30) % 12
			const color = light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0')
		}
		return `#${f(0)}${f(8)}${f(4)}`
	}

	let newColor = hslToHex(hue, saturation, lightness)

	// If color already exists, try a few more times with different hues
	let attempts = 0
	while (existingColors.includes(newColor) && attempts < 10) {
		const newHue = (hue + (attempts + 1) * 36) % 360 // Spread colors around the color wheel
		newColor = hslToHex(newHue, saturation, lightness)
		attempts++
	}

	return newColor
}
