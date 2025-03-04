'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import TeamMemberForm from './components/TeamMemberForm'

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

export type formInputs = z.infer<typeof formSchema>

const roles = [
	{ value: 'founder', label: 'Founder' },
	{ value: 'editor', label: 'Editor' },
]

export function TeamMembersPage() {
	const [isSubmitting, setIsSubmitting] = useState(false)

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

	const onSubmit = async (values: formInputs) => {
		setIsSubmitting(true)
		await new Promise((resolve) => setTimeout(resolve, 2000))
		console.log(values)
		setIsSubmitting(false)
		toast.success('Team members saved successfully!')
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

					<TeamMemberForm
						form={form}
						roles={roles}
						onSubmit={onSubmit}
						isSubmitting={isSubmitting}
					/>
				</div>
			</div>
		</div>
	)
}
