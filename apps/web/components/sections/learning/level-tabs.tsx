interface LevelTabsProps {
	value: string
	onValueChange: (value: string) => void
	className?: string
}

export function LevelTabs({
	value,
	onValueChange,
	className = '',
}: LevelTabsProps) {
	const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

	return (
		<div className="bg-gray-50/80">
			<div className={`inline-flex p-1 ${className}`}>
				{levels.map((level) => {
					const isActive = value === level.toLowerCase()
					return (
						// biome-ignore lint/a11y/useButtonType: <explanation>
						<button
							key={level}
							onClick={() => onValueChange(level.toLowerCase())}
							className={`
                  px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${
										isActive
											? 'bg-white text-black shadow-sm'
											: 'text-gray-500 hover:text-gray-900'
									}
                `}
						>
							{level}
						</button>
					)
				})}
			</div>
		</div>
	)
}
