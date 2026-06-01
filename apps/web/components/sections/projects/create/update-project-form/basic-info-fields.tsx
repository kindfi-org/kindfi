'use client'

import { useFormContext } from 'react-hook-form'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { Textarea } from '~/components/base/textarea'
import type { CreateProjectFormData } from '~/lib/types/project/create-project.types'

export function BasicInfoFields() {
	const form = useFormContext<CreateProjectFormData>()

	return (
		<>
			<FormField
				control={form.control}
				name="title"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							Title <span className="text-destructive">*</span>
						</FormLabel>
						<FormControl>
							<Input
								placeholder="Enter your project title"
								className="bg-white border-green-600"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							Description <span className="text-destructive">*</span>
						</FormLabel>
						<FormControl>
							<Textarea
								placeholder="Describe your project in a few sentences"
								className="min-h-[120px] border-green-600 bg-white"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	)
}
