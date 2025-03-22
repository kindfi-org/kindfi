import { useState } from 'react'
import type { ITeamMember } from '~/components/types/team'
import { mockAdvisoryBoardData } from '~/lib/mock-data/project/teams'

export const AdvisoryBoardCard: React.FC<ITeamMember> = () => {
	return (
		<div className="max-w-sm rounded overflow-hidden shadow-lg bg-white p-6">
			<div className="font-bold text-xl mb-2">James Takahashi</div>
			<p className="text-gray-700 text-base">Industry Veteran</p>
			<p className="text-gray-600 text-sm mt-4">Former CEO of Pacific Grid</p>
		</div>
	)
}

export const AdvisoryBoard = () => {
	const [teamData] = useState(mockAdvisoryBoardData)
	return (
		<div>
			<h2>Advisory Board</h2>
			{/* list */}
			<div>
				{teamData.map((ele) => (
					<AdvisoryBoardCard key={`${ele.name}${ele.role}`} {...ele} />
				))}
			</div>
		</div>
	)
}
