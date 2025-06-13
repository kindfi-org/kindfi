import { zodResolver } from '@hookform/resolvers/zod'
import { kycReviewsInsertSchema } from '@services/supabase'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

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
import type { KycReviewsInsertValues } from '~/lib/types/dashboard'

interface AddReviewFormProps {
	userId: string
}

export function AddReviewForm({ userId }: AddReviewFormProps) {
	const form = useForm<KycReviewsInsertValues>({
		resolver: zodResolver(kycReviewsInsertSchema),
		defaultValues: {
			decision: undefined,
			review_notes: '',
			additional_notes: '',
		},
	})

	function onSubmit(data: KycReviewsInsertValues) {
		toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
			loading: `Adding review for ${userId}`,
			success: 'Review added successfully',
			error: 'Failed to add review',
		})

		// Reset form after successful submission
		form.reset()
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
						name="decision"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Decision</FormLabel>
								<Select {...field} onValueChange={field.onChange}>
									<FormControl>
										<SelectTrigger aria-label="Select review decision">
											<SelectValue placeholder="Select decision" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="approved">Approve</SelectItem>
										<SelectItem value="rejected">Reject</SelectItem>
										<SelectItem value="pending">Mark as Pending</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="review_notes"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Review Notes</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										value={field.value ?? ''}
										placeholder="Enter your review notes..."
										className="min-h-[80px]"
										aria-describedby="review-notes-description"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="additional_notes"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Additional Notes (Optional)</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										value={field.value ?? ''}
										placeholder="Any additional comments..."
										className="min-h-[60px]"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full">
						Add Review
					</Button>
				</form>
			</Form>
		</section>
	)
}
