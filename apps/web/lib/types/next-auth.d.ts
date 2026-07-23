import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			email: string
			name: string
			image: string
			jwt: string
			role: string
			device?: {
				credential_id: string
				public_key: string
				address: string
			}
			userData?: {
				role?: string
				display_name?: string
				bio?: string
				image_url?: string
				onboarding_provider?: string
			}
			onboardingProvider?: string
			wallet?: {
				address: string
				provider: string
			}
		} & DefaultSession['user']
		supabaseAccessToken?: string
		device?: {
			credential_id: string
			public_key: string
			address: string
		}
		wallet?: {
			address: string
			provider: string
		}
		onboardingProvider?: string
	}

	interface User {
		userData?: {
			role?: string
			display_name?: string
			bio?: string
			image_url?: string
			onboarding_provider?: string
		}
		device?: {
			credential_id: string
			public_key: string
			address: string
		}
		wallet?: {
			address: string
			provider: string
		}
	}

	interface JWT {
		role?: string
		provider?: string
		onboardingProvider?: string
		wallet?: {
			address: string
			provider: string
		}
		device?: {
			credential_id: string
			public_key: string
			address: string
		}
		supabaseAccessToken?: string
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		role?: string
		provider?: string
		onboardingProvider?: string
		wallet?: {
			address: string
			provider: string
		}
		device?: {
			credential_id: string
			public_key: string
			address: string
		}
		supabaseAccessToken?: string
	}
}
