'use client'

import { createContext, type ReactNode, useContext, useState } from 'react'
import { useSetState } from 'react-use'

export interface CreateFoundationFormData {
	name: string
	description: string
	slug: string
	foundedYear: number
	mission?: string
	vision?: string
	websiteUrl?: string
	socialLinks: Record<string, string>
	logoUrl?: string
	coverImageUrl?: string
}

interface CreateFoundationContextType {
	formData: CreateFoundationFormData
	updateFormData: (data: Partial<CreateFoundationFormData>) => void
}

const CreateFoundationContext = createContext<
	CreateFoundationContextType | undefined
>(undefined)

const initialFormData: CreateFoundationFormData = {
	name: '',
	description: '',
	slug: '',
	foundedYear: new Date().getFullYear(),
	mission: '',
	vision: '',
	websiteUrl: '',
	socialLinks: {},
	logoUrl: '',
	coverImageUrl: '',
}

export function CreateFoundationProvider({
	children,
}: {
	children: ReactNode
}) {
	const [formData, setFormData] =
		useSetState<CreateFoundationFormData>(initialFormData)

	const updateFormData = (data: Partial<CreateFoundationFormData>) => {
		setFormData((prev) => ({ ...prev, ...data }))
	}

	return (
		<CreateFoundationContext.Provider
			value={{
				formData,
				updateFormData,
			}}
		>
			{children}
		</CreateFoundationContext.Provider>
	)
}

export function useCreateFoundation() {
	const context = useContext(CreateFoundationContext)
	if (context === undefined) {
		throw new Error(
			'useCreateFoundation must be used within a CreateFoundationProvider',
		)
	}
	return context
}
