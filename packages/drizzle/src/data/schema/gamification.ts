import { sql } from 'drizzle-orm'
import {
	check,
	foreignKey,
	index,
	pgPolicy,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from 'drizzle-orm/pg-core'
import { usersInAuth } from './auth'
import { categories } from './projects'
import { usersInNextAuth } from './next-auth'

export const waitlistInterests = pgTable(
	'waitlist_interests',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		name: text().notNull(),
		email: text(),
		role: text().notNull(),
		projectName: text('project_name'),
		projectDescription: text('project_description'),
		categoryId: uuid('category_id'),
		location: text(),
		source: text(),
		consent: boolean().default(false).notNull(),
	},
	(table) => [
		index('waitlist_interests_category_id_idx').using(
			'btree',
			table.categoryId.asc().nullsLast().op('uuid_ops'),
		),
		index('waitlist_interests_created_at_idx').using(
			'btree',
			table.createdAt.desc().nullsFirst().op('timestamptz_ops'),
		),
		index('waitlist_interests_email_idx').using('btree', sql`lower(email)`),
		index('waitlist_interests_role_idx').using(
			'btree',
			table.role.asc().nullsLast().op('text_ops'),
		),
		foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: 'waitlist_interests_category_id_fkey',
		}).onDelete('set null'),
		pgPolicy('Allow public inserts', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
			withCheck: sql`true`,
		}),
		pgPolicy('No public select', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('No public update', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('No public delete', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
		check(
			'waitlist_interests_role_check',
			sql`role = ANY (ARRAY['project_creator'::text, 'supporter'::text, 'partner'::text])`,
		),
	],
)

export const challenges = pgTable(
	'challenges',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid('user_id').default(sql`auth.uid()`),
		identifier: text().notNull(),
		rpId: text('rp_id').notNull(),
		challenge: text().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' })
			.default(sql`(now() + '00:05:00'::interval)`)
			.notNull(),
		nextAuthUserId: uuid('next_auth_user_id'),
	},
	(table) => [
		index('idx_challenges_expires_at').using(
			'btree',
			table.expiresAt.asc().nullsLast().op('timestamptz_ops'),
		),
		index('idx_challenges_identifier_rp_id').using(
			'btree',
			table.identifier.asc().nullsLast().op('text_ops'),
			table.rpId.asc().nullsLast().op('text_ops'),
		),
		index('idx_challenges_next_auth_user_id').using(
			'btree',
			table.nextAuthUserId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'challenges_user_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.nextAuthUserId],
			foreignColumns: [usersInNextAuth.id],
			name: 'challenges_next_auth_user_id_fkey',
		}).onDelete('cascade'),
		unique('challenges_identifier_rp_id_key').on(table.identifier, table.rpId),
		pgPolicy('Service role can manage all challenges', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
			using: sql`true`,
		}),
		pgPolicy('Users can manage their own challenges via NextAuth', {
			as: 'permissive',
			for: 'all',
			to: ['public'],
		}),
	],
)
