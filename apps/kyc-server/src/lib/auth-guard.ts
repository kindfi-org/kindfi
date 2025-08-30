import { supabase } from '@packages/lib/supabase/shared/service-role-client'

export async function verifyAuth(req: Request): Promise<{ user: any; error?: never } | { user?: never; error: string }> {
	const authHeader = req.headers.get('Authorization')
	if (!authHeader?.startsWith('Bearer ')) {
		return { error: 'Missing or invalid authorization header' }
	}

	const token = authHeader.replace('Bearer ', '')
	const { data: user, error } = await supabase.auth.getUser(token)

	if (error || !user.user) {
		return { error: 'Invalid or expired token' }
	}

	return { user: user.user }
}

export async function requireAuth(req: Request, handler: (req: Request, user: any) => Promise<Response>): Promise<Response> {
	const authResult = await verifyAuth(req)
	
	if (authResult.error) {
		return Response.json({ error: authResult.error }, { status: 401 })
	}

	return handler(req, authResult.user)
}