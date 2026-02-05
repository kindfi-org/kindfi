'use client'

import {
	Calendar,
	CheckCircle2,
	Globe,
	Loader2,
	Sparkles,
	XCircle,
} from 'lucide-react'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { Textarea } from '~/components/base/textarea'
import { cn } from '~/lib/utils'
import { useSlugValidation } from '../hooks/use-slug-validation'
import type { CreateFoundationFormData } from '../types'
import { FormSectionHeader } from './form-section-header'

type BasicInfoSectionProps = {
	/** When true, slug is read-only (edit mode) and validation is skipped */
	slugReadOnly?: boolean
}

export function BasicInfoSection({
	slugReadOnly = false,
}: BasicInfoSectionProps) {
	const form = useFormContext<CreateFoundationFormData>()
	const slug = form.watch('slug')
	const {
		isChecking,
		isAvailable,
		error: slugError,
	} = useSlugValidation(slugReadOnly ? '' : slug)

	// Optimize: use getValues instead of watch for display-only values
	const description = form.getValues('description') || ''
	const descriptionLength = useMemo(() => description.length, [description])

	return (
		<div className="space-y-6">
			<FormSectionHeader icon={Sparkles} title="Basic Information" />

			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-base font-medium">
							Foundation Name <span className="text-destructive">*</span>
						</FormLabel>
						<FormControl>
							<Input
								placeholder="e.g., Green Earth Foundation"
								className="h-11 border-2 focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500"
								{...field}
								autoComplete="organization"
							/>
						</FormControl>
						<FormDescription>
							The official name of your foundation
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="slug"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-base font-medium">
							URL Slug <span className="text-destructive">*</span>
						</FormLabel>
						<FormControl>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
									/foundations/
								</span>
								<Input
									placeholder="foundation-name"
									className={cn(
										'h-11 pl-28 border-2 focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500',
										!slugReadOnly &&
											slug &&
											slug.length >= 3 &&
											!isChecking &&
											(isAvailable === false
												? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive'
												: isAvailable === true
													? 'border-green-500 focus-visible:border-green-500'
													: ''),
									)}
									{...field}
									autoComplete="off"
									spellCheck={false}
									disabled={slugReadOnly}
									readOnly={slugReadOnly}
								/>
								{!slugReadOnly && slug && slug.length >= 3 ? (
									<div className="absolute right-3 top-1/2 -translate-y-1/2">
										{isChecking ? (
											<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
										) : isAvailable === true ? (
											<CheckCircle2
												className="h-4 w-4 text-green-500"
												aria-label="Slug available"
											/>
										) : isAvailable === false ? (
											<XCircle
												className="h-4 w-4 text-destructive"
												aria-label="Slug taken"
											/>
										) : null}
									</div>
								) : null}
							</div>
						</FormControl>
						<FormDescription>
							{slugReadOnly
								? 'Foundation URL cannot be changed.'
								: "Auto-generated from name. Edit if needed. This will be your foundation's unique URL."}
						</FormDescription>
						{!slugReadOnly && slugError ? (
							<p className="text-sm text-destructive" role="alert">
								{slugError}
							</p>
						) : null}
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<FormField
					control={form.control}
					name="foundedYear"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-base font-medium flex items-center gap-2">
								<Calendar
									className="h-4 w-4 text-purple-600"
									aria-hidden="true"
								/>
								Year Founded <span className="text-destructive">*</span>
							</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="2020"
									min="1900"
									max={new Date().getFullYear()}
									className="h-11 border-2 focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500"
									{...field}
									onChange={(e) => field.onChange(Number(e.target.value))}
									inputMode="numeric"
								/>
							</FormControl>
							<FormDescription>
								The year your foundation was established
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="websiteUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-base font-medium flex items-center gap-2">
								<Globe className="h-4 w-4 text-purple-600" aria-hidden="true" />
								Website URL
							</FormLabel>
							<FormControl>
								<Input
									type="url"
									placeholder="https://example.com"
									className="h-11 border-2 focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500"
									{...field}
									autoComplete="url"
								/>
							</FormControl>
							<FormDescription>
								Your foundation&apos;s official website
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>

			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-base font-medium">
							Description <span className="text-destructive">*</span>
						</FormLabel>
						<FormControl>
							<Textarea
								placeholder="Describe your foundation's purpose, impact, and what makes it unique…"
								className="min-h-[120px] border-2 focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 resize-none"
								{...field}
							/>
						</FormControl>
						<div className="flex justify-between items-center">
							<FormDescription>
								Provide a clear and compelling description of your foundation
							</FormDescription>
							<span
								className={`text-xs ${descriptionLength < 10 ? 'text-destructive' : 'text-muted-foreground'}`}
								aria-live="polite"
							>
								{descriptionLength} / 10+ characters
							</span>
						</div>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	)
}
