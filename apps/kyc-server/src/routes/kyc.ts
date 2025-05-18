// Helper function to add CORS headers
const addCorsHeaders = (response: Response): Response => {
	response.headers.set('Access-Control-Allow-Origin', '*')
	response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
	response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
	return response
}

export const kycRoutes = {
	'/api/kyc/step1': {
		POST: async (req: Request): Promise<Response> => {
			try {
				const data = await req.json()
				console.log('Received KYC step 1 data:', data)

				const { fullName, dateOfBirth, nationality } = data
				if (!fullName || typeof fullName !== 'string' || fullName.length < 3) {
					return addCorsHeaders(
						new Response(
							JSON.stringify({ error: 'Invalid or missing fullName' }),
							{ status: 400, headers: { 'Content-Type': 'application/json' } },
						),
					)
				}
				if (!dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
					return addCorsHeaders(
						new Response(
							JSON.stringify({ error: 'Invalid or missing dateOfBirth' }),
							{ status: 400, headers: { 'Content-Type': 'application/json' } },
						),
					)
				}
				if (
					!nationality ||
					typeof nationality !== 'string' ||
					nationality.length < 1
				) {
					return addCorsHeaders(
						new Response(
							JSON.stringify({ error: 'Invalid or missing nationality' }),
							{ status: 400, headers: { 'Content-Type': 'application/json' } },
						),
					)
				}

				return addCorsHeaders(
					new Response(
						JSON.stringify({
							success: true,
							message: 'KYC step 1 completed',
							data,
						}),
						{ status: 200, headers: { 'Content-Type': 'application/json' } },
					),
				)
			} catch (error) {
				console.error('Error processing KYC step 1:', error)
				return addCorsHeaders(
					new Response(JSON.stringify({ error: 'Internal server error' }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					}),
				)
			}
		},
		OPTIONS: async (req: Request): Promise<Response> => {
			return addCorsHeaders(new Response(null, { status: 204 }))
		},
	},
}
