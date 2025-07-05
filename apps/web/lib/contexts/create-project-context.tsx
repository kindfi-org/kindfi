'use client'

import { type ReactNode, createContext, useContext, useState } from 'react'
import { useSetState } from 'react-use'

import type { CreateProjectFormData } from '../types/project/create-project.types'

interface CreateProjectContextType {
	formData: CreateProjectFormData
	updateFormData: (data: Partial<CreateProjectFormData>) => void
	currentStep: number
	setCurrentStep: (step: number) => void
}

const CreateProjectContext = createContext<
	CreateProjectContextType | undefined
>(undefined)

const initialFormData: CreateProjectFormData = {
	title: '',
	description: '',
	targetAmount: 0,
	minimumInvestment: 0,
	image: null,
	website: '',
	socialLinks: [],
	location: {
		country: '',
		code: '',
	},
	category: '',
	tags: [],
}

export function CreateProjectProvider({ children }: { children: ReactNode }) {
	const [formData, setFormData] =
		useSetState<CreateProjectFormData>(initialFormData)
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
			}}
		>
			{children}
		</CreateProjectContext.Provider>
	)
}

export function useCreateProject() {
	const context = useContext(CreateProjectContext)
	if (context === undefined) {
		throw new Error(
			'useCreateProject must be used within a CreateProjectProvider',
		)
	}
	return context
}
