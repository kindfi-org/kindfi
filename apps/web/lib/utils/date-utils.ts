export function formatDate(date: string) {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

export function formatDistanceToNow(date: Date | string): string {
	const now = new Date()
	const then = typeof date === 'string' ? new Date(date) : date
	const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

	if (seconds < 60) return 'just now'
	if (seconds < 3600) {
		const minutes = Math.floor(seconds / 60)
		return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
	}
	if (seconds < 86400) {
		const hours = Math.floor(seconds / 3600)
		return `${hours} hour${hours !== 1 ? 's' : ''} ago`
	}
	if (seconds < 604800) {
		const days = Math.floor(seconds / 86400)
		return `${days} day${days !== 1 ? 's' : ''} ago`
	}
	if (seconds < 2592000) {
		const weeks = Math.floor(seconds / 604800)
		return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
	}
	if (seconds < 31536000) {
		const months = Math.floor(seconds / 2592000)
		return `${months} month${months !== 1 ? 's' : ''} ago`
	}
	const years = Math.floor(seconds / 31536000)
	return `${years} year${years !== 1 ? 's' : ''} ago`
}
