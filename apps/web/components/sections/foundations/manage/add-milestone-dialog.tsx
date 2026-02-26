'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '~/components/base/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/base/dialog'
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

const addMilestoneSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().optional(),
	achievedDate: z.string().min(1, 'Date is required'),
	impactMetric: z.string().optional(),
})

type AddMilestoneFormData = z.infer<typeof addMilestoneSchema>

type AddMilestoneDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	foundationSlug: string
}

function formatDateForInput(date: Date): string {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

export function AddMilestoneDialog({
	open,
	onOpenChange,
	foundationSlug,
}: AddMilestoneDialogProps) {
	const queryClient = useQueryClient()

	const form = useForm<AddMilestoneFormData>({
		resolver: zodResolver(addMilestoneSchema),
		defaultValues: {
			title: '',
			description: '',
			achievedDate: formatDateForInput(new Date()),
			impactMetric: '',
		},
	})

	const mutation = useMutation({
		mutationFn: async (data: AddMilestoneFormData) => {
			const res = await fetch(`/api/foundations/${foundationSlug}/milestones`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: data.title,
					description: data.description || null,
					achievedDate: data.achievedDate,
					impactMetric: data.impactMetric || null,
				}),
			})
			if (!res.ok) {
				const err = await res.json().catch(() => ({}))
				throw new Error(err.error ?? 'Failed to add milestone')
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['supabase', 'foundation', foundationSlug],
			})
			toast.success('Milestone added.')
			form.reset({
				title: '',
				description: '',
				achievedDate: formatDateForInput(new Date()),
				impactMetric: '',
			})
			onOpenChange(false)
		},
		onError: (error: Error) => {
			toast.error(error.message)
		},
	})

	const handleSubmit = form.handleSubmit((data) => {
		mutation.mutate(data)
	})

	const handleOpenChange = (next: boolean) => {
		if (!next && !mutation.isPending) {
			form.reset()
		}
		onOpenChange(next)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className="sm:max-w-md"
				aria-describedby="add-milestone-description"
			>
				<DialogHeader>
					<DialogTitle>Add milestone</DialogTitle>
					<DialogDescription id="add-milestone-description">
						Record a key achievement for your foundation. This will be shown on
						your public profile.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={handleSubmit} className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g. Reached 10,000 beneficiaries…"
											className="focus-visible:ring-2 focus-visible:ring-purple-500"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="achievedDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Date achieved</FormLabel>
									<FormControl>
										<Input
											type="date"
											className="focus-visible:ring-2 focus-visible:ring-purple-500"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description (optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Brief context or details…"
											className="min-h-[80px] resize-none focus-visible:ring-2 focus-visible:ring-purple-500"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="impactMetric"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Impact metric (optional)</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g. 10,000 people helped…"
											className="focus-visible:ring-2 focus-visible:ring-purple-500"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter className="gap-2 sm:gap-0">
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
								disabled={mutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={mutation.isPending}
								className="focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
							>
								{mutation.isPending ? 'Adding…' : 'Add milestone'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
