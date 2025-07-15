import type { TMoney, TPercentage } from '~/lib/types'

/** Helper function to create monetary values */
export function createMoney(value: number): TMoney {
	if (value < 0) throw new Error('Money cannot be negative')
	return Number(value.toFixed(2)) as TMoney
}

/** Helper function to validate and create percentage values */
export function createPercentage(value: number): TPercentage {
	if (value < 0 || value > 100) {
		throw new Error('Percentage must be between 0 and 100')
	}
	return value as TPercentage
}
