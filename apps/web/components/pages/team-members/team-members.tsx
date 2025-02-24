'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
	AlertCircle,
	EyeOff,
	ImageIcon,
	Trash2,
	UserPlus,
	Users,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import {
	Card,
	CardContent,
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
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { Switch } from '~/components/base/switch'
import { cn } from '~/lib/utils'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpg', 'image/webp']

const teamMemberSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	title: z.string().min(2, 'Title must be at least 2 characters'),
	role: z.string().min(1, 'Please select a role'),
	profileImage: z.string().optional(),
	isHidden: z.boolean().default(false),
})

const formSchema = z.object({
	teamMembers: z.array(teamMemberSchema),
	hiddenTeamMembers: z.array(teamMemberSchema),
})

const roles = [
	{ value: 'founder', label: 'Founder' },
	{ value: 'editor', label: 'Editor' },
]

export function TeamMembersPage() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showHiddenMembers, setShowHiddenMembers] = useState(false)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			teamMembers: [
				{
					name: '',
					email: '',
					title: '',
					role: '',
					profileImage: '',
					isHidden: false,
				},
			],
			hiddenTeamMembers: [],
		},
	})

	const {
		fields: teamFields,
		append: appendTeam,
		remove: removeTeam,
	} = useFieldArray({
		name: 'teamMembers',
		control: form.control,
	})

	const {
		fields: hiddenFields,
		append: appendHidden,
		remove: removeHidden,
	} = useFieldArray({
		name: 'hiddenTeamMembers',
		control: form.control,
	})

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setIsSubmitting(true)
		await new Promise((resolve) => setTimeout(resolve, 2000))
		console.log(values)
		setIsSubmitting(false)
		toast.success('Team members saved successfully!')
	}

	const handleImageUpload = async (
		file: File,
		fieldName: `teamMembers.${number}.profileImage`,
	) => {
		if (!file) return

		if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
			toast.error('Invalid file type. Please upload a PNG, JPG or WebP image.')
			return
		}

		if (file.size > MAX_FILE_SIZE) {
			toast.error('File is too large. Maximum size is 5MB.')
			return
		}

		const reader = new FileReader()
		reader.onloadend = () => {
			form.setValue(fieldName, reader.result as string)
		}
		reader.readAsDataURL(file)
	}

	return (
		<div className="min-h-screen bg-white">
			<div className="container px-4 py-24 mx-auto max-w-4xl">
				<div className="space-y-8">
					<div className="space-y-2">
						<h1 className="text-2xl font-bold">
							<span className="font-bold gradient-text"> Team Members</span>
						</h1>
						<p className="text-lg text-muted-foreground">
							Add your team members and define their roles in the project.
						</p>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Users className="h-5 w-5" />
										Public Team Members
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									{teamFields.map((field, index) => (
										<div
											key={field.id}
											className="relative space-y-4 rounded-lg border p-4 transition-all duration-200"
										>
											{index > 0 && (
												<button
													type="button"
													className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-background shadow-sm hover:bg-destructive hover:text-destructive-foreground"
													onClick={() => removeTeam(index)}
												>
													<Trash2 className="h-4 w-4" />
												</button>
											)}

											<div className="grid gap-6 md:grid-cols-2">
												<FormField
													control={form.control}
													name={`teamMembers.${index}.name`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Full Name</FormLabel>
															<FormControl>
																<Input
																	placeholder="Enter team member's name"
																	className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
																	{...field}
																/>
															</FormControl>
															<FormMessage className="font-bold gradient-text" />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name={`teamMembers.${index}.email`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Email</FormLabel>
															<FormControl>
																<Input
																	type="email"
																	placeholder="Enter email address"
																	className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
																	{...field}
																/>
															</FormControl>
															<FormMessage className="font-bold gradient-text" />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name={`teamMembers.${index}.title`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Title</FormLabel>
															<FormControl>
																<Input
																	placeholder="e.g., Chief Technology Officer"
																	className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
																	{...field}
																/>
															</FormControl>
															<FormMessage className="font-bold gradient-text" />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name={`teamMembers.${index}.role`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Role</FormLabel>
															<Select
																onValueChange={field.onChange}
																defaultValue={field.value}
															>
																<FormControl>
																	<SelectTrigger className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20">
																		<SelectValue placeholder="Select a role" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{roles.map((role) => (
																		<SelectItem
																			key={role.value}
																			value={role.value}
																		>
																			{role.label}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage className="font-bold gradient-text" />
														</FormItem>
													)}
												/>
											</div>

											<FormField
												control={form.control}
												name={`teamMembers.${index}.profileImage`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>Profile Image</FormLabel>
														<FormControl>
															<div
																className={cn(
																	'flex items-center gap-4',
																	!field.value && 'flex-col md:flex-row',
																)}
															>
																{field.value ? (
																	<div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-muted">
																		<Image
																			src={field.value || '/placeholder.svg'}
																			alt="Profile preview"
																			fill
																			className="object-cover"
																		/>
																		<button
																			type="button"
																			className="absolute right-0 top-0 h-6 w-6 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
																			onClick={() =>
																				form.setValue(
																					`teamMembers.${index}.profileImage`,
																					'',
																				)
																			}
																		>
																			<Trash2 className="h-3 w-3" />
																		</button>
																	</div>
																) : (
																	<div className="flex w-full items-center justify-center">
																		<label
																			htmlFor={`profile-image-${index}`}
																			className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 hover:border-primary/50 hover:bg-muted/50"
																		>
																			<div className="mb-2 rounded-full bg-primary/10 p-2">
																				<ImageIcon className="h-6 w-6 text-primary" />
																			</div>
																			<div className="text-center">
																				<span className="font-medium text-primary">
																					Click to upload
																				</span>{' '}
																				or drag and drop
																			</div>
																			<p className="text-sm text-muted-foreground">
																				PNG, JPG or WebP (MAX. 5MB)
																			</p>
																		</label>
																		<input
																			id={`profile-image-${index}`}
																			type="file"
																			accept={ACCEPTED_IMAGE_TYPES.join(',')}
																			className="hidden"
																			onChange={(e) => {
																				const file = e.target.files?.[0]
																				if (file)
																					handleImageUpload(
																						file,
																						`teamMembers.${index}.profileImage`,
																					)
																			}}
																		/>
																	</div>
																)}
															</div>
														</FormControl>
														<FormMessage className="text-blue-500" />
													</FormItem>
												)}
											/>
										</div>
									))}

									<button
										type="button"
										className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
										onClick={() =>
											appendTeam({
												name: '',
												email: '',
												title: '',
												role: '',
												profileImage: '',
												isHidden: false,
											})
										}
									>
										<UserPlus className="mr-2 h-4 w-4" />
										Add Team Member
									</button>
								</CardContent>
							</Card>

							<Card className="relative border-0 shadow-lg bg-white/50 backdrop-blur-sm overflow-hidden">
								<div className="absolute right-4 top-4 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
									Beta
								</div>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<EyeOff className="h-5 w-5" />
										Hidden Team Members
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="flex items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<Label className="text-base">Show Hidden Members</Label>
											<p className="text-sm text-muted-foreground">
												Toggle to view and manage private collaborators
											</p>
										</div>
										<Switch
											checked={showHiddenMembers}
											onCheckedChange={setShowHiddenMembers}
											aria-label="Toggle hidden members"
											className="bg-green-500"
										/>
									</div>

									{showHiddenMembers && (
										<>
											{hiddenFields.map((field, index) => (
												<div
													key={field.id}
													className="relative space-y-4 rounded-lg border p-4 transition-all duration-200"
												>
													<button
														type="button"
														className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-background shadow-sm hover:bg-destructive hover:text-destructive-foreground"
														onClick={() => removeHidden(index)}
													>
														<Trash2 className="h-4 w-4" />
													</button>

													<div className="grid gap-6 md:grid-cols-2">
														<FormField
															control={form.control}
															name={`hiddenTeamMembers.${index}.name`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Full Name</FormLabel>
																	<FormControl>
																		<Input
																			placeholder="Enter team member's name"
																			className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage className="text-blue-500" />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`hiddenTeamMembers.${index}.email`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Email</FormLabel>
																	<FormControl>
																		<Input
																			type="email"
																			placeholder="Enter email address"
																			className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage className="text-blue-500" />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`hiddenTeamMembers.${index}.title`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Title</FormLabel>
																	<FormControl>
																		<Input
																			placeholder="e.g., Chief Technology Officer"
																			className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage className="text-blue-500" />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`hiddenTeamMembers.${index}.role`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Role</FormLabel>
																	<Select
																		onValueChange={field.onChange}
																		defaultValue={field.value}
																	>
																		<FormControl>
																			<SelectTrigger className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20">
																				<SelectValue placeholder="Select a role" />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent>
																			{roles.map((role) => (
																				<SelectItem
																					key={role.value}
																					value={role.value}
																				>
																					{role.label}
																				</SelectItem>
																			))}
																		</SelectContent>
																	</Select>
																	<FormMessage className="text-blue-500" />
																</FormItem>
															)}
														/>
													</div>
												</div>
											))}

											<button
												type="button"
												className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
												onClick={() =>
													appendHidden({
														name: '',
														email: '',
														title: '',
														role: '',
														profileImage: '',
														isHidden: true,
													})
												}
											>
												<EyeOff className="mr-2 h-4 w-4" />
												Add Hidden Team Member
											</button>

											<Alert>
												<AlertCircle className="h-4 w-4" />
												<AlertTitle>Private Collaboration</AlertTitle>
												<AlertDescription>
													Hidden team members can access the project dashboard
													but won't be displayed publicly on your project page.
												</AlertDescription>
											</Alert>
										</>
									)}
								</CardContent>
							</Card>

							<div className="flex justify-end gap-4">
								<button
									type="submit"
									className="min-w-[200px] px-4 py-2 border border-green-500 text-green-500 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-green-50 gradient-border-btn"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<span className="flex items-center">
											<svg
												aria-label="Loading icon"
												className="w-4 h-4 mr-2 animate-spin"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<title>Loading icon</title>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												/>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8v8H4z"
												/>
											</svg>
											Saving...
										</span>
									) : (
										<span className="flex items-center">
											<svg
												aria-label="Save icon"
												className="w-4 h-4 mr-2"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<title>Save icon</title>
												<path
													fill="currentColor"
													d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2zm-5 18a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3-4H8V5h7v12z"
												/>
											</svg>
											Save Changes
										</span>
									)}
								</button>
							</div>
						</form>
					</Form>
				</div>
			</div>
		</div>
	)
}
