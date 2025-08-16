'use client'

import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/base/card'
import { Button } from '~/components/base/button'
import { Textarea } from '~/components/base/textarea'

export interface AskQuestionFormProps {
	newQuestion: string
	onChange: (value: string) => void
	onSubmit: () => void
	isSubmitting?: boolean
	isDisabled?: boolean
}

export function AskQuestionForm({ newQuestion, onChange, onSubmit, isSubmitting, isDisabled }: AskQuestionFormProps) {
	return (
		<Card className="border-0 shadow-sm">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg">Ask a Question</CardTitle>
				<CardDescription>
					Your question will be visible to the project team and community members.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Textarea
					value={newQuestion}
					onChange={(e) => onChange(e.target.value)}
					placeholder="What would you like to know about this project?"
					className="min-h-24 focus:border-primary"
				/>
			</CardContent>
			<CardFooter className="flex justify-end gap-2">
				<Button
					onClick={onSubmit}
					disabled={!newQuestion.trim() || !!isSubmitting || !!isDisabled}
					className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"
					aria-label="Submit your question"
				>
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
							Submitting...
						</>
					) : (
						'Submit Question'
					)}
				</Button>
			</CardFooter>
		</Card>
	)
}

export default AskQuestionForm


