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
import { Input } from '~/components/base/input'
import { Textarea } from '~/components/base/textarea'

// Define the form schema with Zod
const updateFormSchema = z.object({
	title: z.string().min(1, { message: 'Title is required' }),
	description: z.string().min(1, { message: 'Description is required' }),
})

// Infer the type from the schema
type UpdateFormValues = z.infer<typeof updateFormSchema>

interface UpdateFormProps {
	update?: {
		id: string
		title: string
		description: string
	}
	onSubmit: (data: { title: string; description: string }) => void
	onCancel: () => void
	isSubmitting: boolean
}

export function UpdateForm({
	update,
	onSubmit,
	onCancel,
	isSubmitting,
}: UpdateFormProps) {
	// Initialize the form with react-hook-form and zod resolver
	const form = useForm<UpdateFormValues>({
		resolver: zodResolver(updateFormSchema),
		defaultValues: {
			title: update?.title || '',
			description: update?.description || '',
		},
	})

	// Handle form submission
	const handleSubmit = (values: UpdateFormValues) => {
		onSubmit(values)
	}

	return (
		<Card className="mb-6 border-blue-100">
			<CardContent className="p-6">
				<h3 className="text-xl font-bold mb-4">
					{update ? 'Edit Update' : 'Create New Update'}
				</h3>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel
										htmlFor="update-title"
										className="block text-sm font-medium mb-1"
									>
										Title
									</FormLabel>
									<FormControl>
										<Input
											id="update-title"
											placeholder="Enter update title"
											{...field}
										/>
									</FormControl>
									<FormMessage className="text-red-500 text-sm mt-1" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel
										htmlFor="update-description"
										className="block text-sm font-medium mb-1"
									>
										Description
									</FormLabel>
									<FormControl>
										<Textarea
											id="update-description"
											placeholder="Enter update details"
											rows={5}
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
								) : update ? (
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
