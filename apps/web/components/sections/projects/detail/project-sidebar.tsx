'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Heart, Share } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { Badge } from '~/components/base/badge'
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
import { cn } from '~/lib/utils'
import { getTextColor } from '~/lib/utils/color-utils'

interface ProjectSidebarProps {
	project: ProjectDetail
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
	const [isFollowing, setIsFollowing] = useState(false)
	const progressPercentage = Math.min(
		Math.round((project.raised / project.goal) * 100),
		100,
	)

	// Define the form schema with zod
	const formSchema = z.object({
		investmentAmount: z
			.number({
				required_error: 'Investment amount is required',
				invalid_type_error: 'Investment amount must be a number',
			})
			.min(
				project.minInvestment,
				`Minimum investment is $${project.minInvestment}`,
			),
	})

	// Set up react-hook-form with zod validation
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		mode: 'onChange',
		defaultValues: {
			investmentAmount: project.minInvestment,
		},
	})

	const handleToggleFollow = async () => {
		try {
			// TODO: Send follow/unfollow request to backend
			setIsFollowing(!isFollowing)
		} catch (error) {
			console.error(error)
			toast.error('Unable to update follow status', {
				icon: <CircleAlert className="text-destructive" />,
			})
		}
	}

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		try {
			// TODO: Send donation to backend
			toast.success('Thank you for your support!', {
				description: `You've donated $${data.investmentAmount.toLocaleString()}`,
				icon: <CircleCheck className="text-primary" />,
			})
		} catch (error) {
			console.error(error)
			toast.error('Something went wrong', {
				description: "We couldn't process your donation. Please try again.",
				icon: <CircleAlert className="text-destructive" />,
			})
		}
	}

	const handleShare = () => {
		if (navigator.share) {
			navigator
				.share({
					title: project.title,
					text: project.description ?? '',
					url: window.location.href,
				})
				.catch((error) => console.log('Error sharing', error))
		} else {
			navigator.clipboard.writeText(window.location.href)
			toast('Link copied to clipboard ✅', {
				description: 'You can now share it with others',
			})
		}
	}

	return (
		<motion.div
			className="bg-white rounded-xl shadow-md overflow-hidden sticky top-16"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<div className="p-6">
				<h2 className="text-xl font-bold mb-2">Support This Project</h2>
				<p className="text-muted-foreground mb-4">
					Your contribution matters. Join the change.
				</p>

				<div
					className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2"
					role="progressbar"
					tabIndex={0}
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

				<div className="flex justify-between text-sm text-gray-500 mb-3">
					<span>${project.raised.toLocaleString()} raised</span>
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
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<span className="text-muted-foreground">$</span>
										</div>
										<FormControl>
											<Input
												type="number"
												placeholder={`Min. $${project.minInvestment}`}
												className="pl-6 border-green-600 bg-white"
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
							className="w-full mt-4 gradient-btn text-white"
							size="lg"
							disabled={!form.formState.isValid}
						>
							Support Now
						</Button>
					</form>
				</Form>

				<div className="flex gap-4">
					<Button
						variant="outline"
						className="w-full flex items-center justify-center gap-2 gradient-border-btn bg-white"
						onClick={handleToggleFollow}
					>
						<Heart
							className={`h-4 w-4 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`}
						/>
						{isFollowing ? 'Following' : 'Follow'}
					</Button>

					<Button
						variant="outline"
						className="w-full flex items-center justify-center gap-2 gradient-border-btn bg-white"
						onClick={handleShare}
					>
						<Share className="h-4 w-4" />
						Share
					</Button>
				</div>
			</div>

			<div className="bg-gray-50 p-6 border-t border-gray-200">
				<h3 className="font-medium mb-2">Project Tags</h3>
				<div className="flex flex-wrap gap-2">
					{project.tags.map((tag) => {
						const bg = tag.color || '#ccc' // fallback
						const textColor = getTextColor(bg)

						return (
							<Badge
								key={tag.id}
								className={cn(
									'uppercase',
									textColor === 'white' ? 'text-white' : 'text-black',
								)}
								style={{ backgroundColor: bg }}
							>
								{tag.name}
							</Badge>
						)
					})}
				</div>
			</div>
		</motion.div>
	)
}
