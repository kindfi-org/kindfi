import React from 'react'
import { TeamMembersPage } from '~/components/pages/team-members/team-members'
import TeamsTab from '~/components/sections/project/teams/TeamsTab'

export default function page() {
	return (
		<>
			<TeamsTab />
			<div>
				<TeamMembersPage />
			</div>
		</>
	)
}
