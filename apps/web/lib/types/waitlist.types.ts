export type WaitlistRole = 'project_creator' | 'supporter' | 'partner'

export interface WaitlistFormData {
  name: string
  email?: string
  role: WaitlistRole
  projectName?: string
  projectDescription?: string
  categoryId?: string
  location?: string
  source?: string
  consent: boolean
}

export interface WaitlistStepOneData {
  name: string
  email?: string
  role: WaitlistRole
}

export interface WaitlistStepTwoData {
  projectName?: string
  projectDescription?: string
  categoryId?: string
  location?: string
}

export interface WaitlistStepThreeData {
  source?: string
  consent: boolean
}


