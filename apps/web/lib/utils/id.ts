/**
 * Generates a unique identifier combining timestamp and random elements
 * Format: timestamp-randomString (e.g., 1706547362-a1b2c3d4)
 */
export function generateUniqueId(): string {
	// Get current timestamp in seconds
	const timestamp = Math.floor(Date.now() / 1000)

	// Generate 8 random hex characters
	const randomPart = Array.from({ length: 8 }, () =>
		Math.floor(Math.random() * 16).toString(16),
	).join('')

	// Combine timestamp and random string
	return `${timestamp}-${randomPart}`
}
