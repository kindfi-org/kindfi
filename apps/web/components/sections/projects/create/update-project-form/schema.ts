import {
	stepOneSchema,
	stepThreeSchema,
	stepTwoSchema,
} from '~/lib/schemas/create-project.schemas'

export const updateProjectSchema = stepOneSchema
	.and(stepTwoSchema)
	.and(stepThreeSchema)
