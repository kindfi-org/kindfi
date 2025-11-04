import { zodResolver } from '@hookform/resolvers/zod'
import { kycReviewsInsertSchema } from '@services/supabase'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { Button } from '~/components/base/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import type { KycRecord } from '~/lib/types/dashboard'

interface KycDetailsFormProps {
	item: KycRecord
}

export function KycDetailsForm({ item }: KycDetailsFormProps) {
	const form = useForm<z.infer<typeof kycReviewsInsertSchema>>({
		resolver: zodResolver(kycReviewsInsertSchema),
		defaultValues: {
			user_id: item.userId,
			status: item.status || 'pending',
			verification_level: item.verificationLevel || 'basic',
			notes: item.notes || '',
			created_at: item.createdAt,
			updated_at: item.updatedAt,
		},
	})

	function onSubmit(data: z.infer<typeof kycReviewsInsertSchema>) {
		toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
			loading: `Updating KYC details for ${data.user_id}`,
			success: 'KYC details updated successfully',
			error: 'Failed to update KYC details',
		})
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<FormField
					control={form.control}
					name="user_id"
					render={({ field }) => (
						<FormItem>
							<FormLabel>User ID</FormLabel>
							<FormControl>
								<Input {...field} readOnly />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Status</FormLabel>
								<Select
									value={field.value ?? undefined}
									onValueChange={field.onChange}
								>
									<FormControl>
										<SelectTrigger aria-label="Select KYC status">
											<SelectValue placeholder="Select a status" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="approved">Approved</SelectItem>
										<SelectItem value="rejected">Rejected</SelectItem>
										<SelectItem value="verified">Verified</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="verification_level"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Verification Level</FormLabel>
								<Select
									onValueChange={field.onChange}
									value={field.value ?? undefined}
								>
									<FormControl>
										<SelectTrigger aria-label="Select verification level">
											<SelectValue placeholder="Select a level" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="basic">Basic</SelectItem>
										<SelectItem value="enhanced">Enhanced</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<FormField
						control={form.control}
						name="created_at"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Created</FormLabel>
								<FormControl>
									<Input
										{...field}
										value={
											field.value
												? new Date(field.value).toLocaleDateString()
												: ''
										}
										readOnly
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="updated_at"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Updated</FormLabel>
								<FormControl>
									<Input
										{...field}
										value={
											field.value
												? new Date(field.value).toLocaleDateString()
												: ''
										}
										readOnly
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button type="submit" className="w-full">
					Update KYC Details
				</Button>
			</form>
		</Form>
	)
}
