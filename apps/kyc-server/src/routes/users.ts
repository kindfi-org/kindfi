import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_ANON_KEY!,
)

export const userRoutes = {
	'/api/users': {
		async GET(req: Request) {
			try {
				const url = new URL(req.url)
				const page = url.searchParams.get('page') || '1'
				const limit = url.searchParams.get('limit') || '20'
				const search = url.searchParams.get('search')
				const status = url.searchParams.get('status')

				const from = (parseInt(page) - 1) * parseInt(limit)
				const to = from + parseInt(limit) - 1

				let query = supabase.from('kyc_status').select('*')

				if (status) {
					query = query.eq('status', status)
				}

				query = query.order('status').order('created_at', { ascending: false })
				query = query.range(from, to)

				const { data: users, error } = await query

				if (error) {
					console.log('DB error:', error)
				}

				return Response.json({
					users: users || [],
					total: users?.length || 0,
					page: parseInt(page),
				})
			} catch (err) {
				console.log(err)
				return Response.json({ error: 'Something broke' }, { status: 500 })
			}
		},
	},

	'/api/stats': {
		async GET(req: Request) {
			try {
				const { data } = await supabase.from('kyc_status').select('status')

				if (!data) return Response.json({ error: 'No data' }, { status: 500 })

				const stats = {
					total: data.length,
					pending: data.filter((d) => d.status === 'pending').length,
					approved: data.filter((d) => d.status === 'approved').length,
					rejected: data.filter((d) => d.status === 'rejected').length,
				}

				return Response.json(stats)
			} catch (err) {
				return Response.json({ error: 'Stats failed' }, { status: 500 })
			}
		},
	},
}
