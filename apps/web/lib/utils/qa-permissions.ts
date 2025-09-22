/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Enums } from '@services/supabase'
import type {
	AnswerMetadata,
	ProjectMemberRole,
	QuestionMetadata,
	UserData,
	UserRole,
} from '../types/project/project-qa.types'

/**
 * Check if a user can mark an answer as official
 * Must be a project team member (admin/editor) or project owner
 */
export function canMarkAnswerOfficial(
	userRole: UserRole | null,
	_projectId: string,
): boolean {
	if (!userRole) return false

	return (
		userRole.is_project_owner ||
		(userRole.is_team_member &&
			userRole.project_member_role !== undefined &&
			['admin', 'editor'].includes(userRole.project_member_role))
	)
}

/**
 * Check if a user can resolve a question
 * Question author, project team members, or project owners can resolve
 */
export function canResolveQuestion(
	userRole: UserRole | null,
	questionAuthorId: string,
	currentUserId: string | null,
	_projectId: string,
): boolean {
	if (!currentUserId) return false

	if (questionAuthorId === currentUserId) return true

	if (!userRole) return false

	return (
		userRole.is_project_owner ||
		(userRole.is_team_member &&
			userRole.project_member_role !== undefined &&
			['admin', 'editor'].includes(userRole.project_member_role))
	)
}

/**
 * Check if a user can create questions/answers
 * Any authenticated user can create Q&A content
 */
export function canCreateQAContent(currentUserId: string | null): boolean {
	return currentUserId !== null
}

/**
 * Check if a user can edit their own content
 */
export function canEditOwnContent(
	authorId: string,
	currentUserId: string | null,
): boolean {
	return currentUserId !== null && authorId === currentUserId
}

/**
 * Check if a user can delete Q&A content
 * Authors, project team members, or project owners can delete
 */
export function canDeleteQAContent(
	userRole: UserRole | null,
	authorId: string,
	currentUserId: string | null,
	_projectId: string,
): boolean {
	if (!currentUserId) return false

	if (authorId === currentUserId) return true

	if (!userRole) return false

	return (
		userRole.is_project_owner ||
		(userRole.is_team_member &&
			userRole.project_member_role !== undefined &&
			['admin', 'editor'].includes(userRole.project_member_role))
	)
}

/**
 * Get user role information for Q&A permissions
 * This should be called with data from your auth system and database
 */
export function getUserRole(
	userData: UserData | null,
	projectId: string,
	projectMembers: ProjectMemberRole[],
	projectOwnerId: string | null,
): UserRole | null {
	if (!userData || !('role' in userData)) return null

	const userId = userData.id
	const userProjectMember = projectMembers.find((pm) => pm.user_id === userId)

	return {
		role: userData.role as Enums<'user_role'>,
		is_project_owner: projectOwnerId === userId,
		is_team_member: !!userProjectMember,
		project_member_role: userProjectMember?.role,
	}
}

/**
 * Helper to determine if an answer is marked as official
 */

export function isOfficialAnswer(
	metadata: AnswerMetadata | undefined,
): boolean {
	return metadata?.is_official === true
}

/**
 * Helper to get question status
 */

export function getQuestionStatus(
	metadata: QuestionMetadata | undefined,
): 'new' | 'answered' | 'resolved' {
	return metadata?.status || 'new'
}

/**
 * Helper to check if a question is resolved
 */
export function isQuestionResolved(
	metadata: QuestionMetadata | undefined,
): boolean {
	return getQuestionStatus(metadata) === 'resolved'
}

/**
 * Helper to validate metadata structure for different comment types
 */
export function validateMetadata(
	type: Enums<'comment_type'>,
	metadata: any,
): boolean {
	switch (type) {
		case 'question':
			return (
				!metadata || ['new', 'answered', 'resolved'].includes(metadata.status)
			)
		case 'answer':
			return (
				!metadata ||
				typeof metadata.is_official === 'boolean' ||
				metadata.is_official === undefined
			)
		case 'comment':
			return true
		default:
			return false
	}
}
