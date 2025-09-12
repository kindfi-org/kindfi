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
	CSRFTokenField,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import type { InviteMemberData } from '~/lib/types/project/team-members.types'
import { RoleSelect } from './role-select'

const inviteSchema = z.object({
	email: z
		.string()
		.trim()
		.toLowerCase()
		.email('Please enter a valid email address')
		.max(254, 'Email is too long'),
	role: z.enum([
		'admin',
		'editor',
		'advisor',
		'community',
		'core',
		'others',
	] as const),
	title: z.string().trim().max(80, 'Title is too long').optional(),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface InviteMemberFormProps {
	onInvite: (data: InviteMemberData) => Promise<void>
	isLoading?: boolean
	className?: string
}

export function InviteMemberForm({
	onInvite,
	isLoading = false,
	className,
}: InviteMemberFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<InviteFormData>({
		resolver: zodResolver(inviteSchema),
		defaultValues: {
			email: '',
			role: 'community',
			title: '',
		},
	})

	const handleSubmit = async (data: InviteFormData) => {
		try {
			setIsSubmitting(true)
			await onInvite({
				email: data.email,
				role: data.role,
				title: data.title || undefined,
			})
			form.reset()
		} catch (error) {
			console.error('Failed to invite member:', error)
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
			<Card className="bg-white">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserPlus aria-hidden className="h-5 w-5" />
						Invite Team Member
					</CardTitle>
					<CardDescription>
						Send an invitation to add a new member to your project team.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-4"
						>
							<CSRFTokenField />
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Email Address{' '}
												<span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input
													placeholder="member@example.com"
													type="email"
													autoComplete="email"
													className="bg-white border-green-600"
													disabled={isLoading || isSubmitting}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="role"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Role <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<RoleSelect
													value={field.value}
													onValueChange={field.onChange}
													disabled={isLoading || isSubmitting}
													className="w-full"
													showDescription
													descriptions={{
														admin:
															'Leads coordination, aligns stakeholders, and drives key project decisions.',
														editor:
															'Owns content and documentation quality; refines specs, copy, and visuals.',
														advisor:
															'Provides strategic guidance, mentorship, and domain expertise.',
														community:
															'Engages users, gathers feedback, and nurtures community relations.',
														core: 'Handles core responsibilities across planning, delivery, and execution.',
														others:
															'Custom role for specialized contributions not covered by standard roles.',
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title (optional)</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., Software Engineer, Marketing Lead"
												className="bg-white border-green-600"
												disabled={isLoading || isSubmitting}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end">
								<Button
									type="submit"
									disabled={isLoading || isSubmitting}
									aria-label={
										isSubmitting ? 'Sending invitation' : 'Send invitation'
									}
									className="flex items-center gap-2 px-8 text-white gradient-btn"
								>
									{isSubmitting ? (
										<>
											<Loader2 aria-hidden className="h-4 w-4 animate-spin" />
											Sending...
										</>
									) : (
										<>
											<UserPlus aria-hidden className="h-4 w-4" />
											Send Invite
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
