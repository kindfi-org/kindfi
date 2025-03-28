import * as types from '../../lib/types'

export const RESPONSES: types.Responses = {
	FORM: {
		SUCCESS: {
			type: 'success',
			message: 'Form submitted successfully!',
		},
		ERROR: {
			type: 'error',
			message: 'Failed to submit the form. Please try again.',
		},
	},
}
