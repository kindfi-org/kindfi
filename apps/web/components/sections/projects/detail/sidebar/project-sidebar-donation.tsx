'use client'

import { motion } from 'framer-motion'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '~/components/base/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { progressBarAnimation } from '~/lib/constants/animations'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'

type DonationFormValues = { investmentAmount: number }

export function ProjectSidebarDonation({
	project,
	form,
	onSubmit,
	progressPercentage,
	onChainRaised,
	isFetchingBalance,
}: {
	project: ProjectDetail
	form: UseFormReturn<DonationFormValues>
	onSubmit: (data: DonationFormValues) => Promise<void>
	progressPercentage: number
	onChainRaised: number | null
	isFetchingBalance: boolean
}) {
	return (
		<>
			<h2 className="mb-2 text-xl font-bold">Support This Project</h2>
			<p className="mb-4 text-muted-foreground">
				Your contribution matters. Join the change.
			</p>

			<div
				className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2"
				role="progressbar"
				aria-valuenow={progressPercentage}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={`${progressPercentage}% funded`}
			>
				<motion.div
					className="h-full rounded-full gradient-progress"
					custom={progressPercentage}
					variants={progressBarAnimation}
					initial="initial"
					animate="animate"
				/>
			</div>

			<div className="flex justify-between mb-3 text-sm text-gray-500">
				<span>
					${(onChainRaised ?? project.raised).toLocaleString()} raised
					{isFetchingBalance ? ' (updating...)' : ''}
				</span>
				<span>{progressPercentage}%</span>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="mb-6">
					<FormField
						control={form.control}
						name="investmentAmount"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Donation Amount (USD)</FormLabel>
								<div className="relative">
									<div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
										<span className="text-muted-foreground">$</span>
									</div>
									<FormControl>
										<Input
											type="number"
											placeholder={`Min. $${project.minInvestment}`}
											className="pl-6 bg-white border-green-600"
											{...field}
											onChange={(e) => {
												const value =
													e.target.value === ''
														? undefined
														: Number(e.target.value)
												field.onChange(value)
											}}
											value={field.value ?? ''}
										/>
									</FormControl>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						className="mt-4 w-full text-white gradient-btn"
						size="lg"
						disabled={!form.formState.isValid}
					>
						Support Now
					</Button>
				</form>
			</Form>

			<div className="p-3 my-4 text-sm text-amber-900 bg-amber-50 rounded-md border border-amber-300">
				Donating without logging in means you will miss out on features like
				reputation, contributor NFTs, and future perks. If that&apos;s fine, you
				can still donate anonymously.
			</div>
		</>
	)
}
