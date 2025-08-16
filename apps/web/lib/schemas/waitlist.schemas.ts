import { z } from 'zod'
import type { WaitlistFormData, WaitlistRole } from '../types/waitlist.types'

export const waitlistRoleSchema: z.ZodSchema<WaitlistRole> = z.enum([
  'project_creator',
  'supporter',
  'partner',
])

export const waitlistStepOneSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  role: waitlistRoleSchema,
})

export const waitlistStepTwoSchema = z.object({
  projectName: z.string().min(2, 'Project name is too short').optional(),
  projectDescription: z
    .string()
    .min(10, 'Please share at least 10 characters')
    .optional(),
  categoryId: z.string().optional(),
  location: z.string().optional(),
})

export const waitlistStepThreeSchema = z.object({
  source: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consent is required' }),
  }),
})

export const waitlistSchema: z.ZodSchema<WaitlistFormData> = waitlistStepOneSchema
  .and(waitlistStepTwoSchema)
  .and(waitlistStepThreeSchema)


