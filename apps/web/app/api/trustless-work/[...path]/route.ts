import { proxyTrustlessWorkRequest } from '~/lib/services/trustless-work-proxy.service'

type RouteContext = {
	params: Promise<{ path: string[] }>
}

const handleRequest = async (request: Request, context: RouteContext): Promise<Response> => {
	const { path } = await context.params
	return proxyTrustlessWorkRequest(request, path ?? [])
}

export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
