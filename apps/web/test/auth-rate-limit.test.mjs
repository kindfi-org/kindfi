import fetch from 'node-fetch'

async function testOtpVerification() {
	const baseUrl = 'http://localhost:3002/auth/confirm'
	const testParams = {
		// Using a more realistic token hash format
		token_hash: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
		type: 'email',
	}

	console.log('Starting OTP verification rate limit test...\n')

	// Function to make a verification request
	async function makeRequest(attempt) {
		const url = `${baseUrl}?token_hash=${testParams.token_hash}&type=${testParams.type}`

		try {
			const response = await fetch(url)
			const redirectUrl = response.url

			console.log(`Attempt ${attempt}:`)
			console.log(`Status: ${response.status}`)
			console.log(`Redirect URL: ${redirectUrl}`)

			if (redirectUrl.includes('rate_limit_exceeded')) {
				console.log('Rate limit exceeded ✓')
			} else if (redirectUrl.includes('error')) {
				console.log('Error:', new URL(redirectUrl).searchParams.get('error'))
			}
			console.log('---')

			return response
		} catch (error) {
			console.error(`Error in attempt ${attempt}:`, error)
			return null
		}
	}

	// Make multiple requests to trigger rate limiting
	for (let i = 1; i <= 6; i++) {
		await makeRequest(i)
		// Add a small delay between requests
		await new Promise((resolve) => setTimeout(resolve, 1000))
	}
}

// Run the test
testOtpVerification().catch(console.error)
