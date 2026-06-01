import { sql } from 'drizzle-orm'
import {
	char,
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
import { usersInAuth } from './auth'
import { milestoneStatus, projectMemberRole, projectStatus } from './enums'
import { profiles } from './profiles'

export const categories = pgTable(
	'categories',
	{
		name: text().notNull(),
		color: char({ length: 7 }).notNull(),
		id: uuid().defaultRandom().primaryKey().notNull(),
		slug: text(),
	},
	(table) => [
		index('categories_slug_idx').using(
			'btree',
			table.slug.asc().nullsLast().op('text_ops'),
		),
		unique('categories_name_key').on(table.name),
		unique('categories_color_key').on(table.color),
		pgPolicy('Public can read categories', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Admins can write categories', {
			as: 'permissive',
			for: 'all',
			to: ['public'],
		}),
		check('chk_color_format', sql`color ~ '^#[0-9A-Fa-f]{6}$'::text`),
	],
)


export const projects = pgTable(
	'projects',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		title: text().notNull(),
		description: text().notNull(),
		currentAmount: numeric('current_amount', { precision: 12, scale: 2 })
			.default('0')
			.notNull(),
		targetAmount: numeric('target_amount', {
			precision: 12,
			scale: 2,
		}).notNull(),
		minInvestment: numeric('min_investment', {
			precision: 12,
			scale: 2,
		}).notNull(),
		percentageComplete: numeric('percentage_complete', {
			precision: 5,
			scale: 2,
		})
			.default('0')
			.notNull(),
		kinderCount: integer('kinder_count').default(0).notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		categoryId: uuid('category_id').notNull(),
		imageUrl: text('image_url'),
		kindlerId: uuid('kindler_id').notNull(),
		slug: text(),
		socialLinks: jsonb('social_links').default({}).notNull(),
		projectLocation: char('project_location', { length: 3 }).notNull(),
		status: projectStatus().default('draft').notNull(),
		metadata: jsonb().default({}).notNull(),
		foundationId: uuid('foundation_id'),
	},
	(table) => [
		index('idx_projects_kindler_id').using(
			'btree',
			table.kindlerId.asc().nullsLast().op('uuid_ops'),
		),
		index('projects_project_location_idx').using(
			'btree',
			table.projectLocation.asc().nullsLast().op('bpchar_ops'),
		),
		uniqueIndex('projects_slug_key').using(
			'btree',
			table.slug.asc().nullsLast().op('text_ops'),
		),
		index('projects_status_idx').using(
			'btree',
			table.status.asc().nullsLast().op('enum_ops'),
		),
		foreignKey({
			columns: [table.kindlerId],
			foreignColumns: [usersInAuth.id],
			name: 'projects_kindler_id_fkey',
		}),
		foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: 'projects_category_id_fkey',
		}).onDelete('set null'),
		index('idx_projects_foundation_id').using(
			'btree',
			table.foundationId.asc().nullsLast().op('uuid_ops'),
		),
		pgPolicy('Public read access to projects', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Temporary public insert access to projects', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
		}),
		pgPolicy('Temporary public update access to projects', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('Projects can be deleted by owner', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
		check(
			'check_min_investment_less_than_target',
			sql`min_investment <= target_amount`,
		),
		check('check_positive_target_amount', sql`target_amount > (0)::numeric`),
		check(
			'chk_project_location_alpha3',
			sql`project_location ~ '^[A-Z]{3}$'::text`,
		),
	],
)


export const projectUpdates = pgTable(
	'project_updates',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		projectId: uuid('project_id').notNull(),
		authorId: uuid('author_id').notNull(),
		title: text().notNull(),
		content: text().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('idx_project_updates_author_id').using(
			'btree',
			table.authorId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_project_updates_project_id').using(
			'btree',
			table.projectId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'project_updates_project_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.authorId],
			foreignColumns: [usersInAuth.id],
			name: 'project_updates_author_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('Public read access to project updates', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Project updates can be created by project members', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('Project updates can be modified by authors', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('Project updates can be deleted by authors or project owners', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)

export const projectPitch = pgTable(
	'project_pitch',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		title: text().notNull(),
		story: text().notNull(),
		pitchDeck: text('pitch_deck'),
		videoUrl: text('video_url'),
		projectId: uuid('project_id').notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
	},
	(table) => [
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'project_pitch_project_id_fkey',
		}).onDelete('cascade'),
		unique('project_pitch_project_id_key').on(table.projectId),
		pgPolicy('Public read access to project pitches', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Temporary public insert access to project pitches', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
		}),
		pgPolicy('Temporary public update access to project pitches', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('Users can delete their own project pitches', {
			as: 'permissive',
			for: 'delete',
			to: ['public'],
		}),
	],
)

export const projectMembers = pgTable(
	'project_members',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		projectId: uuid('project_id').notNull(),
		userId: uuid('user_id').notNull(),
		role: projectMemberRole().default('editor').notNull(),
		joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		title: text().default('').notNull(),
	},
	(table) => [
		index('idx_project_members_project_id').using(
			'btree',
			table.projectId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_project_members_user_id').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'project_members_project_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'project_members_user_id_fkey',
		}).onDelete('cascade'),
		unique('project_members_project_id_user_id_key').on(
			table.projectId,
			table.userId,
		),
		pgPolicy('Public read access to project members', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Project owners can add members', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('Project owners can remove members', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
		pgPolicy('Project owners can update member roles', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
	],
)

export const milestones = pgTable(
	'milestones',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		title: text().notNull(),
		description: text(),
		amount: numeric({ precision: 20, scale: 7 }).notNull(),
		deadline: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
		status: milestoneStatus().default('pending').notNull(),
		orderIndex: integer('order_index').notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		completedAt: timestamp('completed_at', {
			withTimezone: true,
			mode: 'string',
		}),
		projectId: uuid('project_id').notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'milestones_project_id_fkey',
		}),
		pgPolicy('Project owners can create milestones', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
			withCheck: sql`(project_id IN ( SELECT projects.id
   FROM projects
  WHERE (projects.kindler_id = auth.uid())))`,
		}),
		pgPolicy('Public read access to milestones', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
		}),
		pgPolicy('Project owners can update milestones', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('Project owners can delete milestones', {
			as: 'permissive',
			for: 'delete',
			to: ['public'],
		}),
		check('valid_milestone_amount', sql`amount > (0)::numeric`),
	],
)

export const projectTags = pgTable(
	'project_tags',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		name: text().notNull(),
		color: char({ length: 7 }).notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
	},
	(table) => [
		unique('project_tags_name_color_key').on(table.name, table.color),
		check(
			'project_tags_color_check',
			sql`(color)::text ~ '^#[0-9A-Fa-f]{6}$'::text`,
		),
	],
)


export const projectTagRelationships = pgTable(
	'project_tag_relationships',
	{
		projectId: uuid('project_id').notNull(),
		tagId: uuid('tag_id').notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'project_tag_relationships_project_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.tagId],
			foreignColumns: [projectTags.id],
			name: 'project_tag_relationships_tag_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.projectId, table.tagId],
			name: 'project_tag_relationships_pkey',
		}),
	],
)

export const kindlerProjects = pgTable(
	'kindler_projects',
	{
		kindlerId: uuid('kindler_id').notNull(),
		projectId: uuid('project_id').notNull(),
		joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('idx_kindler_projects_project_id').using(
			'btree',
			table.projectId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.kindlerId],
			foreignColumns: [usersInAuth.id],
			name: 'kindler_projects_kindler_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'kindler_projects_project_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.kindlerId, table.projectId],
			name: 'kindler_projects_pkey',
		}),
		pgPolicy('Kindler-project relationships viewable by everyone', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
			using: sql`true`,
		}),
		pgPolicy('Users can join projects as kindlers', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('Users can leave projects', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)

export const userFollows = pgTable(
	'user_follows',
	{
		followerId: uuid('follower_id').notNull(),
		followingId: uuid('following_id').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('idx_user_follows_follower').using(
			'btree',
			table.followerId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_user_follows_following').using(
			'btree',
			table.followingId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.followerId],
			foreignColumns: [profiles.id],
			name: 'user_follows_follower_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.followingId],
			foreignColumns: [profiles.id],
			name: 'user_follows_following_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.followerId, table.followingId],
			name: 'user_follows_pkey',
		}),
		pgPolicy('user_follows_select', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('user_follows_insert', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('user_follows_delete', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)

