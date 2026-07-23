'use client'

import { createContext, type ReactNode, useContext, useState } from 'react'
import { useSetState } from 'react-use'

import type { CreateProjectFormData } from '../../lib/types/project/create-project.types'

interface CreateProjectContextType {
	formData: CreateProjectFormData
	updateFormData: (data: Partial<CreateProjectFormData>) => void
	currentStep: number
	setCurrentStep: (step: number) => void
	lockedFoundation?: { id: string; name: string }
}

const CreateProjectContext = createContext<CreateProjectContextType | undefined>(undefined)

const initialFormData: CreateProjectFormData = {
	title: '',
	description: '',
	targetAmount: 0,
	minimumInvestment: 0,
	image: null,
	website: '',
	socialLinks: [],
	location: '',
	category: '',
	tags: [],
	sourceLocale: 'en',
}

type CreateProjectProviderProps = {
	children: ReactNode
	initialFoundationId?: string
	lockedFoundation?: { id: string; name: string }
}

export function CreateProjectProvider({
	children,
	initialFoundationId,
	lockedFoundation,
}: CreateProjectProviderProps) {
	const [formData, setFormData] = useSetState<CreateProjectFormData>({
		...initialFormData,
		...(initialFoundationId ? { foundationId: initialFoundationId } : {}),
	})
	const [currentStep, setCurrentStep] = useState(1)

	const updateFormData = (data: Partial<CreateProjectFormData>) => {
		setFormData((prev) => ({ ...prev, ...data }))
	}

	return (
		<CreateProjectContext.Provider
			value={{
				formData,
				updateFormData,
				currentStep,
				setCurrentStep,
				lockedFoundation,
			}}
		>
			{children}
		</CreateProjectContext.Provider>
	)
}

export function useCreateProject() {
	const context = useContext(CreateProjectContext)
	if (context === undefined) {
		throw new Error('useCreateProject must be used within a CreateProjectProvider')
	}
	return context
}
