import { sql } from 'drizzle-orm'
import {
	check,
	foreignKey,
	index,
	integer,
	jsonb,
	numeric,
	pgPolicy,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core'
import {
	usersInNextAuth,
} from './next-auth'
import {
	milestones,
} from './projects'
import {
	escrowContracts,
} from './escrow'

export const foundations = pgTable(
	'foundations',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		name: text().notNull(),
		description: text().notNull(),
		slug: text().notNull(),
		logoUrl: text('logo_url'),
		coverImageUrl: text('cover_image_url'),
		founderId: uuid('founder_id').notNull(),
		foundedYear: integer('founded_year').notNull(),
		mission: text(),
		vision: text(),
		websiteUrl: text('website_url'),
		socialLinks: jsonb('social_links').default({}).notNull(),
		totalDonationsReceived: numeric('total_donations_received', {
			precision: 20,
			scale: 7,
		})
			.default('0')
			.notNull(),
		totalCampaignsCompleted: integer('total_campaigns_completed')
			.default(0)
			.notNull(),
		totalCampaignsOpen: integer('total_campaigns_open').default(0).notNull(),
		metadata: jsonb().default({}).notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		})
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		})
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		uniqueIndex('foundations_slug_key').using(
			'btree',
			table.slug.asc().nullsLast().op('text_ops'),
		),
		index('idx_foundations_founder_id').using(
			'btree',
			table.founderId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_foundations_slug').using(
			'btree',
			table.slug.asc().nullsLast().op('text_ops'),
		),
		foreignKey({
			columns: [table.founderId],
			foreignColumns: [usersInNextAuth.id],
			name: 'foundations_founder_id_fkey',
		}).onDelete('cascade'),
		check(
			'valid_slug_format',
			sql`slug ~ '^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$'::text`,
		),
		check(
			'valid_founded_year',
			sql`founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)`,
		),
		pgPolicy('Public read access to foundations', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Authenticated users can insert foundations', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('Founders can update their foundations', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('Founders can delete their foundations', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)

export const foundationMilestones = pgTable(
	'foundation_milestones',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		foundationId: uuid('foundation_id').notNull(),
		title: text().notNull(),
		description: text(),
		achievedDate: timestamp('achieved_date', {
			withTimezone: false,
			mode: 'date',
		}).notNull(),
		impactMetric: text('impact_metric'),
		metadata: jsonb().default({}),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		})
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		})
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index('idx_foundation_milestones_foundation_id').using(
			'btree',
			table.foundationId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.foundationId],
			foreignColumns: [foundations.id],
			name: 'foundation_milestones_foundation_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('Public read access to foundation milestones', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Foundation founders can insert milestones', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('Foundation founders can update milestones', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('Foundation founders can delete milestones', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)

export const foundationEscrows = pgTable(
	'foundation_escrows',
	{
		foundationId: uuid('foundation_id').notNull(),
		escrowId: uuid('escrow_id').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.foundationId],
			foreignColumns: [foundations.id],
			name: 'foundation_escrows_foundation_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.escrowId],
			foreignColumns: [escrowContracts.id],
			name: 'foundation_escrows_escrow_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.foundationId, table.escrowId],
			name: 'foundation_escrows_pkey',
		}),
		index('idx_foundation_escrows_foundation_id').using(
			'btree',
			table.foundationId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_foundation_escrows_escrow_id').using(
			'btree',
			table.escrowId.asc().nullsLast().op('uuid_ops'),
		),
		pgPolicy('Public read access to foundation escrows', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Foundation founders can insert escrows', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
	],
)
