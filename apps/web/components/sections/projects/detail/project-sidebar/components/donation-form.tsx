'use client'

import { Loader2 } from 'lucide-react'
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
import { TrustlessExternalWalletBanner } from '~/components/sections/projects/manage/escrow/components/trustless-external-wallet-banner'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import type { FormValues } from '../types'

interface DonationFormProps {
	project: ProjectDetail
	hasEscrow: boolean
	isGoalReached: boolean
	form: UseFormReturn<FormValues>
	onSubmit: (data: FormValues) => Promise<void>
}

export function DonationForm({
	project,
	hasEscrow,
	isGoalReached,
	form,
	onSubmit,
}: DonationFormProps) {
	const canDonate = hasEscrow && !isGoalReached
	return (
		<>
			{hasEscrow && (
				<div className="mb-4">
					<TrustlessExternalWalletBanner compact />
				</div>
			)}

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
											type="text"
											inputMode="decimal"
											placeholder={
												!hasEscrow
													? 'Donations coming soon'
													: isGoalReached
														? 'Funding goal reached'
														: `Min. $${project.minInvestment}…`
											}
											className="pl-6 disabled:opacity-60 disabled:cursor-not-allowed"
											aria-label="Donation amount in USD"
											autoComplete="off"
											value={field.value > 0 ? String(field.value) : ''}
											onChange={(event) => {
												const raw = event.target.value
												if (raw === '' || raw === '.') {
													field.onChange(0)
													return
												}
												const parsed = Number(raw)
												if (!Number.isNaN(parsed)) {
													field.onChange(parsed)
												}
											}}
											onBlur={field.onBlur}
											name={field.name}
											ref={field.ref}
											disabled={!canDonate}
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
						disabled={!canDonate || !form.formState.isValid || form.formState.isSubmitting}
						aria-busy={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
								Supporting…
							</>
						) : (
							'Support Now'
						)}
					</Button>
				</form>
			</Form>
		</>
	)
}

interface DonationNoticesProps {
	hasEscrow: boolean
	isGoalReached: boolean
}

export function DonationNotices({ hasEscrow, isGoalReached }: DonationNoticesProps) {
	return (
		<>
			{hasEscrow && isGoalReached && (
				<div className="p-3 my-4 text-sm text-green-900 bg-green-50 rounded-md border border-green-300">
					<p className="font-medium mb-1">Funding goal reached</p>
					<p className="text-green-800">
						This project has met its fundraising target. Thank you to everyone who contributed!
					</p>
				</div>
			)}

			{hasEscrow && !isGoalReached && (
				<div className="p-3 my-4 text-sm text-amber-900 bg-amber-50 rounded-md border border-amber-300">
					Donating without logging in means you will miss out on features like reputation,
					contributor NFTs, and future perks. If that&apos;s fine, you can still donate anonymously.
				</div>
			)}

			{!hasEscrow && (
				<div className="p-3 my-4 text-sm text-amber-900 bg-amber-50 rounded-md border border-amber-300">
					<p className="font-medium mb-1">Donations not yet available</p>
					<p className="text-amber-800">
						This project is still setting up its secure escrow contract. Check back soon to support
						this cause.
					</p>
				</div>
			)}
		</>
	)
}
