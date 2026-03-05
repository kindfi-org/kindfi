/**
 * Server-side validation for project URL slugs.
 * Prevents path traversal and ensures safe use in queries and URLs.
 */
const PROJECT_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MIN_LENGTH = 1
const MAX_LENGTH = 80

export function validateProjectSlug(slug: unknown): slug is string {
	return (
		typeof slug === 'string' &&
		slug.length >= MIN_LENGTH &&
		slug.length <= MAX_LENGTH &&
		PROJECT_SLUG_REGEX.test(slug)
	)
}
