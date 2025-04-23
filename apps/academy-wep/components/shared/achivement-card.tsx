import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import type React from 'react'

export interface AchievementCardProps {
	title: string
	description: string
	icon: LucideIcon
	iconColor: string
	status: 'completed' | 'in-progress' | 'locked'
	completedDate?: string
	tokenId?: string
	viewLink?: string
	moduleRequired?: string
}

const AchievementCard: React.FC<AchievementCardProps> = ({
	title,
	description,
	icon: Icon,
	iconColor,
	status,
	completedDate,
	tokenId,
	viewLink,
	moduleRequired,
}) => {
	const isLocked = status === 'locked'
	const isCompleted = status === 'completed'

	return (
		<div className="group bg-white border hover:shadow-lg border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center relative transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-gray-300">
			<div
				className="w-20 h-20 rounded-full mb-4 flex items-center justify-center border-2 transition-colors duration-300 group-hover:border-2 group-hover:border-opacity-80"
				style={{
					borderColor: iconColor,
					backgroundColor: isLocked ? '#F3F4F6' : 'white',
				}}
			>
				<Icon
					color={iconColor}
					size={32}
					strokeWidth={1.5}
					className="transition-transform duration-300 group-hover:scale-110"
				/>
			</div>

			<h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
				{title}
			</h3>
			<p className="text-sm text-gray-500 mb-4 group-hover:text-gray-600 transition-colors">
				{description}
			</p>

			{isCompleted && (
				<div className="text-xs text-green-600 mb-4 flex flex-col items-center">
					<span>Earned on {completedDate}</span>
					{tokenId && (
						<span className="text-gray-500 truncate max-w-full">
							Token ID: {tokenId}
						</span>
					)}
				</div>
			)}

			{isCompleted && viewLink && (
				<Link
					href={viewLink}
					className="text-sm text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-300 hover:text-blue-700"
				>
					View on Stellar
				</Link>
			)}

			{!isCompleted && !viewLink && <p>{moduleRequired}</p>}

			{!isCompleted && (
				<button
					type="button"
					className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg w-full hover:bg-blue-100 hover:text-blue-700 transition-colors duration-300"
				>
					Start Learning
				</button>
			)}
		</div>
	)
}

export default AchievementCard
