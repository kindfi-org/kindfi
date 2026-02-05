'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { CSRFTokenField, Form } from '~/components/base/form'
import { useCreateFoundation } from '~/hooks/contexts/use-create-foundation.context'
import { BasicInfoSection } from './components/basic-info-section'
import { FormFooter } from './components/form-footer'
import { LogoSection } from './components/logo-section'
import { MissionVisionSection } from './components/mission-vision-section'
import { SocialLinksSection } from './components/social-links-section'
import { useFoundationFormSubmission } from './hooks/use-foundation-form-submission'
import { type CreateFoundationFormData, createFoundationSchema } from './types'
import { generateSlug } from './utils/slug-generator'

export function CreateFoundationForm() {
	const { formData, updateFormData } = useCreateFoundation()
	const { submitFoundation, isSubmitting } = useFoundationFormSubmission()

	const form = useForm<CreateFoundationFormData>({
		resolver: zodResolver(createFoundationSchema),
		defaultValues: {
			name: formData.name,
			description: formData.description,
			slug: formData.slug,
			foundedYear: formData.foundedYear,
			mission: formData.mission,
			vision: formData.vision,
			websiteUrl: formData.websiteUrl,
			socialLinks: formData.socialLinks,
			logo: null,
		},
	})

	// Auto-generate slug from name (only watch name field, not all fields)
	// eslint-disable-next-line react-hooks/incompatible-library -- watch() is intentional for slug sync; form is not passed to memoized children
	const foundationName = form.watch('name')
	useEffect(() => {
		if (foundationName && !form.getValues('slug')) {
			const autoSlug = generateSlug(foundationName)
			if (autoSlug) {
				form.setValue('slug', autoSlug, { shouldValidate: false })
			}
		}
	}, [foundationName, form])

	const onSubmit = async (data: CreateFoundationFormData) => {
		updateFormData(data)
		try {
			await submitFoundation(data)
		} catch (error) {
			// Error is already handled in the hook with toast
			// If it's a slug error, set it on the form field
			if (
				error instanceof Error &&
				error.message.includes('foundation URL is already taken')
			) {
				form.setError('slug', {
					type: 'manual',
					message: error.message,
				})
			}
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<Card className="bg-white max-w-3xl mx-auto shadow-lg">
				<CardHeader className="border-b">
					<CardTitle className="text-2xl font-bold flex items-center gap-2">
						<Building2 className="h-6 w-6 text-purple-600" aria-hidden="true" />
						Foundation Information
					</CardTitle>
					<CardDescription>
						Fill in the details about your foundation. All fields marked with *
						are required.
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

							<BasicInfoSection />
							<MissionVisionSection />
							<SocialLinksSection />
							<LogoSection />

							<FormFooter isSubmitting={isSubmitting} />
						</form>
					</Form>
				</CardContent>
			</Card>
		</motion.div>
	)
}
