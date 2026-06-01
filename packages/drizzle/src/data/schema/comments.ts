import { sql } from 'drizzle-orm'
import {
	check,
	foreignKey,
	index,
	jsonb,
	pgPolicy,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core'
import { usersInAuth } from './auth'
import { commentType } from './enums'
import { projects, projectUpdates } from './projects'

export const comments = pgTable(
	'comments',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		content: text().notNull(),
		authorId: uuid('author_id').notNull(),
		parentCommentId: uuid('parent_comment_id'),
		projectId: uuid('project_id'),
		projectUpdateId: uuid('project_update_id'),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
		type: commentType().default('comment').notNull(),
		metadata: jsonb().default({}).notNull(),
	},
	(table) => [
		index('idx_comments_metadata_status')
			.using('btree', sql`((metadata ->> 'status'::text))`)
			.where(sql`(type = 'question'::comment_type)`),
		index('idx_comments_official_answers')
			.using('btree', sql`((metadata ->> 'is_official'::text))`)
			.where(sql`(type = 'answer'::comment_type)`),
		index('idx_comments_parent_id').using(
			'btree',
			table.parentCommentId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_comments_type').using('btree', table.type.asc().nullsLast().op('enum_ops')),
		index('idx_comments_type_parent').using(
			'btree',
			table.type.asc().nullsLast().op('uuid_ops'),
			table.parentCommentId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.authorId],
			foreignColumns: [usersInAuth.id],
			name: 'comments_author_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.parentCommentId],
			foreignColumns: [table.id],
			name: 'comments_parent_comment_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'comments_project_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.projectUpdateId],
			foreignColumns: [projectUpdates.id],
			name: 'comments_project_update_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('Public read access to comments', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('update_answer_official', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('update_question_status', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		check(
			'check_project_or_update',
			sql`((project_id IS NOT NULL) AND (project_update_id IS NULL)) OR ((project_id IS NULL) AND (project_update_id IS NOT NULL))`,
		),
		check(
			'chk_comments_metadata_status',
			sql`(type <> 'question'::comment_type) OR ((metadata ->> 'status'::text) = ANY (ARRAY['new'::text, 'answered'::text, 'resolved'::text]))`,
		),
	],
)

export const community = pgTable(
	'community',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		projectId: uuid('project_id').notNull(),
		updateId: uuid('update_id').notNull(),
		commentId: uuid('comment_id').notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		index('community_project_id_idx').using(
			'btree',
			table.projectId.asc().nullsLast().op('uuid_ops'),
		),
		index('community_update_id_idx').using(
			'btree',
			table.updateId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'community_project_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.updateId],
			foreignColumns: [projectUpdates.id],
			name: 'community_update_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.commentId],
			foreignColumns: [comments.id],
			name: 'comment_id_fkey',
		}).onDelete('cascade'),
	],
)
