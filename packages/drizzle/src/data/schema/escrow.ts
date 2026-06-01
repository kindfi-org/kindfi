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
	uuid,
} from 'drizzle-orm/pg-core'
import { escrowStatusType } from './enums'
import { milestones, projects } from './projects'

export const escrowContracts = pgTable(
	'escrow_contracts',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		engagementId: text('engagement_id').notNull(),
		contractId: text('contract_id').notNull(),
		projectId: uuid('project_id').notNull(),
		contributionId: uuid('contribution_id').notNull(),
		payerAddress: text('payer_address').notNull(),
		receiverAddress: text('receiver_address').notNull(),
		amount: numeric({ precision: 20, scale: 7 }).notNull(),
		currentState: escrowStatusType('current_state').default('NEW').notNull(),
		platformFee: numeric('platform_fee', { precision: 5, scale: 2 }).notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		completedAt: timestamp('completed_at', {
			withTimezone: true,
			mode: 'string',
		}),
		metadata: jsonb().default({}),
	},
	(table) => [
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'escrow_contracts_project_id_fkey',
		}),
		foreignKey({
			columns: [table.contributionId],
			foreignColumns: [contributions.id],
			name: 'escrow_contracts_contribution_id_fkey',
		}),
		unique('escrow_contracts_engagement_id_key').on(table.engagementId),
		unique('escrow_contracts_contract_id_key').on(table.contractId),
		pgPolicy('public_select_escrow_contracts', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		check('valid_escrow_amount', sql`amount > (0)::numeric`),
		check('valid_platform_fee', sql`platform_fee >= (0)::numeric`),
	],
)

export const contributions = pgTable(
	'contributions',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		projectId: uuid('project_id').notNull(),
		contributorId: uuid('contributor_id').notNull(),
		amount: numeric({ precision: 20, scale: 7 }).notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'contributions_project_id_fkey',
		}),
	],
)

export const escrowStatus = pgTable(
	'escrow_status',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		escrowId: text('escrow_id').notNull(),
		status: escrowStatusType().notNull(),
		currentMilestone: integer('current_milestone'),
		totalFunded: numeric('total_funded', { precision: 20, scale: 7 }),
		totalReleased: numeric('total_released', { precision: 20, scale: 7 }),
		lastUpdated: timestamp('last_updated', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		metadata: jsonb().default({}),
	},
	(table) => [
		index('idx_escrow_status_escrow_id').using(
			'btree',
			table.escrowId.asc().nullsLast().op('text_ops'),
		),
		index('idx_escrow_status_last_updated').using(
			'btree',
			table.lastUpdated.asc().nullsLast().op('timestamptz_ops'),
		),
		index('idx_escrow_status_metadata').using(
			'gin',
			table.metadata.asc().nullsLast().op('jsonb_ops'),
		),
		index('idx_escrow_status_status').using('btree', table.status.asc().nullsLast().op('enum_ops')),
		check('valid_amounts', sql`total_funded >= total_released`),
	],
)

export const escrowReviews = pgTable(
	'escrow_reviews',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		escrowId: uuid('escrow_id').notNull(),
		milestoneId: uuid('milestone_id'),
		reviewerAddress: text('reviewer_address').notNull(),
		status: text().default('PENDING').notNull(),
		reviewNotes: text('review_notes'),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		reviewedAt: timestamp('reviewed_at', {
			withTimezone: true,
			mode: 'string',
		}),
		disputerId: uuid('disputer_id'),
		type: text().notNull(),
		resolutionText: text('resolution_text'),
		evidenceUrls: text('evidence_urls').array(),
		transactionHash: text('transaction_hash'),
	},
	(table) => [
		index('escrow_reviews_escrow_id_idx').using(
			'btree',
			table.escrowId.asc().nullsLast().op('uuid_ops'),
		),
		index('escrow_reviews_milestone_id_idx').using(
			'btree',
			table.milestoneId.asc().nullsLast().op('uuid_ops'),
		),
		index('escrow_reviews_type_idx').using('btree', table.type.asc().nullsLast().op('text_ops')),
		foreignKey({
			columns: [table.escrowId],
			foreignColumns: [escrowContracts.id],
			name: 'escrow_reviews_escrow_id_fkey',
		}),
		foreignKey({
			columns: [table.milestoneId],
			foreignColumns: [milestones.id],
			name: 'escrow_reviews_milestone_id_fkey',
		}),
		check('escrow_reviews_type_check', sql`type = ANY (ARRAY['dispute'::text, 'milestone'::text])`),
	],
)

export const escrowMilestones = pgTable(
	'escrow_milestones',
	{
		escrowId: uuid('escrow_id').notNull(),
		milestoneId: uuid('milestone_id').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('idx_escrow_milestones_escrow_id').using(
			'btree',
			table.escrowId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_escrow_milestones_milestone_id').using(
			'btree',
			table.milestoneId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.escrowId],
			foreignColumns: [escrowContracts.id],
			name: 'escrow_milestones_escrow_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.milestoneId],
			foreignColumns: [milestones.id],
			name: 'escrow_milestones_milestone_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.escrowId, table.milestoneId],
			name: 'escrow_milestones_pkey1',
		}),
		pgPolicy('select escrow_milestones for owners', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
			using: sql`(EXISTS ( SELECT 1
   FROM (milestones m
     JOIN projects p ON ((p.id = m.project_id)))
  WHERE ((m.id = escrow_milestones.milestone_id) AND (p.kindler_id = next_auth.uid()))))`,
		}),
		pgPolicy('insert escrow_milestones for owners', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('update escrow_milestones for owners', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('delete escrow_milestones for owners', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)

export const projectEscrows = pgTable(
	'project_escrows',
	{
		projectId: uuid('project_id').notNull(),
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
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'project_escrows_project_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.escrowId],
			foreignColumns: [escrowContracts.id],
			name: 'project_escrows_escrow_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.projectId, table.escrowId],
			name: 'project_escrows_pkey',
		}),
		unique('unique_project_id').on(table.projectId),
		unique('unique_escrow_id').on(table.escrowId),
		pgPolicy('select project_escrows for project owners', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
			using: sql`(EXISTS ( SELECT 1
   FROM projects p
  WHERE ((p.id = project_escrows.project_id) AND (p.kindler_id = next_auth.uid()))))`,
		}),
		pgPolicy('insert project_escrows for project owners', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('update project_escrows for project owners', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('delete project_escrows for project owners', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)
