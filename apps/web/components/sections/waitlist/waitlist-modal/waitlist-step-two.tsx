'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
import { useWaitlist } from '~/hooks/contexts/use-waitlist.context'
import { waitlistStepTwoSchema } from '~/lib/schemas/waitlist.schemas'
import type { WaitlistStepTwoData } from '~/lib/types/waitlist.types'

export function WaitlistStepTwo({
	onNext,
	onBack,
}: {
	onNext: () => void
	onBack: () => void
}) {
	const { formData, updateFormData } = useWaitlist()
	const form = useForm<WaitlistStepTwoData>({
		resolver: zodResolver(waitlistStepTwoSchema),
		defaultValues: {
			projectName: formData.projectName || '',
			projectDescription: formData.projectDescription || '',
			location: formData.location || '',
		},
	})

	const onSubmit = (data: WaitlistStepTwoData) => {
		updateFormData({ ...data })
		onNext()
	}

	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			transition={{ duration: 0.3 }}
		>
			<Card className="bg-white">
				<CardContent className="pt-6">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="projectName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Project name (optional)</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g. Agua Limpia en Lima"
												className="bg-white"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="projectDescription"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Brief description (optional)</FormLabel>
										<FormControl>
											<Textarea
												placeholder="What is the impact you want to create?"
												className="bg-white"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="location"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Location (optional)</FormLabel>
										<FormControl>
											<Input
												placeholder="City, Country"
												className="bg-white"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-between">
								<Button type="button" variant="outline" onClick={onBack}>
									<ChevronLeft className="mr-2 w-4 h-4" /> Back
								</Button>
								<Button type="submit" className="min-w-28">
									Next <ChevronRight className="ml-2 w-4 h-4" />
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</motion.div>
	)
}
