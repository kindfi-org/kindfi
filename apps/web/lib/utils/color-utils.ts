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

export function getTextColor(bgColor: string): 'white' | 'black' {
	const color = bgColor.trim().startsWith('#')
		? bgColor.trim()
		: `#${bgColor.trim()}`
	const whiteRatio = getContrast.ratio(color, '#FFFFFF')
	const blackRatio = getContrast.ratio(color, '#000000')

	if (whiteRatio >= 4) return 'white'
	if (blackRatio >= 4.5) return 'black'
	return whiteRatio > blackRatio ? 'white' : 'black'
}
