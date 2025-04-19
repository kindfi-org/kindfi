type ImpactJourneyProps = {
	currentImpact: string
	projectRank: string
	totalProjects: number
	supportingSince: string
}

export function ImpactJourney({
	currentImpact,
	projectRank,
	totalProjects,
	supportingSince,
}: ImpactJourneyProps) {
	return (
		<div>
			<h4 className="font-semibold mb-4">Your Impact Journey</h4>
			<div className="space-y-3 text-gray-600">
				<div className="flex justify-between">
					<span>Current Impact</span>
					<span>{currentImpact}</span>
				</div>
				<div className="flex justify-between">
					<span>Project Rank</span>
					<span>
						#{projectRank} of {totalProjects}
					</span>
				</div>
				<div className="flex justify-between ">
					<span>Supporting Since</span>
					<span>{supportingSince}</span>
				</div>
			</div>
		</div>
	)
}
