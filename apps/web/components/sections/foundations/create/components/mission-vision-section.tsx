'use client'

import { Eye, Target } from 'lucide-react'
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
import { Textarea } from '~/components/base/textarea'
import type { CreateFoundationFormData } from '../types'
import { FormSectionHeader } from './form-section-header'

export function MissionVisionSection() {
	const form = useFormContext<CreateFoundationFormData>()

	// Optimize: use getValues instead of watch for display-only values
	const mission = form.getValues('mission') || ''
	const vision = form.getValues('vision') || ''
	const missionLength = useMemo(() => mission.length, [mission])
	const visionLength = useMemo(() => vision.length, [vision])

	return (
		<div className="space-y-6">
			<FormSectionHeader icon={Target} title="Mission & Vision" optional />

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<FormField
					control={form.control}
					name="mission"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-base font-medium">
								Mission Statement
							</FormLabel>
							<FormControl>
								<Textarea
									placeholder="What is your foundation's mission?"
									className="min-h-[100px] border-2 focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 resize-none"
									{...field}
								/>
							</FormControl>
							<FormDescription className="text-xs" aria-live="polite">
								{missionLength} characters
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="vision"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-base font-medium flex items-center gap-2">
								<Eye className="h-4 w-4 text-purple-600" aria-hidden="true" />
								Vision Statement
							</FormLabel>
							<FormControl>
								<Textarea
									placeholder="What is your foundation's vision for the future?"
									className="min-h-[100px] border-2 focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 resize-none"
									{...field}
								/>
							</FormControl>
							<FormDescription className="text-xs" aria-live="polite">
								{visionLength} characters
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	)
}
