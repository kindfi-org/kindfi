import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/base/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { Textarea } from '~/components/base/textarea'
import { useToast } from '~/components/base/toast'
import { STATUS_OPTIONS } from '~/lib/constants/dashboard'

const addReviewSchema = z.object({
	status: z.enum(['pending', 'approved', 'rejected', 'verified']),
	notes: z.string().optional(),
})

type AddReviewFormData = z.infer<typeof addReviewSchema>

interface AddReviewFormProps {
	userId: string
	onReviewAdded?: () => void
}

export function AddReviewForm({ userId, onReviewAdded }: AddReviewFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { toast, toasts } = useToast()

	const form = useForm<AddReviewFormData>({
		resolver: zodResolver(addReviewSchema),
		defaultValues: {
			status: undefined,
			notes: '',
		},
	})

	async function onSubmit(data: AddReviewFormData) {
		setIsSubmitting(true)

		try {
			const response = await fetch(`/api/users/${userId}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					status: data.status,
					notes: data.notes || null,
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || 'Failed to update KYC status')
			}

			await response.json()

			toast({
				title: 'Review added successfully',
				description: `KYC status updated to ${data.status}`,
			})

			// Reset form after successful submission
			form.reset()

			// Call the callback if provided (to refresh data)
			onReviewAdded?.()
		} catch (error) {
			console.error('Error adding review:', error)
			toast({
				title: 'Failed to add review',
				description:
					error instanceof Error ? error.message : 'Please try again later',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<section
			className="flex flex-col gap-3"
			aria-labelledby="add-review-heading"
		>
			<Label id="add-review-heading" className="text-base font-medium">
				Add Review
			</Label>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Decision</FormLabel>
								<Select
									value={field.value}
									onValueChange={field.onChange}
									disabled={isSubmitting}
								>
									<FormControl>
										<SelectTrigger aria-label="Select review decision">
											<SelectValue placeholder="Select decision" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{Object.entries(STATUS_OPTIONS).map(
											([value, { label, icon: Icon, color }]) => (
												<SelectItem key={value} value={value}>
													<span className="flex items-center gap-2">
														<Icon
															className={`w-4 h-4 ${color}`}
															aria-hidden="true"
														/>
														<span>{label}</span>
													</span>
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="notes"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Review Notes (Optional)</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										value={field.value ?? ''}
										placeholder="Enter your review notes..."
										className="min-h-[120px]"
										disabled={isSubmitting}
										aria-describedby="review-notes-description"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? 'Submitting...' : 'Add Review'}
					</Button>
				</form>
			</Form>
		</section>
	)
}
