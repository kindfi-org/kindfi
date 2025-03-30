import { ChevronDown, MessageCircle } from 'lucide-react'
import { useState } from 'react'

interface Answer {
	id: number
	author: string
	role: string
	timeAgo: string
	content: string
}

interface QuestionProps {
	question: string
	author: string
	timeAgo: string
	answers: Answer[]
}

const QuestionCard: React.FC<QuestionProps> = ({
	question,
	author,
	timeAgo,
	answers,
}) => {
	const [isExpanded, setIsExpanded] = useState(false)

	const toggleExpand = (event: React.MouseEvent | React.KeyboardEvent) => {
		if ('key' in event && event.key !== 'Enter' && event.key !== ' ') return
		setIsExpanded((prev) => !prev)
	}

	return (
		<div className="mb-4 border rounded-lg p-4 shadow-sm bg-white">
			<button
				className="flex items-start justify-between w-full cursor-pointer focus:outline-none"
				type="button"
				onClick={toggleExpand}
				onKeyDown={toggleExpand}
				tabIndex={0}
				aria-expanded={isExpanded}
			>
				<div className="flex space-x-3">
					<MessageCircle className="w-5 h-5 text-blue-500" />
					<div>
						<p className="font-medium text-left">{question}</p>
						<p className="text-sm text-left text-gray-500">
							Asked by {author} • {timeAgo}
						</p>
					</div>
				</div>
				{answers.length > 0 && (
					<ChevronDown
						className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
					/>
				)}
			</button>

			{isExpanded && answers.length > 0 && (
				<div className="mt-2 p-3 bg-gray-100 rounded-md">
					{answers.map((answer) => (
						<div key={answer.id} className="mb-2">
							<span className="bg-green-200 text-xs p-1 rounded-full border">
								{answer.role}
							</span>{' '}
							<span className="font-medium">{answer.author}</span> •{' '}
							{answer.timeAgo}
							<p className="text-gray-700 mt-1">{answer.content}</p>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export { QuestionCard }
