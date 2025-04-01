import type { TMoney, TPercentage, Tag } from '~/lib/types'
import { getA11yColorMatch } from './color-utils'

/** Helper function to validate and create project tag */
export function createProjectTag(
	id: string,
	text: string,
	color: { backgroundColor: string; textColor: string },
): Tag {
	if (!id.trim()) throw new Error('Tag ID cannot be empty')
	if (!text.trim()) throw new Error('Tag text cannot be empty')
	if (!color.backgroundColor.trim() || !color.textColor.trim()) {
		throw new Error('Both backgroundColor and textColor are required')
	}

	return { id, text, color }
}

/** Helper function to create monetary values */
export function createMoney(value: number): TMoney {
	if (value < 0) throw new Error('Money cannot be negative')
	return Number(value.toFixed(2)) as TMoney
}

/** Helper function to validate image URLs */
export function createImageUrl(url: string): string {
	try {
		new URL(url)
		return url
	} catch {
		throw new Error('Invalid image URL')
	}
}

/** Helper function to validate and create percentage values */
export function createPercentage(value: number): TPercentage {
	if (value < 0 || value > 100) {
		throw new Error('Percentage must be between 0 and 100')
	}
	return value as TPercentage
}

export function getTagColors(tag: Tag | string): {
	backgroundColor: string
	color: string
} {
	return typeof tag === 'string'
		? { backgroundColor: '#E5E7EB', color: '#374151' }
		: typeof tag.color !== 'string'
			? {
					backgroundColor: tag.color?.backgroundColor ?? '',
					color: tag.color?.textColor ?? '',
				}
			: {
					backgroundColor: tag.color,
					color: getA11yColorMatch(tag.color)[1], // Use accessible text color
				}
}
