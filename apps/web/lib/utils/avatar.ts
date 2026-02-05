export function getInitials(name: string): string {
	if (!name) return '?'

	const parts = name.trim().split(/\s+/)
	if (parts.length === 1) {
		return parts[0].charAt(0).toUpperCase()
	}

	// Get first letter of first name and first letter of last name
	return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
