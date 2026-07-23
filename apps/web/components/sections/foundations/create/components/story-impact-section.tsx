'use client'

import { BookOpen, CheckCircle2, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { Button } from '~/components/base/button'
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
import type { CreateFoundationFormData } from '../types'
import { FormSectionHeader } from './form-section-header'

const MAX_IMPACT_ITEMS = 12

export function StoryImpactSection() {
	const form = useFormContext<CreateFoundationFormData>()
	const impactHighlights = form.watch('impactHighlights') ?? []

	const handleAddImpact = () => {
		if (impactHighlights.length >= MAX_IMPACT_ITEMS) return
		form.setValue('impactHighlights', [...impactHighlights, ''], { shouldDirty: true })
	}

	const handleRemoveImpact = (index: number) => {
		form.setValue(
			'impactHighlights',
			impactHighlights.filter((_, i) => i !== index),
			{ shouldDirty: true },
		)
	}

	const handleImpactChange = (index: number, value: string) => {
		const next = [...impactHighlights]
		next[index] = value
		form.setValue('impactHighlights', next, { shouldDirty: true })
	}

	return (
		<div className="space-y-6">
			<FormSectionHeader icon={BookOpen} title="Story & Impact" />

			<FormField
				control={form.control}
				name="story"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-base font-medium flex items-center gap-2">
							<Sparkles className="h-4 w-4 text-purple-600" aria-hidden="true" />
							Your Story
						</FormLabel>
						<FormControl>
							<Textarea
								placeholder="Share the journey behind your foundation — what inspired you, the people you serve, and why donors should care…"
								className="min-h-[140px] resize-none"
								{...field}
								value={field.value ?? ''}
							/>
						</FormControl>
						<FormDescription>
							A personal narrative helps donors connect emotionally. This appears prominently on
							your foundation profile.
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className="space-y-4">
				<div>
					<FormLabel className="text-base font-medium flex items-center gap-2">
						<CheckCircle2 className="h-4 w-4 text-purple-600" aria-hidden="true" />
						Impact Highlights
					</FormLabel>
					<FormDescription className="mt-1.5">
						List accomplishments you&apos;ve achieved over time — no exact numbers required. Each
						item builds credibility with potential donors.
					</FormDescription>
				</div>

				{impactHighlights.length > 0 ? (
					<ul className="space-y-3">
						{impactHighlights.map((item, index) => (
							<li key={`${item}-${index}`} className="flex items-start gap-2">
								<Input
									placeholder="e.g., Built community gardens in 5 neighborhoods"
									value={item}
									onChange={(e) => handleImpactChange(index, e.target.value)}
									className="h-11"
									aria-label={`Impact highlight ${index + 1}`}
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-11 w-11 shrink-0 text-destructive hover:text-destructive"
									onClick={() => handleRemoveImpact(index)}
									aria-label={`Remove impact highlight ${index + 1}`}
								>
									<Trash2 className="h-4 w-4" aria-hidden="true" />
								</Button>
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-muted-foreground rounded-lg border border-dashed p-4 text-center">
						No impact highlights yet. Add your first accomplishment below.
					</p>
				)}

				{impactHighlights.length < MAX_IMPACT_ITEMS ? (
					<Button type="button" variant="outline" onClick={handleAddImpact} className="gap-2">
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add impact highlight
					</Button>
				) : (
					<p className="text-xs text-muted-foreground">
						Maximum of {MAX_IMPACT_ITEMS} impact highlights reached.
					</p>
				)}
			</div>
		</div>
	)
}
