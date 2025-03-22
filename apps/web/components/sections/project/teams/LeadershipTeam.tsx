import { useState } from 'react'
import type { ITeamMember } from '~/components/types/team'
import { mockLeadershipTeamData } from '~/lib/mock-data/project/teams'

export const LeadershipTeamCard: React.FC<ITeamMember> = () => {
	return (
		<div className="max-w-sm rounded overflow-hidden shadow-lg bg-white p-6">
			<div className="font-bold text-xl mb-2">Michael Chen</div>
			<p className="text-gray-700 text-base">CEO & Co-Founder</p>
			<p className="text-gray-600 text-sm mt-4">
				Former VP of Engineering at Tesla Energy, 15+ years experience in
				renewable energy systems and mechanical engineering.
			</p>
		</div>
	)
}

export const LeadershipTeam = () => {
	const [teamData] = useState(mockLeadershipTeamData)
	return (
		<div>
			<h2>Leadership Team</h2>
			{/* list */}
			<div>
				{teamData.map((ele) => (
					<LeadershipTeamCard key={`${ele.name}${ele.role}`} {...ele} />
				))}
			</div>
		</div>
	)
}
