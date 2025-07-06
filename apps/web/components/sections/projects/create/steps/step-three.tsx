'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Check, ChevronDown, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '~/components/base/command'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/base/popover'
import { TagInput } from '~/components/sections/projects/create/tag-input'
import { CategoryBadge } from '~/components/sections/projects/filters'
import { useCreateProject } from '~/lib/contexts/create-project-context'
import { categories } from '~/lib/mock-data/project/categories.mock'
import { stepThreeSchema } from '~/lib/schemas/create-project.schemas'
import type { StepThreeData } from '~/lib/types/project/create-project.types'
import { cn } from '~/lib/utils'
import {
	findCountryByAlpha3,
	getCountryOptions,
} from '~/lib/utils/create-project-helpers'
import { CountryFlag } from '../country-flag'

const countryOptions = getCountryOptions()

interface StepThreeProps {
	onBack: () => void
	onSubmit: () => void
}

export function StepThree({ onBack, onSubmit }: StepThreeProps) {
	const { formData, updateFormData } = useCreateProject()
	const [open, setOpen] = useState(false)

	const form = useForm<StepThreeData>({
		resolver: zodResolver(stepThreeSchema),
		defaultValues: {
			location: formData.location,
			category: formData.category,
			tags: formData.tags,
		},
	})

	const selectedCode = form.watch('location')
	const selected = findCountryByAlpha3(selectedCode)

	const handleSelect = (alpha3: string) => {
		form.setValue('location', alpha3, { shouldValidate: true })
		setOpen(false)
	}

	const handleSubmit = (data: StepThreeData) => {
		updateFormData({
			...data,
			tags: data.tags || [],
		})
		onSubmit()
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
								name="location"
								render={({ field: _field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Where is your project based? *</FormLabel>
										<Popover open={open} onOpenChange={setOpen}>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														aria-expanded={open}
														aria-label="Select a country"
														className={cn(
															'w-full justify-between border-green-600 bg-white text-sm font-medium text-gray-700 hover:text-gray-700',
															!selected && 'text-muted-foreground',
														)}
													>
														<div className="flex items-center">
															{selected && (
																<CountryFlag countryCode={selected.alpha3} />
															)}
															{selected ? selected.name : 'Select a country'}
														</div>
														<ChevronDown className="ml-2 h-4 w-4 shrink-0" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-[--radix-popover-trigger-width] p-0"
												align="start"
											>
												<Command className="bg-white">
													<CommandInput placeholder="Search countries..." />
													<CommandList>
														<CommandEmpty>No country found.</CommandEmpty>
														<CommandGroup className="max-h-64 overflow-auto">
															{countryOptions.map((country) => (
																<CommandItem
																	key={country.alpha3}
																	value={country.name}
																	onSelect={() => handleSelect(country.alpha3)}
																	className="cursor-pointer"
																>
																	<Check
																		className={cn(
																			'mr-2 h-4 w-4',
																			selected?.alpha3 === country.alpha3
																				? 'opacity-100'
																				: 'opacity-0',
																		)}
																	/>
																	<CountryFlag countryCode={country.alpha3} />
																	{country.name}
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											How would you categorize your project? *
										</FormLabel>
										<FormControl>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
												{categories.map((category) => (
													<CategoryBadge
														key={category.id}
														category={category}
														selected={field.value === category.id}
														onClick={() => field.onChange(category.id)}
														className="justify-center"
													/>
												))}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="tags"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Add relevant keywords to describe your project
										</FormLabel>
										<FormControl>
											<TagInput
												value={field.value || []}
												onChange={field.onChange}
												error={form.formState.errors.tags?.message}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
								<Button
									type="button"
									variant="outline"
									onClick={onBack}
									className="flex items-center justify-center gap-2 gradient-border-btn bg-white w-full sm:w-auto"
								>
									<ChevronLeft className="h-4 w-4" />
									Previous
								</Button>

								<Button
									type="submit"
									disabled={!form.formState.isValid}
									className="flex items-center justify-center gap-2 gradient-btn text-white w-full sm:w-auto"
								>
									Submit for Review
									<Check className="h-4 w-4" />
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</motion.div>
	)
}
