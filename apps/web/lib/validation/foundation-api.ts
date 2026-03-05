/**
 * Server-side validation for foundation API payloads.
 * Keeps validation in sync with client schema and enforces security limits.
 */

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/
const MAX_NAME_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 5000
const MAX_MISSION_LENGTH = 2000
const MAX_VISION_LENGTH = 2000
const MAX_URL_LENGTH = 2048
const MAX_SOCIAL_LINKS_KEYS = 20
const MAX_SOCIAL_LINK_VALUE_LENGTH = 2048
const FOUNDED_YEAR_MIN = 1900

export function validateSlug(slug: unknown): slug is string {
	return (
		typeof slug === 'string' &&
		slug.length >= 3 &&
		slug.length <= 30 &&
		SLUG_REGEX.test(slug)
	)
}

export function validateRequiredString(
	value: unknown,
	maxLength: number,
): value is string {
	return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

export function validateOptionalString(
	value: unknown,
	maxLength: number,
): value is string {
	if (value == null || value === '') return true
	return typeof value === 'string' && value.length <= maxLength
}

export function validateOptionalUrl(value: unknown): value is string | null {
	if (value == null || value === '') return true
	if (typeof value !== 'string') return false
	try {
		const u = new URL(value)
		return u.protocol === 'https:' || u.protocol === 'http:'
	} catch {
		return false
	}
}

export function validateFoundedYear(value: unknown): value is number {
	if (typeof value !== 'number' || Number.isNaN(value)) return false
	const year = Math.floor(value)
	const currentYear = new Date().getFullYear()
	return year >= FOUNDED_YEAR_MIN && year <= currentYear
}

export function validateSocialLinks(
	raw: unknown,
): { ok: true; value: Record<string, string> } | { ok: false; error: string } {
	if (raw == null || raw === '') {
		return { ok: true, value: {} }
	}
	if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
		return { ok: false, error: 'socialLinks must be an object' }
	}
	const obj = raw as Record<string, unknown>
	const keys = Object.keys(obj)
	if (keys.length > MAX_SOCIAL_LINKS_KEYS) {
		return {
			ok: false,
			error: `At most ${MAX_SOCIAL_LINKS_KEYS} social links allowed`,
		}
	}
	const result: Record<string, string> = {}
	for (const key of keys) {
		const val = obj[key]
		if (typeof val !== 'string') continue
		if (val.length > MAX_SOCIAL_LINK_VALUE_LENGTH) continue
		try {
			new URL(val)
			result[key] = val
		} catch {
			// skip invalid URL
		}
	}
	return { ok: true, value: result }
}

export const foundationValidationLimits = {
	MAX_NAME_LENGTH,
	MAX_DESCRIPTION_LENGTH,
	MAX_MISSION_LENGTH,
	MAX_VISION_LENGTH,
	MAX_URL_LENGTH,
	MAX_SOCIAL_LINKS_KEYS,
} as const
