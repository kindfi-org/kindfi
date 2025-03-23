'use client'
import { useState } from 'react'
import {
	mockAdvisoryBoardData,
	mockLeadershipTeamData,
} from '~/lib/mock-data/project/teams'
import { AdvisoryBoard } from './AdvisoryBoard'
import { LeadershipTeam } from './LeadershipTeam'

const TeamsTab = () => {
	const [leadershipTeamData] = useState(mockLeadershipTeamData)
	const [advisoryTeamData] = useState(mockAdvisoryBoardData)
	return (
		<div className="bg-white">
			<LeadershipTeam
				data={leadershipTeamData}
				totalCount={advisoryTeamData.length + leadershipTeamData.length}
			/>
			<AdvisoryBoard data={advisoryTeamData} />
		</div>
	)
}

export default TeamsTab
