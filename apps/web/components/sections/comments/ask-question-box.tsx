'use client'

import { useState } from 'react'
import { Button } from '~/components/base/button'
import { Textarea } from '~/components/base/textarea'

// TODO: Move this to the types folder

interface AskQuestionBoxProps {
	onSubmit: (text: string) => void
	onAfterSubmit?: () => void
	placeholder?: string
	inline?: boolean
}

export const AskQuestionBox = ({
	onSubmit,
	onAfterSubmit,
	placeholder = 'Ask a question or leave a comment...',
	inline = false,
}: AskQuestionBoxProps) => {
	const [text, setText] = useState('')

	const handleSubmit = () => {
		if (text.trim()) {
			onSubmit(text)
			setText('')
			onAfterSubmit?.()
		}
	}

	const content = (
		<div className="max-w-3xl mx-auto">
			<Textarea
				placeholder={placeholder}
				value={text}
				onChange={(e) => setText(e.target.value)}
				className="resize-none"
			/>
			<div className="flex justify-end mt-2">
				<Button type="button" onClick={handleSubmit} disabled={!text.trim()}>
					Submit
				</Button>
			</div>
		</div>
	)

	if (inline) {
		return <div className="mt-2">{content}</div>
	}

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-20">
			{content}
		</div>
	)
}
