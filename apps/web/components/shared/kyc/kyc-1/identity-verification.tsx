'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowRight, Shield } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Form } from '~/components/base/form'
import { DateOfBirthField } from './date-of-birth-field'
import { FullNameField } from './full-name-field'
import { NationalityField } from './nationality-field'
import { ProgressIndicator } from './progress-indicator'
import {
	type IdentityFormValues,
	type IdentityVerificationProps,
	identitySchema,
} from './types'

export function IdentityVerification({
	onCancel,
	onNext,
	defaultValues,
}: IdentityVerificationProps) {
	const [isOpen, setIsOpen] = useState(true)
	const [submissionError, setSubmissionError] = useState<string | null>(null)

	const form = useForm<IdentityFormValues>({
		resolver: zodResolver(identitySchema),
		defaultValues: {
			fullName: defaultValues?.fullName || '',
			dateOfBirth: defaultValues?.dateOfBirth
				? new Date(defaultValues.dateOfBirth)
				: undefined,
			nationality: defaultValues?.nationality || '',
		},
	})

	const handleClose = () => {
		setIsOpen(false)
	}

	const handleContinue = () => {
		setIsOpen(false)
	}

	if (!isOpen) return null

	const handleSubmit = async (data: IdentityFormValues) => {
		try {
			console.log('Submitting data:', data)
			setSubmissionError(null)
			await onNext(data)
			console.log('Submission successful')
		} catch (error) {
			console.error('Error submitting data:', error)
			setSubmissionError('Error submitting data. Please try again.')
		}
	}

	return (
		<Card className="w-full max-w-xl mx-auto">
			<CardHeader className="flex flex-row items-center gap-2">
				<Shield className="h-5 w-5" />
				<div>
					<CardTitle className="text-2xl font-semibold">
						Verify Your Identity
					</CardTitle>
					<p className="text-gray-500 mt-1">
						Let's start by confirming some basic information about you.
					</p>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				<ProgressIndicator step={1} totalSteps={5} />

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-6"
					>
						<FullNameField control={form.control} />
						<DateOfBirthField control={form.control} />
						<NationalityField control={form.control} />

						{submissionError && (
							<div className="bg-red-50 p-4 rounded-lg border border-red-200">
								<div className="flex gap-2">
									<AlertCircle className="h-5 w-5 text-red-700 flex-shrink-0 mt-0.5" />
									<div>
										<p className="text-sm text-red-600">{submissionError}</p>
									</div>
								</div>
							</div>
						)}

						<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
							<div className="flex gap-2">
								<AlertCircle className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
								<div>
									<p className="font-medium mb-1">Important</p>
									<p className="text-sm text-gray-600">
										Please ensure all information matches your official
										documents. This information cannot be changed later without
										contacting support.
									</p>
								</div>
							</div>
						</div>

						<div className="flex justify-end space-x-4 pt-4">
							<Button type="button" variant="outline" onClick={onCancel}>
								Cancel
							</Button>
							<Button
								type="submit"
								className="bg-black text-white hover:bg-black/80"
							>
								Continue <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
