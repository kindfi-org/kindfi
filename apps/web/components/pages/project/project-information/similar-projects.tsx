interface SimilarProjectsProps {
	projects?: Array<{
		id: string | number
		title: string
		description: string
		amountRaised: number
		percentageComplete: number
		imageUrl?: string
	}>
	onViewMoreClick?: () => void
}

const SimilarProjects = ({
	projects = [],
	onViewMoreClick = () => {},
}: SimilarProjectsProps) => {
	const displayProjects =
		projects.length > 0
			? projects
			: [
					{
						id: 'example1',
						title: 'EcoFlow Energy Solutions',
						description: 'Renewable energy storage for residential',
						amountRaised: 1200000,
						percentageComplete: 80,
					},
					{
						id: 'example2',
						title: 'GreenPower Storage Systems',
						description: 'Grid-scale energy storage technology',
						amountRaised: 1200000,
						percentageComplete: 57,
					},
				]
	return (
		<>
			<div className="w-full bg-white shadow-gray-200 shadow-md rounded-lg py-6 px-6 my-5">
				<p className=" font-bold text-lg">Similar Projects </p>

				<div className="w-full  mt-2">
					{displayProjects.map((project) => (
						// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
						<div
							key={project.id}
							className="w-full flex items-start justify-between gap-3 my-3 cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
							// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
							onClick={() => (window.location.href = `/project/${project.id}`)}
						>
							<div className="w-[20%] lg:w-[10%]">
								<div className="bg-gray-300 rounded-sm h-10" />
							</div>

							<div className="w-[80%] lg:w-[90%]">
								<p className="text-sm font-semibold truncate">
									{project.title}
								</p>
								<p className="text-xs text-gray-400 font-normal truncate">
									{project.description}
								</p>

								<div className="w-full flex items-center justify-start gap-3 mt-2">
									<div className="w-auto py-1 px-4 rounded-lg bg-slate-200">
										<p className="font-bold text-[9px] capitalize">
											{(project.amountRaised / 1000000).toFixed(1)}M raised
										</p>
									</div>

									<p className="text-gray-400 font-semibold text-xs">
										{project.percentageComplete}%
									</p>
								</div>
							</div>
						</div>
					))}

					<div className="w-full mt-5">
						{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
						<p
							className="text-xs text-center cursor-pointer font-bold hover:text-blue-600 transition-colors"
							onClick={onViewMoreClick}
						>
							View more
						</p>
					</div>
				</div>
			</div>
		</>
	)
}

export default SimilarProjects
