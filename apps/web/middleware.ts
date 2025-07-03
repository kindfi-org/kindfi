import { updateSession } from '@packages/lib/supabase-server'
import type { NextRequest } from 'next/server'

// * Infer the type of the first parameter of updateSession
type ExpectedRequestType = Parameters<typeof updateSession>[0]

export async function middleware(request: NextRequest) {
	// * Cast the request object through 'unknown' to the expected type.
	// ? This handles cases where TypeScript sees two NextRequest types as "incompatible"
	// ? due to different declaration origins in a monorepo setup.
	return await updateSession(request as unknown as ExpectedRequestType)
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}
