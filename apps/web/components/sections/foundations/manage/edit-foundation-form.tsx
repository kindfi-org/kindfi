'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { CSRFTokenField, Form } from '~/components/base/form'
import { BasicInfoSection } from '../create/components/basic-info-section'
import { FormFooter } from '../create/components/form-footer'
import { LogoSection } from '../create/components/logo-section'
import { MissionVisionSection } from '../create/components/mission-vision-section'
import { SocialLinksSection } from '../create/components/social-links-section'
import {
	type CreateFoundationFormData,
	createFoundationSchema,
} from '../create/types'

export type EditFoundationFormFoundation = {
	name: string
	description: string
	slug: string
	foundedYear: number
	mission: string | null
	vision: string | null
	websiteUrl: string | null
	socialLinks: Record<string, string>
	logoUrl: string | null
}

type EditFoundationFormProps = {
	slug: string
	foundation: EditFoundationFormFoundation
}

export function EditFoundationForm({
	slug,
	foundation,
}: EditFoundationFormProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const form = useForm<CreateFoundationFormData>({
		resolver: zodResolver(createFoundationSchema),
		defaultValues: {
			name: foundation.name,
			description: foundation.description,
			slug: foundation.slug,
			foundedYear: foundation.foundedYear,
			mission: foundation.mission ?? '',
			vision: foundation.vision ?? '',
			websiteUrl: foundation.websiteUrl ?? '',
			socialLinks: foundation.socialLinks ?? {},
			logo: null,
		},
	})

	const onSubmit = (data: CreateFoundationFormData) => {
		startTransition(async () => {
			try {
				const formDataToSubmit = new FormData()
				formDataToSubmit.append('name', data.name)
				formDataToSubmit.append('description', data.description)
				formDataToSubmit.append('foundedYear', String(data.foundedYear))
				if (data.mission) formDataToSubmit.append('mission', data.mission)
				if (data.vision) formDataToSubmit.append('vision', data.vision)
				if (data.websiteUrl)
					formDataToSubmit.append('websiteUrl', data.websiteUrl)
				if (data.socialLinks && Object.keys(data.socialLinks).length > 0) {
					formDataToSubmit.append(
						'socialLinks',
						JSON.stringify(data.socialLinks),
					)
				}
				if (data.logo instanceof File) {
					formDataToSubmit.append('logo', data.logo)
				}

				const response = await fetch(`/api/foundations/${slug}`, {
					method: 'PATCH',
					body: formDataToSubmit,
				})

				const result = await response.json()

				if (!response.ok) {
					throw new Error(result.error ?? 'Failed to update foundation')
				}

				toast.success('Foundation updated successfully.')
				router.refresh()
				router.push(`/foundations/${slug}/manage`)
			} catch (error) {
				console.error('Edit foundation error:', error)
				toast.error(
					error instanceof Error
						? error.message
						: 'Failed to update foundation. Please try again.',
				)
			}
		})
	}

	return (
		<Card className="bg-card shadow-lg max-w-3xl mx-auto">
			<CardHeader className="border-b">
				<CardTitle className="text-2xl font-bold">Edit foundation</CardTitle>
				<CardDescription>
					Update name, description, mission, vision, and logo. The foundation
					URL cannot be changed.
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-6">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-8"
						noValidate
					>
						<CSRFTokenField />
						<BasicInfoSection slugReadOnly />
						<MissionVisionSection />
						<SocialLinksSection />
						<LogoSection />
						<FormFooter
							isSubmitting={isPending}
							variant="edit"
							cancelHref={`/foundations/${slug}/manage`}
						/>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
