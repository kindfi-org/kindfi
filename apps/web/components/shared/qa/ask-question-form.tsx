'use client'

import { HelpCircle, Loader2 } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Textarea } from '~/components/base/textarea'
import { FormActions } from '~/components/shared/form/form-actions'
import { FormFieldGroup } from '~/components/shared/form/form-field-group'
import { FormSectionHeader } from '~/components/shared/form/form-section-header'
import { formLayoutClasses } from '~/lib/form/form-styles'
import { cn } from '~/lib/utils'

export interface AskQuestionFormProps {
	newQuestion: string
	onChange: (value: string) => void
	onSubmit: () => void
	isSubmitting?: boolean
	isDisabled?: boolean
}

export function AskQuestionForm({
	newQuestion,
	onChange,
	onSubmit,
	isSubmitting,
	isDisabled,
}: AskQuestionFormProps) {
	return (
		<div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
			<div className="border-b bg-[#fafbfc] px-5 py-4 sm:px-6">
				<FormSectionHeader
					icon={HelpCircle}
					title="Ask a Question"
					description="Your question will be visible to the project team and community members."
					className="border-0 pb-0"
				/>
			</div>

			<div className={cn(formLayoutClasses.stack, 'px-5 py-5 sm:px-6 sm:py-6')}>
				<FormFieldGroup
					id="project-question"
					label="Your question"
					description="Be specific so the team can give a helpful answer."
				>
					<Textarea
						id="project-question"
						value={newQuestion}
						onChange={(e) => onChange(e.target.value)}
						placeholder="What would you like to know about this project?"
						rows={4}
					/>
				</FormFieldGroup>

				<FormActions align="end" className="mt-0 border-0 pt-0">
					<Button
						onClick={onSubmit}
						disabled={!newQuestion.trim() || !!isSubmitting || !!isDisabled}
						className="gradient-btn min-w-36 rounded-full text-white"
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
				</FormActions>
			</div>
		</div>
	)
}

export default AskQuestionForm
