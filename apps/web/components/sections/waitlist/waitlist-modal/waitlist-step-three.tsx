'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ChevronLeft, Loader2 } from 'lucide-react'
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
import { useWaitlist } from '~/hooks/contexts/use-waitlist.context'
import { waitlistStepThreeSchema } from '~/lib/schemas/waitlist.schemas'
import type { WaitlistStepThreeData } from '~/lib/types/waitlist.types'

export function WaitlistStepThree({
	onBack,
	onSubmit,
	isPending = false,
}: {
	onBack: () => void
	onSubmit: (d: WaitlistStepThreeData) => void
	isPending?: boolean
}) {
	const { formData, updateFormData } = useWaitlist()
	const form = useForm<WaitlistStepThreeData>({
		resolver: zodResolver(waitlistStepThreeSchema),
		defaultValues: {
			source: formData.source || '',
			consent: formData.consent,
		},
	})

	const handleSubmit = (data: WaitlistStepThreeData) => {
		updateFormData(data)
		onSubmit(data)
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
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-6"
						>
							<FormField
								control={form.control}
								name="source"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Where did you hear about KindFi? (optional)
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Twitter, Stellar, friend, etc."
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
								name="consent"
								render={({ field }) => (
									<FormItem>
										<div className="flex gap-3 items-center">
											<input
												id="consent"
												type="checkbox"
												className="w-4 h-4"
												checked={field.value}
												onChange={(e) => field.onChange(e.target.checked)}
											/>
											<FormLabel htmlFor="consent">
												I agree to be contacted about KindFi updates
											</FormLabel>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-between">
								<Button type="button" variant="outline" onClick={onBack}>
									<ChevronLeft className="mr-2 w-4 h-4" /> Back
								</Button>
								<Button type="submit" className="min-w-28" disabled={isPending}>
									{isPending ? (
										<>
											<Loader2 className="mr-2 w-4 h-4 animate-spin" />{' '}
											Submitting
										</>
									) : (
										'Submit'
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
