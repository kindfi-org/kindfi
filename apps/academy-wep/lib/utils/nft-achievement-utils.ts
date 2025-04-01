/**
 * Calculates the progress percentage based on earned and total badges
 * @param earnedBadges Number of badges earned
 * @param totalBadges Total number of available badges
 * @returns Progress percentage (rounded to nearest integer)
 */
export function calculateProgress(
	earnedBadges: number,
	totalBadges: number,
): number {
	if (totalBadges === 0) return 0
	return Math.round((earnedBadges / totalBadges) * 100)
}
