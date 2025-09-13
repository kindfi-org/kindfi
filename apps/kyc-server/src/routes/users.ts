import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TypedSupabaseClient } from '@packages/lib/types'
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

					const supabase = supabaseServiceRole as TypedSupabaseClient

					let query = supabase.from('kyc_reviews').select(`
							id,
							user_id,
							status,
							verification_level,
							reviewer_id,
							notes,
							created_at,
							updated_at
						`)

					if (
						params.status &&
						['pending', 'approved', 'rejected', 'verified'].includes(
							params.status,
						)
					) {
						query = query.eq(
							'status',
							params.status as 'pending' | 'approved' | 'rejected' | 'verified',
						)
					}
					if (
						params.verificationLevel &&
						['basic', 'enhanced'].includes(params.verificationLevel)
					) {
						query = query.eq(
							'verification_level',
							params.verificationLevel as 'basic' | 'enhanced',
						)
					}

					if (params.search) {
						query = query.ilike('user_id', `%${params.search}%`)
					}

					if (params.sortBy === 'status') {
						query = query.order('status', { ascending: false })
						query = query.order('created_at', { ascending: false })
					} else {
						query = query.order('status', { ascending: false })
						query = query.order(
							params.sortBy as
								| 'created_at'
								| 'updated_at'
								| 'verification_level',
							{ ascending: params.sortOrder === 'asc' },
						)
					}

					let countQuery = supabase
						.from('kyc_reviews')
						.select('*', { count: 'exact', head: true })

					if (
						params.status &&
						['pending', 'approved', 'rejected', 'verified'].includes(
							params.status,
						)
					) {
						countQuery = countQuery.eq(
							'status',
							params.status as 'pending' | 'approved' | 'rejected' | 'verified',
						)
					}
					if (
						params.verificationLevel &&
						['basic', 'enhanced'].includes(params.verificationLevel)
					) {
						countQuery = countQuery.eq(
							'verification_level',
							params.verificationLevel as 'basic' | 'enhanced',
						)
					}
					if (params.search) {
						countQuery = countQuery.or(`user_id.ilike.%${params.search}%`)
					}

					const { count } = await countQuery

					const { data: users, error } = await query.range(
						offset,
						offset + limit - 1,
					)

					if (error) {
						return Response.json({ error: 'Database error' }, { status: 500 })
					}

					// Quick hack to get profile data - should probably join in one query
					const userIds = users?.map((u) => u.user_id) || []
					let profiles: {
						id: string
						email: string | null
						display_name: string | null
					}[] = []

					if (userIds.length) {
						const { data } = await supabase
							.from('profiles')
							.select('id, email, display_name')
							.in('id', userIds)
						profiles = data || []
					}

					const transformedUsers =
						users?.map((user) => {
							const profile = profiles.find((p) => p.id === user.user_id)
							return {
								id: user.id,
								user_id: user.user_id,
								email: profile?.email || null,
								display_name: profile?.display_name || null,
								status: user.status,
								verification_level: user.verification_level,
								reviewer_id: user.reviewer_id,
								notes: user.notes,
								created_at: user.created_at,
								updated_at: user.updated_at,
							}
						}) || []

					return Response.json({
						success: true,
						data: transformedUsers,
						pagination: {
							page,
							limit,
							total: count || 0,
							totalPages: Math.ceil((count || 0) / limit),
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
					const supabase = supabaseServiceRole as TypedSupabaseClient

					const { data: statusCounts, error: statusError } = await supabase
						.from('kyc_reviews')
						.select('status')

					if (statusError) {
						console.error('Database error:', statusError)
						return Response.json(
							{ error: 'Failed to fetch user stats' },
							{ status: 500 },
						)
					}

					const stats = statusCounts?.reduce(
						(acc, user) => {
							acc.totalUsers++
							acc[user.status as keyof typeof acc]++
							return acc
						},
						{
							totalUsers: 0,
							pending: 0,
							approved: 0,
							rejected: 0,
						},
					) || { totalUsers: 0, pending: 0, approved: 0, rejected: 0 }

					const thirtyDaysAgo = new Date()
					thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

					const { data: recentUsers, error: recentError } = await supabase
						.from('kyc_reviews')
						.select('status, created_at')
						.gte('created_at', thirtyDaysAgo.toISOString())

					if (recentError) {
						console.error('Recent users error:', recentError)
					}

					const recentStats = recentUsers?.reduce(
						(acc, user) => {
							acc.totalUsers++
							acc[user.status as keyof typeof acc]++
							return acc
						},
						{
							totalUsers: 0,
							pending: 0,
							approved: 0,
							rejected: 0,
						},
					) || { totalUsers: 0, pending: 0, approved: 0, rejected: 0 }

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

					const supabase = supabaseServiceRole as TypedSupabaseClient

					console.log(`🔄 Updating KYC status for user ${userId} to ${status}`)

					const { data, error } = await supabase
						.from('kyc_reviews')
						.update({
							status: status as
								| 'pending'
								| 'approved'
								| 'rejected'
								| 'verified',
							notes: notes || null,
							updated_at: new Date().toISOString(),
						})
						.eq('user_id', userId)
						.select()

					if (error) {
						console.error('Database error:', error)
						return Response.json(
							{ error: 'Failed to update KYC status' },
							{ status: 500 },
						)
					}

					if (!data || data.length === 0) {
						return Response.json({ error: 'User not found' }, { status: 404 })
					}

					console.log(`✅ Successfully updated KYC status for user ${userId}`)

					return Response.json({
						success: true,
						data: data[0],
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
