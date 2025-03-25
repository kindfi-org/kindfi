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
