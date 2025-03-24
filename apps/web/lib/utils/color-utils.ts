import getContrast from 'get-contrast'

const MAXIMUM_COLOR_RANGE = Number.parseInt('0xFFFFFF')
function randomHexColor(): string {
	return `#${`${Math.floor(Math.random() * MAXIMUM_COLOR_RANGE)
		.toString(16)
		.padStart(6, '0')}`}`
}

export function getA11yColorMatch(color: string) {
	let contrastColor = randomHexColor()

	while (!getContrast.isAccessible(color, contrastColor)) {
		contrastColor = randomHexColor()
	}

	return [color, contrastColor] // [background, text]
}
