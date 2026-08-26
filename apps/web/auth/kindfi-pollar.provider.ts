import { db, eq, profiles } from '@packages/drizzle'
import type { User } from 'next-auth'
import CredentialsProvider, { type CredentialInput } from 'next-auth/providers/credentials'
import { z } from 'zod'
import { linkPollarUserToKindFi } from '~/lib/pollar/bridge/link-pollar-user'
import { verifyPollarAccessToken } from '~/lib/pollar/bridge/verify-pollar-token'

const pollarSessionSchema = z.object({
	accessToken: z.string().min(1),
	pollarUserId: z.string().min(1),
	walletAddress: z.string().min(1),
	email: z.string().email().nullable(),
	authProvider: z.string().nullable(),
	network: z.string().min(1),
	profile: z
		.object({
			firstName: z.string().nullable().optional(),
			lastName: z.string().nullable().optional(),
			avatar: z.string().nullable().optional(),
		})
		.optional(),
})

export interface KindfiPollarCredentials {
	pollarSessionJson: string
	linkToExistingUserId?: string
}

export const kindfiPollarProvider = CredentialsProvider({
	id: 'pollar',
	name: 'Pollar',
	credentials: {
		pollarSessionJson: { label: 'Pollar Session', type: 'text' },
		linkToExistingUserId: { label: 'Link To User ID', type: 'text' },
	} as Record<keyof KindfiPollarCredentials, CredentialInput>,
	async authorize(credentialsArg, _req): Promise<User | null> {
		const credentials = credentialsArg as KindfiPollarCredentials | undefined
		if (!credentials?.pollarSessionJson) {
			return null
		}

		try {
			const parsed = pollarSessionSchema.parse(JSON.parse(credentials.pollarSessionJson))
			const verified = await verifyPollarAccessToken(parsed)
			const linked = await linkPollarUserToKindFi(verified, {
				linkToExistingUserId: credentials.linkToExistingUserId || undefined,
			})

			const profileData = await db
				.select({
					id: profiles.id,
					displayName: profiles.displayName,
					bio: profiles.bio,
					imageUrl: profiles.imageUrl,
					role: profiles.role,
					onboardingProvider: profiles.onboardingProvider,
				})
				.from(profiles)
				.where(eq(profiles.id, linked.userId))
				.limit(1)

			const userData = profileData[0]
			if (!userData) {
				throw new Error('Profile not found after Pollar link')
			}

			return {
				id: linked.userId,
				email: linked.email,
				name: userData.displayName || linked.email,
				image: userData.imageUrl || null,
				wallet: {
					address: linked.walletAddress,
					provider: 'pollar',
				},
				userData: {
					role: userData.role,
					display_name: userData.displayName || undefined,
					bio: userData.bio || undefined,
					image_url: userData.imageUrl || undefined,
					onboarding_provider: userData.onboardingProvider,
				},
			}
		} catch (_error) {
			throw new Error('Pollar authentication failed')
		}
	},
})
