import type { TypedSupabaseClient } from '@packages/lib/types'
import type { AdminListResponse, AdminUsersQuery } from '~/lib/validators/admin-list-params'
import { runPaginatedAdminQuery } from './run-paginated-query'

export type AdminUserKycStatus =
	| 'not_started'
	| 'pending'
	| 'approved'
	| 'verified'
	| 'rejected'
	| 'unknown'

export interface AdminUserListItem {
	id: string
	displayName: string | null
	email: string | null
	imageUrl: string | null
	slug: string | null
	role: string | null
	onboardingProvider: string | null
	/** Wallet readiness indicators — truncated is done in the UI. */
	externalWalletAddress: string | null
	pollarWalletAddress: string | null
	createdAt: string | null
	kyc: {
		status: AdminUserKycStatus
		verificationLevel: string | null
		updatedAt: string | null
	}
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function sanitizeSearchTerm(term: string): string {
	return term.replace(/[,()%\\]/g, ' ').trim()
}

const KNOWN_KYC_STATUSES: ReadonlySet<string> = new Set([
	'not_started',
	'pending',
	'approved',
	'verified',
	'rejected',
])

function normalizeKycStatus(status: string | null): AdminUserKycStatus {
	if (!status) return 'not_started'
	return KNOWN_KYC_STATUSES.has(status) ? (status as AdminUserKycStatus) : 'unknown'
}

/**
 * Paginated, filterable admin user list served from the
 * `admin_users_overview` view (profiles + latest KYC review status). Only
 * operational fields are selected — never KYC notes or provider payloads.
 */
export async function getAdminUsers(
	client: TypedSupabaseClient,
	params: AdminUsersQuery,
): Promise<AdminListResponse<AdminUserListItem>> {
	const runQuery = (from: number, to: number) => {
		let query = client.from('admin_users_overview').select(
			`id, display_name, email, image_url, slug, role, onboarding_provider,
				 external_wallet_address, pollar_wallet_address, created_at,
				 kyc_status, kyc_verification_level, kyc_updated_at`,
			{ count: 'exact' },
		)

		if (params.role) query = query.eq('role', params.role)
		if (params.provider) query = query.eq('onboarding_provider', params.provider)

		if (params.kyc === 'approved') {
			// The approved bucket includes the legacy 'verified' status.
			query = query.in('kyc_status', ['approved', 'verified'])
		} else if (params.kyc) {
			query = query.eq('kyc_status', params.kyc)
		}

		if (params.wallet === 'pollar') {
			query = query.not('pollar_wallet_address', 'is', null)
		} else if (params.wallet === 'external') {
			query = query.not('external_wallet_address', 'is', null)
		} else if (params.wallet === 'none') {
			query = query.is('pollar_wallet_address', null).is('external_wallet_address', null)
		}

		if (params.from) query = query.gte('created_at', `${params.from}T00:00:00.000Z`)
		if (params.to) query = query.lte('created_at', `${params.to}T23:59:59.999Z`)

		if (params.q) {
			const raw = params.q.trim()
			if (UUID_PATTERN.test(raw)) {
				query = query.eq('id', raw)
			} else {
				const term = sanitizeSearchTerm(raw)
				if (term) {
					query = query.or(
						[
							`display_name.ilike.%${term}%`,
							`email.ilike.%${term}%`,
							`slug.ilike.%${term}%`,
							`external_wallet_address.ilike.%${term}%`,
							`pollar_wallet_address.ilike.%${term}%`,
						].join(','),
					)
				}
			}
		}

		switch (params.sort) {
			case 'oldest':
				query = query.order('created_at', { ascending: true, nullsFirst: false })
				break
			case 'name':
				query = query.order('display_name', { ascending: true, nullsFirst: false })
				break
			default:
				query = query.order('created_at', { ascending: false, nullsFirst: false })
		}

		return query.range(from, to)
	}

	type UserRow = {
		id: string | null
		display_name: string | null
		email: string | null
		image_url: string | null
		slug: string | null
		role: string | null
		onboarding_provider: string | null
		external_wallet_address: string | null
		pollar_wallet_address: string | null
		created_at: string | null
		kyc_status: string | null
		kyc_verification_level: string | null
		kyc_updated_at: string | null
	}

	const { rows, total } = await runPaginatedAdminQuery<UserRow>(
		runQuery,
		params.page,
		params.pageSize,
		'admin users',
	)

	return {
		items: rows.map((row) => ({
			id: row.id as string,
			displayName: row.display_name,
			email: row.email,
			imageUrl: row.image_url,
			slug: row.slug,
			role: row.role,
			onboardingProvider: row.onboarding_provider,
			externalWalletAddress: row.external_wallet_address,
			pollarWalletAddress: row.pollar_wallet_address,
			createdAt: row.created_at,
			kyc: {
				status: normalizeKycStatus(row.kyc_status),
				verificationLevel: row.kyc_verification_level,
				updatedAt: row.kyc_updated_at,
			},
		})),
		total,
		page: params.page,
		pageSize: params.pageSize,
	}
}
