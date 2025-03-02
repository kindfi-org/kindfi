/**
 * Example client-side code for interacting with the Passkey Authentication API
 *
 * This example demonstrates how to:
 * 1. Register a new passkey
 * 2. Authenticate with a passkey
 * 3. Properly include the origin parameter in all requests
 */

// API base URL - replace with your actual API URL
const API_BASE_URL = 'https://api.example.com'

/**
 * Register a new passkey for a user
 * @param {string} identifier - User identifier (e.g., email)
 * @returns {Promise<boolean>} - Whether registration was successful
 */
async function registerPasskey(identifier) {
	try {
		// Step 1: Get registration options
		const optionsResponse = await fetch(
			`${API_BASE_URL}/api/passkey/generate-registration-options`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identifier,
					origin: window.location.origin, // Always include the current origin
				}),
			},
		)

		if (!optionsResponse.ok) {
			const error = await optionsResponse.json()
			throw new Error(error.error || 'Failed to get registration options')
		}

		const options = await optionsResponse.json()

		// Step 2: Create credentials using the browser's WebAuthn API
		// The options returned by the server need to be properly formatted for navigator.credentials.create()
		const credential = await navigator.credentials.create({
			publicKey: options,
		})

		// Step 3: Verify the registration with the server
		const verificationResponse = await fetch(
			`${API_BASE_URL}/api/passkey/verify-registration`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identifier,
					origin: window.location.origin, // Always include the current origin
					registrationResponse: credential, // This needs to be properly formatted for the server
				}),
			},
		)

		if (!verificationResponse.ok) {
			const error = await verificationResponse.json()
			throw new Error(error.error || 'Failed to verify registration')
		}

		const result = await verificationResponse.json()
		return result.verified === true
	} catch (error) {
		console.error('Passkey registration error:', error)
		return false
	}
}

/**
 * Authenticate a user with a passkey
 * @param {string} identifier - User identifier (e.g., email)
 * @returns {Promise<boolean>} - Whether authentication was successful
 */
async function authenticateWithPasskey(identifier) {
	try {
		// Step 1: Get authentication options
		const optionsResponse = await fetch(
			`${API_BASE_URL}/api/passkey/generate-authentication-options`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identifier,
					origin: window.location.origin, // Always include the current origin
				}),
			},
		)

		if (!optionsResponse.ok) {
			const error = await optionsResponse.json()
			throw new Error(error.error || 'Failed to get authentication options')
		}

		const options = await optionsResponse.json()

		// Step 2: Get credentials using the browser's WebAuthn API
		// The options returned by the server need to be properly formatted for navigator.credentials.get()
		const credential = await navigator.credentials.get({
			publicKey: options,
		})

		// Step 3: Verify the authentication with the server
		const verificationResponse = await fetch(
			`${API_BASE_URL}/api/passkey/verify-authentication`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identifier,
					origin: window.location.origin, // Always include the current origin
					authenticationResponse: credential, // This needs to be properly formatted for the server
				}),
			},
		)

		if (!verificationResponse.ok) {
			const error = await verificationResponse.json()
			throw new Error(error.error || 'Failed to verify authentication')
		}

		const result = await verificationResponse.json()
		return result.verified === true
	} catch (error) {
		console.error('Passkey authentication error:', error)
		return false
	}
}

// Example usage in a web application
document.addEventListener('DOMContentLoaded', () => {
	// Registration form
	const registrationForm = document.getElementById('registration-form')
	if (registrationForm) {
		registrationForm.addEventListener('submit', async (event) => {
			event.preventDefault()
			const email = document.getElementById('email').value

			const success = await registerPasskey(email)
			if (success) {
				alert('Passkey registered successfully!')
			} else {
				alert('Failed to register passkey. Please try again.')
			}
		})
	}

	// Authentication form
	const authForm = document.getElementById('auth-form')
	if (authForm) {
		authForm.addEventListener('submit', async (event) => {
			event.preventDefault()
			const email = document.getElementById('auth-email').value

			const success = await authenticateWithPasskey(email)
			if (success) {
				alert('Authentication successful!')
			} else {
				alert('Authentication failed. Please try again.')
			}
		})
	}
})
