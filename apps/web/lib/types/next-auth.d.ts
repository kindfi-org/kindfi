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
		} & DefaultSession['user']
		supabaseAccessToken?: string
		device?: {
			credential_id: string
			public_key: string
			address: string
		}
	}

	interface User {
		userData?: {
			role?: string
			display_name?: string
			bio?: string
			image_url?: string
		}
		device?: {
			credential_id: string
			public_key: string
			address: string
		}
	}

	interface JWT {
		role?: string
		provider?: string
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
		device?: {
			credential_id: string
			public_key: string
			address: string
		}
		supabaseAccessToken?: string
	}
}
