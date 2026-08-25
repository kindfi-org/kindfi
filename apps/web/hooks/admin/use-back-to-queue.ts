'use client'

import { useSearchParams } from 'next/navigation'

/**
 * Validates a `from` back-link value: it must be an internal admin path.
 * Anything else (external URLs, other routes) is rejected to avoid open
 * redirects.
 */
export function sanitizeAdminBackLink(value: string | null): string | null {
	if (!value) return null
	if (!value.startsWith('/admin')) return null
	if (value.startsWith('//')) return null
	return value
}

/**
 * Reads the validated `?from=` back-link that admin queue and list links
 * attach when routing into project-management workspaces.
 */
export function useAdminBackLink(): string | null {
	const searchParams = useSearchParams()
	return sanitizeAdminBackLink(searchParams.get('from'))
}
