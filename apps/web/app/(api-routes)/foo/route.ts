export async function GET() {
	return new Response(
		JSON.stringify({ message: 'Hello from the foo route!' }),
		{
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		},
	)
}

export async function POST() {
	return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
		status: 405,
		headers: { 'Content-Type': 'application/json' },
	})
}
