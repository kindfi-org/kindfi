import getContrast from 'get-contrast'

const MAXIMUM_COLOR_RANGE = Number.parseInt('0xFFFFFF')
function randomHexColor(): string {
	return `#${`${Math.floor(Math.random() * MAXIMUM_COLOR_RANGE)
		.toString(16)
		.padStart(6, '0')}`}`
}

export function getA11yColorMatch(color: string): [string, string] {
	// Validate input color format
	let new_color = color
	if (!new_color.startsWith('#')) {
		new_color = `#${new_color}`
	}

	let attempts = 0
	const MAX_ATTEMPTS = 100
	let contrastColor = randomHexColor()

	while (
		!getContrast.isAccessible(new_color, contrastColor) &&
		attempts < MAX_ATTEMPTS
	) {
		contrastColor = randomHexColor()
		attempts++
	}

	return [new_color, contrastColor] // [background, text]
}
