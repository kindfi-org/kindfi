import { db, eq, profiles } from '@packages/drizzle'
import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { logger } from '@/lib/logger'
import {
	activatePollarWallet,
	type PollarVerifiedSession,
	registerPollarExternalUser,
} from './verify-pollar-token'

export interface LinkedPollarProfile {
	userId: string
	email: string
	walletAddress: string
	isNewUser: boolean
	onboardingProvider: 'pollar' | 'legacy_passkey'
}

const createAuthUserWithProfile = async (input: {
	email: string
	displayName: string
	pollarUserId: string
	walletAddress: string
}): Promise<string> => {
	const { data: createdUser, error: createError } = await supabaseServiceRole.auth.admin.createUser(
		{
			email: input.email,
			email_confirm: true,
			user_metadata: {
				display_name: input.displayName,
				onboarding_provider: 'pollar',
			},
		},
	)

	if (createError || !createdUser.user) {
		throw createError ?? new Error('Failed to create auth user for Pollar onboarding')
	}

	const userId = createdUser.user.id

	const { error: profileError } = await supabaseServiceRole.from('profiles').upsert(
		{
			id: userId,
			next_auth_user_id: userId,
			email: input.email,
			display_name: input.displayName,
			role: 'pending',
			onboarding_provider: 'pollar',
			pollar_user_id: input.pollarUserId,
			pollar_wallet_address: input.walletAddress,
			external_wallet_address: input.walletAddress,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: 'id' },
	)

	if (profileError) {
		logger.error('[Pollar] Profile upsert failed after auth user creation', profileError)
		throw profileError
	}

	return userId
}

const updateProfileWithPollar = async (input: {
	userId: string
	pollarUserId: string
	walletAddress: string
	email?: string | null
	displayName?: string | null
	imageUrl?: string | null
	linkLegacy: boolean
}): Promise<void> => {
	await db
		.update(profiles)
		.set({
			onboardingProvider: 'pollar',
			pollarUserId: input.pollarUserId,
			pollarWalletAddress: input.walletAddress,
			externalWalletAddress: input.walletAddress,
			email: input.email ?? undefined,
			displayName: input.displayName ?? undefined,
			imageUrl: input.imageUrl ?? undefined,
			updatedAt: new Date().toISOString(),
			...(input.linkLegacy ? {} : {}),
		})
		.where(eq(profiles.id, input.userId))
}

/**
 * Finds or creates a KindFi profile for a verified Pollar session.
 */
export const linkPollarUserToKindFi = async (
	verified: PollarVerifiedSession,
	options: { linkToExistingUserId?: string } = {},
): Promise<LinkedPollarProfile> => {
	const email = verified.email?.trim().toLowerCase()
	if (!email) {
		throw new Error('Pollar account must include an email to link with KindFi')
	}

	const displayName =
		[verified.profile?.firstName, verified.profile?.lastName].filter(Boolean).join(' ').trim() ||
		email.split('@')[0]

	// Explicit link to logged-in legacy user
	if (options.linkToExistingUserId) {
		await updateProfileWithPollar({
			userId: options.linkToExistingUserId,
			pollarUserId: verified.pollarUserId,
			walletAddress: verified.walletAddress,
			email,
			displayName,
			imageUrl: verified.profile?.avatar ?? null,
			linkLegacy: true,
		})

		await registerPollarExternalUser({
			externalId: options.linkToExistingUserId,
			email,
			firstName: verified.profile?.firstName,
			lastName: verified.profile?.lastName,
			avatar: verified.profile?.avatar,
		})

		return {
			userId: options.linkToExistingUserId,
			email,
			walletAddress: verified.walletAddress,
			isNewUser: false,
			onboardingProvider: 'pollar',
		}
	}

	// Existing Pollar user
	const existingByPollar = await db
		.select({
			id: profiles.id,
			email: profiles.email,
			onboardingProvider: profiles.onboardingProvider,
		})
		.from(profiles)
		.where(eq(profiles.pollarUserId, verified.pollarUserId))
		.limit(1)

	if (existingByPollar[0]) {
		const row = existingByPollar[0]
		await updateProfileWithPollar({
			userId: row.id,
			pollarUserId: verified.pollarUserId,
			walletAddress: verified.walletAddress,
			email,
			displayName,
			imageUrl: verified.profile?.avatar ?? null,
			linkLegacy: false,
		})

		return {
			userId: row.id,
			email: row.email ?? email,
			walletAddress: verified.walletAddress,
			isNewUser: false,
			onboardingProvider: row.onboardingProvider === 'pollar' ? 'pollar' : 'legacy_passkey',
		}
	}

	// Match by email for legacy → Pollar upgrade
	const existingByEmail = await db
		.select({
			id: profiles.id,
			email: profiles.email,
			onboardingProvider: profiles.onboardingProvider,
		})
		.from(profiles)
		.where(eq(profiles.email, email))
		.limit(1)

	if (existingByEmail[0]) {
		const row = existingByEmail[0]
		await updateProfileWithPollar({
			userId: row.id,
			pollarUserId: verified.pollarUserId,
			walletAddress: verified.walletAddress,
			email,
			displayName,
			imageUrl: verified.profile?.avatar ?? null,
			linkLegacy: true,
		})

		await registerPollarExternalUser({
			externalId: row.id,
			email,
			firstName: verified.profile?.firstName,
			lastName: verified.profile?.lastName,
			avatar: verified.profile?.avatar,
		})

		return {
			userId: row.id,
			email: row.email ?? email,
			walletAddress: verified.walletAddress,
			isNewUser: false,
			onboardingProvider: 'pollar',
		}
	}

	// Brand new user
	const userId = await createAuthUserWithProfile({
		email,
		displayName,
		pollarUserId: verified.pollarUserId,
		walletAddress: verified.walletAddress,
	})

	await registerPollarExternalUser({
		externalId: userId,
		email,
		firstName: verified.profile?.firstName,
		lastName: verified.profile?.lastName,
		avatar: verified.profile?.avatar,
	})

	return {
		userId,
		email,
		walletAddress: verified.walletAddress,
		isNewUser: true,
		onboardingProvider: 'pollar',
	}
}

export const activatePollarWalletForProfile = async (userId: string): Promise<void> => {
	const rows = await db
		.select({
			pollarWalletAddress: profiles.pollarWalletAddress,
			pollarWalletActivatedAt: profiles.pollarWalletActivatedAt,
		})
		.from(profiles)
		.where(eq(profiles.id, userId))
		.limit(1)

	const profile = rows[0]
	if (!profile?.pollarWalletAddress) {
		return
	}

	if (profile.pollarWalletActivatedAt) {
		return
	}

	await activatePollarWallet(profile.pollarWalletAddress)

	await db
		.update(profiles)
		.set({
			pollarWalletActivatedAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		})
		.where(eq(profiles.id, userId))
}
