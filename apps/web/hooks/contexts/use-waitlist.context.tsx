'use client'

import { createContext, type ReactNode, useContext, useState } from 'react'
import { useSetState } from 'react-use'

import type { WaitlistFormData } from '~/lib/types/waitlist.types'

interface WaitlistContextType {
  formData: WaitlistFormData
  updateFormData: (data: Partial<WaitlistFormData>) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const WaitlistContext = createContext<WaitlistContextType | undefined>(
  undefined,
)

const initialFormData: WaitlistFormData = {
  name: '',
  email: '',
  role: 'project_creator',
  projectName: '',
  projectDescription: '',
  categoryId: '',
  location: '',
  source: '',
  consent: false,
}

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useSetState<WaitlistFormData>(initialFormData)
  const [currentStep, setCurrentStep] = useState(1)
  const [isOpen, setIsOpen] = useState(false)

  const updateFormData = (data: Partial<WaitlistFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  return (
    <WaitlistContext.Provider
      value={{ formData, updateFormData, currentStep, setCurrentStep, isOpen, setIsOpen }}
    >
      {children}
    </WaitlistContext.Provider>
  )
}

export function useWaitlist() {
  const context = useContext(WaitlistContext)
  if (context === undefined) {
    throw new Error('useWaitlist must be used within a WaitlistProvider')
  }
  return context
}


