'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Textarea } from '~/components/base/textarea'

// Define the form schema with Zod based on actual DB structure
const updateFormSchema = z.object({
	content: z.string().min(1, { message: 'Content is required' }),
})

type UpdateFormValues = z.infer<typeof updateFormSchema>

interface UpdateData {
	id?: string
	content: string
}

interface UpdateFormProps {
	update?: UpdateData
	onSubmit: (data: UpdateData) => void
	onCancel: () => void
	isSubmitting: boolean
}

export function UpdateForm({
	update,
	onSubmit,
	onCancel,
	isSubmitting,
}: UpdateFormProps) {
	const form = useForm<UpdateFormValues>({
		resolver: zodResolver(updateFormSchema),
		defaultValues: {
			content: update?.content || '',
		},
	})

	// Handle form submission
	const handleSubmit = (values: UpdateFormValues) => {
		// If we're editing, preserve the ID
		if (update?.id) {
			onSubmit({ ...values, id: update.id })
		} else {
			onSubmit(values)
		}
	}

	return (
		<Card className="mb-6 border-blue-100">
			<CardContent className="p-6">
				<h3 className="text-2xl font-bold mb-4">
					{update?.id ? 'Edit Update' : 'Create New Update'}
				</h3>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormLabel
										htmlFor="update-content"
										className="block font-medium mb-1"
									>
										Content
									</FormLabel>
									<FormControl>
										<Textarea
											id="update-content"
											placeholder="Share an update about your project..."
											rows={8}
											{...field}
										/>
									</FormControl>
									<FormMessage className="text-red-500 text-sm mt-1" />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-3 pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : update?.id ? (
									'Save Changes'
								) : (
									'Post Update'
								)}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
