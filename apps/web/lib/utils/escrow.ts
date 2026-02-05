/**
 * Generates words from a title for use in escrow identifiers.
 * Similar to slug generation, extracts key words from the title.
 *
 * @param title - Project title to extract words from
 * @returns Words string (e.g., "solar-energy-initiative")
 */
function _extractWordsFromTitle(title: string): string {
	return title
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '-')
		.split('-')
		.filter((word) => word.length > 0)
		.slice(0, 5) // Limit to first 5 words to keep it concise
		.join('-')
}

/**
 * Generates an engagement ID for escrow contracts.
 * Format: "Kindfi - {Project Title} - {consecutive number}"
 *
 * @param title - Project title
 * @param consecutiveNumber - Consecutive number for this escrow (1, 2, 3, etc.)
 * @returns Engagement ID string
 */
export function generateEngagementId(
	title: string,
	consecutiveNumber: number,
): string {
	return `Kindfi - ${title} - ${consecutiveNumber}`
}

/**
 * Generates a title for escrow contracts.
 * Format: "Kindfi - {Project Title} - {consecutive number}"
 *
 * @param title - Project title
 * @param consecutiveNumber - Consecutive number for this escrow (1, 2, 3, etc.)
 * @returns Escrow title string
 */
export function generateEscrowTitle(
	title: string,
	consecutiveNumber: number,
): string {
	return `Kindfi - ${title} - ${consecutiveNumber}`
}

/**
 * USDC has 7 decimal places
 * Converts dollars to stroops (smallest unit)
 *
 * @param dollars - Amount in dollars (e.g., 100)
 * @returns Amount in stroops (e.g., 1000000000 for 100 USDC)
 */
export function dollarsToStroops(dollars: number): number {
	return Math.floor(dollars * 10_000_000)
}

/**
 * Converts stroops back to dollars
 *
 * @param stroops - Amount in stroops (e.g., 1000000000)
 * @returns Amount in dollars (e.g., 100)
 */
export function stroopsToDollars(stroops: number): number {
	return stroops / 10_000_000
}
