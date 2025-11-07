import { db, devices, kycReviews, profiles } from '@packages/drizzle'
import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { corsConfig } from '../config/cors'
import { handleError } from '../lib/error-handler'
import {
	isSupabaseConfigured,
	supabaseServiceRole,
} from '../lib/supabase-client'
import { withCORS } from '../middleware/cors'

const withConfiguredCORS = (
	handler: (req: Request) => Response | Promise<Response>,
) => withCORS(handler, corsConfig)

// Helper to escape SQL LIKE wildcards
const escapeLike = (str: string): string => {
	return str.replace(/[%_]/g, '\\$&')
}

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

					// Build where conditions for profiles (all users)
					const profileConditions = []
					const kycConditions = []

					// Apply status filter only if specified
					if (
						params.status &&
						['pending', 'approved', 'rejected', 'verified'].includes(
							params.status,
						)
					) {
						kycConditions.push(
							eq(
								kycReviews.status,
								params.status as
									| 'pending'
									| 'approved'
									| 'rejected'
									| 'verified',
							),
						)
					}

					if (
						params.verificationLevel &&
						['basic', 'enhanced'].includes(params.verificationLevel)
					) {
						kycConditions.push(
							eq(
								kycReviews.verificationLevel,
								params.verificationLevel as 'basic' | 'enhanced',
							),
						)
					}

					if (params.search) {
						const escapedSearch = escapeLike(params.search)
						profileConditions.push(
							or(
								ilike(profiles.id, `%${escapedSearch}%`),
								ilike(profiles.email, `%${escapedSearch}%`),
								ilike(profiles.displayName, `%${escapedSearch}%`),
							),
						)
					}

					const profileWhereClause =
						profileConditions.length > 0 ? and(...profileConditions) : undefined
					const kycWhereClause =
						kycConditions.length > 0 ? and(...kycConditions) : undefined

					// Build order by - prioritize pending status first if filtering by status
					const orderBy = []
					if (params.status) {
						// Custom status ordering when filtering: pending first
						orderBy.push(sql`CASE 
							WHEN ${kycReviews.status} = 'pending' THEN 0
							WHEN ${kycReviews.status} = 'approved' THEN 1  
							WHEN ${kycReviews.status} = 'rejected' THEN 2
							WHEN ${kycReviews.status} = 'verified' THEN 3
							ELSE 4
						END`)
					}

					if (params.sortBy === 'created_at') {
						orderBy.push(
							params.sortOrder === 'asc'
								? asc(profiles.createdAt)
								: desc(profiles.createdAt),
						)
					} else if (params.sortBy === 'updated_at') {
						orderBy.push(
							params.sortOrder === 'asc'
								? asc(profiles.updatedAt)
								: desc(profiles.updatedAt),
						)
					} else if (params.sortBy === 'verification_level') {
						orderBy.push(
							params.sortOrder === 'asc'
								? asc(kycReviews.verificationLevel)
								: desc(kycReviews.verificationLevel),
						)
					} else {
						orderBy.push(desc(profiles.createdAt))
					}

					// Get total count of profiles matching search criteria
					const [totalProfilesResult] = await db
						.select({ count: count() })
						.from(profiles)
						.where(profileWhereClause)

					const totalProfiles = totalProfilesResult?.count || 0

					// Get users with their KYC status (if any) and device info
					const usersQuery = db
						.select({
							id: profiles.id,
							user_id: profiles.id,
							// KYC data (null if user hasn't started KYC)
							kyc_id: kycReviews.id,
							status: kycReviews.status,
							verification_level: kycReviews.verificationLevel,
							reviewer_id: kycReviews.reviewerId,
							notes: kycReviews.notes,
							kyc_created_at: kycReviews.createdAt,
							kyc_updated_at: kycReviews.updatedAt,
							// Profile data
							email: profiles.email,
							display_name: profiles.displayName,
							profile_image_url: profiles.imageUrl,
							profile_role: profiles.role,
							created_at: profiles.createdAt,
							updated_at: profiles.updatedAt,
							// Device count (non-sensitive info)
							device_count: sql<number>`count(DISTINCT ${devices.id})`.as(
								'device_count',
							),
						})
						.from(profiles)
						.leftJoin(kycReviews, eq(profiles.id, kycReviews.userId))
						.leftJoin(devices, eq(profiles.id, devices.userId))
						.where(
							profileWhereClause
								? and(profileWhereClause, kycWhereClause)
								: kycWhereClause,
						)
						.groupBy(
							profiles.id,
							profiles.email,
							profiles.displayName,
							profiles.imageUrl,
							profiles.role,
							profiles.createdAt,
							profiles.updatedAt,
							kycReviews.id,
							kycReviews.userId,
							kycReviews.status,
							kycReviews.verificationLevel,
							kycReviews.reviewerId,
							kycReviews.notes,
							kycReviews.createdAt,
							kycReviews.updatedAt,
						)

					// Apply ordering
					const users = await usersQuery
						.orderBy(...orderBy)
						.limit(limit)
						.offset(offset)

					return Response.json({
						success: true,
						data: users,
						pagination: {
							page,
							limit,
							total: totalProfiles,
							totalPages: Math.ceil(totalProfiles / limit),
						},
						filters: {
							search: params.search,
							status: params.status,
							verificationLevel: params.verificationLevel,
							sortBy: params.sortBy,
							sortOrder: params.sortOrder,
						},
						meta: {
							totalUsers: totalProfiles,
							totalWithKyc: users.filter((u) => u.kyc_id !== null).length,
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
					// Get total users from profiles table (all registered users)
					const [totalUsersResult] = await db
						.select({ count: count() })
						.from(profiles)

					const totalUsers = totalUsersResult?.count || 0

					// Get KYC status counts
					const statusCounts = await db
						.select({
							status: kycReviews.status,
							count: count(),
						})
						.from(kycReviews)
						.groupBy(kycReviews.status)

					const kycStats = statusCounts.reduce(
						(acc, item) => {
							if (item.status !== 'verified') {
								acc[item.status] = item.count
							}
							return acc
						},
						{
							pending: 0,
							approved: 0,
							rejected: 0,
						},
					)

					// Period-over-period trend calculation (last 30 days vs prior 30 days)
					const thirtyDaysAgo = new Date()
					thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

					const sixtyDaysAgo = new Date()
					sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

					// Total users registered in last 30 days
					const [currentPeriodUsersResult] = await db
						.select({ count: count() })
						.from(profiles)
						.where(sql`${profiles.createdAt} >= ${thirtyDaysAgo.toISOString()}`)

					const currentPeriodTotalUsers = currentPeriodUsersResult?.count || 0

					// Total users registered in prior 30 days (30-60 days ago)
					const [priorPeriodUsersResult] = await db
						.select({ count: count() })
						.from(profiles)
						.where(
							sql`${profiles.createdAt} >= ${sixtyDaysAgo.toISOString()} AND ${profiles.createdAt} < ${thirtyDaysAgo.toISOString()}`,
						)

					const priorPeriodTotalUsers = priorPeriodUsersResult?.count || 0

					// KYC status counts for last 30 days
					const currentPeriodCounts = await db
						.select({
							status: kycReviews.status,
							count: count(),
						})
						.from(kycReviews)
						.where(
							sql`${kycReviews.createdAt} >= ${thirtyDaysAgo.toISOString()}`,
						)
						.groupBy(kycReviews.status)

					const currentPeriodStats = currentPeriodCounts.reduce(
						(acc, item) => {
							if (item.status !== 'verified') {
								acc[item.status] = item.count
							}
							return acc
						},
						{
							pending: 0,
							approved: 0,
							rejected: 0,
						},
					)

					// KYC status counts for prior 30 days (30-60 days ago)
					const priorPeriodCounts = await db
						.select({
							status: kycReviews.status,
							count: count(),
						})
						.from(kycReviews)
						.where(
							sql`${kycReviews.createdAt} >= ${sixtyDaysAgo.toISOString()} AND ${kycReviews.createdAt} < ${thirtyDaysAgo.toISOString()}`,
						)
						.groupBy(kycReviews.status)

					const priorPeriodStats = priorPeriodCounts.reduce(
						(acc, item) => {
							if (item.status !== 'verified') {
								acc[item.status] = item.count
							}
							return acc
						},
						{
							pending: 0,
							approved: 0,
							rejected: 0,
						},
					)

					const calculateTrend = (currentCount: number, priorCount: number) => {
						const delta = currentCount - priorCount
						const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same'
						const percentChange =
							priorCount > 0
								? (delta / priorCount) * 100
								: currentCount > 0
									? 100
									: 0

						return {
							currentCount,
							priorCount,
							delta,
							direction,
							percentChange: Math.round(percentChange * 10) / 10, // Round to 1 decimal
							isPositive: delta >= 0,
						}
					}

					return Response.json({
						success: true,
						data: {
							totalUsers,
							pending: kycStats.pending,
							approved: kycStats.approved,
							rejected: kycStats.rejected,
							trends: {
								totalUsers: calculateTrend(
									currentPeriodTotalUsers,
									priorPeriodTotalUsers,
								),
								pending: calculateTrend(
									currentPeriodStats.pending,
									priorPeriodStats.pending,
								),
								approved: calculateTrend(
									currentPeriodStats.approved,
									priorPeriodStats.approved,
								),
								rejected: calculateTrend(
									currentPeriodStats.rejected,
									priorPeriodStats.rejected,
								),
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
							status: status as
								| 'pending'
								| 'approved'
								| 'rejected'
								| 'verified',
							notes: notes || null,
							updatedAt: new Date().toISOString(),
						})
						.where(eq(kycReviews.userId, userId))
						.returning()

					if ((!result || result.length === 0) && status === 'pending') {
						// No KYC record found. Creating an initial review.
						const newReview = await db
							.insert(kycReviews)
							.values({
								userId,
								status,
								notes: notes || null,
								verificationLevel: 'basic', // <-- Add default verificationLevel
								createdAt: new Date().toISOString(),
								updatedAt: new Date().toISOString(),
							})
							.returning()

						if (!newReview || newReview.length === 0) {
							return Response.json(
								{ error: 'Failed to create KYC review' },
								{ status: 500 },
							)
						}

						console.log(
							`✅ Successfully created initial KYC review for user ${userId}`,
						)
					} else if (!result || result.length === 0) {
						return Response.json(
							{ error: 'KYC review not found for user' },
							{ status: 404 },
						)
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
		async GET(req: Request) {
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

					console.log(`🔍 Fetching comprehensive data for user ${userId}`)

					// 1. Get user profile
					const [userProfile] = await db
						.select()
						.from(profiles)
						.where(eq(profiles.id, userId))
						.limit(1)

					if (!userProfile) {
						return Response.json(
							{ error: 'User profile not found' },
							{ status: 404 },
						)
					}

					// 2. Get KYC review record (if exists)
					const [kycReview] = await db
						.select()
						.from(kycReviews)
						.where(eq(kycReviews.userId, userId))
						// Get the latest created first
						.orderBy(desc(kycReviews.createdAt))
						.limit(1)

					// 3. Get user devices
					const userDevices = await db
						.select()
						.from(devices)
						.where(eq(devices.userId, userId))

					// 4. Check for KYC documents in Supabase storage bucket
					let kycDocuments: {
						hasDocuments: boolean
						documentCount: number
						documents: Array<{ name: string; size: number; updatedAt: string }>
					} = {
						hasDocuments: false,
						documentCount: 0,
						documents: [],
					}

					// Only check storage if Supabase is configured
					if (isSupabaseConfigured()) {
						try {
							const { data: files, error: storageError } =
								await supabaseServiceRole.storage.from('kyc').list(userId, {
									limit: 100,
									sortBy: { column: 'updated_at', order: 'desc' },
								})

							if (storageError) {
								console.warn(
									`⚠️ Storage error for user ${userId}:`,
									storageError.message,
								)
							} else if (files && files.length > 0) {
								kycDocuments = {
									hasDocuments: true,
									documentCount: files.length,
									documents: files.map((file) => ({
										name: file.name,
										size: file.metadata?.size || 0,
										updatedAt: file.updated_at || file.created_at,
									})),
								}
							}
						} catch (storageErr) {
							console.error(`❌ Failed to check storage for user ${userId}:`, {
								error:
									storageErr instanceof Error
										? storageErr.message
										: String(storageErr),
							})
						}
					} else {
						console.warn(
							'⚠️ Supabase storage not configured, skipping document check',
						)
					}

					// 5. Compile comprehensive response
					const userDetails = {
						profile: {
							id: userProfile.id,
							email: userProfile.email,
							displayName: userProfile.displayName,
							bio: userProfile.bio,
							imageUrl: userProfile.imageUrl,
							role: userProfile.role,
							slug: userProfile.slug,
							createdAt: userProfile.createdAt,
							updatedAt: userProfile.updatedAt,
						},
						kyc: kycReview
							? {
									id: kycReview.id,
									status: kycReview.status,
									verificationLevel: kycReview.verificationLevel,
									reviewerId: kycReview.reviewerId,
									notes: kycReview.notes,
									createdAt: kycReview.createdAt,
									updatedAt: kycReview.updatedAt,
								}
							: null,
						devices: {
							count: userDevices.length,
							devices: userDevices.map((device) => ({
								id: device.id,
								deviceName: device.deviceName,
								deviceType: device.deviceType,
								credentialType: device.credentialType,
								backupState: device.backupState,
								createdAt: device.createdAt,
								lastUsedAt: device.lastUsedAt,
								publicKey: `${device.publicKey.slice(0, 8)}...${device.publicKey.slice(-8)}`,
								address: device.address,
							})),
						},
						documents: kycDocuments,
						verification: {
							hasProfile: true,
							hasKycRecord: !!kycReview,
							hasDocuments: kycDocuments.hasDocuments,
							isComplete:
								!!kycReview &&
								kycDocuments.hasDocuments &&
								kycReview.status !== 'pending',
						},
					}

					console.log(`✅ Successfully fetched data for user ${userId}`, {
						hasKyc: !!kycReview,
						hasDocuments: kycDocuments.hasDocuments,
						documentCount: kycDocuments.documentCount,
					})

					return Response.json({
						success: true,
						data: userDetails,
					})
				} catch (error) {
					console.error('Error fetching user status:', error)
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
							status: status as
								| 'pending'
								| 'approved'
								| 'rejected'
								| 'verified',
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

	'/api/users/chart': {
		async GET(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const url = new URL(req.url)
					const period = url.searchParams.get('period') || '30d'

					// Calculate date range based on period
					let daysBack = 30
					if (period === '7d') daysBack = 7
					else if (period === '90d') daysBack = 90
					else if (period === 'all') daysBack = 365 // 1 year for 'all'

					const endDate = new Date()
					const startDate = new Date()
					startDate.setDate(startDate.getDate() - daysBack)

					// Generate array of dates for the period
					const dates: string[] = []
					const currentDate = new Date(startDate)
					while (currentDate <= endDate) {
						dates.push(currentDate.toISOString().split('T')[0])
						currentDate.setDate(currentDate.getDate() + 1)
					}

					// Query for daily signups (profiles created per day)
					const signupsQuery = await db
						.select({
							date: sql<string>`DATE(${profiles.createdAt})`.as('date'),
							count: count(),
						})
						.from(profiles)
						.where(
							sql`${profiles.createdAt} >= ${startDate.toISOString()} AND ${profiles.createdAt} <= ${endDate.toISOString()}`,
						)
						.groupBy(sql`DATE(${profiles.createdAt})`)

					// Query for daily KYC starts (kyc_reviews created per day)
					const kycStartsQuery = await db
						.select({
							date: sql<string>`DATE(${kycReviews.createdAt})`.as('date'),
							count: count(),
						})
						.from(kycReviews)
						.where(
							sql`${kycReviews.createdAt} >= ${startDate.toISOString()} AND ${kycReviews.createdAt} <= ${endDate.toISOString()}`,
						)
						.groupBy(sql`DATE(${kycReviews.createdAt})`)

					// Create lookup maps for easy access
					const signupsMap = new Map(
						signupsQuery.map((item) => [item.date, item.count]),
					)
					const kycStartsMap = new Map(
						kycStartsQuery.map((item) => [item.date, item.count]),
					)

					// Build chart data for all dates in range
					const chartData = dates.map((date) => ({
						date,
						signups: signupsMap.get(date) || 0,
						kycStarts: kycStartsMap.get(date) || 0,
					}))

					return Response.json({
						success: true,
						data: chartData,
						meta: {
							period,
							startDate: startDate.toISOString(),
							endDate: endDate.toISOString(),
							totalDays: dates.length,
						},
					})
				} catch (error) {
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},

	'/api/users/:id/reviews': {
		async GET(req: Request) {
			return withConfiguredCORS(async () => {
				try {
					const url = new URL(req.url)
					const pathSegments = url.pathname.split('/')
					const userId = pathSegments[pathSegments.length - 2]

					if (!userId) {
						return Response.json(
							{ error: 'User ID is required' },
							{ status: 400 },
						)
					}

					// Fetch all KYC reviews for this user
					const reviews = await db
						.select()
						.from(kycReviews)
						.where(eq(kycReviews.userId, userId))
						.orderBy(desc(kycReviews.createdAt))

					return Response.json({
						success: true,
						data: reviews,
					})
				} catch (error) {
					console.error('Error fetching user reviews:', error)
					return handleError(error)
				}
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	},
}
