'use client'

import { useSearchParams } from 'next/navigation'

/**
 * Validates a `from` back-link value: it must be an internal admin path.
 * Anything else (external URLs, other routes) is rejected to avoid open
 * redirects.
 */
export function sanitizeAdminBackLink(value: string | null): string | null {
	if (!value) return null
	if (value.startsWith('//') || value.includes('\\')) return null
	// Must be exactly /admin or a canonical path under /admin/ — this also
	// rejects siblings like /administer and traversal like /admin/../x.
	const [path] = value.split('?')
	if (path !== '/admin' && !path.startsWith('/admin/')) return null
	if (path.split('/').some((segment) => segment === '..' || segment === '.')) return null
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
