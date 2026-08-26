import { sql } from 'drizzle-orm'
import {
	bigint,
	foreignKey,
	index,
	pgPolicy,
	pgSchema,
	text,
	timestamp,
	unique,
	uuid,
} from 'drizzle-orm/pg-core'

export const nextAuth = pgSchema('next_auth')

export const usersInNextAuth = nextAuth.table(
	'users',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		name: text(),
		email: text(),
		image: text(),
		emailVerified: timestamp('email_verified', {
			withTimezone: true,
			mode: 'string',
		}),
	},
	(table) => [
		unique('email_unique').on(table.email),
		pgPolicy('Users can view own user data', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`(next_auth.uid() = id)`,
		}),
		pgPolicy('Service role can manage all users', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
		}),
	],
)

export const sessionsInNextAuth = nextAuth.table(
	'sessions',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
		sessionToken: text('session_token').notNull(),
		userId: uuid('user_id'),
	},
	(table) => [
		index('idx_next_auth_sessions_session_token').using(
			'btree',
			table.sessionToken.asc().nullsLast().op('text_ops'),
		),
		index('idx_next_auth_sessions_user_id').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInNextAuth.id],
			name: 'sessions_user_id_fkey',
		}).onDelete('cascade'),
		unique('sessiontoken_unique').on(table.sessionToken),
		unique('sessions_session_token_key').on(table.sessionToken),
		pgPolicy('Users can view own sessions', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`(next_auth.uid() = user_id)`,
		}),
		pgPolicy('Service role can manage all sessions', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
		}),
	],
)

export const accountsInNextAuth = nextAuth.table(
	'accounts',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		type: text().notNull(),
		provider: text().notNull(),
		providerAccountId: text('provider_account_id').notNull(),
		refreshToken: text('refresh_token'),
		accessToken: text('access_token'),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		expiresAt: bigint('expires_at', { mode: 'number' }),
		tokenType: text('token_type'),
		scope: text(),
		idToken: text('id_token'),
		sessionState: text('session_state'),
		oauthTokenSecret: text('oauth_token_secret'),
		oauthToken: text('oauth_token'),
		userId: uuid('user_id'),
	},
	(table) => [
		index('idx_next_auth_accounts_provider').using(
			'btree',
			table.provider.asc().nullsLast().op('text_ops'),
			table.providerAccountId.asc().nullsLast().op('text_ops'),
		),
		index('idx_next_auth_accounts_user_id').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInNextAuth.id],
			name: 'accounts_user_id_fkey',
		}).onDelete('cascade'),
		unique('provider_unique').on(table.provider, table.providerAccountId),
		unique('accounts_provider_provider_account_id_key').on(table.provider, table.providerAccountId),
		pgPolicy('Users can view own accounts', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`(next_auth.uid() = user_id)`,
		}),
		pgPolicy('Service role can manage all accounts', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
		}),
	],
)

export const verificationTokensInNextAuth = nextAuth.table(
	'verification_tokens',
	{
		identifier: text(),
		token: text().primaryKey().notNull(),
		expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	},
	(table) => [
		unique('verification_tokens_identifier_token_key').on(table.identifier, table.token),
		pgPolicy('Service role can manage all verification tokens', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
			using: sql`true`,
		}),
	],
)
