'use client'

import { MapPin, Sparkles, Tag } from 'lucide-react'
import { useI18n } from '~/lib/i18n'
import type { ProjectMatchingResult } from '~/lib/services/project-matching/schemas'

interface MatchingPreferenceInsightsProps {
	insights: ProjectMatchingResult['preferenceInsights']
}

export const MatchingPreferenceInsights = ({ insights }: MatchingPreferenceInsightsProps) => {
	const { t } = useI18n()

	const hasCategories = insights.topCategories.length > 0
	const hasRegions = insights.topRegions.length > 0
	const hasTags = insights.topTags.length > 0

	if (!hasCategories && !hasRegions && !hasTags) {
		return null
	}

	return (
		<div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
			<p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-emerald-800">
				<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
				{t('profile.matchingInsightsTitle')}
			</p>
			<div className="flex flex-wrap gap-2">
				{hasCategories
					? insights.topCategories.map((category) => (
							<span
								key={`category-${category}`}
								className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
							>
								<Tag className="h-3 w-3 text-emerald-600" aria-hidden="true" />
								{category}
							</span>
						))
					: null}
				{hasRegions
					? insights.topRegions.map((region) => (
							<span
								key={`region-${region}`}
								className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
							>
								<MapPin className="h-3 w-3 text-emerald-600" aria-hidden="true" />
								{region}
							</span>
						))
					: null}
				{hasTags
					? insights.topTags.map((tag) => (
							<span
								key={`tag-${tag}`}
								className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
							>
								{tag}
							</span>
						))
					: null}
			</div>
		</div>
	)
}
