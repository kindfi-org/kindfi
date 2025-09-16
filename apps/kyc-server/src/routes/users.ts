import { db, kycReviews, profiles, devices } from '@packages/drizzle'
import { and, count, desc, asc, ilike, eq, sql } from 'drizzle-orm'
import { corsConfig } from '../config/cors'
import { withCORS } from '../middleware/cors'
import { handleError } from '../utils/error-handler'

const withConfiguredCORS = (
	handler: (req: Request) => Response | Promise<Response>,
) => withCORS(handler, corsConfig)

interface UsersQueryParams {
	page?: string
	limit?: string
	search?: string
	status?: string
	verificationLevel?: string
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
}

export const usersRoutes = {
	'/api/users': {
		async GET(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const url = new URL(req.url)
					const params: UsersQueryParams = {
						page: url.searchParams.get('page') || '1',
						limit: url.searchParams.get('limit') || '10',
						search: url.searchParams.get('search') || '',
						status: url.searchParams.get('status') || '',
						verificationLevel: url.searchParams.get('verificationLevel') || '',
						sortBy: url.searchParams.get('sortBy') || 'created_at',
						sortOrder:
							(url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
					}

					const page = parseInt(params.page || '1', 10)
					const limit = Math.min(parseInt(params.limit || '10', 10), 100)
					const offset = (page - 1) * limit

					// Build where conditions
					const conditions = []
					
					if (params.status && ['pending', 'approved', 'rejected', 'verified'].includes(params.status)) {
						conditions.push(eq(kycReviews.status, params.status as 'pending' | 'approved' | 'rejected' | 'verified'))
					}
					
					if (params.verificationLevel && ['basic', 'enhanced'].includes(params.verificationLevel)) {
						conditions.push(eq(kycReviews.verificationLevel, params.verificationLevel as 'basic' | 'enhanced'))
					}
					
					if (params.search) {
						conditions.push(ilike(kycReviews.userId, `%${params.search}%`))
					}

					const whereClause = conditions.length > 0 ? and(...conditions) : undefined

					// Build order by
					const orderBy = []
					orderBy.push(desc(kycReviews.status)) // Always sort by status first
					
					if (params.sortBy === 'created_at') {
						orderBy.push(params.sortOrder === 'asc' ? asc(kycReviews.createdAt) : desc(kycReviews.createdAt))
					} else if (params.sortBy === 'updated_at') {
						orderBy.push(params.sortOrder === 'asc' ? asc(kycReviews.updatedAt) : desc(kycReviews.updatedAt))
					} else if (params.sortBy === 'verification_level') {
						orderBy.push(params.sortOrder === 'asc' ? asc(kycReviews.verificationLevel) : desc(kycReviews.verificationLevel))
					} else {
						orderBy.push(desc(kycReviews.createdAt))
					}

					// Get total count
					const [totalResult] = await db
						.select({ count: count() })
						.from(kycReviews)
						.where(whereClause)

					const totalCount = totalResult?.count || 0

					// Get users with profile and device info
					const users = await db
						.select({
							id: kycReviews.id,
							user_id: kycReviews.userId,
							status: kycReviews.status,
							verification_level: kycReviews.verificationLevel,
							reviewer_id: kycReviews.reviewerId,
							notes: kycReviews.notes,
							created_at: kycReviews.createdAt,
							updated_at: kycReviews.updatedAt,
							// Profile data
							email: profiles.email,
							display_name: profiles.displayName,
							profile_image_url: profiles.imageUrl,
							profile_role: profiles.role,
							// Device count (non-sensitive info)
							device_count: sql<number>`count(${devices.id})`.as('device_count'),
						})
						.from(kycReviews)
						.leftJoin(profiles, eq(kycReviews.userId, profiles.id))
						.leftJoin(devices, eq(kycReviews.userId, devices.userId))
						.where(whereClause)
						.groupBy(
							kycReviews.id,
							kycReviews.userId,
							kycReviews.status,
							kycReviews.verificationLevel,
							kycReviews.reviewerId,
							kycReviews.notes,
							kycReviews.createdAt,
							kycReviews.updatedAt,
							profiles.email,
							profiles.displayName,
							profiles.imageUrl,
							profiles.role
						)
						.orderBy(...orderBy)
						.limit(limit)
						.offset(offset)

					return Response.json({
						success: true,
						data: users,
						pagination: {
							page,
							limit,
							total: totalCount,
							totalPages: Math.ceil(totalCount / limit),
						},
						filters: {
							search: params.search,
							status: params.status,
							verificationLevel: params.verificationLevel,
							sortBy: params.sortBy,
							sortOrder: params.sortOrder,
						},
					})
				} catch (error) {
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},

	'/api/users/stats': {
		async GET(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					// Get all status counts
					const statusCounts = await db
						.select({
							status: kycReviews.status,
							count: count(),
						})
						.from(kycReviews)
						.groupBy(kycReviews.status)

					const stats = statusCounts.reduce(
						(acc, item) => {
							acc.totalUsers += item.count
							acc[item.status] = item.count
							return acc
						},
						{
							totalUsers: 0,
							pending: 0,
							approved: 0,
							rejected: 0,
						}
					)

					// Get recent users (last 30 days)
					const thirtyDaysAgo = new Date()
					thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

					const recentCounts = await db
						.select({
							status: kycReviews.status,
							count: count(),
						})
						.from(kycReviews)
						.where(sql`${kycReviews.createdAt} >= ${thirtyDaysAgo.toISOString()}`)
						.groupBy(kycReviews.status)

					const recentStats = recentCounts.reduce(
						(acc, item) => {
							acc.totalUsers += item.count
							acc[item.status] = item.count
							return acc
						},
						{
							totalUsers: 0,
							pending: 0,
							approved: 0,
							rejected: 0,
						}
					)

					const calculateTrend = (current: number, recent: number) => ({
						value: recent > 0 ? (recent / Math.max(current, 1)) * 100 : 0,
						isPositive: recent > 0,
					})

					return Response.json({
						success: true,
						data: {
							totalUsers: stats.totalUsers,
							pending: stats.pending,
							approved: stats.approved,
							rejected: stats.rejected,
							trends: {
								totalUsers: calculateTrend(
									stats.totalUsers,
									recentStats.totalUsers,
								),
								pending: calculateTrend(stats.pending, recentStats.pending),
								approved: calculateTrend(stats.approved, recentStats.approved),
								rejected: calculateTrend(stats.rejected, recentStats.rejected),
							},
						},
					})
				} catch (error) {
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},

	'/api/users/:id/status': {
		async PATCH(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const url = new URL(req.url)
					const pathSegments = url.pathname.split('/')
					const userId = pathSegments[pathSegments.length - 2] // Extract user ID from URL

					if (!userId) {
						return Response.json(
							{ error: 'User ID is required' },
							{ status: 400 },
						)
					}

					const body = await req.json()
					const { status, notes } = body

					if (
						!status ||
						!['pending', 'approved', 'rejected', 'verified'].includes(status)
					) {
						return Response.json(
							{
								error:
									'Invalid status. Must be one of: pending, approved, rejected, verified',
							},
							{ status: 400 },
						)
					}

					console.log(`🔄 Updating KYC status for user ${userId} to ${status}`)

					const result = await db
						.update(kycReviews)
						.set({
							status: status as 'pending' | 'approved' | 'rejected' | 'verified',
							notes: notes || null,
							updatedAt: new Date().toISOString(),
						})
						.where(eq(kycReviews.userId, userId))
						.returning()

					if (!result || result.length === 0) {
						return Response.json({ error: 'User not found' }, { status: 404 })
					}

					console.log(`✅ Successfully updated KYC status for user ${userId}`)

					return Response.json({
						success: true,
						data: result[0],
						message: `KYC status updated to ${status}`,
					})
				} catch (error) {
					console.error('Error updating KYC status:', error)
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},

	'/api/kyc-reviews/:id/status': {
		async PATCH(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const url = new URL(req.url)
					const pathSegments = url.pathname.split('/')
					const recordId = pathSegments[pathSegments.length - 2] // Extract record ID from URL

					if (!recordId) {
						return Response.json(
							{ error: 'Record ID is required' },
							{ status: 400 },
						)
					}

					const body = await req.json()
					const { status, notes } = body

					if (
						!status ||
						!['pending', 'approved', 'rejected', 'verified'].includes(status)
					) {
						return Response.json(
							{
								error:
									'Invalid status. Must be one of: pending, approved, rejected, verified',
							},
							{ status: 400 },
						)
					}

					// Use the primary key (id) instead of user_id to ensure only one record is updated
					const result = await db
						.update(kycReviews)
						.set({
							status: status as 'pending' | 'approved' | 'rejected' | 'verified',
							notes: notes || null,
							updatedAt: new Date().toISOString(),
						})
						.where(eq(kycReviews.id, recordId))
						.returning()

					if (!result || result.length === 0) {
						return Response.json({ error: 'Record not found' }, { status: 404 })
					}

					return Response.json({
						success: true,
						data: result[0],
						message: `KYC status updated to ${status}`,
					})
				} catch (error) {
					console.error('Error updating KYC status:', error)
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},
}