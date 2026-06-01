import { sql } from 'drizzle-orm'
import {
	foreignKey,
	index,
	integer,
	pgPolicy,
	pgTable,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core'
import { usersInAuth } from './auth'
import {
	backupState,
	credentialType,
	deviceType,
	kycStatusEnum,
	kycVerificationEnum,
	profileVerificationStatus,
	userRole,
} from './enums'
import { usersInNextAuth } from './next-auth'

export const profiles = pgTable(
	'profiles',
	{
		id: uuid().primaryKey().notNull(),
		role: userRole().default('kindler').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		displayName: text('display_name').default(''),
		bio: text().default(''),
		imageUrl: text('image_url').default(''),
		email: text(),
		nextAuthUserId: uuid('next_auth_user_id'),
		slug: text('slug'),
	},
	(table) => [
		uniqueIndex('profiles_slug_key').using('btree', table.slug.asc().nullsLast().op('text_ops')),
		index('idx_profiles_next_auth_user_id').using(
			'btree',
			table.nextAuthUserId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.id],
			foreignColumns: [usersInAuth.id],
			name: 'profiles_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.nextAuthUserId],
			foreignColumns: [usersInNextAuth.id],
			name: 'profiles_next_auth_user_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.id],
			foreignColumns: [usersInNextAuth.id],
			name: 'profiles_id_fkey1',
		})
			.onUpdate('cascade')
			.onDelete('cascade'),
		pgPolicy('Public read access to profiles', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Users can insert their own profile', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('Users can update their own profile', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('Users can view their own profile via NextAuth', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
		}),
		pgPolicy('Users can update their own profile via NextAuth', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('Service role can manage all profiles', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
		}),
	],
)

export const kycReviews = pgTable(
	'kyc_reviews',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid('user_id').notNull(),
		status: kycStatusEnum().notNull(),
		verificationLevel: kycVerificationEnum('verification_level').notNull(),
		reviewerId: uuid('reviewer_id').default(sql`auth.uid()`),
		notes: text(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('idx_kyc_reviews_reviewer_id').using(
			'btree',
			table.reviewerId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_kyc_reviews_user_id').using('btree', table.userId.asc().nullsLast().op('uuid_ops')),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'kyc_reviews_user_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.reviewerId],
			foreignColumns: [usersInAuth.id],
			name: 'kyc_reviews_reviewer_id_fkey',
		}).onDelete('set null'),
		pgPolicy('Whitelisted users can create KYC reviews', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
			withCheck: sql`((EXISTS ( SELECT 1
   FROM kyc_admin_whitelist
  WHERE (kyc_admin_whitelist.user_id = auth.uid()))) AND (reviewer_id = auth.uid()))`,
		}),
		pgPolicy('Whitelisted users can view all KYC reviews', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
		}),
		pgPolicy('Whitelisted users can update KYC reviews', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('Users can view their own KYC reviews', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
		}),
	],
)

export const kycAdminWhitelist = pgTable(
	'kyc_admin_whitelist',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid('user_id').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		createdBy: uuid('created_by'),
		notes: text(),
	},
	(table) => [
		index('idx_kyc_admin_whitelist_user_id').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'kyc_admin_whitelist_user_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.createdBy],
			foreignColumns: [usersInAuth.id],
			name: 'kyc_admin_whitelist_created_by_fkey',
		}).onDelete('set null'),
		unique('kyc_admin_whitelist_user_id_key').on(table.userId),
		pgPolicy('Allow reading admin whitelist', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Whitelisted admins can manage whitelist', {
			as: 'permissive',
			for: 'all',
			to: ['public'],
		}),
	],
)

export const devices = pgTable(
	'devices',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid('user_id'),
		identifier: text().notNull(),
		rpId: text('rp_id').notNull(),
		deviceName: text('device_name'),
		credentialType: credentialType('credential_type').default('public-key').notNull(),
		credentialId: text('credential_id').notNull(),
		aaguid: text().default('00000000-0000-0000-0000-000000000000').notNull(),
		address: text().default('0x').notNull(),
		signCount: integer('sign_count').default(0).notNull(),
		transports: text().array().default(['']).notNull(),
		profileVerificationStatus: profileVerificationStatus('profile_verification_status')
			.default('unverified')
			.notNull(),
		deviceType: deviceType('device_type').default('single_device').notNull(),
		backupState: backupState('backup_state').default('not_backed_up').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		lastUsedAt: timestamp('last_used_at', {
			withTimezone: true,
			mode: 'string',
		}),
		publicKey: text('public_key').notNull(),
		nextAuthUserId: uuid('next_auth_user_id'),
	},
	(table) => [
		index('idx_devices_credential_id').using(
			'btree',
			table.credentialId.asc().nullsLast().op('text_ops'),
		),
		index('idx_devices_identifier_rp_id').using(
			'btree',
			table.identifier.asc().nullsLast().op('text_ops'),
			table.rpId.asc().nullsLast().op('text_ops'),
		),
		index('idx_devices_next_auth_user_id').using(
			'btree',
			table.nextAuthUserId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_devices_user_id').using('btree', table.userId.asc().nullsLast().op('uuid_ops')),
		foreignKey({
			columns: [table.nextAuthUserId],
			foreignColumns: [usersInNextAuth.id],
			name: 'devices_next_auth_user_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'devices_user_id_fkey',
		}),
		unique('devices_credential_id_key').on(table.credentialId),
		pgPolicy('Service role can manage all devices', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
			using: sql`true`,
		}),
		pgPolicy('Users can view their own devices via NextAuth', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
		}),
		pgPolicy('Users can insert their own devices via NextAuth', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
		}),
		pgPolicy('Users can update their own devices via NextAuth', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('Users can delete their own devices via NextAuth', {
			as: 'permissive',
			for: 'delete',
			to: ['public'],
		}),
	],
)
