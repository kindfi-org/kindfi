'use client'

import { Loader2 } from 'lucide-react'
import Link from 'next/link'
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
	isDonationReady: boolean
	isEscrowDataLoading: boolean
	isAuthenticated: boolean
	signInHref: string
	form: UseFormReturn<FormValues>
	onSubmit: (data: FormValues) => Promise<void>
}

export function DonationForm({
	project,
	hasEscrow,
	isGoalReached,
	isDonationReady,
	isEscrowDataLoading,
	isAuthenticated,
	signInHref,
	form,
	onSubmit,
}: DonationFormProps) {
	const canDonate = isDonationReady && !isGoalReached && isAuthenticated
	return (
		<>
			{hasEscrow && isAuthenticated && (
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
													: !isAuthenticated
														? 'Sign in to donate'
														: isEscrowDataLoading
															? 'Loading escrow…'
															: isGoalReached
																? 'Funding goal reached'
																: !isDonationReady
																	? 'Preparing donations…'
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

					{isAuthenticated ? (
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
					) : (
						<Button
							type="button"
							className="mt-4 w-full text-white gradient-btn"
							size="lg"
							asChild
							disabled={!hasEscrow || isGoalReached}
						>
							<Link href={signInHref}>Sign in to donate</Link>
						</Button>
					)}
				</form>
			</Form>
		</>
	)
}

interface DonationNoticesProps {
	hasEscrow: boolean
	isGoalReached: boolean
	isAuthenticated: boolean
	signInHref: string
}

export function DonationNotices({
	hasEscrow,
	isGoalReached,
	isAuthenticated,
	signInHref,
}: DonationNoticesProps) {
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

			{hasEscrow && !isGoalReached && !isAuthenticated && (
				<div className="p-3 my-4 text-sm text-blue-900 bg-blue-50 rounded-md border border-blue-200">
					<p className="font-medium mb-1">Sign in to donate</p>
					<p className="text-blue-800">
						Create an account or{' '}
						<Link href={signInHref} className="font-medium underline underline-offset-2">
							sign in
						</Link>{' '}
						to support this project and unlock reputation, contributor NFTs, and perks.
					</p>
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
