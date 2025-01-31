import type React from 'react'
import { FaBookmark, FaCheckCircle, FaClock, FaShareAlt } from 'react-icons/fa'

interface TimelineEvent {
	title: string
	date: string
	status: 'completed' | 'pending'
}

interface TimelineProps {
	events: TimelineEvent[]
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
	return (
		<div className="timeline space-y-4 bg-gray-50 rounded-lg p-6 shadow-lg border border-gray-200">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold text-black">Impact Timeline</h3>
				<div className="flex space-x-4">
					<button className="flex items-center text-sm font-medium text-blue-600 hover:underline">
						<FaShareAlt className="mr-2" />
						Share
					</button>
					<button className="flex items-center text-sm font-medium text-blue-600 hover:underline">
						<FaBookmark className="mr-2" />
						Bookmark
					</button>
				</div>
			</div>
			<ul className="space-y-4">
				{events.map((event, index) => (
					<li
						key={index}
						className="flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200"
					>
						<div className="flex items-center">
							{event.status === 'completed' ? (
								<FaCheckCircle className="w-6 h-6 text-green-500 mr-4" />
							) : (
								<FaClock className="w-6 h-6 text-gray-400 mr-4" />
							)}
							<div>
								<p className="text-sm font-medium text-gray-900">
									{event.title}
								</p>
								<p className="text-sm text-gray-500">{event.date}</p>
							</div>
						</div>

						<span
							className={`text-sm font-medium px-3 py-1 rounded-lg ${
								event.status === 'completed'
									? 'bg-green-100 text-green-600'
									: 'bg-gray-100 text-gray-500'
							}`}
						>
							{event.status === 'completed' ? 'Completed' : 'Pending'}
						</span>
					</li>
				))}
			</ul>
		</div>
	)
}

export default Timeline
