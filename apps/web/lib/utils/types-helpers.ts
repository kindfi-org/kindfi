import type { ProjectTag, TMoney, TPercentage } from '~/lib/types'

/** Helper function to validate and create project tag */
export function createProjectTag(id: string, text: string): ProjectTag {
	if (!id.trim()) throw new Error('Tag ID cannot be empty')
	if (!text.trim()) throw new Error('Tag text cannot be empty')
	return { id, text }
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
