// This file is intended for configuration settings related to AI models. It may export constants or configuration objects.

export const AI_MODEL_CONFIG = {
	ageGenderModel: {
		manifest: 'src/constants/models/age-gender-weight.manifest.json',
		weights: 'src/constants/models/age-gender-weight.model.bin',
	},
	faceExpressionModel: {
		manifest: 'src/constants/models/face-expression-weight.manifest.json',
		weights: 'src/constants/models/face-expression-weight.model.bin',
	},
}
