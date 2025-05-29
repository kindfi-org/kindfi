export const appConfig = {
	auth: {
		secret: process.env.NEXTAUTH_SECRET,
		url: process.env.NEXTAUTH_URL,
		token: {
			expiration: process.env.JWT_TOKEN_EXPIRATION
				? Number.parseInt(process.env.JWT_TOKEN_EXPIRATION, 10)
				: 60 * 60 * 24 * 30, // Default to 30 days
			update: process.env.NEXT_PUBLIC_JWT_TOKEN_UPDATE
				? Number.parseInt(process.env.NEXT_PUBLIC_JWT_TOKEN_UPDATE, 10)
				: 60 * 60 * 24, // Default to 24 hours
		},
	},
	features: {
		enableEscrowFeature:
			process.env.NODE_ENV === 'development' ||
			process.env.NEXT_PUBLIC_ENABLE_ESCROW_FEATURE === 'true',
	},
} as const
