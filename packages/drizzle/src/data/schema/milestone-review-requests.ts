import { sql } from 'drizzle-orm'
import {
	check,
	foreignKey,
	index,
	integer,
	pgPolicy,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core'
import { profiles } from './profiles'
import { projects } from './projects'

export const milestoneReviewRequests = pgTable(
	'milestone_review_requests',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		projectId: uuid('project_id').notNull(),
		escrowContractId: text('escrow_contract_id').notNull(),
		milestoneIndex: integer('milestone_index').notNull(),
		milestoneTitle: text('milestone_title'),
		status: text().default('pending').notNull(),
		requesterId: uuid('requester_id').notNull(),
		reviewerId: uuid('reviewer_id'),
		requestNotes: text('request_notes'),
		reviewNotes: text('review_notes'),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		})
			.default(sql`now()`)
			.notNull(),
		reviewedAt: timestamp('reviewed_at', {
			withTimezone: true,
			mode: 'string',
		}),
	},
	(table) => [
		index('milestone_review_requests_project_id_idx').using(
			'btree',
			table.projectId.asc().nullsLast().op('uuid_ops'),
		),
		index('milestone_review_requests_status_idx').using(
			'btree',
			table.status.asc().nullsLast().op('text_ops'),
		),
		index('milestone_review_requests_created_at_idx').using(
			'btree',
			table.createdAt.desc().nullsLast().op('timestamptz_ops'),
		),
		uniqueIndex('milestone_review_requests_pending_unique_idx')
			.using(
				'btree',
				table.projectId.asc().nullsLast().op('uuid_ops'),
				table.escrowContractId.asc().nullsLast().op('text_ops'),
				table.milestoneIndex.asc().nullsLast().op('int4_ops'),
			)
			.where(sql`status = 'pending'`),
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'milestone_review_requests_project_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.requesterId],
			foreignColumns: [profiles.id],
			name: 'milestone_review_requests_requester_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.reviewerId],
			foreignColumns: [profiles.id],
			name: 'milestone_review_requests_reviewer_id_fkey',
		}).onDelete('set null'),
		check(
			'milestone_review_requests_status_check',
			sql`status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])`,
		),
		check('milestone_review_requests_milestone_index_check', sql`milestone_index >= 0`),
		pgPolicy('Project managers can view milestone review requests', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
			using: sql`((EXISTS ( SELECT 1
   FROM projects p
  WHERE ((p.id = milestone_review_requests.project_id) AND ((p.kindler_id = current_auth_user_id()) OR (EXISTS ( SELECT 1
           FROM project_members pm
          WHERE ((pm.project_id = p.id) AND (pm.user_id = current_auth_user_id()) AND (pm.role = ANY (ARRAY['core'::project_member_role, 'admin'::project_member_role, 'editor'::project_member_role]))))))))) OR (EXISTS ( SELECT 1
   FROM profiles pr
  WHERE ((pr.id = current_auth_user_id()) AND (pr.role = 'admin'::user_role)))))`,
		}),
		pgPolicy('Project managers can create milestone review requests', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
			withCheck: sql`((requester_id = current_auth_user_id()) AND (status = 'pending'::text) AND (EXISTS ( SELECT 1
   FROM projects p
  WHERE ((p.id = milestone_review_requests.project_id) AND ((p.kindler_id = current_auth_user_id()) OR (EXISTS ( SELECT 1
           FROM project_members pm
          WHERE ((pm.project_id = p.id) AND (pm.user_id = current_auth_user_id()) AND (pm.role = ANY (ARRAY['core'::project_member_role, 'admin'::project_member_role, 'editor'::project_member_role]))))))))))`,
		}),
		pgPolicy('Platform admins can update milestone review requests', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
			using: sql`(EXISTS ( SELECT 1
   FROM profiles pr
  WHERE ((pr.id = current_auth_user_id()) AND (pr.role = 'admin'::user_role))))`,
			withCheck: sql`(EXISTS ( SELECT 1
   FROM profiles pr
  WHERE ((pr.id = current_auth_user_id()) AND (pr.role = 'admin'::user_role))))`,
		}),
	],
)
