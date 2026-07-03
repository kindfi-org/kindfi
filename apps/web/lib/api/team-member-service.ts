import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TablesInsert } from '@services/supabase'

type ProfileRow = {
	id: string
	display_name: string | null
	bio: string | null
	image_url: string | null
	email: string | null
}

type TeamInsertInput = {
	entityId: string
	entityColumn: 'project_id' | 'foundation_id'
	teamTable: 'project_team' | 'foundation_team'
	membersTable: 'project_members' | 'foundation_members'
	ownerUserId: string
	type: 'manual' | 'registered'
	fullName?: string
	roleTitle: string
	bio?: string
	photoUrl?: string
	yearsInvolved?: number
	userId?: string
}

const mapTeamMember = (member: {
	id: string
	project_id?: string
	foundation_id?: string
	user_id: string | null
	full_name: string
	role_title: string
	bio: string | null
	photo_url: string | null
	years_involved: number | null
	order_index: number
	created_at: string
	updated_at: string
}) => ({
	id: member.id,
	entityId: member.project_id ?? member.foundation_id ?? '',
	userId: member.user_id,
	fullName: member.full_name,
	roleTitle: member.role_title,
	bio: member.bio,
	photoUrl: member.photo_url,
	yearsInvolved: member.years_involved,
	orderIndex: member.order_index,
	createdAt: member.created_at,
	updatedAt: member.updated_at,
	isManager: Boolean(member.user_id),
})

export async function createTeamMemberRecord(input: TeamInsertInput) {
	const {
		entityId,
		entityColumn,
		teamTable,
		membersTable,
		ownerUserId,
		type,
		roleTitle,
		bio,
		photoUrl,
		yearsInvolved,
		userId,
		fullName,
	} = input

	let profile: ProfileRow | null = null
	if (type === 'registered') {
		if (!userId) {
			return { error: 'User ID is required for registered team members', status: 400 as const }
		}
		if (userId === ownerUserId) {
			return { error: 'The owner is already a team member', status: 400 as const }
		}

		const { data: profileData, error: profileError } = await supabaseServiceRole
			.from('profiles')
			.select('id, display_name, bio, image_url, email')
			.eq('id', userId)
			.maybeSingle()

		if (profileError || !profileData) {
			return { error: 'Registered user not found', status: 404 as const }
		}
		profile = profileData
	}

	const existingTeamQuery = supabaseServiceRole
		.from(teamTable)
		.select('id, user_id')
		.eq(entityColumn, entityId)

	if (type === 'registered' && userId) {
		existingTeamQuery.eq('user_id', userId)
	}

	const [existingTeamResult, orderResult] = await Promise.all([
		type === 'registered' && userId
			? existingTeamQuery.maybeSingle()
			: Promise.resolve({ data: null, error: null }),
		supabaseServiceRole
			.from(teamTable)
			.select('order_index')
			.eq(entityColumn, entityId)
			.order('order_index', { ascending: false })
			.limit(1)
			.maybeSingle(),
	])

	if (existingTeamResult.data) {
		return { error: 'This user is already on the team', status: 409 as const }
	}

	const nextOrderIndex =
		orderResult.data?.order_index != null ? orderResult.data.order_index + 1 : 0

	const resolvedFullName =
		type === 'registered'
			? profile?.display_name?.trim() || profile?.email || 'Team Member'
			: (fullName?.trim() ?? '')

	const sharedInsert = {
		full_name: resolvedFullName,
		role_title: roleTitle,
		bio: bio?.trim() || (type === 'registered' ? profile?.bio?.trim() || null : null),
		photo_url:
			photoUrl?.trim() || (type === 'registered' ? profile?.image_url?.trim() || null : null),
		years_involved: yearsInvolved ?? null,
		order_index: nextOrderIndex,
		user_id: type === 'registered' ? (userId ?? null) : null,
	}

	const insertData =
		entityColumn === 'project_id'
			? ({
					...sharedInsert,
					project_id: entityId,
				} satisfies TablesInsert<'project_team'>)
			: ({
					...sharedInsert,
					foundation_id: entityId,
				} satisfies TablesInsert<'foundation_team'>)

	const { data: newMember, error: insertError } = await supabaseServiceRole
		.from(teamTable)
		.insert(insertData)
		.select()
		.single()

	if (insertError) {
		return { error: insertError.message, status: 500 as const }
	}

	if (type === 'registered' && userId) {
		const memberInsert =
			entityColumn === 'project_id'
				? ({
						project_id: entityId,
						user_id: userId,
						role: 'admin',
						title: roleTitle,
					} satisfies TablesInsert<'project_members'>)
				: ({
						foundation_id: entityId,
						user_id: userId,
						role: 'admin',
						title: roleTitle,
					} satisfies TablesInsert<'foundation_members'>)

		const { error: memberError } = await supabaseServiceRole
			.from(membersTable)
			.upsert(memberInsert, {
				onConflict: `${entityColumn},user_id`,
			})

		if (memberError) {
			await supabaseServiceRole.from(teamTable).delete().eq('id', newMember.id)
			return { error: memberError.message, status: 500 as const }
		}
	}

	return { member: mapTeamMember(newMember), status: 201 as const }
}

export async function deleteTeamMemberRecord(input: {
	entityId: string
	entityColumn: 'project_id' | 'foundation_id'
	teamTable: 'project_team' | 'foundation_team'
	membersTable: 'project_members' | 'foundation_members'
	memberId: string
}) {
	const { data: teamMember, error: fetchError } = await supabaseServiceRole
		.from(input.teamTable)
		.select('id, user_id')
		.eq('id', input.memberId)
		.eq(input.entityColumn, input.entityId)
		.maybeSingle()

	if (fetchError || !teamMember) {
		return { error: 'Team member not found', status: 404 as const }
	}

	const { error: deleteError } = await supabaseServiceRole
		.from(input.teamTable)
		.delete()
		.eq('id', input.memberId)
		.eq(input.entityColumn, input.entityId)

	if (deleteError) {
		return { error: deleteError.message, status: 500 as const }
	}

	if (teamMember.user_id) {
		await supabaseServiceRole
			.from(input.membersTable)
			.delete()
			.eq(input.entityColumn, input.entityId)
			.eq('user_id', teamMember.user_id)
	}

	return { status: 200 as const }
}
