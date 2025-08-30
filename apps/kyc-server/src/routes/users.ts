import { supabase } from '@packages/lib/supabase/shared/service-role-client'
import { requireAuth } from '../lib/auth-guard'

export const userRoutes = {
	'/api/users': {
		async GET(req: Request) {
			return requireAuth(req, async (req, user) => {
				try {
					const url = new URL(req.url)
					const page = url.searchParams.get('page') || '1'
					const limit = url.searchParams.get('limit') || '20'
					const search = url.searchParams.get('search')
					const status = url.searchParams.get('status')

					const from = (parseInt(page) - 1) * parseInt(limit)
					const to = from + parseInt(limit) - 1

					const allowedStatuses = ['pending', 'approved', 'rejected', 'verified']

					let query = supabase.from('kyc_status').select('*', { count: 'exact' })

					if (search) {
						query = query.or(`user_id.ilike.%${search}%,id::text.ilike.%${search}%`)
					}

					if (status && allowedStatuses.includes(status)) {
						query = query.eq('status', status)
					}

					query = query.order('created_at', { ascending: false }).range(from, to)

					const { data: users, count, error } = await query

					if (error) {
						console.log('DB error:', error)
					}

					const statusPriority = { pending: 0, approved: 1, rejected: 2, verified: 3 }
					const sortedUsers = (users || []).sort((a, b) => {
						const priorityA = statusPriority[a.status as keyof typeof statusPriority] ?? 4
						const priorityB = statusPriority[b.status as keyof typeof statusPriority] ?? 4
						return priorityA - priorityB
					})

					return Response.json({
						users: sortedUsers,
						total: count || 0,
						page: parseInt(page),
					})
				} catch (err) {
					console.log(err)
					return Response.json({ error: 'Something broke' }, { status: 500 })
				}
			})
		},
	},

	'/api/stats': {
		async GET(req: Request) {
			return requireAuth(req, async (req, user) => {
				try {
					const { data, error } = await supabase.from('kyc_status').select('status', { count: 'exact' })

					if (error) {
						console.log('DB error:', error)
						return Response.json({ error: `Database error: ${error.message}` }, { status: 500 })
					}

					const statusData = data || []
					const stats = {
						total: statusData.length,
						pending: statusData.filter((d) => d.status === 'pending').length,
						approved: statusData.filter((d) => d.status === 'approved').length,
						rejected: statusData.filter((d) => d.status === 'rejected').length,
						verified: statusData.filter((d) => d.status === 'verified').length,
					}

					return Response.json(stats)
				} catch (err) {
					console.log('Unexpected error:', err)
					return Response.json({ error: 'Stats failed' }, { status: 500 })
				}
			})
		},
	},
}
