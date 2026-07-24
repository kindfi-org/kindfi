'use client'

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { useSetState } from 'react-use'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import {
	CONTENT_WIZARD_STEPS,
	type ContentWizardFormData,
	type ContentWizardMode,
	type ContentWizardStep,
	initialContentWizardFormData,
} from '~/lib/types/project/content-wizard.types'

interface ContentWizardContextType {
	mode: ContentWizardMode
	formData: ContentWizardFormData
	updateFormData: (data: Partial<ContentWizardFormData>) => void
	currentStep: ContentWizardStep
	setCurrentStep: (step: ContentWizardStep) => void
	goToNextStep: () => void
	goToPreviousStep: () => void
	sourceLocaleLocked: boolean
	lockSourceLocale: () => void
	projectId?: string
	projectSlug?: string
	setProjectIdentity: (id: string, slug: string) => void
	developmentOnly?: boolean
	lockedFoundation?: { id: string; name: string }
}

const ContentWizardContext = createContext<ContentWizardContextType | undefined>(undefined)

type ContentWizardProviderProps = {
	children: ReactNode
	mode: ContentWizardMode
	initialData?: Partial<ContentWizardFormData>
	initialStep?: ContentWizardStep
	projectId?: string
	projectSlug?: string
	developmentOnly?: boolean
	lockedFoundation?: { id: string; name: string }
	defaultSourceLocale?: SupportedLocale
}

export function ContentWizardProvider({
	children,
	mode,
	initialData,
	initialStep = 'language',
	projectId: initialProjectId,
	projectSlug: initialProjectSlug,
	developmentOnly = false,
	lockedFoundation,
	defaultSourceLocale = 'en',
}: ContentWizardProviderProps) {
	const [formData, setFormData] = useSetState<ContentWizardFormData>({
		...initialContentWizardFormData(defaultSourceLocale),
		...initialData,
		projectId: initialProjectId ?? initialData?.projectId,
	})
	const [currentStep, setCurrentStep] = useState<ContentWizardStep>(initialStep)
	const [sourceLocaleLocked, setSourceLocaleLocked] = useState(
		mode === 'manage' || Boolean(initialData?.sourceLocale),
	)
	const [projectId, setProjectId] = useState<string | undefined>(initialProjectId)
	const [projectSlug, setProjectSlug] = useState<string | undefined>(initialProjectSlug)

	const updateFormData = useCallback(
		(data: Partial<ContentWizardFormData>) => {
			setFormData((prev) => ({ ...prev, ...data }))
		},
		[setFormData],
	)

	const goToNextStep = useCallback(() => {
		setCurrentStep((prev) => {
			const index = CONTENT_WIZARD_STEPS.indexOf(prev)
			if (index < 0 || index >= CONTENT_WIZARD_STEPS.length - 1) return prev
			return CONTENT_WIZARD_STEPS[index + 1]
		})
	}, [])

	const goToPreviousStep = useCallback(() => {
		setCurrentStep((prev) => {
			const index = CONTENT_WIZARD_STEPS.indexOf(prev)
			if (index <= 0) return prev
			return CONTENT_WIZARD_STEPS[index - 1]
		})
	}, [])

	const lockSourceLocale = useCallback(() => {
		setSourceLocaleLocked(true)
	}, [])

	const setProjectIdentity = useCallback(
		(id: string, slug: string) => {
			setProjectId(id)
			setProjectSlug(slug)
			setFormData((prev) => ({ ...prev, projectId: id, slug }))
		},
		[setFormData],
	)

	const value = useMemo(
		() => ({
			mode,
			formData,
			updateFormData,
			currentStep,
			setCurrentStep,
			goToNextStep,
			goToPreviousStep,
			sourceLocaleLocked,
			lockSourceLocale,
			projectId,
			projectSlug,
			setProjectIdentity,
			developmentOnly,
			lockedFoundation,
		}),
		[
			mode,
			formData,
			updateFormData,
			currentStep,
			goToNextStep,
			goToPreviousStep,
			sourceLocaleLocked,
			lockSourceLocale,
			projectId,
			projectSlug,
			setProjectIdentity,
			developmentOnly,
			lockedFoundation,
		],
	)

	return <ContentWizardContext.Provider value={value}>{children}</ContentWizardContext.Provider>
}

export function useContentWizard() {
	const context = useContext(ContentWizardContext)
	if (context === undefined) {
		throw new Error('useContentWizard must be used within a ContentWizardProvider')
	}
	return context
}
