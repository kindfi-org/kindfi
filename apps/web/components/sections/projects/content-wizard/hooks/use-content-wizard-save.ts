'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useContentWizard } from '~/hooks/contexts/use-content-wizard.context'
import { useHighlightsMutation } from '~/hooks/projects/use-highlights-mutation'
import { useProjectPitchMutation } from '~/hooks/projects/use-pitch-mutation'
import { useProjectMutation } from '~/hooks/projects/use-project-mutation'
import type {
	ContentWizardFormData,
	ContentWizardStep,
} from '~/lib/types/project/content-wizard.types'
import { sanitizeProjectTranslationForApi } from '~/lib/utils/project-utils'

type SaveStepResult = {
	projectId?: string
	projectSlug?: string
}

export function useContentWizardSave() {
	const router = useRouter()
	const { mode, projectId, projectSlug, setProjectIdentity, developmentOnly } = useContentWizard()

	const { mutateAsync: saveProject, isPending: isSavingProject } = useProjectMutation({
		projectId,
		developmentOnly,
	})

	const { mutateAsync: savePitch, isPending: isSavingPitch } = useProjectPitchMutation()
	const { mutateAsync: saveHighlights, isPending: isSavingHighlights } = useHighlightsMutation()

	const isSaving = isSavingProject || isSavingPitch || isSavingHighlights

	const saveStep = useCallback(
		async (step: ContentWizardStep, data: ContentWizardFormData): Promise<SaveStepResult> => {
			switch (step) {
				case 'language':
					return {}

				case 'basics-primary': {
					if (mode === 'create' && !projectId) {
						const createPayload: ContentWizardFormData = {
							...data,
							location: data.location || 'USA',
							category: data.category || '',
							tags: data.tags ?? [],
							socialLinks: data.socialLinks ?? [],
							image: data.image ?? null,
							website: data.website ?? '',
							translation: undefined,
						}

						if (!createPayload.category) {
							throw new Error('A category is required to create the project')
						}

						const result = await saveProject(createPayload)
						if ('slug' in result && result.slug && 'id' in result && result.id) {
							setProjectIdentity(result.id, result.slug)
							router.replace(`/projects/${result.slug}/manage/content?step=story-primary`)
							return { projectId: result.id, projectSlug: result.slug }
						}
						return {}
					}

					await saveProject({
						...data,
						slug: projectSlug,
						translation: undefined,
					})
					return { projectId, projectSlug }
				}

				case 'basics-translation': {
					await saveProject({
						...data,
						slug: projectSlug,
						translation: sanitizeProjectTranslationForApi(data.translation),
					})
					return { projectId, projectSlug }
				}

				case 'story-primary':
				case 'story-translation': {
					if (!projectId || !projectSlug) {
						throw new Error('Project must be created before saving story')
					}

					await savePitch({
						projectId,
						projectSlug,
						title: data.pitchTitle,
						story: data.pitchStory,
						pitchDeck: data.pitchDeck,
						videoUrl: data.pitchVideoUrl,
						translation: data.pitchTranslation,
					})
					return { projectId, projectSlug }
				}

				case 'highlights-primary': {
					if (!projectId || !projectSlug) {
						throw new Error('Project must be created before saving highlights')
					}

					// Primary step only — do not persist incomplete translation placeholders
					await saveHighlights({
						projectId,
						projectSlug,
						highlights: data.highlights,
					})
					return { projectId, projectSlug }
				}

				case 'highlights-translation': {
					if (!projectId || !projectSlug) {
						throw new Error('Project must be created before saving highlights')
					}

					await saveHighlights({
						projectId,
						projectSlug,
						highlights: data.highlights,
						translationHighlights: data.translationHighlights,
					})
					return { projectId, projectSlug }
				}

				case 'media':
				case 'location':
				case 'review': {
					await saveProject({
						...data,
						slug: projectSlug,
						translation: sanitizeProjectTranslationForApi(data.translation),
					})
					return { projectId, projectSlug }
				}

				default:
					return {}
			}
		},
		[
			mode,
			projectId,
			projectSlug,
			saveProject,
			savePitch,
			saveHighlights,
			setProjectIdentity,
			router,
		],
	)

	return { saveStep, isSaving }
}
