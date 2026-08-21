import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { ServerActionError } from '~/lib/auth/server-action-auth'

export interface ComplianceAdminContext {
	userId: string
}

/**
 * Compliance policy/exception management requires an explicit
 * `compliance_admin` permission on top of the general `role = 'admin'`
 * check used elsewhere in /admin (see lib/utils/admin.ts requireAdmin()).
 * Being an authenticated admin is not sufficient by itself — this is a
 * separate, narrower grant so the blast radius of a compromised admin
 * account doesn't automatically include compliance policy control.
 *
 * Throws ServerActionError('UNAUTHORIZED' | 'FORBIDDEN') — callers (server
 * actions and API routes) are expected to catch and convert via
 * toServerActionFailure, consistent with the rest of the server-action auth
 * layer.
 */
export async function requireComplianceAdmin(action: string): Promise<ComplianceAdminContext> {
	const session = await getServerSession(nextAuthOption)

	if (!session?.user?.id) {
		logger.warn(`[compliance] Unauthorized attempt to call ${action}`)
		throw new ServerActionError('Unauthorized: You must be signed in.', 'UNAUTHORIZED')
	}

	// `compliance_admin` is not in the generated Supabase types yet (added by
	// this change's migration; regenerate via `task supabase:gen` against a
	// live database), so the typed query builder can't select it directly —
	// narrow the client the same way lib/services/audit-logger.ts does for
	// the equally-ungenerated audit_logs table.
	const supabase = await createSupabaseServerClient()
	const { data: profile, error } = await (
		supabase as unknown as {
			from: (table: 'profiles') => {
				select: (cols: string) => {
					eq: (
						col: string,
						val: string,
					) => {
						single: () => PromiseLike<{
							data: { role: string; compliance_admin: boolean } | null
							error: { message: string } | null
						}>
					}
				}
			}
		}
	)
		.from('profiles')
		.select('role, compliance_admin')
		.eq('id', session.user.id)
		.single()

	if (error || !profile) {
		logger.error('[compliance] Failed to load profile for compliance admin check', {
			userId: session.user.id,
			error: error?.message,
		})
		throw new ServerActionError('Forbidden: Compliance admin privileges are required.', 'FORBIDDEN')
	}

	const isComplianceAdmin = profile.role === 'admin' && profile.compliance_admin === true

	if (!isComplianceAdmin) {
		logger.warn(`[compliance] Forbidden: ${session.user.id} lacks compliance_admin for ${action}`)
		throw new ServerActionError('Forbidden: Compliance admin privileges are required.', 'FORBIDDEN')
	}

	return { userId: session.user.id }
}
