import { useState } from 'react'

interface AskQuestionBoxProps {
	onSubmit: (question: string) => void
}

const AskQuestionBox: React.FC<AskQuestionBoxProps> = ({ onSubmit }) => {
	const [question, setQuestion] = useState('')

	const handleSubmit = () => {
		if (question.trim() === '') return
		onSubmit(question)
		setQuestion('') // Clear input after submission
	}

	return (
		<div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
			<h1 className="font-semibold mb-2">Have a Question?</h1>
			<textarea
				className="w-full p-2 border rounded-md"
				placeholder="Ask the team directly and get answers to vour most pressing questions"
				value={question}
				onChange={(e) => setQuestion(e.target.value)}
			/>
			<button
				type="submit"
				className="mt-2 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
				onClick={handleSubmit}
			>
				Submit Question
			</button>
		</div>
	)
}


export { AskQuestionBox }

