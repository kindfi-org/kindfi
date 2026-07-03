'use client'

import { motion } from 'framer-motion'
import { Loader2, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/base/tabs'
import { Textarea } from '~/components/base/textarea'
import { UserSearchPicker } from '~/components/shared/user-search-picker'
import { zodResolver } from '~/lib/form/zod-resolver'
import type { SearchableUser } from '~/lib/schemas/user.schemas'
import type { CreateTeamMemberData } from '~/lib/types/project/project-team.types'

interface AddTeamMemberFormProps {
	onAdd: (data: CreateTeamMemberData) => Promise<void>
	excludeUserIds?: string[]
	entityLabel?: 'campaign' | 'foundation'
	className?: string
}

const manualTeamMemberSchema = z.object({
	fullName: z.string().trim().min(1, 'Full name is required').max(100, 'Full name is too long'),
	roleTitle: z.string().trim().min(1, 'Role/title is required').max(100, 'Role/title is too long'),
	bio: z.string().trim().max(300, 'Bio must be 2-3 lines (max 300 characters)').optional(),
	photoUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
	yearsInvolved: z
		.number()
		.int('Years must be a whole number')
		.min(0, 'Years cannot be negative')
		.max(100, 'Please enter a valid number of years')
		.optional(),
})

const registeredTeamMemberSchema = z.object({
	roleTitle: z.string().trim().min(1, 'Role/title is required').max(100, 'Role/title is too long'),
	bio: z.string().trim().max(300, 'Bio must be 2-3 lines (max 300 characters)').optional(),
})

type ManualTeamMemberFormData = z.infer<typeof manualTeamMemberSchema>
type RegisteredTeamMemberFormData = z.infer<typeof registeredTeamMemberSchema>

export function AddTeamMemberForm({
	onAdd,
	excludeUserIds = [],
	entityLabel = 'campaign',
	className,
}: AddTeamMemberFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [selectedUser, setSelectedUser] = useState<SearchableUser | null>(null)

	const manualForm = useForm<ManualTeamMemberFormData>({
		resolver: zodResolver(manualTeamMemberSchema),
		defaultValues: {
			fullName: '',
			roleTitle: '',
			bio: '',
			photoUrl: '',
			yearsInvolved: undefined,
		},
	})

	const registeredForm = useForm<RegisteredTeamMemberFormData>({
		resolver: zodResolver(registeredTeamMemberSchema),
		defaultValues: {
			roleTitle: '',
			bio: '',
		},
	})

	const handleManualSubmit = async (data: ManualTeamMemberFormData) => {
		try {
			setIsSubmitting(true)
			await onAdd({
				type: 'manual',
				fullName: data.fullName,
				roleTitle: data.roleTitle,
				bio: data.bio || undefined,
				photoUrl: data.photoUrl || undefined,
				yearsInvolved: data.yearsInvolved,
			})
			manualForm.reset()
		} catch (error) {
			logger.error('Failed to add team member:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleRegisteredSubmit = async (data: RegisteredTeamMemberFormData) => {
		if (!selectedUser) {
			registeredForm.setError('roleTitle', {
				message: 'Please select a registered user',
			})
			return
		}

		try {
			setIsSubmitting(true)
			await onAdd({
				type: 'registered',
				userId: selectedUser.id,
				roleTitle: data.roleTitle,
				bio: data.bio || undefined,
			})
			registeredForm.reset()
			setSelectedUser(null)
		} catch (error) {
			logger.error('Failed to add registered team member:', error)
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
						Add someone manually for display, or select a registered user to grant {entityLabel}{' '}
						management access.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="registered">
						<TabsList className="grid w-full grid-cols-2 mb-6">
							<TabsTrigger value="registered" className="flex items-center gap-2">
								<Users className="h-4 w-4" aria-hidden="true" />
								Registered User
							</TabsTrigger>
							<TabsTrigger value="manual" className="flex items-center gap-2">
								<UserPlus className="h-4 w-4" aria-hidden="true" />
								Manual Entry
							</TabsTrigger>
						</TabsList>

						<TabsContent value="registered">
							<Form {...registeredForm}>
								<form
									onSubmit={registeredForm.handleSubmit(handleRegisteredSubmit)}
									className="space-y-4"
								>
									<div className="space-y-2">
										<Label>
											Platform User <span className="text-destructive">*</span>
										</Label>
										<UserSearchPicker
											selectedUser={selectedUser}
											onSelect={setSelectedUser}
											disabled={isSubmitting}
											excludeUserIds={excludeUserIds}
										/>
										<p className="text-xs text-muted-foreground">
											Registered users are granted permission to manage this {entityLabel}.
										</p>
									</div>

									<FormField
										control={registeredForm.control}
										name="roleTitle"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Role / Title <span className="text-destructive">*</span>
												</FormLabel>
												<FormControl>
													<Input
														placeholder="e.g., Campaign Manager, Co-founder"
														disabled={isSubmitting}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={registeredForm.control}
										name="bio"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Short Bio{' '}
													<span className="text-muted-foreground text-xs">(optional)</span>
												</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Override the user's profile bio for this team listing…"
														rows={3}
														disabled={isSubmitting}
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
											disabled={isSubmitting || !selectedUser}
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
													<Users className="h-4 w-4" />
													Add & Grant Access
												</>
											)}
										</Button>
									</div>
								</form>
							</Form>
						</TabsContent>

						<TabsContent value="manual">
							<Form {...manualForm}>
								<form onSubmit={manualForm.handleSubmit(handleManualSubmit)} className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={manualForm.control}
											name="fullName"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Full Name <span className="text-destructive">*</span>
													</FormLabel>
													<FormControl>
														<Input placeholder="John Doe" disabled={isSubmitting} {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={manualForm.control}
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
										control={manualForm.control}
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
											control={manualForm.control}
											name="photoUrl"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Photo URL{' '}
														<span className="text-muted-foreground text-xs">(optional)</span>
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
											control={manualForm.control}
											name="yearsInvolved"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Years Involved{' '}
														<span className="text-muted-foreground text-xs">(optional)</span>
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
																	e.target.value ? parseInt(e.target.value, 10) : undefined,
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
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</motion.div>
	)
}
