'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Loader2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
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
import type { CreateTeamMemberData } from '~/lib/types/project/project-team.types'

interface AddTeamMemberFormProps {
	onAdd: (data: CreateTeamMemberData) => Promise<void>
	className?: string
}

const teamMemberSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(1, 'Full name is required')
		.max(100, 'Full name is too long'),
	roleTitle: z
		.string()
		.trim()
		.min(1, 'Role/title is required')
		.max(100, 'Role/title is too long'),
	bio: z
		.string()
		.trim()
		.max(300, 'Bio must be 2-3 lines (max 300 characters)')
		.optional(),
	photoUrl: z
		.string()
		.url('Please enter a valid URL')
		.optional()
		.or(z.literal('')),
	yearsInvolved: z
		.number()
		.int('Years must be a whole number')
		.min(0, 'Years cannot be negative')
		.max(100, 'Please enter a valid number of years')
		.optional(),
})

type TeamMemberFormData = z.infer<typeof teamMemberSchema>

export function AddTeamMemberForm({
	onAdd,
	className,
}: AddTeamMemberFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<TeamMemberFormData>({
		resolver: zodResolver(teamMemberSchema),
		defaultValues: {
			fullName: '',
			roleTitle: '',
			bio: '',
			photoUrl: '',
			yearsInvolved: undefined,
		},
	})

	const handleSubmit = async (data: TeamMemberFormData) => {
		try {
			setIsSubmitting(true)
			await onAdd({
				fullName: data.fullName,
				roleTitle: data.roleTitle,
				bio: data.bio || undefined,
				photoUrl: data.photoUrl || undefined,
				yearsInvolved: data.yearsInvolved,
			})
			form.reset()
		} catch (error) {
			console.error('Failed to add team member:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className={className}
		>
			<Card className="border border-border bg-card shadow-sm">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserPlus className="h-5 w-5" aria-hidden="true" />
						Add Team Member
					</CardTitle>
					<CardDescription>
						Add someone who&apos;s behind this project. No account required.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-4"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="fullName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Full Name <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input
													placeholder="John Doe"
													disabled={isSubmitting}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="roleTitle"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Role / Title <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input
													placeholder="e.g., Project Lead, Designer"
													disabled={isSubmitting}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="bio"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Short Bio{' '}
											<span className="text-muted-foreground text-xs">
												(optional, 2-3 lines)
											</span>
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Brief description of their role and contribution..."
												rows={3}
												disabled={isSubmitting}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="photoUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Photo URL{' '}
												<span className="text-muted-foreground text-xs">
													(optional)
												</span>
											</FormLabel>
											<FormControl>
												<Input
													placeholder="https://example.com/photo.jpg"
													type="url"
													disabled={isSubmitting}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="yearsInvolved"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Years Involved{' '}
												<span className="text-muted-foreground text-xs">
													(optional)
												</span>
											</FormLabel>
											<FormControl>
												<Input
													placeholder="e.g., 3"
													type="number"
													min={0}
													max={100}
													disabled={isSubmitting}
													{...field}
													onChange={(e) =>
														field.onChange(
															e.target.value
																? parseInt(e.target.value, 10)
																: undefined,
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="flex justify-end">
								<Button
									type="submit"
									disabled={isSubmitting}
									variant="primary-gradient"
									className="flex items-center gap-2"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Adding...
										</>
									) : (
										<>
											<UserPlus className="h-4 w-4" />
											Add Team Member
										</>
									)}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</motion.div>
	)
}
