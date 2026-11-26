'use client'

import { useId } from 'react'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { AdminListShell } from '~/components/sections/admin/shared/admin-list-shell'
import { useAdminListParams } from '~/hooks/admin/use-admin-list-params'
import { useAdminQuery } from '~/hooks/admin/use-admin-query'
import type { AdminUserListItem } from '~/lib/queries/admin/get-admin-users'
import type { AdminListResponse } from '~/lib/validators/admin-list-params'
import {
	adminUsersQuerySchema,
	ONBOARDING_PROVIDER_FILTERS,
	USER_ROLE_FILTERS,
	USER_SORT_OPTIONS,
	WALLET_READINESS_FILTERS,
} from '~/lib/validators/admin-list-params'
import { KycStatsBar } from './kyc-stats-bar'
import { UserRow } from './user-row'

const ALL = 'all'

interface FilterSelectProps {
	label: string
	value: string
	onChange: (value: string | undefined) => void
	options: Array<{ value: string; label: string }>
	allLabel: string
}

function FilterSelect({ label, value, onChange, options, allLabel }: FilterSelectProps) {
	const id = useId()
	return (
		<div className="flex items-center gap-1.5">
			<Label htmlFor={id} className="sr-only">
				{label}
			</Label>
			<Select
				value={value || ALL}
				onValueChange={(next) => onChange(next === ALL ? undefined : next)}
			>
				<SelectTrigger id={id} className="h-9 w-auto min-w-32 gap-1" aria-label={label}>
					<SelectValue placeholder={allLabel} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL}>{allLabel}</SelectItem>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}

const ROLE_LABELS: Record<string, string> = {
	admin: 'Admin',
	creator: 'Creator',
	donor: 'Donor',
	kinder: 'Kinder',
	kindler: 'Kindler',
	pending: 'Pending',
}

const WALLET_LABELS: Record<string, string> = {
	pollar: 'Pollar wallet',
	external: 'External wallet',
	none: 'No wallet',
}

const PROVIDER_LABELS: Record<string, string> = {
	legacy_passkey: 'Passkey onboarding',
	pollar: 'Pollar onboarding',
}

const SORT_LABELS: Record<(typeof USER_SORT_OPTIONS)[number], string> = {
	newest: 'Newest first',
	oldest: 'Oldest first',
	name: 'By name',
}

export function AdminUsersPage() {
	const { params, normalizedParams, setParam, setPage, resetFilters } =
		useAdminListParams(adminUsersQuerySchema)

	const { data, isLoading, isError, refetch } = useAdminQuery<AdminListResponse<AdminUserListItem>>(
		'users',
		{ params: normalizedParams },
	)

	const hasActiveFilters = Object.keys(normalizedParams).some(
		(key) => !['page', 'pageSize', 'sort'].includes(key),
	)

	return (
		<div className="space-y-6">
			<AdminSectionHeader
				title="Users & KYC"
				description="Community members with roles, wallet readiness, and normalized KYC status. Sensitive KYC data never appears here."
			/>

			<KycStatsBar activeKyc={params.kyc} onSelect={(kyc) => setParam('kyc', kyc)} />

			<AdminListShell
				searchValue={params.q ?? ''}
				onSearchChange={(value) => setParam('q', value || undefined)}
				searchPlaceholder="Search by name, email, handle, user ID, or wallet address…"
				filters={
					<>
						<FilterSelect
							label="Filter by role"
							allLabel="All roles"
							value={params.role ?? ''}
							onChange={(value) => setParam('role', value)}
							options={USER_ROLE_FILTERS.map((role) => ({
								value: role,
								label: ROLE_LABELS[role] ?? role,
							}))}
						/>
						<FilterSelect
							label="Filter by onboarding provider"
							allLabel="All providers"
							value={params.provider ?? ''}
							onChange={(value) => setParam('provider', value)}
							options={ONBOARDING_PROVIDER_FILTERS.map((provider) => ({
								value: provider,
								label: PROVIDER_LABELS[provider] ?? provider,
							}))}
						/>
						<FilterSelect
							label="Filter by wallet readiness"
							allLabel="Any wallet state"
							value={params.wallet ?? ''}
							onChange={(value) => setParam('wallet', value)}
							options={WALLET_READINESS_FILTERS.map((wallet) => ({
								value: wallet,
								label: WALLET_LABELS[wallet] ?? wallet,
							}))}
						/>
						<FilterSelect
							label="Sort users"
							allLabel="Newest first"
							value={params.sort === 'newest' ? '' : params.sort}
							onChange={(value) => setParam('sort', value ?? 'newest')}
							options={USER_SORT_OPTIONS.filter((sort) => sort !== 'newest').map((sort) => ({
								value: sort,
								label: SORT_LABELS[sort],
							}))}
						/>
					</>
				}
				isLoading={isLoading}
				isError={isError}
				onRetry={() => refetch()}
				total={data?.total ?? 0}
				page={params.page}
				pageSize={params.pageSize}
				onPageChange={setPage}
				emptyTitle="No users yet"
				emptyDescription="New sign-ups appear here as the community grows."
				hasActiveFilters={hasActiveFilters}
				onResetFilters={resetFilters}
				skeletonRowHeight={104}
			>
				<ul className="space-y-3">
					{(data?.items ?? []).map((user) => (
						<li key={user.id}>
							<UserRow user={user} />
						</li>
					))}
				</ul>
			</AdminListShell>
		</div>
	)
}
