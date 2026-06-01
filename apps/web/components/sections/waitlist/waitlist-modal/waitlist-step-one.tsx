'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { useWaitlist } from '~/hooks/contexts/use-waitlist.context'
import { waitlistStepOneSchema } from '~/lib/schemas/waitlist.schemas'
import type { WaitlistStepOneData } from '~/lib/types/waitlist.types'

export function WaitlistStepOne({ onNext }: { onNext: () => void }) {
	const { formData, updateFormData } = useWaitlist()
	const form = useForm<WaitlistStepOneData>({
		resolver: zodResolver(waitlistStepOneSchema),
		defaultValues: {
			name: formData.name,
			email: formData.email || '',
			role: formData.role,
		},
	})

	const onSubmit = (data: WaitlistStepOneData) => {
		updateFormData({ ...data, email: data.email || undefined })
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
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Your name *</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g. Maria Lopez"
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
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email (optional)</FormLabel>
										<FormControl>
											<Input
												placeholder="you@example.com"
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
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>I am a *</FormLabel>
										<FormControl>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select your role" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="project_creator">
														Project creator
													</SelectItem>
													<SelectItem value="supporter">Supporter</SelectItem>
													<SelectItem value="partner">Partner</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-end">
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
