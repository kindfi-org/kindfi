'use client'

import type React from 'react'

import { ArrowLeft, Check, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/base/dialog'
import { ScrollArea } from '~/components/base/scroll-area'
import ReviewSection from './review-section'
import type { FinalReviewProps } from '~/lib/types/final-review-kyc5.types'

export default function FinalReview({
	onBack,
	onSubmit,
	onStepChange,
	kycData,
}: FinalReviewProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const handleSubmit = async () => {
		setIsSubmitting(true)
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000))
			onSubmit()
			setIsSuccess(true)
			toast.success('KYC Submitted Successfully')
			setTimeout(() => {
				setIsDialogOpen(false)
				setIsSuccess(false)
				setIsSubmitting(false)
			}, 3000)
		} catch (error) {
			toast.error('Submission Failed')
			setIsSubmitting(false)
		}
	}

	return (
		<Card className="w-full max-w-xl mx-auto max-h-[90vh] flex flex-col">
			<CardHeader className="flex-shrink-0">
				<CardTitle className="text-2xl font-semibold">
					Review Your Information
				</CardTitle>
				<p className="text-gray-500">
					Please review all your information before final submission
				</p>
			</CardHeader>

			<CardContent className="space-y-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
				<div className="flex-shrink-0">
					<h3 className="text-lg font-medium mb-2">Step 5 of 5</h3>
					<div className="w-full h-2 bg-gray-200 rounded-full">
						<div className="w-full h-2 bg-black rounded-full" />
					</div>
				</div>

				<ScrollArea className="h-[50vh] pr-4">
					<div className="space-y-8">
						<ReviewSection
							title="Personal Information"
							onEdit={() => onStepChange(1)}
						>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div className="space-y-1">
									<p className="font-medium">Full Name</p>
									<p className="text-gray-600">
										{kycData.personalInfo.fullName}
									</p>
								</div>
								<div className="space-y-1">
									<p className="font-medium">Date of Birth</p>
									<p className="text-gray-600">
										{kycData.personalInfo.dateOfBirth}
									</p>
								</div>
								<div className="space-y-1">
									<p className="font-medium">Nationality</p>
									<p className="text-gray-600">
										{kycData.personalInfo.nationality}
									</p>
								</div>
							</div>
						</ReviewSection>

						<ReviewSection title="ID Document" onEdit={() => onStepChange(2)}>
							<div className="space-y-4">
								<div className="space-y-1">
									<p className="font-medium">Document Type</p>
									<p className="text-gray-600">
										{kycData.documents.documentType}
									</p>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<p className="font-medium">Front Side</p>
										<div className="aspect-[3/2] relative bg-gray-100 rounded-lg overflow-hidden">
											<img
												src="/placeholder.svg?height=200&width=300"
												alt="ID Front"
												className="object-cover w-full h-full"
											/>
										</div>
									</div>
									<div className="space-y-2">
										<p className="font-medium">Back Side</p>
										<div className="aspect-[3/2] relative bg-gray-100 rounded-lg overflow-hidden">
											<img
												src="/placeholder.svg?height=200&width=300"
												alt="ID Back"
												className="object-cover w-full h-full"
											/>
										</div>
									</div>
								</div>
							</div>
						</ReviewSection>

						<ReviewSection
							title="Proof of Address"
							onEdit={() => onStepChange(3)}
						>
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div className="space-y-1">
										<p className="font-medium">Street Address</p>
										<p className="text-gray-600">{kycData.address.street}</p>
									</div>
									<div className="space-y-1">
										<p className="font-medium">City</p>
										<p className="text-gray-600">{kycData.address.city}</p>
									</div>
									<div className="space-y-1">
										<p className="font-medium">Country</p>
										<p className="text-gray-600">{kycData.address.country}</p>
									</div>
								</div>
								<div className="space-y-2">
									<p className="font-medium">Proof Document</p>
									<div className="aspect-[3/2] relative bg-gray-100 rounded-lg overflow-hidden">
										<img
											src="/placeholder.svg?height=200&width=300"
											alt="Proof of Address"
											className="object-cover w-full h-full"
										/>
									</div>
								</div>
							</div>
						</ReviewSection>
					</div>
				</ScrollArea>
			</CardContent>

			<div className="flex justify-between space-x-4 p-6 border-t flex-shrink-0">
				<Button variant="outline" onClick={onBack}>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back
				</Button>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button>Submit for Verification</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
							<X className="h-4 w-4" />
							<span className="sr-only">Close</span>
						</DialogClose>
						{!isSuccess ? (
							<>
								<DialogHeader>
									<DialogTitle>Confirm Submission</DialogTitle>
									<DialogDescription>
										Are you sure you want to submit your KYC information for
										verification? This action cannot be undone.
									</DialogDescription>
								</DialogHeader>
								<div className="flex justify-end space-x-4 mt-4">
									<Button
										variant="outline"
										onClick={() => setIsDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button onClick={handleSubmit} disabled={isSubmitting}>
										{isSubmitting ? 'Submitting...' : 'Confirm Submission'}
									</Button>
								</div>
							</>
						) : (
							<div className="flex flex-col items-center justify-center py-6">
								<div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
									<Check className="h-6 w-6 text-green-600" />
								</div>
								<DialogTitle className="text-center mb-2">
									Submission Successful
								</DialogTitle>
								<DialogDescription className="text-center">
									Your KYC information has been submitted successfully. We will
									review your information and get back to you soon.
								</DialogDescription>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</Card>
	)
}
