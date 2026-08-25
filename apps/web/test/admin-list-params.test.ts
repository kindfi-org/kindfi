import { describe, expect, test } from 'bun:test'
import {
	ADMIN_DEFAULT_PAGE_SIZE,
	ADMIN_MAX_PAGE_SIZE,
	adminProjectsQuerySchema,
	adminUsersQuerySchema,
	buildAdminListQueryString,
	normalizeAdminListParams,
	parseAdminListParams,
} from '~/lib/validators/admin-list-params'

describe('admin list params', () => {
	test('applies defaults when no params are provided', () => {
		const params = parseAdminListParams(adminProjectsQuerySchema, new URLSearchParams())
		expect(params.page).toBe(1)
		expect(params.pageSize).toBe(ADMIN_DEFAULT_PAGE_SIZE)
		expect(params.sort).toBe('newest')
		expect(params.status).toBeUndefined()
		expect(params.q).toBeUndefined()
	})

	test('parses valid filters', () => {
		const params = parseAdminListParams(
			adminProjectsQuerySchema,
			new URLSearchParams('status=review&escrow=none&sort=funding&page=3&q=water'),
		)
		expect(params.status).toBe('review')
		expect(params.escrow).toBe('none')
		expect(params.sort).toBe('funding')
		expect(params.page).toBe(3)
		expect(params.q).toBe('water')
	})

	test('invalid values fall back safely instead of failing', () => {
		const params = parseAdminListParams(
			adminProjectsQuerySchema,
			new URLSearchParams('status=bogus&sort=nope&page=-4&pageSize=9999&from=not-a-date'),
		)
		expect(params.status).toBeUndefined()
		expect(params.sort).toBe('newest')
		expect(params.page).toBe(1)
		expect(params.pageSize).toBe(ADMIN_DEFAULT_PAGE_SIZE)
		expect(params.from).toBeUndefined()
	})

	test('caps pageSize at the maximum', () => {
		const params = parseAdminListParams(
			adminProjectsQuerySchema,
			new URLSearchParams(`pageSize=${ADMIN_MAX_PAGE_SIZE + 1}`),
		)
		expect(params.pageSize).toBe(ADMIN_DEFAULT_PAGE_SIZE)
	})

	test('users schema validates kyc and wallet filters', () => {
		const valid = parseAdminListParams(
			adminUsersQuerySchema,
			new URLSearchParams('kyc=not_started&wallet=pollar&provider=pollar&role=admin'),
		)
		expect(valid.kyc).toBe('not_started')
		expect(valid.wallet).toBe('pollar')
		expect(valid.provider).toBe('pollar')
		expect(valid.role).toBe('admin')

		const invalid = parseAdminListParams(
			adminUsersQuerySchema,
			new URLSearchParams('kyc=hacked&wallet=all'),
		)
		expect(invalid.kyc).toBeUndefined()
		expect(invalid.wallet).toBeUndefined()
	})

	test('normalizeAdminListParams sorts keys and drops empty values', () => {
		const normalized = normalizeAdminListParams({
			sort: 'newest',
			page: 2,
			q: undefined,
			status: '',
			escrow: 'none',
		})
		expect(Object.keys(normalized)).toEqual(['escrow', 'page', 'sort'])
		expect(normalized.page).toBe('2')
	})

	test('normalization is stable regardless of insertion order', () => {
		const a = normalizeAdminListParams({ page: 1, sort: 'newest', status: 'review' })
		const b = normalizeAdminListParams({ status: 'review', sort: 'newest', page: 1 })
		expect(JSON.stringify(a)).toBe(JSON.stringify(b))
	})

	test('buildAdminListQueryString produces a canonical query string', () => {
		const query = buildAdminListQueryString({ sort: 'newest', page: 2, q: 'clean water' })
		expect(query).toBe('page=2&q=clean+water&sort=newest')
	})
})
